"""Tests que corren hoy.

No prueban la simulación, que todavía no existe. Prueban que el archivo de
criterios fijados de antemano esté presente, se pueda leer y esté completo,
porque ese archivo tiene que ser confiable antes de que se produzca cualquier
resultado.
"""

from __future__ import annotations

from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
THRESHOLDS = REPO / "umbrales.yaml"

REQUIRED_CRITERIA = {
    "delay_bias",
    "noise_requirement",
    "earlier_alarm",
    "beats_fixed_population_delay",
    "noise_estimate_recovers",
}


def load() -> dict:
    yaml = pytest.importorskip("yaml", reason="pyyaml es una dependencia declarada")
    with THRESHOLDS.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def test_thresholds_file_exists_and_parses() -> None:
    assert THRESHOLDS.is_file()
    assert isinstance(load(), dict)


def test_every_prespecified_criterion_is_present() -> None:
    data = load()
    ids = {item["id"] for item in data["criteria"]}
    assert REQUIRED_CRITERIA <= ids


def test_every_criterion_has_a_statement_and_a_pass_condition() -> None:
    for item in load()["criteria"]:
        assert item.get("statement")
        assert item.get("passes_if")


def test_the_bias_with_spread_reporting_rule_is_present() -> None:
    """El sesgo nunca se informa sin la dispersión al lado."""
    ids = {item["id"] for item in load()["reporting_rules"]}
    assert "bias_with_spread" in ids


def test_readme_status_matches_results() -> None:
    """El README no puede decir que no hay resultados si results/ tiene archivos de datos."""
    results = REPO / "results"
    data_files = [p for p in results.iterdir() if p.name != ".gitkeep"]
    readme = (REPO / "README.md").read_text(encoding="utf-8")
    if data_files:
        assert "todavía sin resultados" not in readme, "hay resultados, pero el README dice que no"
