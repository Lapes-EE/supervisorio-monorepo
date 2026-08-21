# ==========================================
# TESTE DA JACOBIANA
# ==========================================

import numpy as np

from .config import num_estados
from .network import criar_rede
from .functions import (
    criar_estados_iniciais,
    calcular_h_x,
)
from .jacobian import calcular_jacobiana


# ==========================================
# JACOBIANA NUMÉRICA
# ==========================================

def calcular_jacobiana_numerica(
    x,
    Y,
    tipos_z,
    k,
    m,
    epsilon=1e-6,
):
    """
    Calcula H numericamente usando diferenças finitas centrais.
    """

    num_medicoes = len(tipos_z)

    H_numerica = np.zeros(
        (num_medicoes, num_estados)
    )

    for j in range(num_estados):

        # Estado x + epsilon
        x_mais = x.copy()
        x_mais[j] += epsilon

        # Estado x - epsilon
        x_menos = x.copy()
        x_menos[j] -= epsilon

        # h(x + epsilon)
        h_mais = calcular_h_x(
            x_mais,
            Y,
            tipos_z,
            k,
            m,
        )

        # h(x - epsilon)
        h_menos = calcular_h_x(
            x_menos,
            Y,
            tipos_z,
            k,
            m,
        )

        # Diferença central
        derivada = (
            h_mais - h_menos
        ) / (2 * epsilon)

        H_numerica[:, j] = derivada.flatten()

    return H_numerica


# ==========================================
# MEDIÇÕES PARA TESTE
# ==========================================

def criar_medicoes_teste():

    # Uma medição de cada tipo:
    #
    # P: fluxo 0 -> 1
    # P: injeção na barra 0
    # Q: fluxo 0 -> 2
    # Q: injeção na barra 0
    # V: tensão da barra 1
    # V: tensão da barra 2

    tipos_z = [
        "P",
        "P",
        "Q",
        "Q",
        "V",
        "V",
    ]

    k = [
        0,
        0,
        0,
        0,
        1,
        2,
    ]

    m = [
        1,
        0,
        2,
        0,
        1,
        2,
    ]

    return tipos_z, k, m


# ==========================================
# EXECUÇÃO DO TESTE
# ==========================================

def main():

    # --------------------------------------
    # Rede
    # --------------------------------------

    Y, linhas = criar_rede()

    # --------------------------------------
    # Estado inicial
    # --------------------------------------

    x0, estados, barra_estados = (
        criar_estados_iniciais()
    )

    # --------------------------------------
    # Medições
    # --------------------------------------

    tipos_z, k, m = criar_medicoes_teste()

    # --------------------------------------
    # Jacobiana analítica
    # --------------------------------------

    H_analitica = calcular_jacobiana(
        x=x0,
        Y=Y,
        k=k,
        m=m,
        tipos_z=tipos_z,
        estados=estados,
        barra_estados=barra_estados,
    )

    # --------------------------------------
    # Jacobiana numérica
    # --------------------------------------

    H_numerica = calcular_jacobiana_numerica(
        x=x0,
        Y=Y,
        tipos_z=tipos_z,
        k=k,
        m=m,
    )

    # --------------------------------------
    # Diferença
    # --------------------------------------

    diferenca = (
        H_analitica - H_numerica
    )

    erro_absoluto = np.abs(diferenca)

    erro_maximo = np.max(
        erro_absoluto
    )

    erro_medio = np.mean(
        erro_absoluto
    )

    # --------------------------------------
    # Resultados
    # --------------------------------------

    print("=" * 60)
    print("TESTE DA JACOBIANA")
    print("=" * 60)

    print("\nDimensão da Jacobiana:")
    print(H_analitica.shape)

    print("\nJacobiana analítica:")
    print(H_analitica)

    print("\nJacobiana numérica:")
    print(H_numerica)

    print("\nDiferença:")
    print(diferenca)

    print("\nErro máximo:")
    print(f"{erro_maximo:.12e}")

    print("\nErro médio:")
    print(f"{erro_medio:.12e}")

    # --------------------------------------
    # Critério
    # --------------------------------------

    tolerancia = 1e-5

    print("\n" + "=" * 60)

    if erro_maximo < tolerancia:

        print("✅ JACOBIANA VALIDADA")

    else:

        print("❌ JACOBIANA COM DIFERENÇA")

    print("=" * 60)


if __name__ == "__main__":
    main()