import os

from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, create_engine, select

from .models import Measure

from scalar_fastapi import get_scalar_api_reference

from .run_estimator import executar_estimador

from .test_run_estimator import criar_telemetry_data_teste




DATABASE_URL = "postgresql+psycopg://hyper:hyper@localhost:5432/metrics"

engine = create_engine(
    DATABASE_URL,
    echo=True,
)

app = FastAPI(docs_url=None, redoc_url=None)


def get_session():
    with Session(engine) as session:
        yield session


@app.get("/estimation")
def get_latest_voltage(
    session: Session = Depends(get_session),
):
    statement = """
        SELECT
            meter_id,
            time,
            tensao_fase_neutro_c,
            potencia_ativa_fundamental_c,
            potencia_reativa_c
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

    measure = session.exec(statement).mappings().all()
    
    print(measure)
    telemetry_data = criar_telemetry_data_teste()
    
    resultado = executar_estimador(telemetry_data)
    resultados = resultado["resultados"]

    if measure is None:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma medida encontrada"
        )
        
    
    return resultados["tensoes"]

@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        # Your OpenAPI document
        openapi_url=app.openapi_url,

    )

