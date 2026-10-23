"""El archivo de escenarios contiene la grilla de la sección 7 de la especificación."""

from __future__ import annotations

from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
SCENARIOS = REPO / "escenarios.yaml"


def load() -> dict:
    yaml = pytest.importorskip("yaml", reason="pyyaml es una dependencia declarada")
    with SCENARIOS.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def test_the_specification_grid_is_in_the_config_file() -> None:
    data = load()
    tau = data["etiquetas"]["constante_de_tiempo_min"]
    noise = data["etiquetas"]["ruido_mg_dl"]
    grid = {s["id"]: s for s in data["escenarios"] if s["grupo"] == "grilla"}
    expected = {
        "tipico_ruido_bajo": (tau["corta"], tau["larga"], noise["bajo"]),
        "tipico_ruido_medio": (tau["corta"], tau["larga"], noise["medio"]),
        "tipico_ruido_alto": (tau["corta"], tau["larga"], noise["alto"]),
        "persona_lenta": (tau["larga"], tau["mas_larga"], noise["medio"]),
        "persona_rapida": (tau["la_mas_corta"], tau["corta"], noise["medio"]),
    }
    assert set(grid) == set(expected)
    for scenario_id, (tau1, tau2, sigma) in expected.items():
        row = grid[scenario_id]
        assert (row["tau1_min"], row["tau2_min"], row["ruido_mg_dl"]) == (tau1, tau2, sigma)


def test_every_scenario_has_two_distinct_positive_time_constants() -> None:
    for row in load()["escenarios"]:
        assert 0 < row["tau1_min"] < row["tau2_min"]
        assert row["ruido_mg_dl"] > 0
