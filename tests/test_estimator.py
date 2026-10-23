"""Tests del estimador del retraso, del generador y de la reconstrucción.

Estos tests revisan que el código resuelva sus propias ecuaciones. Ninguno es
evidencia de que el método funcione en una persona.
"""

from __future__ import annotations

import numpy as np
import pytest

from glucose_delay import estimator, metrics, model, reconstruct

DT = 1.0
DURATION = 480.0


@pytest.fixture(scope="module")
def blood() -> np.ndarray:
    return model.simulate_blood_glucose(DURATION, DT)


def test_noiseless_signals_recover_the_true_delays_exactly(blood) -> None:
    """Sin ruido, el estimador debe devolver ambas constantes de tiempo reales.

    Este es el primer test que hay que activar. Si no pasa, nada de lo que
    viene después significa algo, porque una vez eliminado el ruido el problema
    es lineal y está exactamente determinado.
    """
    for tau1, tau2 in [(6.0, 15.0), (15.0, 30.0), (3.0, 6.0), (12.0, 30.0), (3.0, 8.0)]:
        g1 = model.diffuse(blood, tau1, DT)
        g2 = model.diffuse(blood, tau2, DT)
        for rhs in estimator.RHS_CORRECTIONS:
            est = estimator.estimate_time_constants(g1, g2, DT, rhs_correction=rhs)
            assert est.status == estimator.STATUS_OK
            assert est.tau1 == pytest.approx(tau1, abs=0.05)
            assert est.tau2 == pytest.approx(tau2, abs=0.05)
            assert np.isfinite(est.condition_number)


def test_noise_variance_estimate_matches_the_injected_noise() -> None:
    long_signal = model.simulate_blood_glucose(48_000.0, DT)
    noisy = model.add_noise(long_signal, 5.0, seed=[7, 0, 1])
    sigma_hat = np.sqrt(estimator.estimate_noise_variance(noisy, DT))
    assert sigma_hat == pytest.approx(5.0, rel=0.03)

    noiseless = np.sqrt(estimator.estimate_noise_variance(long_signal, DT))
    assert noiseless < 0.05


def test_a_negative_time_constant_is_reported_as_a_failure(blood) -> None:
    """Una constante de tiempo de difusión negativa es imposible y nunca se recorta."""
    g1 = model.diffuse(blood, 6.0, DT)
    # Una señal que se adelanta a la sangre, como si tuviera tau = -5 min.
    g2 = blood + 5.0 * np.gradient(blood, DT)
    est = estimator.estimate_time_constants(g1, g2, DT)
    assert est.status == estimator.STATUS_NEGATIVE
    assert not est.ok
    assert est.tau2 < 0.0  # el valor negativo se conserva, no se recorta a cero


def test_near_identical_depths_are_reported_as_not_identifiable(blood) -> None:
    """Si las dos constantes de tiempo son demasiado parecidas, decirlo en vez de invertir."""
    g1 = model.diffuse(blood, 10.0, DT)
    g2 = model.diffuse(blood, 10.01, DT)
    est = estimator.estimate_time_constants(g1, g2, DT)
    assert est.status == estimator.STATUS_NOT_IDENTIFIABLE
    assert np.isnan(est.tau1) and np.isnan(est.tau2)

    same = estimator.estimate_time_constants(g1, g1.copy(), DT)
    assert same.status == estimator.STATUS_NOT_IDENTIFIABLE


def test_the_same_seed_reproduces_the_same_record() -> None:
    a = model.simulate_record(6.0, 15.0, 5.0, master_seed=1, replicate=3)
    b = model.simulate_record(6.0, 15.0, 5.0, master_seed=1, replicate=3)
    for field in ("blood", "g1_true", "g2_true", "g1", "g2"):
        assert np.array_equal(getattr(a, field), getattr(b, field))

    other = model.simulate_record(6.0, 15.0, 5.0, master_seed=1, replicate=4)
    assert not np.array_equal(a.g1, other.g1)

    # Las dos profundidades nunca comparten el mismo ruido.
    assert not np.allclose(a.g1 - a.g1_true, a.g2 - a.g2_true)


