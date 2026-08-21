from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from src.api.main import app, get_session
from .test_run_estimator import criar_telemetry_data_teste

client = TestClient(app)


def test_get_docs():
    response = client.get("/docs")
    assert response.status_code == 200


def test_get_estimation():
    mock_session = MagicMock()
    raw_data = criar_telemetry_data_teste()
    mock_rows = [
        {
            "meterId": item["meterId"],
            "time": item["time"],
            "tensaoFaseNeutroC": item["measurements"]["tensaoFaseNeutroC"],
            "potenciaAtivaFundamentalC": item["measurements"]["potenciaAtivaFundamentalC"],
            "potenciaReativaC": item["measurements"]["potenciaReativaC"],
        }
        for item in raw_data
    ]
    mock_session.execute.return_value.mappings.return_value.all.return_value = mock_rows

    def override_get_session():
        yield mock_session

    app.dependency_overrides[get_session] = override_get_session
    try:
        response = client.get("/estimation")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert len(data["data"]) == 14
        for item in data["data"]:
            assert "barra" in item
            assert "ID_medidor" in item
            assert "tensao_pu" in item
            assert "tensao_V" in item
            assert "tensao_medida_V" in item
            assert "erro_V" in item
    finally:
        app.dependency_overrides.clear()


def test_post_estimation_with_voltage_override():
    mock_session = MagicMock()
    raw_data = criar_telemetry_data_teste()
    mock_rows = [
        {
            "meterId": item["meterId"],
            "time": item["time"],
            "tensaoFaseNeutroC": item["measurements"]["tensaoFaseNeutroC"],
            "potenciaAtivaFundamentalC": item["measurements"]["potenciaAtivaFundamentalC"],
            "potenciaReativaC": item["measurements"]["potenciaReativaC"],
        }
        for item in raw_data
    ]
    mock_session.execute.return_value.mappings.return_value.all.return_value = mock_rows

    def override_get_session():
        yield mock_session

    app.dependency_overrides[get_session] = override_get_session
    try:
        # Override meter 1 voltage to 250.0 V
        payload = {
            "overrides": [
                {
                    "meterId": 1,
                    "tensaoFaseNeutroC": 250.0,
                }
            ]
        }
        response = client.post("/estimation", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        meter1 = next(item for item in data["data"] if item["ID_medidor"] == 1)
        assert meter1["tensao_medida_V"] == 250.0
        assert meter1["erro_V"] is not None
        assert abs(meter1["erro_V"]) > 0.0
    finally:
        app.dependency_overrides.clear()


def test_get_estimation_not_found():
    mock_session = MagicMock()
    mock_session.execute.return_value.mappings.return_value.all.return_value = []

    def override_get_session():
        yield mock_session

    app.dependency_overrides[get_session] = override_get_session
    try:
        response = client.get("/estimation")
        assert response.status_code == 404
        assert response.json()["detail"] == "Nenhuma medida encontrada"
    finally:
        app.dependency_overrides.clear()
