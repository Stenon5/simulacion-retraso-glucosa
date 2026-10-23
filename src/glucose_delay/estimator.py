"""Estimación del retraso con dos profundidades, sin ninguna medición en sangre.

Especificado en docs/especificacion.md, secciones 3 y 4. Todavía no está
implementado.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def estimate_noise_variance(series, dt_min: float) -> float:
    """Estima la varianza del ruido a partir de la segunda diferencia de la serie."""
    raise NotImplementedError(NOT_IMPLEMENTED)


def estimate_time_constants(g1, g2, dt_min: float):
    """Estima ambas constantes de tiempo con la corrección del error en las variables.

    Debe devolver las dos constantes de tiempo, la varianza de ruido estimada y
    el número de condición de la matriz corregida. Una constante de tiempo
    negativa es una falla y se informa como tal, nunca se recorta a cero.
    """
    raise NotImplementedError(NOT_IMPLEMENTED)
