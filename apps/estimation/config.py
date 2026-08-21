# ==========================================
# CONFIGURAÇÕES DO ESTIMADOR DE ESTADO
# ==========================================

Sbase = 100000.0
Vbase = 220.0
Zbase = (Vbase**2) / Sbase

tol = 10e-4

barra_referencia = 0
max_iteracao = 10
limiar_bad_data = 3.0

# NOME DAS BARRAS - Ordem utilizada nas matrizes do sistema
bus_name = [
    'QG', 
    'EL', 
    'Q11', 
    'Q12', 
    'Q13', 
    'Q14',
    'Q21a', 
    'Q21b', 
    'Q22', 
    'Q23', 
    'Q24',
    'Q31', 
    'Q32', 
    'Q33'
]

# meterId do banco de dados → nome da barra
mapa_medidor_para_nome = {
    13: 'EL',
    12: 'Q11',
    1: 'Q12',
    2: 'Q13',
    3: 'Q14',
    11: 'Q21a',
    10: 'Q21b',
    6: 'Q22',
    4: 'Q23',
    5: 'Q24',
    9: 'Q31',
    7: 'Q32',
    8: 'Q33',
    14: 'QG'
}

# NOME DA BARRA → ÍNDICE DA MATRIZ utilizado pelo estimador
i_bus = {
    nome: indice
    for indice, nome in enumerate(bus_name)
}

# meterId do banco de dados → índice usado pelo estimador
mapa_medidor_para_indice = {
    meter_id: i_bus[nome_barra]
    for meter_id, nome_barra
    in mapa_medidor_para_nome.items()
}


# VARIÂNCIAS DAS MEDIÇÕES - retirada dos certificados de calibração dos medidores
variancia_por_barra = {
    0 :  {
        'V': 0.02/100, 
        'P': 0.02/100, 
        'Q': 0.02/100},
    1 :  {
        'V': 0.05/100, 
        'P': 0.01/100, 
        'Q': 0.01/100},
    2 : {
        'V': 0.02/100, 
        'P': 0.01/100, 
        'Q': 0.01/100},
    3 : {
        'V': 0.05/100, 
        'P': 0.01/100, 
        'Q': 0.01/100},    #### P e Q = 0, porém influencia na identificação de dados ruins
    4 : {
        'V': 0.02/100, 
        'P': 0.01/100, 
        'Q': 0.01/100},
    5 : {
        'V': 0.04/100, 
        'P': 0.01/100, 
        'Q': 0.01/100},    #### P e Q = 0, porém influencia na identificação de dados ruins
    6 : {
        'V': 0.08/100, 
        'P': 0.20/100, 
        'Q': 0.21/100},
    7 : {
        'V': 0.27/100, 
        'P': 0.27/100, 
        'Q': 0.27/100},
    8 : {
        'V': 0.01/100, 
        'P': 0.04/100, 
        'Q': 0.05/100},
    9 : {
        'V': 0.01/100, 
        'P': 0.08/100, 
        'Q': 0.09/100},
    10 : {
        'V': 0.01/100, 
        'P': 0.07/100, 
        'Q': 0.07/100},    #### V = 0, porém influencia na identificação de dados ruins
    11 : {
        'V': 0.02/100, 
        'P': 0.02/100, 
        'Q': 0.03/100},
    12 : {
        'V': 0.28/100, 
        'P': 0.23/100, 
        'Q': 0.23/100},
    13 : {
        'V': 0.09/100, 
        'P': 0.15/100, 
        'Q': 0.15/100}
}

num_barras = len(bus_name)

num_estados = num_barras * 2 - 1