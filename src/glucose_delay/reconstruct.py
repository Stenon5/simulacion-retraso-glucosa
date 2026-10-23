"""Reconstruction of blood glucose from the two depth readings.

Specified in docs/spec.md, section 5. Not implemented yet.

Causal only. The filter may use past samples and the current one, never
future samples, because a device cannot.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def reconstruct(g1, g2, tau1: float, tau2: float, sigma: float, dt_min: float):
    """Kalman reconstruction with state [blood, slope, depth 1, depth 2]."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def alarm_times(series, threshold_mg_dl: float, dt_min: float):
    """Times at which a low glucose alarm would fire for a given series."""
    raise NotImplementedError(NOT_IMPLEMENTED)
