"""Estimación del retraso con dos profundidades, sin ninguna medición en sangre.

Especificado en docs/especificacion.md, secciones 3 y 4. Las lecturas de lo
que la especificación deja abierto están en docs/decisiones-de-implementacion.md,
secciones 4 y 5.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

STATUS_OK = "ok"
STATUS_NEGATIVE = "negative_time_constant"
STATUS_NOT_IDENTIFIABLE = "not_identifiable"

# Por encima de este número de condición la matriz corregida de las pendientes
# se considera casi singular. Razón en decisiones de implementación, sección 5.
COND_MAX = 1e4

# "spec": el término del lado derecho tal como está escrito en la sección 4 de
# la especificación, N sigma^2 dt (0, 1, 1). Es la versión primaria.
# "none": sin término del lado derecho, que es lo que da la derivación con la
# integral por trapecio y una columna de unos. Variante secundaria.
RHS_CORRECTIONS = ("spec", "none")


@dataclass(frozen=True)
class DelayEstimate:
    """Resultado del estimador para un registro.

    Si `status` es not_identifiable, tau1 y tau2 son NaN, porque la regla de
    detención prohíbe informar lo que salga de invertir una matriz casi
    singular. Si es negative_time_constant, los valores se guardan tal cual,
    sin recortar.
    """

    tau1: float
    tau2: float
    sigma2: float
    condition_number: float
    condition_number_full: float
    min_eigenvalue: float
    status: str
    rhs_correction: str

    @property
    def ok(self) -> bool:
        return self.status == STATUS_OK

    @property
    def sigma(self) -> float:
        return float(np.sqrt(self.sigma2))


def estimate_noise_variance(series, dt_min: float = 1.0) -> float:
    """Estima la varianza del ruido a partir de la segunda diferencia de la serie.

    Var(Δ²y)/6, con la varianza muestral insesgada. No depende de dt, se acepta
    para mantener la firma del andamiaje.
    """
    d2 = np.diff(np.asarray(series, dtype=float), n=2)
    return float(np.var(d2, ddof=1) / 6.0)


def trapezoid_integral(f, dt_min: float) -> np.ndarray:
    """Integral acumulada por trapecio, con valor 0 en la primera muestra."""
    f = np.asarray(f, dtype=float)
    out = np.zeros_like(f)
    out[1:] = np.cumsum(0.5 * (f[1:] + f[:-1]) * dt_min)
    return out


def estimate_time_constants(
    g1,
    g2,
    dt_min: float,
    *,
    rhs_correction: str = "spec",
    cond_max: float = COND_MAX,
) -> DelayEstimate:
    """Estima ambas constantes de tiempo con la corrección del error en las variables.

    Devuelve las dos constantes de tiempo, la varianza de ruido estimada y el
    número de condición de la matriz corregida. Una constante de tiempo
    negativa es una falla y se informa como tal, nunca se recorta a cero.
    """
    if rhs_correction not in RHS_CORRECTIONS:
        raise ValueError(f"rhs_correction debe ser uno de {RHS_CORRECTIONS}")
    g1 = np.asarray(g1, dtype=float)
    g2 = np.asarray(g2, dtype=float)
    n = len(g1)

    sigma2 = 0.5 * (estimate_noise_variance(g1, dt_min) + estimate_noise_variance(g2, dt_min))
    y = trapezoid_integral(g1 - g2, dt_min)

    x = np.column_stack([np.ones(n), g1, g2])
    corrected = x.T @ x - n * np.diag([0.0, sigma2, sigma2])
    rhs = x.T @ y
    if rhs_correction == "spec":
        rhs = rhs + n * sigma2 * dt_min * np.array([0.0, 1.0, 1.0])

    # Bloque de las pendientes con regresores centrados. Da las mismas
    # pendientes que el sistema 3 x 3 y es el que decide la identificabilidad.
    centered = np.column_stack([g1 - g1.mean(), g2 - g2.mean()])
    slope_block = centered.T @ centered - n * sigma2 * np.eye(2)
    eigenvalues = np.linalg.eigvalsh(slope_block)
    min_eig = float(eigenvalues[0])
    cond = float(eigenvalues[-1] / eigenvalues[0]) if min_eig > 0 else float("inf")
    cond_full = float(np.linalg.cond(corrected))

    common = {
        "sigma2": sigma2,
        "condition_number": cond,
        "condition_number_full": cond_full,
        "min_eigenvalue": min_eig,
        "rhs_correction": rhs_correction,
    }
    if min_eig <= 0 or cond > cond_max:
        return DelayEstimate(
            tau1=float("nan"), tau2=float("nan"), status=STATUS_NOT_IDENTIFIABLE, **common
        )

    beta = np.linalg.solve(corrected, rhs)
    tau1 = float(-beta[1])
    tau2 = float(beta[2])
    status = STATUS_OK if (tau1 > 0 and tau2 > 0) else STATUS_NEGATIVE
    return DelayEstimate(tau1=tau1, tau2=tau2, status=status, **common)
