import os
import time
from datetime import datetime
from typing import Any, Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from ..core.config import Sbase
from ..services.run_estimator import executar_estimador

def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgres+psycopg://"):
        return url.replace("postgres+psycopg://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


DATABASE_URL = normalize_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://hyper:hyper@localhost:5432/metrics",
    )
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
)

app = FastAPI(docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MeasurementOverride(BaseModel):
    meterId: int
    tensaoFaseNeutroC: float | None = Field(
        default=None, description="Tensão Fase-Neutro C em Volts"
    )
    potenciaAtivaFundamentalC: float | None = Field(
        default=None, description="Potência Ativa Fase C em Watts"
    )
    potenciaReativaC: float | None = Field(
        default=None, description="Potência Reativa Fase C em VAr"
    )


class EstimationRequest(BaseModel):
    overrides: list[MeasurementOverride] = Field(default_factory=list)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def _linha_comparacao(comparacao, tipo, indice):
    """
    Retorna a linha da tabela de comparação para um dado tipo (P/Q) e índice
    de barra. Retorna None quando não há correspondência.
    """
    if comparacao is None or comparacao.empty or indice is None:
        return None

    linhas = comparacao[
        (comparacao["Tipo"] == tipo) & (comparacao["Barra_m"] == indice)
    ]
    return linhas.iloc[0] if not linhas.empty else None


def _enriquecer_item_pq(item, comparacao, indice):
    """
    Adiciona a um item de resposta os valores medidos, estimados e o erro de
    potência ativa (P, em W) e reativa (Q, em VAr), convertidos de pu para
    unidades físicas usando Sbase. Campos ausentes ficam como None.
    """
    linha_p = _linha_comparacao(comparacao, "P", indice)
    if linha_p is not None:
        p_medida = float(linha_p["z_medida (pu)"]) * Sbase
        p_estimada = float(linha_p["z_estimada (pu)"]) * Sbase
        item["potencia_ativa_medida_W"] = round(p_medida, 2)
        item["potencia_ativa_W"] = round(p_estimada, 2)
        item["erro_potencia_ativa_W"] = round(p_medida - p_estimada, 2)
    else:
        item["potencia_ativa_medida_W"] = None
        item["potencia_ativa_W"] = None
        item["erro_potencia_ativa_W"] = None

    linha_q = _linha_comparacao(comparacao, "Q", indice)
    if linha_q is not None:
        q_medida = float(linha_q["z_medida (pu)"]) * Sbase
        q_estimada = float(linha_q["z_estimada (pu)"]) * Sbase
        item["potencia_reativa_medida_VAr"] = round(q_medida, 2)
        item["potencia_reativa_VAr"] = round(q_estimada, 2)
        item["erro_potencia_reativa_VAr"] = round(q_medida - q_estimada, 2)
    else:
        item["potencia_reativa_medida_VAr"] = None
        item["potencia_reativa_VAr"] = None
        item["erro_potencia_reativa_VAr"] = None


def _aplicar_overrides(measurements, overrides):
    if not overrides:
        return measurements

    override_map = {o.meterId: o for o in overrides}
    for item in measurements:
        override = override_map.get(item.get("meterId"))
        if override is None:
            continue
        for field in (
            "tensaoFaseNeutroC",
            "potenciaAtivaFundamentalC",
            "potenciaReativaC",
        ):
            value = getattr(override, field)
            if value is not None:
                item[field] = value
    return measurements


def _estimar_snapshot(measurements, overrides):
    resultado = executar_estimador(_aplicar_overrides(measurements, overrides))
    resultados = resultado["resultados"]
    tensoes = resultados["tensoes"]
    comparacao = resultados.get("comparacao")

    for item in tensoes["data"]:
        _enriquecer_item_pq(item, comparacao, item.get("indice_EE"))

    return tensoes["data"]


def _minuto(value):
    if isinstance(value, datetime):
        return value.replace(second=0, microsecond=0)
    return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(
        second=0, microsecond=0
    )


def _calcular_estimacao(
    session: Session,
    overrides: list[MeasurementOverride] | None = None,
):
    statement = """
        SELECT
            meter_id AS "meterId",
            date_trunc('minute', time) AS time,
            AVG(tensao_fase_neutro_c) AS "tensaoFaseNeutroC",
            AVG(potencia_ativa_fundamental_c) AS "potenciaAtivaFundamentalC",
            AVG(potencia_reativa_c) AS "potenciaReativaC"
        FROM measures
        WHERE time >= (SELECT COALESCE(MAX(time), NOW()) FROM measures) - INTERVAL '4 minutes'
        GROUP BY meter_id, date_trunc('minute', time)
        ORDER BY time, meter_id
    """

    rows = [
        dict(row) for row in session.execute(text(statement)).mappings().all()
    ]

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma medida encontrada",
        )

    snapshots = {}
    for row in rows:
        bucket = _minuto(row["time"])
        snapshots.setdefault(bucket, []).append(row)

    history = [
        {
            "time": bucket.isoformat(),
            "data": _estimar_snapshot(measurements, overrides),
        }
        for bucket, measurements in sorted(snapshots.items())
    ]

    return {
        "data": history[-1]["data"],
        "history": history,
    }


_estimation_cache: dict[str, Any] = {"timestamp": 0.0, "data": None}
CACHE_TTL_SECONDS = 30.0


def _obter_estimacao_com_cache(session: Session) -> dict:
    agora = time.time()
    if (
        _estimation_cache["data"] is not None
        and (agora - _estimation_cache["timestamp"]) < CACHE_TTL_SECONDS
    ):
        return _estimation_cache["data"]

    resultado = _calcular_estimacao(session)
    _estimation_cache["timestamp"] = agora
    _estimation_cache["data"] = resultado
    return resultado


def _reset_cache() -> None:
    _estimation_cache["timestamp"] = 0.0
    _estimation_cache["data"] = None


@app.get("/estimation")
def get_latest_voltage(
    session: Session = Depends(get_session),
):
    return _obter_estimacao_com_cache(session)


@app.post("/estimation")
def calculate_voltage_with_overrides(
    request: EstimationRequest,
    session: Session = Depends(get_session),
):
    return _calcular_estimacao(session, request.overrides)


@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
    )
