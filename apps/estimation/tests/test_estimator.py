import numpy as np

from src.core.estimator import metodo_newton_raphson
from src.core.functions import criar_estados_iniciais
from src.core.network import criar_rede


def test_newton_raphson_convergence():
    Y, _ = criar_rede()
    x0, estados, barra_estados = criar_estados_iniciais()

    tipos_z = ["P", "P", "P", "Q", "Q", "Q", "V", "V", "V"]
    k = [0, 0, 0, 0, 0, 0, 0, 1, 2]
    m = [0, 1, 2, 0, 1, 2, 0, 1, 2]

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
    W = np.eye(len(z))

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

    assert resultado["convergiu"] is True
    assert resultado["iteracoes"] <= 10
    assert resultado["delta_norm"] < 1e-3
    assert resultado["x"] is not None
    assert len(resultado["x"]) == 27
    assert resultado["r"].shape == (len(tipos_z), 1)
    assert resultado["r_normalizado"].shape == (len(tipos_z),)