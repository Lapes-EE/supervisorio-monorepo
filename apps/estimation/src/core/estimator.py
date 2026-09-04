# ==========================================
# ESTIMADOR DE ESTADO - MÉTODO DE NEWTON-RAPHSON
# ==========================================

import numpy as np

from .config import tol, max_iteracao
from .functions import calcular_h_x
from .jacobian import calcular_jacobiana

# NEWTON-RAPHSON
def metodo_newton_raphson(
    x0,
    Y,
    z,
    k,
    m,
    W,
    tipos_z,
    estados,
    barra_estados,
):
    """
    Executa o estimador de estado utilizando
    o método de Newton-Raphson.

    Parâmetros
    ----------
    x0 : vetor
        Estado inicial.

    Y : matriz
        Matriz de admitâncias nodais.

    z : vetor
        Vetor de medições.

    k, m : listas
        Barras associadas a cada medição.

    W : matriz
        Matriz de pesos.

    tipos_z : lista
        Tipos das medições: P, Q ou V.

    estados : lista
        Tipo de cada estado: theta ou V.

    barra_estados : lista
        Barra associada a cada estado.

    Retorno
    -------
    x : vetor
        Estado estimado.

    r : vetor
        Resíduo final.

    H : matriz
        Jacobiana no estado final.

    G_matrix : matriz
        Matriz ganho HᵀWH.

    Omega : matriz
        Matriz de covariância dos resíduos.

    r_normalizado : vetor
        Resíduos normalizados.

    convergiu : bool
        Indica se o método convergiu.

    iteracoes : int
        Número de iterações realizadas.
    """

    x = np.copy(x0)
    
    convergiu = False
    iteracoes = 0
    delta_norm = np.inf

    for iteracao in range(max_iteracao):

        iteracoes = iteracao + 1

        h_x = calcular_h_x(
            x=x,
            Y=Y,
            tipos_z=tipos_z,
            k=k,
            m=m,
        )

        H = calcular_jacobiana(
            x=x,
            Y=Y,
            k=k,
            m=m,
            tipos_z=tipos_z,
            estados=estados,
            barra_estados=barra_estados,
        )

        # Resíduo -> r = z - h(x)
        r = z - h_x

        # Matriz ganho -> G = Hᵀ W H
        G_matrix = H.T @ W @ H

        # Vetor de correção -> Δx = G⁺ Hᵀ W r
        delta_x = (
            np.linalg.pinv(G_matrix) @ (H.T @ W @ r)
            )

        x += delta_x.flatten()

        delta_norm = np.linalg.norm(delta_x)

        if delta_norm < tol:

            convergiu = True

            break

    # RECALCULAR TUDO NO ESTADO FINAL
    h_x = calcular_h_x(
        x=x,
        Y=Y,
        tipos_z=tipos_z,
        k=k,
        m=m,
    )

    H = calcular_jacobiana(
        x=x,
        Y=Y,
        k=k,
        m=m,
        tipos_z=tipos_z,
        estados=estados,
        barra_estados=barra_estados,
    )

    r = z - h_x

    G_matrix = H.T @ W @ H

    # COVARIÂNCIA DOS RESÍDUOS
    R_cov = np.linalg.pinv(W)

    Omega = (
        R_cov
        - H
        @ np.linalg.pinv(G_matrix)
        @ H.T
    )

    # Desvio padrão dos resíduos
    sigma_residual = np.sqrt(
        np.abs(np.diag(Omega))
    )

    # Evita divisão por zero
    epsilon = 1e-12

    r_normalizado = np.abs(
        r.flatten()
        / (sigma_residual + epsilon)
    )

    return {
        "x": x,
        "h_x": h_x,
        "r": r,
        "H": H,
        "G": G_matrix,
        "Omega": Omega,
        "sigma_residual": sigma_residual,
        "r_normalizado": r_normalizado,
        "convergiu": convergiu,
        "iteracoes": iteracoes,
        "delta_norm": delta_norm,
        # Dados utilizados na estimação
        "z": z,
        "tipos_z": tipos_z,
        "k": k,
        "m": m,
    }




