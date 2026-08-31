from ..core.network import criar_rede
from ..core.functions import criar_estados_iniciais
from ..core.estimator import metodo_newton_raphson
from .measurements import preparar_medicoes
from .results import processar_resultados

def executar_estimador(telemetry_data):
    dados = preparar_medicoes(
        telemetry_data
    )

    Y, linhas = criar_rede()

    x0, estados, barra_estados = (
        criar_estados_iniciais()
    )

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

    resultado["Y"] = Y
    resultado["linhas"] = linhas
    resultado["estados"] = estados
    resultado["barra_estados"] = barra_estados

    resultados = processar_resultados(
        resultado=resultado,
        df_dados=dados["df_dados"],
        df_medicoes=dados["df_medicoes"],
    )

    return {
        "estimador": resultado,
        "resultados": resultados,
    }