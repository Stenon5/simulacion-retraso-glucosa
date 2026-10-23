"""Resumen por escenario y evaluación de los criterios de umbrales.yaml.

Cómo se lee cada criterio está en docs/decisiones-de-implementacion.md,
sección 10. Este módulo no modifica umbrales.yaml, solo lo lee.
"""

from __future__ import annotations

import math

import numpy as np

from .estimator import STATUS_NEGATIVE, STATUS_NOT_IDENTIFIABLE, STATUS_OK

DELAY_BIAS_MAX_MIN = 1.0
SPIRIT_SD_FACTOR = 3.0
NOISE_REQUIREMENT_MG_DL = 3.0
NOISE_TOLERANCE = 0.10

METHODS = ("est", "true_tau", "population", "single")


def _values(rows, key):
    return np.array([float(r[key]) for r in rows], dtype=float)


def _mean_sd(x: np.ndarray) -> tuple[float, float]:
    x = x[np.isfinite(x)]
    if x.size == 0:
        return float("nan"), float("nan")
    sd = float(np.std(x, ddof=1)) if x.size > 1 else float("nan")
    return float(np.mean(x)), sd


def summarize_scenario(
    scenario: dict, rows: list[dict], population_taus: tuple[float, float]
) -> dict:
    """Una fila de resumen por escenario, con media y desviación estándar lado a lado."""
    n_total = len(rows)
    ok_rows = [r for r in rows if r["status"] == STATUS_OK]
    n_ok = len(ok_rows)
    out: dict = {
        "scenario": scenario["id"],
        "group": scenario["grupo"],
        "tau1_true": float(scenario["tau1_min"]),
        "tau2_true": float(scenario["tau2_min"]),
        "sigma_true": float(scenario["ruido_mg_dl"]),
        "population_tau1": float(population_taus[0]),
        "population_tau2": float(population_taus[1]),
        "n_total": n_total,
        "n_ok": n_ok,
        "n_negative": sum(r["status"] == STATUS_NEGATIVE for r in rows),
        "n_not_identifiable": sum(r["status"] == STATUS_NOT_IDENTIFIABLE for r in rows),
    }
    out["identifiable"] = out["n_not_identifiable"] * 2 <= n_total

    for i in (1, 2):
        mean, sd = _mean_sd(_values(ok_rows, f"tau{i}_est")) if ok_rows else (math.nan, math.nan)
        true = out[f"tau{i}_true"]
        out[f"tau{i}_mean"] = mean
        out[f"tau{i}_sd"] = sd
        out[f"tau{i}_bias"] = mean - true
        out[f"tau{i}_se"] = sd / math.sqrt(n_ok) if n_ok > 1 else math.nan

    # Descriptivo, no registrado de antemano: la diferencia entre las dos
    # constantes y las medianas, para ver si la dispersión es simétrica.
    if ok_rows:
        t1, t2 = _values(ok_rows, "tau1_est"), _values(ok_rows, "tau2_est")
        out["diff_mean"], out["diff_sd"] = _mean_sd(t2 - t1)
        out["tau1_median"] = float(np.median(t1))
        out["tau2_median"] = float(np.median(t2))
    else:
        out["diff_mean"] = out["diff_sd"] = out["tau1_median"] = out["tau2_median"] = math.nan

    sig = _values(rows, "sigma_hat")
    out["sigma_hat_mean"], out["sigma_hat_sd"] = _mean_sd(sig)
    out["n_sigma_within_10pct"] = int(
        np.count_nonzero(np.abs(sig - out["sigma_true"]) <= NOISE_TOLERANCE * out["sigma_true"])
    )

    cond = _values(rows, "cond")
    finite = cond[np.isfinite(cond)]
    out["cond_median"] = float(np.median(finite)) if finite.size else math.inf

    # Errores y alarmas, en las mismas corridas para todos los métodos.
    for m in METHODS:
        out[f"rmse_{m}_mean"], out[f"rmse_{m}_sd"] = (
            _mean_sd(_values(ok_rows, f"rmse_{m}")) if ok_rows else (math.nan, math.nan)
        )
        out[f"rmse_hypo_{m}_mean"], out[f"rmse_hypo_{m}_sd"] = (
            _mean_sd(_values(ok_rows, f"rmse_hypo_{m}")) if ok_rows else (math.nan, math.nan)
        )
        out[f"false_alarms_{m}"] = int(sum(int(r[f"false_alarms_{m}"]) for r in ok_rows))
        out[f"misses_{m}"] = int(sum(math.isnan(float(r[f"alarm_{m}"])) for r in ok_rows))

    for m in ("est", "true_tau", "population"):
        adv = []
        for r in ok_rows:
            a_single = float(r["alarm_single"])
            a_m = float(r[f"alarm_{m}"])
            if not (math.isnan(a_single) or math.isnan(a_m)):
                adv.append(a_single - a_m)
        adv_arr = np.array(adv, dtype=float)
        out[f"advance_{m}_n"] = int(adv_arr.size)
        out[f"advance_{m}_mean"], out[f"advance_{m}_sd"] = _mean_sd(adv_arr)
        out[f"advance_{m}_n_earlier"] = int(np.count_nonzero(adv_arr > 0))
        out[f"advance_{m}_n_same"] = int(np.count_nonzero(adv_arr == 0))
        out[f"advance_{m}_n_later"] = int(np.count_nonzero(adv_arr < 0))

    out["n_est_beats_population"] = int(
        sum(float(r["rmse_est"]) < float(r["rmse_population"]) for r in ok_rows)
    )
    out["n_est_beats_single"] = int(sum(float(r["rmse_est"]) < float(r["rmse_single"]) for r in ok_rows))

    # Variante secundaria, sin término del lado derecho. No decide ningún umbral.
    alt_ok = [r for r in rows if r["status_alt"] == STATUS_OK]
    out["alt_n_ok"] = len(alt_ok)
    out["alt_n_negative"] = sum(r["status_alt"] == STATUS_NEGATIVE for r in rows)
    out["alt_n_not_identifiable"] = sum(r["status_alt"] == STATUS_NOT_IDENTIFIABLE for r in rows)
    for i in (1, 2):
        mean, sd = _mean_sd(_values(alt_ok, f"tau{i}_alt")) if alt_ok else (math.nan, math.nan)
        out[f"alt_tau{i}_mean"] = mean
        out[f"alt_tau{i}_sd"] = sd
        out[f"alt_tau{i}_bias"] = mean - out[f"tau{i}_true"]
    return out


