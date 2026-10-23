"""Tests that run today.

They do not test the simulation, which does not exist. They test that the
pre-specified criteria file is present, parseable and complete, because that
file has to be trustworthy before any result is produced.
"""

from __future__ import annotations

from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
THRESHOLDS = REPO / "thresholds.yaml"

REQUIRED_CRITERIA = {
    "delay_bias",
    "noise_requirement",
    "earlier_alarm",
    "beats_fixed_population_delay",
    "noise_estimate_recovers",
}


def load() -> dict:
    yaml = pytest.importorskip("yaml", reason="pyyaml is a declared dependency")
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
    """Bias is never reported without the spread next to it."""
    ids = {item["id"] for item in load()["reporting_rules"]}
    assert "bias_with_spread" in ids


def test_results_directory_is_still_empty() -> None:
    """While the README says no results yet, results/ must hold no data files."""
    results = REPO / "results"
    data_files = [p for p in results.iterdir() if p.name != ".gitkeep"]
    assert data_files == [], f"README says no results yet but found {data_files}"
