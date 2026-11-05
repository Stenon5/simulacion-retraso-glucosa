"""La figura que va al inicio del README.

Especificado en docs/especificacion.md, sección 9. Escribe
figures/delay-recovery.png a partir de results/serie-representativa.csv, que
escribe run_all.py. Así ninguna imagen muestra algo que no salga de una
corrida con su semilla.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import numpy as np

SERIES_FILE = "serie-representativa.csv"
SERIES_META_FILE = "serie-representativa.json"


def _read_series(result_dir: Path) -> tuple[dict[str, np.ndarray], dict]:
    with (result_dir / SERIES_FILE).open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    columns = {k: np.array([float(r[k]) for r in rows]) for k in rows[0]}
    meta = json.loads((result_dir / SERIES_META_FILE).read_text(encoding="utf-8"))
    return columns, meta


def delay_recovery_figure(result_dir: str, out_path: str) -> None:
    """Dibuja la reconstrucción frente a la glucosa en sangre real para una semilla.

    La línea base de una sola profundidad se dibuja debajo, y la leyenda indica
    la semilla, el escenario y el nivel de ruido.
    """
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    data, meta = _read_series(Path(result_dir))
    t = data["t_min"]

    plt.rcParams.update({"font.size": 12})
    fig, ax = plt.subplots(figsize=(10, 5.6), dpi=150)
    ax.plot(t, data["g1_measured"], ".", color="0.75", markersize=2.5, zorder=1,
            label="Lectura con ruido, profundidad 1")
    ax.plot(t, data["single_depth"], color="0.45", linewidth=2.0, zorder=2,
            label="Una profundidad suavizada (línea base)")
    ax.plot(t, data["blood_true"], color="black", linewidth=2.2, zorder=3,
            label="Glucosa en sangre real (sintética)")
    if np.all(np.isnan(data["two_depth_estimated_tau"])):
        ax.text(0.02, 0.04, "El estimador falló en esta corrida, no hay reconstrucción",
                transform=ax.transAxes)
    else:
        ax.plot(t, data["two_depth_estimated_tau"], color="#1f6fb4", linewidth=2.0, zorder=4,
                label="Dos profundidades, τ estimado y Kalman")
    ax.axhline(meta["umbral_mg_dl"], color="#b2182b", linestyle="--", linewidth=1.2,
               label=f"Umbral de alarma, {meta['umbral_mg_dl']:g} mg/dL")
    ax.set_xlabel("Tiempo (min)")
    ax.set_ylabel("Glucosa (mg/dL)")
    tau_txt = (
        f"τ estimados {meta['tau1_est']:.2f} y {meta['tau2_est']:.2f} min".replace(".", ",")
        if meta["status"] == "ok"
        else f"estimador: {meta['status']}"
    )
    ax.set_title(
        f"Escenario {meta['escenario']}, ruido {meta['ruido_mg_dl']:g} mg/dL, "
        f"semilla maestra {meta['semilla_maestra']}, réplica {meta['replica']}\n"
        f"τ reales {meta['tau1_true']:g} y {meta['tau2_true']:g} min, {tau_txt}. "
        "Datos sintéticos, no es un dispositivo médico.",
        fontsize=11,
    )
    ax.legend(loc="upper right", fontsize=10, framealpha=0.9)
    ax.grid(alpha=0.25)
    fig.tight_layout()
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path)
    plt.close(fig)
