import numpy as np

from .network import criar_rede
from .functions import criar_estados_iniciais
from .estimator import metodo_newton_raphson


def main():

    # REDE
    Y, linhas = criar_rede()

    # ESTADOS INICIAIS
    x0, estados, barra_estados = (
        criar_estados_iniciais()
    )

    # MEDIÇÕES
    tipos_z = [
        "P",
        "P",
        "P",
        "Q",
        "Q",
        "Q",
        "V",
        "V",
        "V",
    ]

    k = [
        0, 0, 0,
        0, 0, 0,
        0, 1, 2,
    ]

    m = [
        0, 1, 2,
        0, 1, 2,
        0, 1, 2,
    ]

    # VALORES DE MEDIÇÃO DE TESTE
    z = np.array([
        [0.10],
        [0.05],
        [0.03],

        [0.05],
        [0.02],
        [0.01],

        [1.00],
        [0.98],
        [1.01],
    ])

    # PESOS
    W = np.eye(len(z))

    # EXECUTA EE
    resultado = metodo_newton_raphson(
        x0=x0,
        Y=Y,
        z=z,
        k=k,
        m=m,
        W=W,
        tipos_z=tipos_z,
        estados=estados,
        barra_estados=barra_estados,
    )

    # RESULTADOS
    print("\n====================================")
    print("RESULTADO DO ESTIMADOR")
    print("====================================")

    print("\nConvergiu:")
    print(resultado["convergiu"])

    print("\nIterações:")
    print(resultado["iteracoes"])

    print("\nDelta:")
    print(resultado["delta_norm"])

    print("\nEstado estimado:")
    print(resultado["x"])

    print("\nResíduos:")
    print(resultado["r"])

    print("\nResíduos normalizados:")
    print(resultado["r_normalizado"])


if __name__ == "__main__":
    main()