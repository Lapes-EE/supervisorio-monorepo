import numpy as np
import pandas as pd

from ..core.config import (
    num_barras,
    Vbase,
    bus_name,
    limiar_bad_data,
)

def obter_estado_final(x):
    """
    Converte os ângulos do vetor de estados
    de radianos para graus.

    O vetor original x permanece em pu/radianos.
    """

    x_graus = np.copy(x)

    x_graus[:num_barras - 1] = np.degrees(
        x[:num_barras - 1]
    )

    return x_graus


def criar_comparacao(
    df_dados,
    h_x,
    r,
    sigma_residual,
    r_normalizado,
):
    """
    Cria o DataFrame com a comparação entre
    medições e valores estimados.
    """

    comparacao = pd.DataFrame({
        "Tipo": df_dados["Tipo"].values,
        "Barra_k": df_dados["Barra k"].values,
        "Barra_m": df_dados["Barra m"].values,
        "z_medida (pu)": df_dados[
            "Medição (pu)"
        ].values,
        "z_estimada (pu)": h_x.flatten(),
        "Residuo (pu)": r.flatten(),
        "Sigma Residual": sigma_residual,
        "Residuo Normalizado": r_normalizado,
    })

    return comparacao


def analisar_medicoes(
    comparacao,
    tipo,
    limiar=limiar_bad_data,
):
    """
    Filtra e analisa as medições de um determinado
    tipo: P, Q ou V.
    """

    df = comparacao[
        comparacao["Tipo"] == tipo
    ].copy()

    df["Erro Abs (pu)"] = (
        df["z_estimada (pu)"]
        - df["z_medida (pu)"]
    ).abs()

    df["Bad Data?"] = (
        df["Residuo Normalizado"].abs()
        > limiar
    )

    df = df.sort_values(
        by="Residuo Normalizado",
        ascending=False,
    )

    return df


def detectar_bad_data(
    tipos_z,
    k,
    m,
    r,
    sigma_residual,
    r_normalizado,
    limiar=limiar_bad_data,
):
    """
    Identifica a medição com maior resíduo normalizado.
    """

    indice_max = int(
        np.argmax(r_normalizado)
    )

    max_rn = float(
        r_normalizado[indice_max]
    )

    return {
        "indice": indice_max,
        "medicao": indice_max + 1,
        "tipo": tipos_z[indice_max],
        "barra_k": k[indice_max],
        "barra_m": m[indice_max],
        "residuo": float(
            r.flatten()[indice_max]
        ),
        "sigma_residual": float(
            sigma_residual[indice_max]
        ),
        "residuo_normalizado": max_rn,
        "bad_data": max_rn > limiar,
    }


# MÉTRICAS GLOBAIS
def calcular_metricas(
    z,
    h_x,
):
    """
    Calcula RMSE e MAE globais.
    """

    erro = (
        h_x.flatten()
        - z.flatten()
    )

    rmse = np.sqrt(
        np.mean(erro ** 2)
    )

    mae = np.mean(
        np.abs(erro)
    )

    return {
        "rmse": float(rmse),
        "mae": float(mae),
    }

def obter_tensoes_barras(x, df_medicoes):
    """
    Extrai as tensões estimadas do vetor de estados,
    converte de pu para volts e associa cada tensão
    ao meterId vindo das medições, incluindo medição real e erro.
    """

    tensoes = []
    inicio_tensoes = num_barras - 1

    # Um registro por barra/medidor
    cols_to_keep = [
        col for col in ["meterId", "i_bus", "barra", "time", "tensaoFaseNeutroC"]
        if col in df_medicoes.columns
    ]
    medidores = (
        df_medicoes[cols_to_keep]
        .drop_duplicates(subset=["meterId", "i_bus"])
        .sort_values("i_bus")
    )

    for _, medidor in medidores.iterrows():
        meter_id = int(medidor["meterId"])
        indice = int(medidor["i_bus"])
        barra = medidor["barra"]

        tensao_pu = float(x[inicio_tensoes + indice])
        tensao_V = float(tensao_pu * Vbase)

        tensao_medida = (
            float(medidor["tensaoFaseNeutroC"])
            if "tensaoFaseNeutroC" in medidor and pd.notna(medidor["tensaoFaseNeutroC"])
            else None
        )
        erro_V = (
            round(tensao_medida - tensao_V, 2)
            if tensao_medida is not None
            else None
        )
        medicao_time = (
            str(medidor["time"])
            if "time" in medidor and pd.notna(medidor["time"])
            else None
        )

        tensoes.append({
            "barra": barra,
            "ID_medidor": meter_id,
            "indice_EE": indice,
            "time": medicao_time,
            "tensao_pu": tensao_pu,
            "tensao_V": round(tensao_V, 2),
            "tensao_medida_V": tensao_medida,
            "erro_V": erro_V,
        })

    return {
        "data": tensoes
    }

# PROCESSAMENTO COMPLETO DOS RESULTADOS
def processar_resultados(
    resultado,
    df_dados,
    df_medicoes,
):
    """
    Processa o resultado produzido pelo estimador.

    Retorna os resultados prontos para uso pela API
    ou pela interface.
    """

    x = resultado["x"]
    h_x = resultado["h_x"]
    r = resultado["r"]
    sigma_residual = resultado[
        "sigma_residual"
    ]
    r_normalizado = resultado[
        "r_normalizado"
    ]

    tipos_z = resultado["tipos_z"]
    k = resultado["k"]
    m = resultado["m"]
    z = resultado["z"]

    x_graus = obter_estado_final(x)
    
    tensoes_barras = obter_tensoes_barras(
        resultado["x"],
        df_medicoes,
    )
    
    comparacao = criar_comparacao(
        df_dados=df_dados,
        h_x=h_x,
        r=r,
        sigma_residual=sigma_residual,
        r_normalizado=r_normalizado,
    )

    df_p = analisar_medicoes(
        comparacao,
        "P",
    )

    df_q = analisar_medicoes(
        comparacao,
        "Q",
    )

    df_v = analisar_medicoes(
        comparacao,
        "V",
    )

    bad_data = detectar_bad_data(
        tipos_z=tipos_z,
        k=k,
        m=m,
        r=r,
        sigma_residual=sigma_residual,
        r_normalizado=r_normalizado,
    )

    metricas = calcular_metricas(
        z=z,
        h_x=h_x,
    )

    return {
        "estado": x,
        "estado_graus": x_graus,
        "comparacao": comparacao,
        "potencia_ativa": df_p,
        "potencia_reativa": df_q,
        "tensao": df_v,
        "bad_data": bad_data,
        "metricas": metricas,
        "tensoes": tensoes_barras,
    }

