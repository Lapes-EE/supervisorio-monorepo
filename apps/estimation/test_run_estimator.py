# ==========================================
# TESTE COMPLETO DO ESTIMADOR
# ==========================================

from .run_estimator import executar_estimador


def criar_telemetry_data_teste():

    return [
    {
      "id": 1077,
      "meterId": 1,
      "time": "2026-08-20T17:08:40.501Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.7025,
        "potenciaAtivaFundamentalC": 159.27734,
        "potenciaReativaC": -2.441406
      }
    },
    {
      "id": 1075,
      "meterId": 2,
      "time": "2026-08-20T17:08:40.483Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.62039,
        "potenciaAtivaFundamentalC": 724.90234,
        "potenciaReativaC": -86.13281
      }
    },
    {
      "id": 1084,
      "meterId": 3,
      "time": "2026-08-20T17:08:40.655Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 217.88164,
        "potenciaAtivaFundamentalC": 2368.0664,
        "potenciaReativaC": -364.16016
      }
    },
    {
      "id": 1082,
      "meterId": 4,
      "time": "2026-08-20T17:08:40.581Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.44875,
        "potenciaAtivaFundamentalC": 686.8164,
        "potenciaReativaC": -106.44531
      }
    },
    {
      "id": 1078,
      "meterId": 5,
      "time": "2026-08-20T17:08:40.527Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.84093,
        "potenciaAtivaFundamentalC": 240.72266,
        "potenciaReativaC": -59.472656
      }
    },
    {
      "id": 1087,
      "meterId": 6,
      "time": "2026-08-20T17:08:40.760Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.56047,
        "potenciaAtivaFundamentalC": 491.11328,
        "potenciaReativaC": -114.0625
      }
    },
    {
      "id": 1081,
      "meterId": 7,
      "time": "2026-08-20T17:08:40.571Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 217.5036,
        "potenciaAtivaFundamentalC": 0,
        "potenciaReativaC": 0
      }
    },
        
    {
      "id": 1079,
      "meterId": 8,
      "time": "2026-08-20T17:08:40.552Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.57405,
        "potenciaAtivaFundamentalC": 238.57422,
        "potenciaReativaC": -50.195312
      }
    },
    {
      "id": 1086,
      "meterId": 9,
      "time": "2026-08-20T17:08:40.726Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.77179,
        "potenciaAtivaFundamentalC": 0,
        "potenciaReativaC": 0
      }
    },
    {
      "id": 1083,
      "meterId": 10,
      "time": "2026-08-20T17:08:40.598Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 217.75493,
        "potenciaAtivaFundamentalC": 2325.586,
        "potenciaReativaC": 1354.9805
      }
    },
    {
      "id": 1080,
      "meterId": 11,
      "time": "2026-08-20T17:08:40.564Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.9925,
        "potenciaAtivaFundamentalC": 0,
        "potenciaReativaC": 0
      }
    },
    {
      "id": 1076,
      "meterId": 12,
      "time": "2026-08-20T17:08:40.485Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.56343,
        "potenciaAtivaFundamentalC": 1224.5117,
        "potenciaReativaC": -154.49219
      }
    },
    {
      "id": 1088,
      "meterId": 13,
      "time": "2026-08-20T17:08:41.459Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.95085,
        "potenciaAtivaFundamentalC": 0,
        "potenciaReativaC": 0
      }
    },
    {
      "id": 1085,
      "meterId": 14,
      "time": "2026-08-20T17:08:40.696Z",
      "status": "success",
      "measurements": {
        "tensaoFaseNeutroC": 218.47617,
        "potenciaAtivaFundamentalC": 8936.035,
        "potenciaReativaC": 183.39844
      }
    }
  ]


def main():

    telemetry_data = criar_telemetry_data_teste()

    resultado = executar_estimador(
        telemetry_data
    )

    resultados = resultado["resultados"]
    
    # ======================================
    # RESULTADOS PROCESSADOS
    # ======================================


    print("\n---------- MÉTRICAS ----------")

    print(
        "RMSE:",
        resultados["metricas"]["rmse"]
    )

    print(
        "MAE:",
        resultados["metricas"]["mae"]
    )

    # ======================================
    # BAD DATA
    # ======================================

    print("\n---------- BAD DATA ----------")

    print(
        resultados["bad_data"]
    )

    # ======================================
    # ESTADO EM GRAUS
    # ======================================

    print("\n---------- ESTADO EM GRAUS ----------")

    print(
        resultados["estado_graus"]
    )

    # ======================================
    # MEDIÇÕES
    # ======================================

    print("\n---------- TENSÕES ----------")

    print(
        resultados["tensao"]
    )

    print("\n---------- POTÊNCIA ATIVA ----------")

    print(
        resultados["potencia_ativa"]
    )

    print("\n---------- POTÊNCIA REATIVA ----------")

    print(
        resultados["potencia_reativa"]
    )
    
    print("\n---------- Tensões em V ----------")

    print(
        resultados["tensoes"]
    )




# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    main()