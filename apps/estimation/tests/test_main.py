from unittest.mock import MagicMock

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from src.api.main import (
    app,
    get_session,
    normalize_database_url,
    _enriquecer_item_pq,
    _reset_cache,
)
from src.core.config import Sbase
from .test_run_estimator import criar_telemetry_data_teste

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_estimation_cache():
    _reset_cache()
    yield
    _reset_cache()


def test_normalize_database_url():
    assert normalize_database_url("postgres://u:p@h:5432/db") == "postgresql+psycopg://u:p@h:5432/db"
    assert normalize_database_url("postgres+psycopg://u:p@h:5432/db") == "postgresql+psycopg://u:p@h:5432/db"
    assert normalize_database_url("postgresql://u:p@h:5432/db") == "postgresql+psycopg://u:p@h:5432/db"
    assert normalize_database_url("postgresql+psycopg://u:p@h:5432/db") == "postgresql+psycopg://u:p@h:5432/db"



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
        assert len(data["history"]) == 1
        assert len(data["history"][0]["data"]) == 14
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


def test_post_estimation_with_active_and_reactive_power_overrides():
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
        response = client.post(
            "/estimation",
            json={
                "overrides": [
                    {
                        "meterId": 1,
                        "potenciaAtivaFundamentalC": 500.0,
                        "potenciaReativaC": 120.0,
                    }
                ]
            },
        )
        assert response.status_code == 200
        meter1 = next(
            item for item in response.json()["data"] if item["ID_medidor"] == 1
        )
        assert meter1["potencia_ativa_medida_W"] == pytest.approx(500.0, abs=0.01)
        assert meter1["potencia_reativa_medida_VAr"] == pytest.approx(120.0, abs=0.01)
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


def _comparacao_teste():
    return pd.DataFrame({
        "Tipo": ["P", "Q"],
        "Barra_k": [0, 0],
        "Barra_m": [3, 3],
        "z_medida (pu)": [0.0015, -0.0004],
        "z_estimada (pu)": [0.0012, -0.0003],
        "Residuo (pu)": [0.0003, -0.0001],
        "Sigma Residual": [0.001, 0.001],
        "Residuo Normalizado": [0.3, -0.1],
    })


def test_enriquecer_item_pq_converte_pu_para_unidades_fisicas():
    item = {}
    _enriquecer_item_pq(item, _comparacao_teste(), 3)

    assert item["potencia_ativa_medida_W"] == round(0.0015 * Sbase, 2)
    assert item["potencia_ativa_W"] == round(0.0012 * Sbase, 2)
    assert item["erro_potencia_ativa_W"] == round(
        0.0015 * Sbase - 0.0012 * Sbase, 2
    )
    assert item["potencia_reativa_medida_VAr"] == round(-0.0004 * Sbase, 2)
    assert item["potencia_reativa_VAr"] == round(-0.0003 * Sbase, 2)
    assert item["erro_potencia_reativa_VAr"] == round(
        -0.0004 * Sbase - (-0.0003 * Sbase), 2
    )


def test_enriquecer_item_pq_erro_eh_medido_menos_estimado():
    item = {}
    _enriquecer_item_pq(item, _comparacao_teste(), 3)

    assert item["erro_potencia_ativa_W"] == pytest.approx(
        item["potencia_ativa_medida_W"] - item["potencia_ativa_W"], abs=0.01
    )
    assert item["erro_potencia_reativa_VAr"] == pytest.approx(
        item["potencia_reativa_medida_VAr"] - item["potencia_reativa_VAr"],
        abs=0.01,
    )


def test_enriquecer_item_pq_sem_match_retorna_none():
    item = {}
    _enriquecer_item_pq(item, _comparacao_teste(), 99)

    assert item["potencia_ativa_medida_W"] is None
    assert item["potencia_ativa_W"] is None
    assert item["erro_potencia_ativa_W"] is None
    assert item["potencia_reativa_medida_VAr"] is None
    assert item["potencia_reativa_VAr"] is None
    assert item["erro_potencia_reativa_VAr"] is None


def test_get_estimation_includes_power_quantities():
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

        for item in data["data"]:
            assert "potencia_ativa_medida_W" in item
            assert "potencia_ativa_W" in item
            assert "erro_potencia_ativa_W" in item
            assert "potencia_reativa_medida_VAr" in item
            assert "potencia_reativa_VAr" in item
            assert "erro_potencia_reativa_VAr" in item

        # Medidor 1: P = 159.27734 W, Q = -2.441406 VAr no payload de teste.
        # Valores próximos a estes provam a conversão pu -> unidade física.
        meter1 = next(item for item in data["data"] if item["ID_medidor"] == 1)
        assert meter1["potencia_ativa_medida_W"] == pytest.approx(159.27734, abs=0.01)
        assert meter1["potencia_reativa_medida_VAr"] == pytest.approx(-2.441406, abs=0.01)
        assert meter1["erro_potencia_ativa_W"] is not None
        assert meter1["erro_potencia_reativa_VAr"] is not None
    finally:
        app.dependency_overrides.clear()


def test_get_estimation_uses_cache():
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
        # First call queries DB
        res1 = client.get("/estimation")
        assert res1.status_code == 200
        initial_calls = mock_session.execute.call_count
        assert initial_calls > 0

        # Second call hits cache (does not query DB again)
        res2 = client.get("/estimation")
        assert res2.status_code == 200
        assert mock_session.execute.call_count == initial_calls
        assert res1.json() == res2.json()
    finally:
        app.dependency_overrides.clear()


def test_post_estimation_with_empty_overrides_uses_cache():
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
        res1 = client.get("/estimation")
        assert res1.status_code == 200
        calls_after_get = mock_session.execute.call_count

        res2 = client.post("/estimation", json={"overrides": []})
        assert res2.status_code == 200
        assert mock_session.execute.call_count == calls_after_get
        assert res1.json() == res2.json()
    finally:
        app.dependency_overrides.clear()


def test_post_estimation_with_overrides_uses_raw_cache_and_does_not_mutate():
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
        # First call populates raw cache
        res_get = client.get("/estimation")
        assert res_get.status_code == 200
        calls_after_get = mock_session.execute.call_count

        # Override meter 1 voltage
        res_post = client.post(
            "/estimation",
            json={"overrides": [{"meterId": 1, "tensaoFaseNeutroC": 999.0}]},
        )
        assert res_post.status_code == 200
        # Should not query DB again because raw snapshots are cached
        assert mock_session.execute.call_count == calls_after_get

        post_data = res_post.json()["data"]
        meter1_post = next(item for item in post_data if item["ID_medidor"] == 1)
        assert meter1_post["tensao_medida_V"] == 999.0

        # Subsequent GET should still return original unmutated cached value
        res_get2 = client.get("/estimation")
        assert res_get2.status_code == 200
        meter1_get2 = next(
            item for item in res_get2.json()["data"] if item["ID_medidor"] == 1
        )
        assert meter1_get2["tensao_medida_V"] == pytest.approx(218.7025, abs=0.01)
    finally:
        app.dependency_overrides.clear()


