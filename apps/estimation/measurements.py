"""
Processamento e preparação das medições para o Estimador de Estado.
"""

from typing import Any, Dict, List, Sequence, Union

import numpy as np
import pandas as pd

from .config import (
    Sbase,
    Vbase,
    mapa_medidor_para_indice,
    mapa_medidor_para_nome,
    variancia_por_barra,
)

# Chaves das medições
V_fase_C = "tensaoFaseNeutroC"
potenciaP_fase_C = "potenciaAtivaFundamentalC"
potenciaQ_fase_C = "potenciaReativaC"

ID_medidor = "meterId"
hora = "time"


def obter_ultimas_medicoes_por_medidor(
    telemetry_data: Sequence[Dict[str, Any]],
) -> Dict[Any, Dict[str, Any]]:
    """
    Recebe uma lista de medições e retorna somente a medição mais recente de cada medidor.
    """
    ultimas_medicoes: Dict[Any, Dict[str, Any]] = {}

    for medicao in telemetry_data:
        meter_id = medicao.get(ID_medidor)
        if meter_id is None:
            meter_id = medicao.get("meter_id")
        if meter_id is None:
            continue

        ts_atual = medicao.get(hora)
        if meter_id not in ultimas_medicoes:
            ultimas_medicoes[meter_id] = medicao
            continue

        if ts_atual is not None:
            ts_salvo = ultimas_medicoes[meter_id].get(hora)
            if ts_salvo is None or ts_atual > ts_salvo:
                ultimas_medicoes[meter_id] = medicao

    return ultimas_medicoes


def criar_dataframe_medicoes(
    telemetry_data: Union[Sequence[Dict[str, Any]], Dict[Any, Dict[str, Any]]],
) -> pd.DataFrame:
    """
    Converte as medições (lista ou dicionário) para um DataFrame estruturado,
    suportando tanto registros planos de banco de dados quanto estruturas com
    dicionário aninhado 'measurements'.
    """
    if isinstance(telemetry_data, dict):
        itens = list(telemetry_data.values())
    else:
        itens = list(obter_ultimas_medicoes_por_medidor(telemetry_data).values())

    dados = []
    for medicao in itens:
        meter_id = medicao.get(ID_medidor)
        if meter_id is None:
            meter_id = medicao.get("meter_id")
        if meter_id is None:
            continue

        barra = mapa_medidor_para_nome.get(meter_id)
        i_bus = mapa_medidor_para_indice.get(meter_id)

        # Medições podem estar diretamente no registro ou aninhadas sob 'measurements'
        nested = medicao.get("measurements")
        values_dict = nested if isinstance(nested, dict) else medicao

        dados.append({
            ID_medidor: meter_id,
            hora: medicao.get(hora),
            "barra": barra,
            "i_bus": i_bus,
            V_fase_C: float(values_dict.get(V_fase_C, 0.0) or 0.0),
            potenciaP_fase_C: float(values_dict.get(potenciaP_fase_C, 0.0) or 0.0),
            potenciaQ_fase_C: float(values_dict.get(potenciaQ_fase_C, 0.0) or 0.0),
        })

    df = pd.DataFrame(dados)
    if not df.empty and "i_bus" in df.columns:
        df = df[df["i_bus"].notna()].copy()
        df["i_bus"] = df["i_bus"].astype(int)
        df = df.sort_values("i_bus").reset_index(drop=True)
    return df


def filtrar_medicoes_do_modelo(df: pd.DataFrame) -> pd.DataFrame:
    """
    Mantém somente os medidores que possuem mapeamento para uma barra do estimador.
    """
    if df.empty or "i_bus" not in df.columns:
        return df

    df_filtrado = df[df["i_bus"].notna()].copy()
    df_filtrado["i_bus"] = df_filtrado["i_bus"].astype(int)
    return df_filtrado


def converter_para_pu(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converte tensão, potência ativa e potência reativa para valores em pu.
    """
    df = df.copy()
    df["V_pu"] = df[V_fase_C] / Vbase
    df["P_pu"] = df[potenciaP_fase_C] / Sbase
    df["Q_pu"] = df[potenciaQ_fase_C] / Sbase
    return df


def construir_dados_estimador(df: pd.DataFrame) -> dict:
    """
    Constrói os vetores e matrizes utilizados pelo estimador:
        tipos_z, k, m, z, W, df_dados
    """
    tipos_z: List[str] = []
    k: List[int] = []
    m: List[int] = []
    med_values: List[float] = []
    pesos: List[float] = []

    barra_QG = 0

    # Potência Ativa (P)
    for _, row in df.iterrows():
        barra_m = int(row["i_bus"])
        tipos_z.append("P")
        k.append(barra_QG)
        m.append(barra_m)
        med_values.append(float(row["P_pu"]))
        pesos.append(1.0 / variancia_por_barra[barra_m]["P"])

    # Potência Reativa (Q)
    for _, row in df.iterrows():
        barra_m = int(row["i_bus"])
        tipos_z.append("Q")
        k.append(barra_QG)
        m.append(barra_m)
        med_values.append(float(row["Q_pu"]))
        pesos.append(1.0 / variancia_por_barra[barra_m]["Q"])

    # Magnitude de Tensão (V)
    for _, row in df.iterrows():
        barra = int(row["i_bus"])
        tipos_z.append("V")
        k.append(barra)
        m.append(barra)
        med_values.append(float(row["V_pu"]))
        pesos.append(1.0 / variancia_por_barra[barra]["V"])

    df_dados = pd.DataFrame({
        "Tipo": tipos_z,
        "Barra k": k,
        "Barra m": m,
        "Medição (pu)": med_values,
        "Peso (1/σ²)": pesos,
    })

    if not df_dados.empty:
        df_dados["sigma"] = np.sqrt(1.0 / df_dados["Peso (1/σ²)"])
        W = np.diag(df_dados["Peso (1/σ²)"].values)
        z = np.array(df_dados["Medição (pu)"]).reshape(-1, 1)
    else:
        df_dados["sigma"] = []
        W = np.empty((0, 0))
        z = np.empty((0, 1))

    return {
        "tipos_z": tipos_z,
        "k": k,
        "m": m,
        "z": z,
        "W": W,
        "df_dados": df_dados,
    }


def preparar_medicoes(telemetry_data: Sequence[Dict[str, Any]]) -> dict:
    """
    Executa todo o processamento necessário para transformar
    os dados brutos em dados prontos para o estimador.
    """
    df = criar_dataframe_medicoes(telemetry_data)
    df = filtrar_medicoes_do_modelo(df)
    df = converter_para_pu(df)
    dados_estimador = construir_dados_estimador(df)

    return {
        "df_medicoes": df,
        **dados_estimador,
    }