def test_reconstruction_never_uses_future_samples() -> None:
    """Truncar el registro no debe cambiar los valores reconstruidos anteriores."""
    rec = model.simulate_record(6.0, 15.0, 5.0, master_seed=1, replicate=0)
    cut = 300
    full = reconstruct.reconstruct(rec.g1, rec.g2, 6.2, 14.7, 5.0, DT)
    short = reconstruct.reconstruct(rec.g1[:cut], rec.g2[:cut], 6.2, 14.7, 5.0, DT)
    assert np.array_equal(full[:cut], short)

    full_single = reconstruct.single_depth_smoother(rec.g1, 5.0, DT)
    short_single = reconstruct.single_depth_smoother(rec.g1[:cut], 5.0, DT)
    assert np.array_equal(full_single[:cut], short_single)


def test_alarm_times_marks_each_downward_crossing() -> None:
    series = np.array([80, 75, 69, 65, 71, 72, 68, 90, 60])
    assert list(reconstruct.alarm_times(series, 70.0, 1.0)) == [2, 6, 8]
    assert list(reconstruct.alarm_times(np.array([60, 65, 75]), 70.0, 2.0)) == [0]


def test_alarm_fires_earlier_than_the_single_depth_baseline(blood) -> None:
    """Revisión del mecanismo, sin ruido y con las constantes reales.

    No es la afirmación empírica del criterio earlier_alarm, que se evalúa con
    ruido en run_all.py. Solo comprueba que, cuando todo lo demás es perfecto,
    el filtro de dos profundidades sigue a la sangre y la línea base de una
    profundidad llega tarde.
    """
    g1 = model.diffuse(blood, 6.0, DT)
    g2 = model.diffuse(blood, 15.0, DT)
    episode = metrics.true_episode(blood, 70.0, DT)
    two_depth = reconstruct.reconstruct(g1, g2, 6.0, 15.0, 0.1, DT)
    single = reconstruct.single_depth_smoother(g1, 0.1, DT)
    a_two = metrics.episode_alarm(two_depth, episode, 70.0, DT)
    a_one = metrics.episode_alarm(single, episode, 70.0, DT)
    assert a_two.detected and a_one.detected
    assert a_two.detection_min < a_one.detection_min
    assert abs(a_two.detection_min - episode[0]) <= 2.0
    assert a_two.false_alarms == 0 and a_one.false_alarms == 0


def test_integral_noise_cross_term_cancels_with_an_intercept() -> None:
    """Respaldo de la sección 5 de las decisiones de implementación.

    Con la integral por trapecio, el ruido de cada regresor se correlaciona con
    el ruido de la integral en la muestra actual, en (N-1) sigma^2 dt / 2. Con
    la columna de unos (regresores centrados) esa covarianza se cancela. Por
    eso la derivación no pide ningún término del lado derecho.
    """
    rng = np.random.default_rng(12345)
    n, draws, sigma = 480, 4000, 1.0
    e1 = rng.normal(0.0, sigma, size=(draws, n))
    e2 = rng.normal(0.0, sigma, size=(draws, n))
    y = np.zeros_like(e1)
    y[:, 1:] = np.cumsum(0.5 * ((e1 - e2)[:, 1:] + (e1 - e2)[:, :-1]) * DT, axis=1)
    scale = (n - 1) * sigma**2 * DT / 2
    uncentered = np.mean(np.sum(e1 * y, axis=1)) / scale
    centered = np.mean(np.sum((e1 - e1.mean(axis=1, keepdims=True)) * y, axis=1)) / scale
    assert uncentered == pytest.approx(1.0, abs=0.15)
    assert centered == pytest.approx(0.0, abs=0.15)
