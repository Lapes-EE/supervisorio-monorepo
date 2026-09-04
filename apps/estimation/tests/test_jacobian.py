import numpy as np

from src.core.config import num_estados
from src.core.functions import calcular_h_x, criar_estados_iniciais
from src.core.jacobian import calcular_jacobiana
from src.core.network import criar_rede


def calcular_jacobiana_numerica(
    x,
    Y,
    tipos_z,
    k,
    m,
    epsilon=1e-6,
):
    """Calcula H numericamente usando diferenças finitas centrais."""
    num_medicoes = len(tipos_z)
    H_numerica = np.zeros((num_medicoes, num_estados))

    for j in range(num_estados):
        x_mais = x.copy()
        x_mais[j] += epsilon

        x_menos = x.copy()
        x_menos[j] -= epsilon

        h_mais = calcular_h_x(x_mais, Y, tipos_z, k, m)
        h_menos = calcular_h_x(x_menos, Y, tipos_z, k, m)

        derivada = (h_mais - h_menos) / (2 * epsilon)
        H_numerica[:, j] = derivada.flatten()

    return H_numerica


def test_analytical_jacobian_matches_numerical():
    Y, _ = criar_rede()
    x0, estados, barra_estados = criar_estados_iniciais()

    tipos_z = ["P", "P", "Q", "Q", "V", "V"]
    k = [0, 0, 0, 0, 1, 2]
    m = [1, 0, 2, 0, 1, 2]

    H_analitica = calcular_jacobiana(
        x=x0,
        Y=Y,
        k=k,
        m=m,
        tipos_z=tipos_z,
        estados=estados,
        barra_estados=barra_estados,
    )

    H_numerica = calcular_jacobiana_numerica(
        x=x0,
        Y=Y,
        tipos_z=tipos_z,
        k=k,
        m=m,
    )

    assert H_analitica.shape == (len(tipos_z), num_estados)
    assert H_numerica.shape == (len(tipos_z), num_estados)

    erro_maximo = np.max(np.abs(H_analitica - H_numerica))
    assert erro_maximo < 1e-5