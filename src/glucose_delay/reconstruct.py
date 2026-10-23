"""Reconstrucción de la glucosa en sangre a partir de las lecturas de las dos profundidades.

Especificado en docs/especificacion.md, sección 5. La inicialización y el
ruido de proceso están en docs/decisiones-de-implementacion.md, sección 6, y
run_all.py los escribe en la salida de cada corrida.

Solo causal. El filtro puede usar las muestras pasadas y la actual, nunca
muestras futuras, porque un dispositivo no puede hacerlo.
"""

from __future__ import annotations

import numpy as np
from scipy.linalg import expm

# Densidad espectral del ruido de la pendiente, en (mg/dL/min)^2 por minuto.
PROCESS_NOISE = 1.0 / 30.0
GLUCOSE_PRIOR_SD = 20.0
SLOPE_PRIOR_SD = 1.0
MEASUREMENT_VARIANCE_FLOOR = 1e-6


def discretize(a_cont: np.ndarray, b_cont: np.ndarray, q: float, dt_min: float):
    """Discretización exacta de dx/dt = A x + B w, con w blanco de densidad q (Van Loan)."""
    n = a_cont.shape[0]
    m = np.zeros((2 * n, 2 * n))
    m[:n, :n] = -a_cont
    m[:n, n:] = q * (b_cont @ b_cont.T)
    m[n:, n:] = a_cont.T
    e = expm(m * dt_min)
    f = e[n:, n:].T
    qd = f @ e[:n, n:]
    return f, 0.5 * (qd + qd.T)


def kalman_filter(measurements, f, qd, h, r, x0, p0) -> np.ndarray:
    """Filtro de Kalman estándar. Devuelve el estado filtrado en cada muestra.

    El estado en la muestra k usa solo las mediciones 0..k.
    """
    y = np.asarray(measurements, dtype=float)
    if y.ndim == 1:
        y = y[:, None]
    n_steps = y.shape[0]
    x = np.array(x0, dtype=float)
    p = np.array(p0, dtype=float)
    out = np.empty((n_steps, x.size))
    for k in range(n_steps):
        if k > 0:
            x = f @ x
            p = f @ p @ f.T + qd
        innovation = y[k] - h @ x
        s = h @ p @ h.T + r
        gain = np.linalg.solve(s, h @ p).T
        x = x + gain @ innovation
        p = p - gain @ h @ p
        p = 0.5 * (p + p.T)
        out[k] = x
    return out


def _measurement_variance(sigma: float) -> float:
    return max(float(sigma) ** 2, MEASUREMENT_VARIANCE_FLOOR)


def reconstruct_states(
    g1,
    g2,
    tau1: float,
    tau2: float,
    sigma: float,
    dt_min: float,
    *,
    process_noise: float = PROCESS_NOISE,
    glucose_prior_sd: float = GLUCOSE_PRIOR_SD,
    slope_prior_sd: float = SLOPE_PRIOR_SD,
) -> np.ndarray:
    """Estado filtrado [sangre, pendiente, profundidad 1, profundidad 2] en cada muestra."""
    if tau1 <= 0 or tau2 <= 0:
        raise ValueError("el filtro necesita constantes de tiempo positivas")
    a_cont = np.array(
        [
            [0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 0.0],
            [1.0 / tau1, 0.0, -1.0 / tau1, 0.0],
            [1.0 / tau2, 0.0, 0.0, -1.0 / tau2],
        ]
    )
    b_cont = np.array([[0.0], [1.0], [0.0], [0.0]])
    f, qd = discretize(a_cont, b_cont, process_noise, dt_min)
    h = np.array([[0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]])
    r = _measurement_variance(sigma) * np.eye(2)
    g1 = np.asarray(g1, dtype=float)
    g2 = np.asarray(g2, dtype=float)
    x0 = np.array([g1[0], 0.0, g1[0], g2[0]])
    p0 = np.diag([glucose_prior_sd**2, slope_prior_sd**2, glucose_prior_sd**2, glucose_prior_sd**2])
    return kalman_filter(np.column_stack([g1, g2]), f, qd, h, r, x0, p0)


def reconstruct(g1, g2, tau1: float, tau2: float, sigma: float, dt_min: float, **kwargs):
    """Reconstrucción de Kalman con estado [sangre, pendiente, profundidad 1, profundidad 2].

    Devuelve la glucosa en sangre reconstruida en cada muestra.
    """
    return reconstruct_states(g1, g2, tau1, tau2, sigma, dt_min, **kwargs)[:, 0]


def single_depth_smoother(
    g,
    sigma: float,
    dt_min: float,
    *,
    process_noise: float = PROCESS_NOISE,
    glucose_prior_sd: float = GLUCOSE_PRIOR_SD,
    slope_prior_sd: float = SLOPE_PRIOR_SD,
) -> np.ndarray:
    """Línea base: una sola profundidad suavizada, sin corregir el retraso.

    Filtro de tendencia lineal local [nivel, pendiente] con el mismo ruido de
    proceso y la misma inicialización que el filtro de dos profundidades.
    """
    a_cont = np.array([[0.0, 1.0], [0.0, 0.0]])
    b_cont = np.array([[0.0], [1.0]])
    f, qd = discretize(a_cont, b_cont, process_noise, dt_min)
    h = np.array([[1.0, 0.0]])
    r = np.array([[_measurement_variance(sigma)]])
    g = np.asarray(g, dtype=float)
    x0 = np.array([g[0], 0.0])
    p0 = np.diag([glucose_prior_sd**2, slope_prior_sd**2])
    return kalman_filter(g, f, qd, h, r, x0, p0)[:, 0]


def alarm_times(series, threshold_mg_dl: float, dt_min: float) -> np.ndarray:
    """Momentos en que se activaría una alarma de glucosa baja para una serie dada.

    Una alarma es cada cruce hacia abajo del umbral, y la muestra 0 si la serie
    parte bajo el umbral. Sin histéresis.
    """
    x = np.asarray(series, dtype=float)
    below = x < threshold_mg_dl
    starts = np.flatnonzero(below[1:] & ~below[:-1]) + 1
    if below.size and below[0]:
        starts = np.concatenate([[0], starts])
    return starts * dt_min
