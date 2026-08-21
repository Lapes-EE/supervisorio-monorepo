# ==========================================
# JACOBIANA DO ESTIMADOR DE ESTADO
# ==========================================

import numpy as np

from .config import num_estados
from .functions import (
    get_theta,
    get_V,
    calcular_Pk,
    calcular_Qk,
)

# DERIVADAS DE Pkm
def dPkm_dtheta_k(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * Vm
        * (
            Gkm * np.sin(theta_k - theta_m)
            - Bkm * np.cos(theta_k - theta_m)
        )
    )

def dPkm_dtheta_m(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * Vm
        * (
            Bkm * np.cos(theta_k - theta_m)
            - Gkm * np.sin(theta_k - theta_m)
        )
    )

def dPkm_dVk(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        2 * Vk * Gkm
        - Vm * (
            Gkm * np.cos(theta_k - theta_m)
            + Bkm * np.sin(theta_k - theta_m)
        )
    )

def dPkm_dVm(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        -Vk * (
            Gkm * np.cos(theta_k - theta_m)
            + Bkm * np.sin(theta_k - theta_m)
        )
    )

# DERIVADAS DE Qkm
def dQkm_dtheta_k(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        -Vk * Vm
        * (
            Gkm * np.cos(theta_k - theta_m)
            + Bkm * np.sin(theta_k - theta_m)
        )
    )

def dQkm_dtheta_m(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * Vm
        * (
            Gkm * np.cos(theta_k - theta_m)
            + Bkm * np.sin(theta_k - theta_m)
        )
    )

def dQkm_dVk(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        -2 * Vk * Bkm
        - Vm * (
            Gkm * np.sin(theta_k - theta_m)
            - Bkm * np.cos(theta_k - theta_m)
        )
    )

def dQkm_dVm(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        -Vk * (
            Gkm * np.sin(theta_k - theta_m)
            - Bkm * np.cos(theta_k - theta_m)
        )
    )

# DERIVADAS DE Pk
def dPk_dtheta_k(Qk, Vk, Bkk):
    return -Qk - Vk**2 * Bkk

def dPk_dtheta_m(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * Vm
        * (
            Gkm * np.sin(theta_k - theta_m)
            - Bkm * np.cos(theta_k - theta_m)
        )
    )

def dPk_dVk(Pk, Vk, Gkk):
    return Pk / Vk + Vk * Gkk

def dPk_dVm(Vk, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * (
            Gkm * np.cos(theta_k - theta_m)
            + Bkm * np.sin(theta_k - theta_m)
        )
    )

# DERIVADAS DE Qk
def dQk_dtheta_k(Pk, Vk, Gkk):
    return Pk - Vk**2 * Gkk

def dQk_dtheta_m(Vk, Vm, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * Vm
        * (
            -Gkm * np.cos(theta_k - theta_m)
            -Bkm * np.sin(theta_k - theta_m)
        )
    )

def dQk_dVk(Qk, Vk, Bkk):
    return Qk / Vk - Vk * Bkk

def dQk_dVm(Vk, Gkm, Bkm, theta_k, theta_m):
    return (
        Vk * (
            Gkm * np.sin(theta_k - theta_m)
            - Bkm * np.cos(theta_k - theta_m)
        )
    )

# DERIVADAS DA MEDIÇÃO DE TENSÃO
def dVk_dVk():
    return 1.0

def dVk_dVm():
    return 0.0

def dVk_dtheta_k():
    return 0.0

def dVk_dtheta_m():
    return 0.0

