"""Tests for the delay estimator.

The tests that describe unwritten code are skipped with an explicit reason, so
that continuous integration on a scaffold repository reports the truth instead
of a red build. Removing a skip is part of the issue that implements the
matching function.
"""

from __future__ import annotations

import pytest

NOT_YET = "not implemented yet: {}, see docs/spec.md and docs/issues-backlog.md"


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_time_constants"))
def test_noiseless_signals_recover_the_true_delays_exactly() -> None:
    """With no noise the estimator must return both true time constants.

    This is the first test to turn on. If it does not pass, nothing downstream
    means anything, because the problem is linear and exactly determined once
    the noise is removed.
    """
    raise AssertionError("unreachable while skipped")


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_noise_variance"))
def test_noise_variance_estimate_matches_the_injected_noise() -> None:
    raise AssertionError("unreachable while skipped")


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_time_constants"))
def test_a_negative_time_constant_is_reported_as_a_failure() -> None:
    """A negative diffusion time constant is impossible and is never clipped."""
    raise AssertionError("unreachable while skipped")


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_time_constants"))
def test_near_identical_depths_are_reported_as_not_identifiable() -> None:
    """When the two time constants are too close, say so instead of inverting."""
    raise AssertionError("unreachable while skipped")


@pytest.mark.skip(reason=NOT_YET.format("model.simulate_blood_glucose"))
def test_the_same_seed_reproduces_the_same_record() -> None:
    raise AssertionError("unreachable while skipped")


@pytest.mark.skip(reason=NOT_YET.format("reconstruct.reconstruct"))
def test_reconstruction_never_uses_future_samples() -> None:
    """Truncating the record must not change earlier reconstructed values."""
    raise AssertionError("unreachable while skipped")


@pytest.mark.skip(reason=NOT_YET.format("reconstruct.alarm_times"))
def test_alarm_fires_earlier_than_the_single_depth_baseline() -> None:
    raise AssertionError("unreachable while skipped")
