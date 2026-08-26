# ==========================================
# FUNÇÕES DO ESTIMADOR DE ESTADO
# ==========================================
import numpy as np

from .config import num_barras, num_estados

# ESTADOS INICIAIS
def criar_estados_iniciais():
    """
    Cria a definição dos estados e o vetor inicial x0.

    Estados:
        theta_2 ... theta_n
        V_1 ... V_n

    A barra de referência não possui estado de ângulo.
    """

    estados = []
    barra_estados = []

    # Ângulos das barras menos a de referência
    for barra in range(1, num_barras):
        estados.append("theta")
        barra_estados.append(barra)

    # Magnitudes de tensão de todas as barras
    for barra in range(num_barras):
        estados.append("V")
        barra_estados.append(barra)


    # Estado inicial:
    # theta = 0
    # V = 1 pu
    x0 = np.zeros(num_estados)
    x0[num_barras - 1:] = 1.0

    return x0, estados, barra_estados

# ACESSO AOS ESTADOS
def get_theta(x, barra):
    """
    Retorna o ângulo da barra.

    A barra 0 é a referência:
        theta_0 = 0
    """

    if barra == 0:
        return 0.0

    return x[barra - 1]

def get_V(x, barra):
    """
    Retorna a magnitude da tensão da barra.
    """

    indice = (num_barras - 1) + barra

    return x[indice]

# FLUXO DE POTÊNCIA ATIVA
def calcular_Pkm(x, G, B, k, m):

    theta_k = get_theta(x, k)
    theta_m = get_theta(x, m)

    Vk = get_V(x, k)
    Vm = get_V(x, m)

    delta = theta_k - theta_m

    return (
        Vk**2 * G
        - Vk * Vm * (
            G * np.cos(delta)
            + B * np.sin(delta)
        )
    )

# FLUXO DE POTÊNCIA REATIVA
def calcular_Qkm(x, G, B, k, m):

    theta_k = get_theta(x, k)
    theta_m = get_theta(x, m)

    Vk = get_V(x, k)
    Vm = get_V(x, m)

    delta = theta_k - theta_m

    return (
        -Vk**2 * B
        - Vk * Vm * (
            G * np.sin(delta)
            - B * np.cos(delta)
        )
    )

# INJEÇÃO DE POTÊNCIA ATIVA
def calcular_Pk(x, G, B, k):

    theta_k = get_theta(x, k)
    Vk = get_V(x, k)

    Pk = 0.0

    for m in range(num_barras):

        theta_m = get_theta(x, m)
        Vm = get_V(x, m)

        Pk += Vk * Vm * (
            G[k, m] * np.cos(theta_k - theta_m)
            + B[k, m] * np.sin(theta_k - theta_m)
        )

    return Pk

# INJEÇÃO DE POTÊNCIA REATIVA
def calcular_Qk(x, G, B, k):

    theta_k = get_theta(x, k)
    Vk = get_V(x, k)

    Qk = 0.0

    for m in range(num_barras):

        theta_m = get_theta(x, m)
        Vm = get_V(x, m)

        Qk += Vk * Vm * (
            G[k, m] * np.sin(theta_k - theta_m)
            - B[k, m] * np.cos(theta_k - theta_m)
        )

    return Qk

# FUNÇÃO DO MODELO DE MEDIÇÃO h(x)
def calcular_h_x(x, Y, tipos_z, k, m):

    h_x = np.zeros((len(tipos_z), 1))

    # G e B DA YBUS
    G_ybus = np.real(Y)
    B_ybus = np.imag(Y)

    for i, tipo in enumerate(tipos_z):

        barra_k = k[i]
        barra_m = m[i]

        # POTÊNCIA ATIVA
        if tipo == "P":

            if barra_m == barra_k:

                h_x[i] = calcular_Pk(
                    x,
                    G_ybus,
                    B_ybus,
                    barra_k
                )

            else:
                G_linha = -np.real(Y[barra_k, barra_m])
                B_linha = -np.imag(Y[barra_k, barra_m])

                h_x[i] = calcular_Pkm(
                    x,
                    G_linha,
                    B_linha,
                    barra_k,
                    barra_m
                )

        # POTÊNCIA REATIVA
        elif tipo == "Q":

            if barra_m == barra_k:

                h_x[i] = calcular_Qk(
                    x,
                    G_ybus,
                    B_ybus,
                    barra_k
                )

            else:

                G_linha = -np.real(Y[barra_k, barra_m])
                B_linha = -np.imag(Y[barra_k, barra_m])

                h_x[i] = calcular_Qkm(
                    x,
                    G_linha,
                    B_linha,
                    barra_k,
                    barra_m
                )


        # TENSÃO
        elif tipo == "V":

            h_x[i] = get_V(
                x,
                barra_k
            )

        else:

            raise ValueError(
                f"Tipo de medição inválido: {tipo}"
            )

    return h_x
