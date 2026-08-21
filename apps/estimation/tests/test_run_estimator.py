import numpy as np

from src.services.measurements import preparar_medicoes
from src.services.run_estimator import executar_estimador


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
                "potenciaReativaC": -2.441406,
            },
        },
        {
            "id": 1075,
            "meterId": 2,
            "time": "2026-08-20T17:08:40.483Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.62039,
                "potenciaAtivaFundamentalC": 724.90234,
                "potenciaReativaC": -86.13281,
            },
        },
        {
            "id": 1084,
            "meterId": 3,
            "time": "2026-08-20T17:08:40.655Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 217.88164,
                "potenciaAtivaFundamentalC": 2368.0664,
                "potenciaReativaC": -364.16016,
            },
        },
        {
            "id": 1082,
            "meterId": 4,
            "time": "2026-08-20T17:08:40.581Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.44875,
                "potenciaAtivaFundamentalC": 686.8164,
                "potenciaReativaC": -106.44531,
            },
        },
        {
            "id": 1078,
            "meterId": 5,
            "time": "2026-08-20T17:08:40.527Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.84093,
                "potenciaAtivaFundamentalC": 240.72266,
                "potenciaReativaC": -59.472656,
            },
        },
        {
            "id": 1087,
            "meterId": 6,
            "time": "2026-08-20T17:08:40.760Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.56047,
                "potenciaAtivaFundamentalC": 491.11328,
                "potenciaReativaC": -114.0625,
            },
        },
        {
            "id": 1081,
            "meterId": 7,
            "time": "2026-08-20T17:08:40.571Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 217.5036,
                "potenciaAtivaFundamentalC": 0.0,
                "potenciaReativaC": 0.0,
            },
        },
        {
            "id": 1079,
            "meterId": 8,
            "time": "2026-08-20T17:08:40.552Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.57405,
                "potenciaAtivaFundamentalC": 238.57422,
                "potenciaReativaC": -50.195312,
            },
        },
        {
            "id": 1086,
            "meterId": 9,
            "time": "2026-08-20T17:08:40.726Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.77179,
                "potenciaAtivaFundamentalC": 0.0,
                "potenciaReativaC": 0.0,
            },
        },
        {
            "id": 1083,
            "meterId": 10,
            "time": "2026-08-20T17:08:40.598Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 217.75493,
                "potenciaAtivaFundamentalC": 2325.586,
                "potenciaReativaC": 1354.9805,
            },
        },
        {
            "id": 1080,
            "meterId": 11,
            "time": "2026-08-20T17:08:40.564Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.9925,
                "potenciaAtivaFundamentalC": 0.0,
                "potenciaReativaC": 0.0,
            },
        },
        {
            "id": 1076,
            "meterId": 12,
            "time": "2026-08-20T17:08:40.485Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.56343,
                "potenciaAtivaFundamentalC": 1224.5117,
                "potenciaReativaC": -154.49219,
            },
        },
        {
            "id": 1088,
            "meterId": 13,
            "time": "2026-08-20T17:08:41.459Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.95085,
                "potenciaAtivaFundamentalC": 0.0,
                "potenciaReativaC": 0.0,
            },
        },
        {
            "id": 1085,
            "meterId": 14,
            "time": "2026-08-20T17:08:40.696Z",
            "status": "success",
            "measurements": {
                "tensaoFaseNeutroC": 218.47617,
                "potenciaAtivaFundamentalC": 8936.035,
                "potenciaReativaC": 183.39844,
            },
        },
    ]


def test_executar_estimador_nested_payload():
    telemetry_data = criar_telemetry_data_teste()
    resultado = executar_estimador(telemetry_data)

    assert resultado["estimador"]["convergiu"] is True
    resultados = resultado["resultados"]

    assert "metricas" in resultados
    assert resultados["metricas"]["rmse"] >= 0
    assert resultados["metricas"]["mae"] >= 0

    assert "bad_data" in resultados
    assert isinstance(resultados["bad_data"]["bad_data"], (bool, np.bool_))

    assert "tensoes" in resultados
    assert "data" in resultados["tensoes"]
    assert len(resultados["tensoes"]["data"]) == 14

    for item in resultados["tensoes"]["data"]:
        assert "barra" in item
        assert "ID_medidor" in item
        assert "indice_EE" in item
        assert "tensao_pu" in item
        assert "tensao_V" in item
        assert "tensao_medida_V" in item
        assert "erro_V" in item
        assert item["tensao_pu"] > 0.8
        assert item["tensao_V"] > 180.0


def test_executar_estimador_flat_payload():
    nested_data = criar_telemetry_data_teste()
    flat_data = [
        {
            "meterId": item["meterId"],
            "time": item["time"],
            "tensaoFaseNeutroC": item["measurements"]["tensaoFaseNeutroC"],
            "potenciaAtivaFundamentalC": item["measurements"]["potenciaAtivaFundamentalC"],
            "potenciaReativaC": item["measurements"]["potenciaReativaC"],
        }
        for item in nested_data
    ]

    resultado = executar_estimador(flat_data)
    assert resultado["estimador"]["convergiu"] is True
    assert len(resultado["resultados"]["tensoes"]["data"]) == 14


def test_preparar_medicoes_deduplication():
    data_with_duplicates = [
        {
            "meterId": 1,
            "time": "2026-08-20T17:08:40.000Z",
            "tensaoFaseNeutroC": 210.0,
            "potenciaAtivaFundamentalC": 100.0,
            "potenciaReativaC": 0.0,
        },
        {
            "meterId": 1,
            "time": "2026-08-20T17:08:45.000Z",
            "tensaoFaseNeutroC": 220.0,
            "potenciaAtivaFundamentalC": 150.0,
            "potenciaReativaC": 5.0,
        },
    ]
    dados = preparar_medicoes(data_with_duplicates)
    df_med = dados["df_medicoes"]
    assert len(df_med) == 1
    assert df_med.iloc[0]["tensaoFaseNeutroC"] == 220.0