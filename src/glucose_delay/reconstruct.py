"""Reconstrucción de la glucosa en sangre a partir de las lecturas de las dos profundidades.

Especificado en docs/especificacion.md, sección 5. Todavía no está
implementado.

Solo causal. El filtro puede usar las muestras pasadas y la actual, nunca
muestras futuras, porque un dispositivo no puede hacerlo.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def reconstruct(g1, g2, tau1: float, tau2: float, sigma: float, dt_min: float):
    """Reconstrucción de Kalman con estado [sangre, pendiente, profundidad 1, profundidad 2]."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def alarm_times(series, threshold_mg_dl: float, dt_min: float):
    """Momentos en que se activaría una alarma de glucosa baja para una serie dada."""
    raise NotImplementedError(NOT_IMPLEMENTED)