def _delay_bias(s: dict) -> dict:
    if not s["identifiable"] or s["n_ok"] == 0:
        return {"resultado": "no identificable", "cumple": False}
    b1, b2 = abs(s["tau1_bias"]), abs(s["tau2_bias"])
    passes = b1 < DELAY_BIAS_MAX_MIN and b2 < DELAY_BIAS_MAX_MIN
    spirit = max(s["tau1_sd"], s["tau2_sd"]) >= SPIRIT_SD_FACTOR * DELAY_BIAS_MAX_MIN
    return {
        "resultado": "cumple" if passes else "no cumple",
        "cumple": bool(passes),
        "sesgo_tau1_min": s["tau1_bias"],
        "de_tau1_min": s["tau1_sd"],
        "sesgo_tau2_min": s["tau2_bias"],
        "de_tau2_min": s["tau2_sd"],
        "corridas_validas": f"{s['n_ok']}/{s['n_total']}",
        "constantes_negativas": f"{s['n_negative']}/{s['n_total']}",
        "no_identificables": f"{s['n_not_identifiable']}/{s['n_total']}",
        "espiritu_incumplido_de_3_min_o_mas": bool(spirit),
        "razon_de_sobre_sesgo_tau1": s["tau1_sd"] / b1 if b1 > 0 else math.inf,
        "razon_de_sobre_sesgo_tau2": s["tau2_sd"] / b2 if b2 > 0 else math.inf,
    }


