"""Modelo directo y generador de datos sintéticos.

Especificado en docs/especificacion.md, secciones 2 y 6. Todavía no está
implementado.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def simulate_blood_glucose(duration_min: float, dt_min: float, seed: int):
    """Genera un registro sintético de glucosa en sangre con una excursión hipoglucémica."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def diffuse(blood_glucose, tau_min: float, dt_min: float):
    """Aplica difusión de primer orden con constante de tiempo tau.

    Se aplica a una serie de glucosa en sangre.
    """
    raise NotImplementedError(NOT_IMPLEMENTED)


def add_noise(signal, sigma, seed: int):
    """Suma ruido gaussiano independiente. El ruido correlacionado corresponde al barrido 2."""
    raise NotImplementedError(NOT_IMPLEMENTED)
