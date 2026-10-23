"""Delay estimation from two depths, with no blood measurement.

Specified in docs/spec.md, sections 3 and 4. Not implemented yet.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def estimate_noise_variance(series, dt_min: float) -> float:
    """Estimate the noise variance from the second difference of the series."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def estimate_time_constants(g1, g2, dt_min: float):
    """Estimate both time constants with the error in variables correction.

    Must return the two time constants, the estimated noise variance and the
    condition number of the corrected matrix. A negative time constant is a
    failure and is reported as one, never clipped to zero.
    """
    raise NotImplementedError(NOT_IMPLEMENTED)
