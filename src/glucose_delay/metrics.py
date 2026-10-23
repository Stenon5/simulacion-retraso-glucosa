"""Métricas de error y de alarma por corrida.

Definiciones en docs/decisiones-de-implementacion.md, secciones 8 y 9.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .reconstruct import alarm_times


def rmse(estimate, truth) -> float:
    e = np.asarray(estimate, dtype=float) - np.asarray(truth, dtype=float)
    return float(np.sqrt(np.mean(e**2)))


def rmse_below(estimate, truth, threshold_mg_dl: float) -> float:
    """RMSE solo en las muestras donde la glucosa real está bajo el umbral."""
    truth = np.asarray(truth, dtype=float)
    mask = truth < threshold_mg_dl
    if not mask.any():
        return float("nan")
    return rmse(np.asarray(estimate, dtype=float)[mask], truth[mask])


def true_episode(blood, threshold_mg_dl: float, dt_min: float) -> tuple[float, float]:
    """Inicio y fin del episodio real bajo el umbral. Hay uno solo por construcción."""
    below = np.flatnonzero(np.asarray(blood, dtype=float) < threshold_mg_dl)
    if below.size == 0:
        raise ValueError("la glucosa en sangre nunca baja del umbral")
    if np.any(np.diff(below) != 1):
        raise ValueError("se esperaba un solo episodio bajo el umbral")
    return float(below[0] * dt_min), float(below[-1] * dt_min)


@dataclass(frozen=True)
class AlarmOutcome:
    detection_min: float  # NaN si el episodio se perdió
    false_alarms: int
    total_alarms: int

    @property
    def detected(self) -> bool:
        return not np.isnan(self.detection_min)


def episode_alarm(
    series,
    episode: tuple[float, float],
    threshold_mg_dl: float,
    dt_min: float,
    early_window_min: float = 30.0,
    late_window_min: float = 30.0,
) -> AlarmOutcome:
    """Momento de detección del episodio real y número de falsas alarmas.

    Detección: primer cruce dentro de [inicio - early, fin].
    Falsa alarma: cruce fuera de [inicio - early, fin + late].
    """
    start, end = episode
    times = alarm_times(series, threshold_mg_dl, dt_min)
    in_detection = times[(times >= start - early_window_min) & (times <= end)]
    related = (times >= start - early_window_min) & (times <= end + late_window_min)
    detection = float(in_detection[0]) if in_detection.size else float("nan")
    return AlarmOutcome(
        detection_min=detection,
        false_alarms=int(np.count_nonzero(~related)),
        total_alarms=int(times.size),
    )
