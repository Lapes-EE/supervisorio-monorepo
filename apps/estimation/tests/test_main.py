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
