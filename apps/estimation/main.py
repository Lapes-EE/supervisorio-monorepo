import os
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from .run_estimator import executar_estimador

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


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


@app.get("/estimation")
def get_latest_voltage(
    session: Session = Depends(get_session),
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

    resultado = executar_estimador(measurements)
    resultados = resultado["resultados"]

    return resultados["tensoes"]


@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
    )
