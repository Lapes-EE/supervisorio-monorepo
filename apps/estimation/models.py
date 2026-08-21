from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field


class Measure(SQLModel, table=True):
    __tablename__ = "measures"

    id: Optional[int] = Field(default=None, primary_key=True)

    meter_id: int = Field(
       default=None
    )

    time: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
        ),
    )


    # --------------------------------------------------------
    # Tensão
    # --------------------------------------------------------

    tensao_fase_neutro_a: Optional[float] = None
    tensao_fase_neutro_b: Optional[float] = None
    tensao_fase_neutro_c: Optional[float] = None

    tensao_fase_fase_ab: Optional[float] = None
    tensao_fase_fase_bc: Optional[float] = None
    tensao_fase_fase_ca: Optional[float] = None

    # --------------------------------------------------------
    # Frequência
    # --------------------------------------------------------

    frequencia: Optional[float] = None

    # --------------------------------------------------------
    # Correntes
    # --------------------------------------------------------

    corrente_a: Optional[float] = None
    corrente_b: Optional[float] = None
    corrente_c: Optional[float] = None

    corrente_de_neutro_medido: Optional[float] = None
    corrente_de_neutro_calculado: Optional[float] = None

    # --------------------------------------------------------
    # Potência aparente
    # --------------------------------------------------------

    potencia_aparente_a: Optional[float] = None
    potencia_aparente_b: Optional[float] = None
    potencia_aparente_c: Optional[float] = None

    potencia_aparente_total_soma_aritmetica: Optional[float] = None
    potencia_aparente_total_soma_vetorial: Optional[float] = None

    # --------------------------------------------------------
    # Potência ativa - Fase A
    # --------------------------------------------------------

    potencia_ativa_fundamental_a: Optional[float] = None
    potencia_ativa_harmonica_a: Optional[float] = None
    potencia_ativa_fundamental_harmonica_a: Optional[float] = None

    # --------------------------------------------------------
    # Potência ativa - Fase B
    # --------------------------------------------------------

    potencia_ativa_fundamental_b: Optional[float] = None
    potencia_ativa_harmonica_b: Optional[float] = None
    potencia_ativa_fundamental_harmonica_b: Optional[float] = None

    # --------------------------------------------------------
    # Potência ativa - Fase C
    # --------------------------------------------------------

    potencia_ativa_fundamental_c: Optional[float] = None
    potencia_ativa_harmonica_c: Optional[float] = None
    potencia_ativa_fundamental_harmonica_c: Optional[float] = None

    # --------------------------------------------------------
    # Potência ativa - Total
    # --------------------------------------------------------

    potencia_ativa_fundamental_total: Optional[float] = None
    potencia_ativa_harmonica_total: Optional[float] = None
    potencia_ativa_fundamental_harmonica_total: Optional[float] = None

    # --------------------------------------------------------
    # Potência reativa
    # --------------------------------------------------------

    potencia_reativa_a: Optional[float] = None
    potencia_reativa_b: Optional[float] = None
    potencia_reativa_c: Optional[float] = None

    potencia_reativa_total_soma_aritmetica: Optional[float] = None
    potencia_reativa_total_soma_vetorial: Optional[float] = None

    # --------------------------------------------------------
    # Ângulos de fase
    # --------------------------------------------------------

    angulo_fase_a: Optional[float] = None
    angulo_fase_b: Optional[float] = None
    angulo_fase_c: Optional[float] = None

    # --------------------------------------------------------
    # Ângulo phi
    # --------------------------------------------------------

    phi_fase_a: Optional[float] = None
    phi_fase_b: Optional[float] = None
    phi_fase_c: Optional[float] = None

    # --------------------------------------------------------
    # Fator de potência real
    # --------------------------------------------------------

    fp_real_fase_a: Optional[float] = None
    fp_real_fase_b: Optional[float] = None
    fp_real_fase_c: Optional[float] = None

    fp_real_total_soma_aritmetica: Optional[float] = None
    fp_real_total_soma_vetorial: Optional[float] = None

    # --------------------------------------------------------
    # Fator de potência por deslocamento
    # --------------------------------------------------------

    fp_deslocamento_fase_a: Optional[float] = None
    fp_deslocamento_fase_b: Optional[float] = None
    fp_deslocamento_fase_c: Optional[float] = None

    fp_deslocamento_total: Optional[float] = None

    # --------------------------------------------------------
    # THD
    # --------------------------------------------------------

    thd_tensao_a: Optional[float] = None
    thd_tensao_b: Optional[float] = None
    thd_tensao_c: Optional[float] = None

    thd_corrente_a: Optional[float] = None
    thd_corrente_b: Optional[float] = None
    thd_corrente_c: Optional[float] = None

    # --------------------------------------------------------
    # Temperatura
    # --------------------------------------------------------

    temperatura_sensor_interno: Optional[float] = None