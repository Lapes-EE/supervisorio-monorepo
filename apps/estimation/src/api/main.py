import os
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from ..services.run_estimator import executar_estimador

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://hyper:hyper@localhost:5432/metrics",
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
    overrides: list[MeasurementOverride] = []


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def _calcular_estimacao(
    session: Session,
    overrides: list[MeasurementOverride] | None = None,
):
    statement = """
        SELECT
            meter_id AS "meterId",
            time,
            tensao_fase_neutro_c AS "tensaoFaseNeutroC",
            potencia_ativa_fundamental_c AS "potenciaAtivaFundamentalC",
            potencia_reativa_c AS "potenciaReativaC"
        FROM (
            SELECT
                meter_id,
                time,
                tensao_fase_neutro_c,
                potencia_ativa_fundamental_c,
                potencia_reativa_c,
                ROW_NUMBER() OVER (
                    PARTITION BY meter_id
                    ORDER BY time DESC
                ) AS rn
            FROM measures
        ) AS medidas
        WHERE rn = 1
        ORDER BY meter_id
    """

    measurements = [
        dict(row) for row in session.execute(text(statement)).mappings().all()
    ]

    if not measurements:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma medida encontrada",
        )

    # Apply manual overrides if present
    if overrides:
        override_map = {o.meterId: o for o in overrides}
        for item in measurements:
            m_id = item.get("meterId")
            if m_id in override_map:
                o = override_map[m_id]
                if o.tensaoFaseNeutroC is not None:
                    item["tensaoFaseNeutroC"] = o.tensaoFaseNeutroC
                if o.potenciaAtivaFundamentalC is not None:
                    item["potenciaAtivaFundamentalC"] = o.potenciaAtivaFundamentalC
                if o.potenciaReativaC is not None:
                    item["potenciaReativaC"] = o.potenciaReativaC

    resultado = executar_estimador(measurements)
    resultados = resultado["resultados"]

    return resultados["tensoes"]


@app.get("/estimation")
def get_latest_voltage(
    session: Session = Depends(get_session),
):
    return _calcular_estimacao(session)


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
