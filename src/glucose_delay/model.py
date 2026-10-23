"""Modelo directo y generador de datos sintéticos.

Especificado en docs/especificacion.md, secciones 2 y 6. Lo que la
especificación deja abierto está decidido en docs/decisiones-de-implementacion.md,
secciones 1 a 3.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

BASELINE_MG_DL = 120.0
MEAL_AMPLITUDE_MG_DL = 60.0
MEAL_PEAK_MIN = 90.0
MEAL_WIDTH_MIN = 30.0
HYPO_DEPTH_MG_DL = 70.0
HYPO_NADIR_MIN = 300.0
HYPO_WIDTH_MIN = 45.0


def time_axis(duration_min: float, dt_min: float) -> np.ndarray:
    """Instantes de muestreo 0, dt, 2 dt, ... hasta antes de duration_min."""
    n_samples = round(duration_min / dt_min)
    return np.arange(n_samples) * dt_min


def simulate_blood_glucose(
    duration_min: float, dt_min: float, seed: int | None = None
) -> np.ndarray:
    """Genera un registro sintético de glucosa en sangre con una excursión hipoglucémica.

    La curva es fija y no depende de la semilla (decisiones de implementación,
    sección 1). El argumento se mantiene para respetar la firma del andamiaje.
    """
    t = time_axis(duration_min, dt_min)
    meal = MEAL_AMPLITUDE_MG_DL * np.exp(-(((t - MEAL_PEAK_MIN) / MEAL_WIDTH_MIN) ** 2))
    hypo = HYPO_DEPTH_MG_DL * np.exp(-(((t - HYPO_NADIR_MIN) / HYPO_WIDTH_MIN) ** 2))
    return BASELINE_MG_DL + meal - hypo


def diffuse(blood_glucose, tau_min: float, dt_min: float) -> np.ndarray:
    """Aplica difusión de primer orden con constante de tiempo tau.

    Se aplica a una serie de glucosa en sangre. Es la solución exacta de
    dG/dt = (G_s - G)/tau cuando G_s se interpola en línea recta entre muestras,
    partiendo del equilibrio G(0) = G_s(0).
    """
    if tau_min <= 0:
        raise ValueError(f"la constante de tiempo debe ser positiva, se recibió {tau_min}")
    u = np.asarray(blood_glucose, dtype=float)
    a = np.exp(-dt_min / tau_min)
    ramp_gain = 1.0 - (tau_min / dt_min) * (1.0 - a)
    g = np.empty_like(u)
    g[0] = u[0]
    for k in range(len(u) - 1):
        g[k + 1] = a * g[k] + (1.0 - a) * u[k] + ramp_gain * (u[k + 1] - u[k])
    return g


def add_noise(signal, sigma, seed) -> np.ndarray:
    """Suma ruido gaussiano independiente. El ruido correlacionado corresponde al barrido 2.

    `seed` es cualquier cosa que acepte numpy.random.default_rng, por ejemplo
    un entero o una lista de enteros como [semilla maestra, réplica, profundidad].
    """
    x = np.asarray(signal, dtype=float)
    rng = np.random.default_rng(seed)
    return x + rng.normal(0.0, sigma, size=x.shape)


def noise_seeds(master_seed: int, replicate: int) -> tuple[list[int], list[int]]:
    """Semillas del ruido de las profundidades 1 y 2 para una réplica.

    Nunca son iguales entre sí, porque dos profundidades con la misma semilla
    tendrían ruido idéntico, es decir, perfectamente correlacionado.
    """
    return [master_seed, replicate, 1], [master_seed, replicate, 2]


@dataclass(frozen=True)
class Record:
    """Un registro sintético completo: la verdad y lo que leería el sensor."""

    t: np.ndarray
    blood: np.ndarray
    g1_true: np.ndarray
    g2_true: np.ndarray
    g1: np.ndarray
    g2: np.ndarray


def simulate_record(
    tau1_min: float,
    tau2_min: float,
    sigma: float,
    master_seed: int,
    replicate: int,
    duration_min: float = 480.0,
    dt_min: float = 1.0,
) -> Record:
    """Genera la sangre, las dos profundidades sin ruido y las dos lecturas con ruido."""
    t = time_axis(duration_min, dt_min)
    blood = simulate_blood_glucose(duration_min, dt_min, master_seed)
    g1_true = diffuse(blood, tau1_min, dt_min)
    g2_true = diffuse(blood, tau2_min, dt_min)
    seed1, seed2 = noise_seeds(master_seed, replicate)
    g1 = add_noise(g1_true, sigma, seed1)
    g2 = add_noise(g2_true, sigma, seed2)
    return Record(t=t, blood=blood, g1_true=g1_true, g2_true=g2_true, g1=g1, g2=g2)
