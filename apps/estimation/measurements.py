# ==========================================
# PROCESSAMENTO DAS MEDIÇÕES
# ==========================================

import numpy as np
import pandas as pd

from .config import (
    Sbase,
    Vbase,
    mapa_medidor_para_nome,
    mapa_medidor_para_indice,
    variancia_por_barra,
)

# CHAVES DAS MEDIÇÕES
V_fase_C = "tensaoFaseNeutroC" 
potenciaP_fase_C = "potenciaAtivaFundamentalC" 
potenciaQ_fase_C = "potenciaReativaC" 

ID_medidor = "meterId" 
hora = "time"

# OBTÉM A ÚLTIMA MEDIÇÃO DE CADA MEDIDOR
def obter_ultimas_medicoes_por_medidor(telemetry_data):
    """
    Recebe uma lista de medições e retorna somente
    a medição mais recente de cada meterId.
    """

    ultimas_medicoes = {}

    for medicao in telemetry_data:

        meter_id = medicao.get(ID_medidor)
        timestamp_atual = medicao.get(hora)

        # Ignora registros incompletos
        if meter_id is None or timestamp_atual is None:
            continue

        if meter_id not in ultimas_medicoes:
            ultimas_medicoes[meter_id] = medicao
            continue

        timestamp_salvo = ultimas_medicoes[meter_id].get(hora)

        if timestamp_atual > timestamp_salvo:
            ultimas_medicoes[meter_id] = medicao

    return ultimas_medicoes

# TRANSFORMA OS REGISTROS EM DATAFRAME
def criar_dataframe_medicoes(ultimas_medicoes):
    """
    Converte as últimas medições de cada medidor
    para um DataFrame e associa:
        meterId
        nome da barra
        índice da barra
    """

    dados = []

    for meter_id, medicao in ultimas_medicoes.items():

        registro = medicao.copy()

        registro[ID_medidor] = meter_id

        # Se as medições estiverem dentro de "measurements",
        # coloca os valores no nível principal.
        medicoes_aninhadas = registro.pop("measurements", {})

        if isinstance(medicoes_aninhadas, dict):
            registro.update(medicoes_aninhadas)

        # meterId → nome da barra
        registro["barra"] = mapa_medidor_para_nome.get(meter_id)

        # meterId → índice utilizado pelo EE
        registro["i_bus"] = mapa_medidor_para_indice.get(meter_id)

        dados.append(registro)

    return pd.DataFrame(dados)

# FILTRA MEDIDORES DO MODELO
def filtrar_medicoes_do_modelo(df):
    """
    Mantém somente os medidores que possuem
    mapeamento para uma barra do estimador.
    """

    df = df.copy()

    df = df[
        df["i_bus"].notna()
    ]

    df["i_bus"] = df["i_bus"].astype(int)

    return df

# CONVERSÃO PARA PU
def converter_para_pu(df):
    """
    Converte tensão, potência ativa e potência
    reativa para valores em pu.
    """

    df = df.copy()

    df["V_pu"] = df[V_fase_C] / Vbase
    df["P_pu"] = df[potenciaP_fase_C] / Sbase
    df["Q_pu"] = df[potenciaQ_fase_C] / Sbase

    return df

# CONSTRUÇÃO DAS MEDIÇÕES DO ESTIMADOR
def construir_dados_estimador(df):
    """
    Constrói os dados utilizados pelo estimador:

        tipos_z
        k
        m
        med_values
        pesos
        z
        W
        sigma
        df_dados
    """

    tipos_z = []
    k = []
    m = []
    med_values = []
    pesos = []

    barra_QG = 0

    # POTÊNCIA ATIVA
    for _, row in df.iterrows():

        barra_m = int(row["i_bus"])
        valor = row["P_pu"]

        if barra_m == barra_QG:
            variancia = variancia_por_barra[barra_QG]["P"]

            tipos_z.append("P")
            k.append(barra_QG)
            m.append(barra_QG)

        else:
            variancia = variancia_por_barra[barra_m]["P"]

            tipos_z.append("P")
            k.append(barra_QG)
            m.append(barra_m)

        med_values.append(valor)
        pesos.append(1 / variancia)

    # POTÊNCIA REATIVA
    for _, row in df.iterrows():

        barra_m = int(row["i_bus"])
        valor = row["Q_pu"]

        if barra_m == barra_QG:
            variancia = variancia_por_barra[barra_QG]["Q"]

            tipos_z.append("Q")
            k.append(barra_QG)
            m.append(barra_QG)

        else:
            variancia = variancia_por_barra[barra_m]["Q"]

            tipos_z.append("Q")
            k.append(barra_QG)
            m.append(barra_m)

        med_values.append(valor)
        pesos.append(1 / variancia)

    # TENSÃO
    for _, row in df.iterrows():

        barra = int(row["i_bus"])
        valor = row["V_pu"]

        variancia = variancia_por_barra[barra]["V"]

        tipos_z.append("V")
        k.append(barra)
        m.append(barra)

        med_values.append(valor)
        pesos.append(1 / variancia)

    # DATAFRAME DAS MEDIÇÕES
    df_dados = pd.DataFrame({
        "Tipo": tipos_z,
        "Barra k": k,
        "Barra m": m,
        "Medição (pu)": med_values,
        "Peso (1/σ²)": pesos,
    })

    df_dados["sigma"] = np.sqrt(
        1 / df_dados["Peso (1/σ²)"]
    )

    # MATRIZ W
    W = np.diag(
        df_dados["Peso (1/σ²)"].values
    )
    
    # VETOR z
    z = np.array(
        df_dados["Medição (pu)"]
    ).reshape(-1, 1)

    return {
        "tipos_z": tipos_z,
        "k": k,
        "m": m,
        "z": z,
        "W": W,
        "df_dados": df_dados,
    }

# PREPARAÇÃO COMPLETA DAS MEDIÇÕES
def preparar_medicoes(telemetry_data):
    """
    Executa todo o processamento necessário
    para transformar os dados brutos em dados
    prontos para o estimador.
    """

    ultimas_medicoes = (
        obter_ultimas_medicoes_por_medidor(
            telemetry_data
        )
    )

    df = criar_dataframe_medicoes(
        ultimas_medicoes
    )

    df = filtrar_medicoes_do_modelo(df)

    df = converter_para_pu(df)

    dados_estimador = construir_dados_estimador(df)

    return {
        "df_medicoes": df,
        **dados_estimador,
    }