# ==========================================
# EXECUÇÃO DO ESTIMADOR DE ESTADO
# ==========================================

from .network import criar_rede
from .functions import criar_estados_iniciais
from .measurements import preparar_medicoes
from .estimator import metodo_newton_raphson
from .results import processar_resultados

def executar_estimador(telemetry_data):

    # PREPARAR MEDIÇÕES
    dados = preparar_medicoes(
        telemetry_data
    )

    # CRIAR REDE
    Y, linhas = criar_rede()

    # CRIAR ESTADO INICIAL
    x0, estados, barra_estados = (
        criar_estados_iniciais()
    )

    # EXECUTAR NEWTON-RAPHSON
    resultado = metodo_newton_raphson(
        x0=x0,
        Y=Y,
        z=dados["z"],
        k=dados["k"],
        m=dados["m"],
        W=dados["W"],
        tipos_z=dados["tipos_z"],
        estados=estados,
        barra_estados=barra_estados,
    )

    # RETORNAR RESULTADOS
    resultado["Y"] = Y
    resultado["linhas"] = linhas
    resultado["estados"] = estados
    resultado["barra_estados"] = barra_estados

    # PROCESSAR RESULTADOS
    resultados = processar_resultados(
        resultado=resultado,
        df_dados=dados["df_dados"],
        df_medicoes=dados["df_medicoes"],
    )

    # RETORNO
    return {
        "estimador": resultado,
        "resultados": resultados,
    }