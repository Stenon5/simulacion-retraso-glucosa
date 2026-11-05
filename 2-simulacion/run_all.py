"""Corre todos los escenarios y escribe los resultados, las figuras y el informe de umbrales.

La especificación está en docs/especificacion.md, las lecturas de lo que deja
abierto en docs/decisiones-de-implementacion.md, la grilla en escenarios.yaml y
los criterios en umbrales.yaml, que este script solo lee.

Uso: python run_all.py --seed 1
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import platform
import subprocess
import sys
from pathlib import Path

import matplotlib
import numpy as np
import scipy
import yaml

# Permite correr sin instalar el paquete. Ruff acepta modificar sys.path entre imports.
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from glucose_delay import estimator, evaluation, figures, metrics, model, reconstruct, report

REPO = Path(__file__).resolve().parent

ROW_FIELDS = [
    "scenario", "master_seed", "replicate", "noise_seed_depth1", "noise_seed_depth2",
    "tau1_true", "tau2_true", "sigma_true",
    "tau1_est", "tau2_est", "status", "sigma_hat", "cond", "cond_full", "min_eig_per_sample",
    "tau1_alt", "tau2_alt", "status_alt",
    "rmse_est", "rmse_true_tau", "rmse_population", "rmse_single",
    "rmse_hypo_est", "rmse_hypo_true_tau", "rmse_hypo_population", "rmse_hypo_single",
    "alarm_blood", "alarm_est", "alarm_true_tau", "alarm_population", "alarm_single",
    "false_alarms_est", "false_alarms_true_tau", "false_alarms_population", "false_alarms_single",
    "advance_est_vs_single",
]


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--seed",
        type=int,
        default=1,
        help="semilla aleatoria, se registra con cada resultado",
    )
    parser.add_argument(
        "--scenario",
        default="all",
        help="nombre de un escenario de escenarios.yaml, o all",
    )
    parser.add_argument(
        "--out",
        default="results",
        help="carpeta para las tablas de resultados",
    )
    parser.add_argument(
        "--figures",
        default="figures",
        help="carpeta para las figuras",
    )
    return parser.parse_args(argv)


def _resolve(path: str) -> Path:
    p = Path(path)
    return p if p.is_absolute() else REPO / p


def _git_info() -> dict:
    def run(*args: str) -> str:
        try:
            done = subprocess.run(
                ["git", *args], cwd=REPO, capture_output=True, text=True, check=True, timeout=20
            )
            return done.stdout.strip()
        except (OSError, subprocess.SubprocessError):
            return ""

    commit = run("rev-parse", "HEAD") or "desconocido"
    dirty = bool(run("status", "--porcelain"))
    return {"commit": commit, "cambios_sin_commit": dirty}


def run_replicate(scenario: dict, cfg: dict, blood: np.ndarray, truth: tuple, master_seed: int,
                  replicate: int, episode: tuple[float, float], keep_series: bool = False):
    dt = float(cfg["registro"]["dt_min"])
    tau1, tau2 = float(scenario["tau1_min"]), float(scenario["tau2_min"])
    sigma = float(scenario["ruido_mg_dl"])
    k = cfg["kalman"]
    kf = {
        "process_noise": float(k["ruido_proceso_pendiente"]),
        "glucose_prior_sd": float(k["de_inicial_glucosa_mg_dl"]),
        "slope_prior_sd": float(k["de_inicial_pendiente_mg_dl_min"]),
    }
    alarm_cfg = cfg["alarma"]
    threshold = float(alarm_cfg["umbral_mg_dl"])
    pop1 = float(cfg["retraso_poblacional_fijo"]["tau1_min"])
    pop2 = float(cfg["retraso_poblacional_fijo"]["tau2_min"])
    cond_max = float(cfg["estimador"]["cond_max"])

    g1_true, g2_true = truth
    seed1, seed2 = model.noise_seeds(master_seed, replicate)
    g1 = model.add_noise(g1_true, sigma, seed1)
    g2 = model.add_noise(g2_true, sigma, seed2)

    est = estimator.estimate_time_constants(
        g1, g2, dt, rhs_correction=cfg["estimador"]["correccion_lado_derecho_primaria"],
        cond_max=cond_max,
    )
    alt = estimator.estimate_time_constants(
        g1, g2, dt, rhs_correction=cfg["estimador"]["correccion_lado_derecho_secundaria"],
        cond_max=cond_max,
    )
    sigma_hat = est.sigma
    baseline_depth = g1 if int(k["profundidad_linea_base"]) == 1 else g2

    series = {
        "true_tau": reconstruct.reconstruct(g1, g2, tau1, tau2, sigma_hat, dt, **kf),
        "population": reconstruct.reconstruct(g1, g2, pop1, pop2, sigma_hat, dt, **kf),
        "single": reconstruct.single_depth_smoother(baseline_depth, sigma_hat, dt, **kf),
    }
    if est.ok:
        series["est"] = reconstruct.reconstruct(g1, g2, est.tau1, est.tau2, sigma_hat, dt, **kf)
    else:
        series["est"] = np.full_like(blood, np.nan)

    def alarm(x):
        return metrics.episode_alarm(
            x, episode, threshold, dt,
            early_window_min=float(alarm_cfg["ventana_previa_min"]),
            late_window_min=float(alarm_cfg["ventana_posterior_min"]),
        )

    row = {
        "scenario": scenario["id"],
        "master_seed": master_seed,
        "replicate": replicate,
        "noise_seed_depth1": "-".join(map(str, seed1)),
        "noise_seed_depth2": "-".join(map(str, seed2)),
        "tau1_true": tau1,
        "tau2_true": tau2,
        "sigma_true": sigma,
        "tau1_est": est.tau1,
        "tau2_est": est.tau2,
        "status": est.status,
        "sigma_hat": sigma_hat,
        "cond": est.condition_number,
        "cond_full": est.condition_number_full,
        "min_eig_per_sample": est.min_eigenvalue / len(g1),
        "tau1_alt": alt.tau1,
        "tau2_alt": alt.tau2,
        "status_alt": alt.status,
        "alarm_blood": alarm(blood).detection_min,
    }
    for m in evaluation.METHODS:
        x = series[m]
        if est.ok or m != "est":
            row[f"rmse_{m}"] = metrics.rmse(x, blood)
            row[f"rmse_hypo_{m}"] = metrics.rmse_below(x, blood, threshold)
            out = alarm(x)
            row[f"alarm_{m}"] = out.detection_min
            row[f"false_alarms_{m}"] = out.false_alarms
        else:
            row[f"rmse_{m}"] = math.nan
            row[f"rmse_hypo_{m}"] = math.nan
            row[f"alarm_{m}"] = math.nan
            row[f"false_alarms_{m}"] = 0
    row["advance_est_vs_single"] = row["alarm_single"] - row["alarm_est"]

    kept = None
    if keep_series:
        kept = {
            "t_min": model.time_axis(cfg["registro"]["duracion_min"], dt),
            "blood_true": blood,
            "g1_measured": g1,
            "g2_measured": g2,
            "two_depth_estimated_tau": series["est"],
            "two_depth_true_tau": series["true_tau"],
            "two_depth_population_tau": series["population"],
            "single_depth": series["single"],
        }
        kept = (kept, est)
    return row, kept


def _write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r[k] for k in fields})


def _jsonable(x):
    if isinstance(x, dict):
        return {k: _jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_jsonable(v) for v in x]
    if isinstance(x, (np.floating, float)):
        x = float(x)
        if math.isnan(x):
            return None
        if math.isinf(x):
            return "infinito" if x > 0 else "-infinito"
        return x
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, np.bool_):
        return bool(x)
    return x


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    cfg = yaml.safe_load((REPO / "escenarios.yaml").read_text(encoding="utf-8"))
    thresholds = yaml.safe_load((REPO / "umbrales.yaml").read_text(encoding="utf-8"))
    exploratory = yaml.safe_load(
        (REPO / "docs" / "cifras-corrida-exploratoria.yaml").read_text(encoding="utf-8")
    )
    out_dir = _resolve(args.out)
    fig_dir = _resolve(args.figures)
    out_dir.mkdir(parents=True, exist_ok=True)
    fig_dir.mkdir(parents=True, exist_ok=True)

    scenarios = cfg["escenarios"]
    if args.scenario != "all":
        scenarios = [s for s in scenarios if s["id"] == args.scenario]
        if not scenarios:
            print(f"escenario desconocido: {args.scenario}", file=sys.stderr)
            return 2

    dt = float(cfg["registro"]["dt_min"])
    duration = float(cfg["registro"]["duracion_min"])
    n_rep = int(cfg["registro"]["replicas_por_escenario"])
    threshold = float(cfg["alarma"]["umbral_mg_dl"])
    population = (
        float(cfg["retraso_poblacional_fijo"]["tau1_min"]),
        float(cfg["retraso_poblacional_fijo"]["tau2_min"]),
    )
    blood = model.simulate_blood_glucose(duration, dt, args.seed)
    episode = metrics.true_episode(blood, threshold, dt)
    fig_cfg = cfg["figura"]

    summaries = []
    representative = None
    for scenario in scenarios:
        truth = (
            model.diffuse(blood, float(scenario["tau1_min"]), dt),
            model.diffuse(blood, float(scenario["tau2_min"]), dt),
        )
        rows = []
        for r in range(n_rep):
            keep = scenario["id"] == fig_cfg["escenario"] and r == int(fig_cfg["replica"])
            row, kept = run_replicate(scenario, cfg, blood, truth, args.seed, r, episode, keep)
            rows.append(row)
            if kept is not None:
                representative = (scenario, r, kept)
        _write_csv(out_dir / f"{scenario['id']}.csv", rows, ROW_FIELDS)
        summary = evaluation.summarize_scenario(scenario, rows, population)
        summaries.append(summary)
        print(
            f"{scenario['id']}: tau1 {summary['tau1_mean']:.2f} ± {summary['tau1_sd']:.2f}, "
            f"tau2 {summary['tau2_mean']:.2f} ± {summary['tau2_sd']:.2f}, "
            f"válidas {summary['n_ok']}/{summary['n_total']}"
        )

    summary_fields = list(summaries[0].keys())
    _write_csv(out_dir / "resumen.csv", summaries, summary_fields)

    registry = evaluation.evaluate(summaries, thresholds)
    meta = {
        "semilla_maestra": args.seed,
        "replicas": n_rep,
        "escenarios_ejecutados": [s["id"] for s in scenarios],
        "corrida_completa": args.scenario == "all",
        "configuracion": cfg,
        "kalman": cfg["kalman"],
        "episodio_real_min": list(episode),
        "software": {
            "python": platform.python_version(),
            "numpy": np.__version__,
            "scipy": scipy.__version__,
            "matplotlib": matplotlib.__version__,
            "pyyaml": yaml.__version__,
        },
        "git": _git_info(),
        "comando": f"python run_all.py --seed {args.seed}"
        + ("" if args.scenario == "all" else f" --scenario {args.scenario}"),
    }
    full_registry = {
        "corrida": meta,
        "umbrales_version": thresholds["meta"]["version"],
        "umbrales_committed": thresholds["meta"]["committed"],
        **registry,
    }
    (out_dir / "registro-de-umbrales.json").write_text(
        json.dumps(_jsonable(full_registry), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    report.write_summary_md(out_dir / "resumen.md", summaries, registry, meta)
    report.write_comparison_md(
        out_dir / "comparacion-con-corrida-exploratoria.md", summaries, exploratory, registry
    )

    if representative is not None:
        scenario, r, (series, est) = representative
        names = list(series.keys())
        rows = [{n: float(series[n][i]) for n in names} for i in range(len(series["t_min"]))]
        _write_csv(out_dir / figures.SERIES_FILE, rows, names)
        series_meta = {
            "escenario": scenario["id"],
            "replica": r,
            "semilla_maestra": args.seed,
            "ruido_mg_dl": float(scenario["ruido_mg_dl"]),
            "tau1_true": float(scenario["tau1_min"]),
            "tau2_true": float(scenario["tau2_min"]),
            "tau1_est": est.tau1,
            "tau2_est": est.tau2,
            "status": est.status,
            "umbral_mg_dl": threshold,
        }
        (out_dir / figures.SERIES_META_FILE).write_text(
            json.dumps(_jsonable(series_meta), ensure_ascii=False, indent=2), encoding="utf-8"
        )
        figures.delay_recovery_figure(str(out_dir), str(fig_dir / "delay-recovery.png"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