def _earlier_alarm(s: dict) -> dict:
    if s["n_ok"] == 0 or s["advance_est_n"] == 0:
        return {"resultado": "sin datos", "cumple": False}
    earlier = s["advance_est_mean"] > 0
    no_more_false = s["false_alarms_est"] <= s["false_alarms_single"]
    no_more_misses = s["misses_est"] <= s["misses_single"]
    passes = earlier and no_more_false and no_more_misses
    return {
        "resultado": "cumple" if passes else "no cumple",
        "cumple": bool(passes),
        "adelanto_medio_min": s["advance_est_mean"],
        "de_adelanto_min": s["advance_est_sd"],
        "corridas_con_alarma_antes": f"{s['advance_est_n_earlier']}/{s['advance_est_n']}",
        "corridas_con_alarma_igual": f"{s['advance_est_n_same']}/{s['advance_est_n']}",
        "corridas_con_alarma_despues": f"{s['advance_est_n_later']}/{s['advance_est_n']}",
        "falsas_alarmas_metodo": f"{s['false_alarms_est']} en {s['n_ok']} corridas",
        "falsas_alarmas_linea_base": f"{s['false_alarms_single']} en {s['n_ok']} corridas",
        "episodios_perdidos_metodo": f"{s['misses_est']}/{s['n_ok']}",
        "episodios_perdidos_linea_base": f"{s['misses_single']}/{s['n_ok']}",
    }


def _beats_population(s: dict) -> dict:
    if s["n_ok"] == 0:
        return {"resultado": "sin datos", "cumple": False}
    passes = s["rmse_est_mean"] < s["rmse_population_mean"]
    return {
        "resultado": "cumple" if passes else "no cumple",
        "cumple": bool(passes),
        "rmse_tau_estimado_mg_dl": s["rmse_est_mean"],
        "de_rmse_tau_estimado": s["rmse_est_sd"],
        "rmse_tau_poblacional_mg_dl": s["rmse_population_mean"],
        "de_rmse_tau_poblacional": s["rmse_population_sd"],
        "corridas_donde_gana_el_estimado": f"{s['n_est_beats_population']}/{s['n_ok']}",
        "tau_poblacional_igual_al_real": bool(
            s["tau1_true"] == s["population_tau1"] and s["tau2_true"] == s["population_tau2"]
        ),
    }


def _noise_recovers(s: dict) -> dict:
    rel = abs(s["sigma_hat_mean"] - s["sigma_true"]) / s["sigma_true"]
    passes = rel <= NOISE_TOLERANCE
    return {
        "resultado": "cumple" if passes else "no cumple",
        "cumple": bool(passes),
        "ruido_inyectado_mg_dl": s["sigma_true"],
        "ruido_estimado_media_mg_dl": s["sigma_hat_mean"],
        "ruido_estimado_de_mg_dl": s["sigma_hat_sd"],
        "error_relativo_de_la_media": rel,
        "corridas_dentro_del_10_por_ciento": f"{s['n_sigma_within_10pct']}/{s['n_total']}",
    }


def noise_crossover(summaries: list[dict]) -> dict:
    """Nivel de ruido donde el método deja de superar a la línea base de una profundidad.

    Solo se puede calcular en familias con el mismo par de constantes y varios
    niveles de ruido. En esta grilla es solo la familia típica.
    """
    families: dict[tuple[float, float], list[dict]] = {}
    for s in summaries:
        if s["group"] != "grilla":
            continue
        families.setdefault((s["tau1_true"], s["tau2_true"]), []).append(s)
    families = {k: v for k, v in families.items() if len(v) >= 2}
    result: dict = {"familias": []}
    for (tau1, tau2), members in families.items():
        members = sorted(members, key=lambda s: s["sigma_true"])
        sig = [s["sigma_true"] for s in members]
        diff = []
        for s in members:
            if s["n_ok"] == 0 or not s["identifiable"]:
                diff.append(math.inf)
            else:
                diff.append(s["rmse_est_mean"] - s["rmse_single_mean"])
        if diff[0] >= 0:
            crossover, text = None, f"menor que {sig[0]:g} mg/dL (el método no gana en ningún nivel)"
            passes = False
        else:
            crossover, text = None, f"{sig[-1]:g} mg/dL o más (el método gana en todos los niveles)"
            passes = sig[-1] >= NOISE_REQUIREMENT_MG_DL
            for i in range(1, len(diff)):
                if diff[i] >= 0:
                    if math.isinf(diff[i]):
                        crossover = sig[i - 1]
                    else:
                        frac = -diff[i - 1] / (diff[i] - diff[i - 1])
                        crossover = sig[i - 1] + frac * (sig[i] - sig[i - 1])
                    text = f"{crossover:.2f} mg/dL (interpolado entre {sig[i - 1]:g} y {sig[i]:g})"
                    passes = crossover >= NOISE_REQUIREMENT_MG_DL
                    break
        result["familias"].append(
            {
                "tau1_min": tau1,
                "tau2_min": tau2,
                "escenarios": [s["scenario"] for s in members],
                "ruido_mg_dl": sig,
                "rmse_metodo_menos_rmse_una_profundidad": diff,
                "cruce_mg_dl": crossover,
                "cruce_texto": text,
                "cumple": bool(passes),
            }
        )
    result["cumple"] = bool(result["familias"]) and all(f["cumple"] for f in result["familias"])
    result["resultado"] = "cumple" if result["cumple"] else "no cumple"
    return result