# CONSTRUÇÃO DA MATRIZ JACOBIANA H
def calcular_jacobiana(
    x,
    Y,
    k,
    m,
    tipos_z,
    estados,
    barra_estados,
):
    """
    Constrói a matriz Jacobiana H.

    Linhas:
        medições

    Colunas:
        estados do estimador
    """

    G = np.real(Y)
    B = np.imag(Y)

    num_z = len(tipos_z)

    H = np.zeros((num_z, num_estados))

    for i in range(num_z):

        tipo_med = tipos_z[i]

        barra_k = k[i]
        barra_m = m[i]

        theta_k = get_theta(x, barra_k)
        Vk = get_V(x, barra_k)

        theta_m = get_theta(x, barra_m)
        Vm = get_V(x, barra_m)

        Gkm = G[barra_k, barra_m]
        Bkm = B[barra_k, barra_m]

        Gkk = G[barra_k, barra_k]
        Bkk = B[barra_k, barra_k]

        # P
        if tipo_med == "P":

            # Fluxo Pkm
            if barra_m != barra_k:

                for j, estado in enumerate(estados):

                    barra_estado = barra_estados[j]

                    if estado == "theta":

                        if barra_estado == barra_k:

                            H[i, j] = dPkm_dtheta_k(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

                        elif barra_estado == barra_m:

                            H[i, j] = dPkm_dtheta_m(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

                    elif estado == "V":

                        if barra_estado == barra_k:

                            H[i, j] = dPkm_dVk(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

                        elif barra_estado == barra_m:

                            H[i, j] = dPkm_dVm(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

            # Injeção Pk
            else:

                Pk = calcular_Pk(
                    x,
                    G,
                    B,
                    barra_k,
                )

                Qk = calcular_Qk(
                    x,
                    G,
                    B,
                    barra_k,
                )

                for j, estado in enumerate(estados):

                    barra_estado = barra_estados[j]

                    # Própria barra
                    if barra_estado == barra_k:

                        if estado == "theta":

                            H[i, j] = dPk_dtheta_k(
                                Qk,
                                Vk,
                                Bkk,
                            )

                        elif estado == "V":

                            H[i, j] = dPk_dVk(
                                Pk,
                                Vk,
                                Gkk,
                            )

                    # Barras vizinhas/outros estados
                    else:

                        theta_m_estado = get_theta(
                            x,
                            barra_estado,
                        )

                        Vm_estado = get_V(
                            x,
                            barra_estado,
                        )

                        Gkm_estado = G[
                            barra_k,
                            barra_estado,
                        ]

                        Bkm_estado = B[
                            barra_k,
                            barra_estado,
                        ]

                        if estado == "theta":

                            H[i, j] = dPk_dtheta_m(
                                Vk,
                                Vm_estado,
                                Gkm_estado,
                                Bkm_estado,
                                theta_k,
                                theta_m_estado,
                            )

                        elif estado == "V":

                            H[i, j] = dPk_dVm(
                                Vk,
                                Gkm_estado,
                                Bkm_estado,
                                theta_k,
                                theta_m_estado,
                            )

        # Q
        elif tipo_med == "Q":

            # Fluxo Qkm
            if barra_m != barra_k:

                for j, estado in enumerate(estados):

                    barra_estado = barra_estados[j]

                    if estado == "theta":

                        if barra_estado == barra_k:

                            H[i, j] = dQkm_dtheta_k(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

                        elif barra_estado == barra_m:

                            H[i, j] = dQkm_dtheta_m(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

                    elif estado == "V":

                        if barra_estado == barra_k:

                            H[i, j] = dQkm_dVk(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

                        elif barra_estado == barra_m:

                            H[i, j] = dQkm_dVm(
                                Vk,
                                Vm,
                                Gkm,
                                Bkm,
                                theta_k,
                                theta_m,
                            )

            # Injeção Qk
            else:

                Pk = calcular_Pk(
                    x,
                    G,
                    B,
                    barra_k,
                )

                Qk = calcular_Qk(
                    x,
                    G,
                    B,
                    barra_k,
                )

                for j, estado in enumerate(estados):

                    barra_estado = barra_estados[j]

                    # Própria barra
                    if barra_estado == barra_k:

                        if estado == "theta":

                            H[i, j] = dQk_dtheta_k(
                                Pk,
                                Vk,
                                Gkk,
                            )

                        elif estado == "V":

                            H[i, j] = dQk_dVk(
                                Qk,
                                Vk,
                                Bkk,
                            )

                    # Barras vizinhas/outros estados
                    else:

                        theta_m_estado = get_theta(
                            x,
                            barra_estado,
                        )

                        Vm_estado = get_V(
                            x,
                            barra_estado,
                        )

                        Gkm_estado = G[
                            barra_k,
                            barra_estado,
                        ]

                        Bkm_estado = B[
                            barra_k,
                            barra_estado,
                        ]

                        if estado == "theta":

                            H[i, j] = dQk_dtheta_m(
                                Vk,
                                Vm_estado,
                                Gkm_estado,
                                Bkm_estado,
                                theta_k,
                                theta_m_estado,
                            )

                        elif estado == "V":

                            H[i, j] = dQk_dVm(
                                Vk,
                                Gkm_estado,
                                Bkm_estado,
                                theta_k,
                                theta_m_estado,
                            )

        # V
        elif tipo_med == "V":

            for j, estado in enumerate(estados):

                barra_estado = barra_estados[j]

                if estado == "theta":

                    H[i, j] = dVk_dtheta_k()

                elif estado == "V":

                    if barra_estado == barra_k:
                        H[i, j] = dVk_dVk()
                    else:
                        H[i, j] = dVk_dVm()

        else:

            raise ValueError(
                f"Tipo de medição inválido: {tipo_med}"
            )

    return H











