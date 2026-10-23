"""Forward model and synthetic data generator.

Specified in docs/spec.md, sections 2 and 6. Not implemented yet.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def simulate_blood_glucose(duration_min: float, dt_min: float, seed: int):
    """Generate a synthetic blood glucose record with one hypoglycemic excursion."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def diffuse(blood_glucose, tau_min: float, dt_min: float):
    """Apply first order diffusion with time constant tau to a blood glucose series."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def add_noise(signal, sigma, seed: int):
    """Add independent Gaussian noise. Correlated noise belongs to sweep 2."""
    raise NotImplementedError(NOT_IMPLEMENTED)