def evaluate(summaries: list[dict], thresholds: dict) -> dict:
    """Registro legible por máquina de qué criterios se cumplieron, por escenario."""
    criteria_text = {c["id"]: c for c in thresholds["criteria"]}
    per_scenario_rules = {
        "delay_bias": _delay_bias,
        "earlier_alarm": _earlier_alarm,
        "beats_fixed_population_delay": _beats_population,
        "noise_estimate_recovers": _noise_recovers,
    }
    grid_ids = [s["scenario"] for s in summaries if s["group"] == "grilla"]
    all_ids = [s["scenario"] for s in summaries]
    out: dict = {}
    for cid, rule in per_scenario_rules.items():
        per = {s["scenario"]: rule(s) for s in summaries}
        failing_grid = [i for i in grid_ids if not per[i]["cumple"]]
        failing_all = [i for i in all_ids if not per[i]["cumple"]]
        out[cid] = {
            "enunciado": criteria_text[cid]["statement"],
            "passes_if": criteria_text[cid]["passes_if"],
            "por_escenario": per,
            "cumple_en_toda_la_grilla": not failing_grid and bool(grid_ids),
            "escenarios_de_la_grilla_que_no_cumplen": failing_grid,
            "cumple_en_los_siete_escenarios": not failing_all and bool(all_ids),
            "escenarios_que_no_cumplen_incluida_replicacion": failing_all,
        }
    nr = noise_crossover(summaries)
    out["noise_requirement"] = {
        "enunciado": criteria_text["noise_requirement"]["statement"],
        "passes_if": criteria_text["noise_requirement"]["passes_if"],
        **nr,
    }

    stopping = {
        s["scenario"]: {
            "constantes_negativas": f"{s['n_negative']}/{s['n_total']}",
            "corridas_no_identificables": f"{s['n_not_identifiable']}/{s['n_total']}",
            "escenario_no_identificable": not s["identifiable"],
        }
        for s in summaries
    }
    secondary = {
        s["scenario"]: {
            "corridas_validas": f"{s['alt_n_ok']}/{s['n_total']}",
            "sesgo_tau1_min": s["alt_tau1_bias"],
            "de_tau1_min": s["alt_tau1_sd"],
            "sesgo_tau2_min": s["alt_tau2_bias"],
            "de_tau2_min": s["alt_tau2_sd"],
            "delay_bias_cumpliria": bool(
                s["alt_n_ok"] > 0
                and abs(s["alt_tau1_bias"]) < DELAY_BIAS_MAX_MIN
                and abs(s["alt_tau2_bias"]) < DELAY_BIAS_MAX_MIN
            ),
        }
        for s in summaries
    }
    return {
        "criterios": out,
        "reglas_de_detencion": stopping,
        "variante_secundaria_no_registrada_de_antemano": {
            "descripcion": (
                "Estimador sin el término N sigma^2 dt (0,1,1) del lado derecho. "
                "Ver docs/decisiones-de-implementacion.md, sección 5. No decide ningún umbral."
            ),
            "por_escenario": secondary,
        },
    }
