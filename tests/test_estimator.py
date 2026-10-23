"""Tests del estimador del retraso.

Los tests que describen código aún no escrito se omiten con una razón
explícita, para que la integración continua de un repositorio en etapa de
andamiaje informe la verdad en vez de quedar en rojo. Quitar una
omisión es parte del issue que implementa la función correspondiente.
"""

from __future__ import annotations

import pytest

NOT_YET = (
    "todavía no implementado: {}, ver docs/especificacion.md y docs/backlog-de-issues.md"
)


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_time_constants"))
def test_noiseless_signals_recover_the_true_delays_exactly() -> None:
    """Sin ruido, el estimador debe devolver ambas constantes de tiempo reales.

    Este es el primer test que hay que activar. Si no pasa, nada de lo que
    viene después significa algo, porque una vez eliminado el ruido el problema
    es lineal y está exactamente determinado.
    """
    raise AssertionError("inalcanzable mientras esté omitido")


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_noise_variance"))
def test_noise_variance_estimate_matches_the_injected_noise() -> None:
    raise AssertionError("inalcanzable mientras esté omitido")


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_time_constants"))
def test_a_negative_time_constant_is_reported_as_a_failure() -> None:
    """Una constante de tiempo de difusión negativa es imposible y nunca se recorta."""
    raise AssertionError("inalcanzable mientras esté omitido")


@pytest.mark.skip(reason=NOT_YET.format("estimator.estimate_time_constants"))
def test_near_identical_depths_are_reported_as_not_identifiable() -> None:
    """Si las dos constantes de tiempo son demasiado parecidas, decirlo en vez de invertir."""
    raise AssertionError("inalcanzable mientras esté omitido")


@pytest.mark.skip(reason=NOT_YET.format("model.simulate_blood_glucose"))
def test_the_same_seed_reproduces_the_same_record() -> None:
    raise AssertionError("inalcanzable mientras esté omitido")


@pytest.mark.skip(reason=NOT_YET.format("reconstruct.reconstruct"))
def test_reconstruction_never_uses_future_samples() -> None:
    """Truncar el registro no debe cambiar los valores reconstruidos anteriores."""
    raise AssertionError("inalcanzable mientras esté omitido")


@pytest.mark.skip(reason=NOT_YET.format("reconstruct.alarm_times"))
def test_alarm_fires_earlier_than_the_single_depth_baseline() -> None:
    raise AssertionError("inalcanzable mientras esté omitido")
