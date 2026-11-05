"""Escribe results/resumen.md y results/comparacion-con-corrida-exploratoria.md.

Todas las cifras salen de los resúmenes que calcula run_all.py en la misma
ejecución. Nada se escribe a mano.
"""

from __future__ import annotations

import math
from pathlib import Path


def num(x, nd: int = 2) -> str:
    if x is None:
        return "n/d"
    x = float(x)
    if math.isnan(x):
        return "n/d"
    if math.isinf(x):
        return "infinito"
    return f"{x:.{nd}f}".replace(".", ",")


def pm(mean, sd, nd: int = 2) -> str:
    return f"{num(mean, nd)} ± {num(sd, nd)}"


def _g(x) -> str:
    return f"{float(x):g}".replace(".", ",")


def _verdict_cell(entry: dict) -> str:
    return entry["resultado"]


def write_summary_md(path: Path, summaries: list[dict], registry: dict, meta: dict) -> None:
    crit = registry["criterios"]
    lines: list[str] = []
    a = lines.append
    a("# Resumen de la corrida")
    a("")
    a(
        f"Generado por `python run_all.py --seed {meta['semilla_maestra']}`. No se edita a mano. "
        f"Cada escenario tiene {meta['replicas']} réplicas con semillas "
        f"`[{meta['semilla_maestra']}, réplica, profundidad]` (réplicas 0 a {meta['replicas'] - 1}). "
        "Los datos por semilla están en `results/<escenario>.csv` y el registro de umbrales en "
        "`results/registro-de-umbrales.json`."
    )
    a("")
    a(
        "Datos sintéticos generados con el mismo modelo que supone el estimador. Esto verifica "
        "que el estimador resuelve sus propias ecuaciones. No es una validación contra un cuerpo "
        "real y no es un dispositivo médico."
    )
    a("")
    a(
        "Media y DE se calculan sobre las corridas válidas de cada escenario (ni constante "
        "negativa ni no identificable). DE es la desviación estándar entre semillas. El sesgo es "
        "la media menos el valor real. Las decisiones de implementación están en "
        "`docs/decisiones-de-implementacion.md`."
    )
    a("")
    a("## Resultados, en el formato de la tabla del README")
    a("")
    a(
        "| Escenario | Retraso real 1 | Retraso estimado 1, media y DE | Retraso real 2 | "
        "Retraso estimado 2, media y DE | Nivel de ruido |"
    )
    a("|---|---|---|---|---|---|")
    for s in summaries:
        if not s["identifiable"] or s["n_ok"] == 0:
            e1 = e2 = "no identificable"
        else:
            e1 = pm(s["tau1_mean"], s["tau1_sd"])
            e2 = pm(s["tau2_mean"], s["tau2_sd"])
        a(
            f"| `{s['scenario']}` | {_g(s['tau1_true'])} min | {e1} min | {_g(s['tau2_true'])} min | "
            f"{e2} min | {_g(s['sigma_true'])} mg/dL |"
        )
    a("")
    a("Los escenarios `replica_*` no están en la grilla de la especificación. Se agregaron para "
      "replicar la corrida exploratoria (ver `docs/decisiones-de-implementacion.md`, sección 11).")
    a("")
    a("## Sesgo junto a la dispersión, por escenario")
    a("")
    a(
        "| Escenario | Sesgo τ1 (min) | DE τ1 | Error estándar τ1 | Sesgo τ2 (min) | DE τ2 | "
        "Error estándar τ2 | Corridas válidas | Constante negativa | No identificable | "
        "Número de condición mediano |"
    )
    a("|---|---|---|---|---|---|---|---|---|---|---|")
    for s in summaries:
        a(
            f"| `{s['scenario']}` | {num(s['tau1_bias'])} | {num(s['tau1_sd'])} | {num(s['tau1_se'])} | "
            f"{num(s['tau2_bias'])} | {num(s['tau2_sd'])} | {num(s['tau2_se'])} | "
            f"{s['n_ok']}/{s['n_total']} | {s['n_negative']}/{s['n_total']} | "
            f"{s['n_not_identifiable']}/{s['n_total']} | {num(s['cond_median'], 0)} |"
        )
    a("")
    a("Descriptivo, no registrado de antemano: la diferencia entre las dos constantes y las "
      "medianas. Sirve para ver en qué dirección se dispersan las estimaciones.")
    a("")
    a("| Escenario | τ2 − τ1 real | τ2 − τ1 estimada, media y DE | Mediana τ1 | Mediana τ2 |")
    a("|---|---|---|---|---|")
    for s in summaries:
        a(
            f"| `{s['scenario']}` | {_g(s['tau2_true'] - s['tau1_true'])} | "
            f"{pm(s['diff_mean'], s['diff_sd'])} | {num(s['tau1_median'])} | {num(s['tau2_median'])} |"
        )
    a("")
    a("## Ruido estimado junto al inyectado")
    a("")
    a("| Escenario | Ruido inyectado (mg/dL) | Ruido estimado, media y DE (mg/dL) | "
      "Corridas dentro del 10 % |")
    a("|---|---|---|---|")
    for s in summaries:
        a(
            f"| `{s['scenario']}` | {_g(s['sigma_true'])} | {pm(s['sigma_hat_mean'], s['sigma_hat_sd'], 3)} | "
            f"{s['n_sigma_within_10pct']}/{s['n_total']} |"
        )
    a("")
    a("## Error de reconstrucción de la glucosa en sangre")
    a("")
    a("RMSE en mg/dL sobre las 480 muestras, media y DE entre semillas, en las corridas válidas. "
      "El retraso poblacional fijo usa τ1 = 6 y τ2 = 15 min, los valores de la persona tipo, así "
      "que en los escenarios típicos coincide con el filtro con τ reales.")
    a("")
    a("| Escenario | Dos profundidades, τ estimado | Dos profundidades, τ reales | "
      "Dos profundidades, τ poblacional fijo | Una profundidad suavizada | Corridas | "
      "Corridas donde τ estimado gana a una profundidad | "
      "Corridas donde τ estimado gana al poblacional |")
    a("|---|---|---|---|---|---|---|---|")
    for s in summaries:
        a(
            f"| `{s['scenario']}` | {pm(s['rmse_est_mean'], s['rmse_est_sd'])} | "
            f"{pm(s['rmse_true_tau_mean'], s['rmse_true_tau_sd'])} | "
            f"{pm(s['rmse_population_mean'], s['rmse_population_sd'])} | "
            f"{pm(s['rmse_single_mean'], s['rmse_single_sd'])} | {s['n_ok']}/{s['n_total']} | "
            f"{s['n_est_beats_single']}/{s['n_ok']} | {s['n_est_beats_population']}/{s['n_ok']} |"
        )
    a("")
    a("Mismo RMSE, solo donde la sangre real está bajo 70 mg/dL:")
    a("")
    a("| Escenario | τ estimado | τ reales | τ poblacional fijo | Una profundidad suavizada |")
    a("|---|---|---|---|---|")
    for s in summaries:
        a(
            f"| `{s['scenario']}` | {pm(s['rmse_hypo_est_mean'], s['rmse_hypo_est_sd'])} | "
            f"{pm(s['rmse_hypo_true_tau_mean'], s['rmse_hypo_true_tau_sd'])} | "
            f"{pm(s['rmse_hypo_population_mean'], s['rmse_hypo_population_sd'])} | "
            f"{pm(s['rmse_hypo_single_mean'], s['rmse_hypo_single_sd'])} |"
        )
    a("")
    a("## Alarma de hipoglucemia")
    a("")
    a("Adelanto = momento de la alarma con una profundidad suavizada menos momento con dos "
      "profundidades y τ estimado. Positivo es antes. Se calcula en las corridas válidas donde "
      "ambos detectan el episodio. Umbral 70 mg/dL.")
    a("")
    a("| Escenario | Adelanto, media y DE (min) | Antes / igual / después | "
      "Falsas alarmas, método y línea base | Episodios perdidos, método y línea base | "
      "Adelanto con τ reales | Adelanto con τ poblacional |")
    a("|---|---|---|---|---|---|---|")
    for s in summaries:
        n = s["advance_est_n"]
        a(
            f"| `{s['scenario']}` | {pm(s['advance_est_mean'], s['advance_est_sd'])} | "
            f"{s['advance_est_n_earlier']}/{n}, {s['advance_est_n_same']}/{n}, "
            f"{s['advance_est_n_later']}/{n} | "
            f"{s['false_alarms_est']} y {s['false_alarms_single']} en {s['n_ok']} corridas | "
            f"{s['misses_est']}/{s['n_ok']} y {s['misses_single']}/{s['n_ok']} | "
            f"{pm(s['advance_true_tau_mean'], s['advance_true_tau_sd'])} | "
            f"{pm(s['advance_population_mean'], s['advance_population_sd'])} |"
        )
    a("")
    a("## Umbrales de `umbrales.yaml`, escenario por escenario")
    a("")
    ids = [s["scenario"] for s in summaries]
    a("| Escenario | delay_bias | earlier_alarm | beats_fixed_population_delay | "
      "noise_estimate_recovers |")
    a("|---|---|---|---|---|")
    for i in ids:
        db = crit["delay_bias"]["por_escenario"][i]
        spirit = " (espíritu incumplido, DE de 3 min o más)" if db.get(
            "espiritu_incumplido_de_3_min_o_mas") else ""
        a(
            f"| `{i}` | {_verdict_cell(db)}{spirit} | "
            f"{_verdict_cell(crit['earlier_alarm']['por_escenario'][i])} | "
            f"{_verdict_cell(crit['beats_fixed_population_delay']['por_escenario'][i])} | "
            f"{_verdict_cell(crit['noise_estimate_recovers']['por_escenario'][i])} |"
        )
    a("")
    nr = crit["noise_requirement"]
    for fam in nr["familias"]:
        a(
            f"`noise_requirement` (familia τ1 = {_g(fam['tau1_min'])}, τ2 = {_g(fam['tau2_min'])}): "
            f"cruce en {fam['cruce_texto'].replace('.', ',')}, {('cumple' if fam['cumple'] else 'no cumple')} "
            "el mínimo de 3 mg/dL. Diferencias de RMSE (método menos una profundidad) en ruido "
            + ", ".join(
                f"{_g(sg)}: {num(d)}" for sg, d in zip(fam["ruido_mg_dl"],
                                                       fam["rmse_metodo_menos_rmse_una_profundidad"])
            )
            + " mg/dL."
        )
    a("")
    a("Veredicto global, regla `per_scenario` sobre los cinco escenarios de la grilla:")
    a("")
    for cid in ("delay_bias", "earlier_alarm", "beats_fixed_population_delay",
                "noise_estimate_recovers"):
        c = crit[cid]
        failing = ", ".join(f"`{x}`" for x in c["escenarios_de_la_grilla_que_no_cumplen"]) or "ninguno"
        failing_all = ", ".join(
            f"`{x}`" for x in c["escenarios_que_no_cumplen_incluida_replicacion"]) or "ninguno"
        a(
            f"* `{cid}`: {'cumple' if c['cumple_en_toda_la_grilla'] else 'no cumple'} en la grilla. "
            f"No cumplen: {failing}. Contando los de replicación, no cumplen: {failing_all}."
        )
    a(f"* `noise_requirement`: {nr['resultado']}.")
    a("")
    a("## Variante secundaria, no registrada de antemano")
    a("")
    a("El mismo estimador sin el término `N σ² Δt (0, 1, 1)` del lado derecho, que la derivación "
      "no respalda (`docs/decisiones-de-implementacion.md`, sección 5). Se informa solo para medir "
      "cuánto pesa ese término. No decide ningún umbral.")
    a("")
    a("| Escenario | τ1, media y DE | Sesgo τ1 | τ2, media y DE | Sesgo τ2 | Corridas válidas |")
    a("|---|---|---|---|---|---|")
    for s in summaries:
        a(
            f"| `{s['scenario']}` | {pm(s['alt_tau1_mean'], s['alt_tau1_sd'])} | {num(s['alt_tau1_bias'])} | "
            f"{pm(s['alt_tau2_mean'], s['alt_tau2_sd'])} | {num(s['alt_tau2_bias'])} | "
            f"{s['alt_n_ok']}/{s['n_total']} |"
        )
    a("")
    a("## Configuración del filtro y de la corrida")
    a("")
    k = meta["kalman"]
    a(
        f"Ruido de proceso de la pendiente q = {num(k['ruido_proceso_pendiente'], 5)} (mg/dL/min)² por "
        f"minuto. Inicialización x0 = [y1(0), 0, y1(0), y2(0)], P0 = diag({_g(k['de_inicial_glucosa_mg_dl'])}², "
        f"{_g(k['de_inicial_pendiente_mg_dl_min'])}², {_g(k['de_inicial_glucosa_mg_dl'])}², "
        f"{_g(k['de_inicial_glucosa_mg_dl'])}²). Ruido de medición R = σ̂² I. Las constantes de tiempo "
        "se estiman con el registro completo antes de filtrar."
    )
    a("")
    a(
        f"Software: Python {meta['software']['python']}, numpy {meta['software']['numpy']}, "
        f"scipy {meta['software']['scipy']}, matplotlib {meta['software']['matplotlib']}, "
        f"pyyaml {meta['software']['pyyaml']}. Commit {meta['git']['commit']}"
        + (" con cambios sin commit en el árbol de trabajo." if meta["git"]["cambios_sin_commit"] else ".")
    )
    a("")
    path.write_text("\n".join(lines), encoding="utf-8")


def write_comparison_md(path: Path, summaries: list[dict], exploratory: dict, registry: dict) -> None:
    by_id = {s["scenario"]: s for s in summaries}
    lines: list[str] = []
    a = lines.append
    a("# Comparación con la corrida exploratoria del 2026-10-16")
    a("")
    a("Generado por `run_all.py`. Las cifras exploratorias están transcritas en "
      "`docs/cifras-corrida-exploratoria.yaml` desde el documento original del medidor. Sus "
      "scripts se perdieron, así que no se sabe con qué curva, intervalo de muestreo ni semillas "
      "se obtuvieron. Si la reproducción discrepa, manda la reproducción.")
    a("")
    a("Criterio de esta comparación: la media reproducida cae dentro de una desviación estándar de "
      "la cifra exploratoria, es decir, |media reproducida − media exploratoria| ≤ DE exploratoria. "
      "Las cifras reproducidas son de la versión primaria del estimador (la fórmula literal de la "
      "especificación).")
    a("")
    a("| Situación exploratoria | Escenario reproducido | Cantidad | Exploratoria, media y DE | "
      "Reproducida, media y DE | Diferencia de medias | ¿Dentro de 1 DE exploratoria? | "
      "DE reproducida / DE exploratoria |")
    a("|---|---|---|---|---|---|---|---|")
    misses: list[str] = []
    hits = 0
    total = 0
    matched: list[dict] = []
    for sit in exploratory["situaciones"]:
        s = by_id.get(sit["escenario"])
        if s is None:
            continue
        matched.append(s)
        for i in (1, 2):
            exp_mean, exp_sd = sit[f"tau{i}_media"], sit[f"tau{i}_de"]
            rep_mean, rep_sd = s[f"tau{i}_mean"], s[f"tau{i}_sd"]
            diff = rep_mean - exp_mean
            within = (not math.isnan(diff)) and abs(diff) <= exp_sd
            total += 1
            hits += int(within)
            if not within:
                misses.append(
                    f"`{s['scenario']}`, τ{i}: exploratoria {pm(exp_mean, exp_sd)} min, reproducida "
                    f"{pm(rep_mean, rep_sd)} min, diferencia {num(diff)} min, más que la DE "
                    f"exploratoria de {num(exp_sd)} min."
                )
            a(
                f"| {sit['nombre']} | `{s['scenario']}` | τ{i} (real {_g(sit[f'tau{i}_real'])} min) | "
                f"{pm(exp_mean, exp_sd)} | {pm(rep_mean, rep_sd)} | {num(diff)} | "
                f"{'sí' if within else 'no'} | {num(rep_sd / exp_sd if exp_sd else math.nan)} |"
            )
        a(
            f"| {sit['nombre']} | `{s['scenario']}` | ruido estimado (real {_g(sit['ruido_real'])} mg/dL) | "
            f"{num(sit['ruido_estimado'])} (sin DE informada) | "
            f"{pm(s['sigma_hat_mean'], s['sigma_hat_sd'], 3)} | "
            f"{num(s['sigma_hat_mean'] - sit['ruido_estimado'], 3)} | no aplica | no aplica |"
        )
    a("")
    a(f"En {hits} de {total} comparaciones de constantes de tiempo la media reproducida cae dentro "
      "de una DE exploratoria.")
    a("")
    a("## Dónde no se reproduce")
    a("")
    if misses:
        for m in misses:
            a(f"* {m}")
    else:
        a("* Todas las medias de las constantes de tiempo caen dentro de una DE exploratoria.")
    a("")
    a("Además, cada fila de la tabla trae la razón entre la DE reproducida y la exploratoria. Que "
      "la media caiga dentro de una DE no implica que la dispersión se haya reproducido.")
    a("")

    claims = exploratory["afirmaciones"]
    crit = registry["criterios"]
    a("## Afirmaciones de la corrida exploratoria")
    a("")
    valid = [s for s in matched if s["n_ok"] > 0]
    if valid:
        max_bias = max(max(abs(s["tau1_bias"]), abs(s["tau2_bias"])) for s in valid)
        worst = max(valid, key=lambda s: max(abs(s["tau1_bias"]), abs(s["tau2_bias"])))
        ok_claim = max_bias <= claims["sesgo_medio_maximo_min"]
        a(
            f"* **Sesgo medio de {num(claims['sesgo_medio_maximo_min'], 1)} min o menos.** En los "
            f"escenarios equivalentes el mayor sesgo medio absoluto reproducido es de "
            f"{num(max_bias)} min (`{worst['scenario']}`). "
            + ("Se reproduce." if ok_claim else "No se reproduce.")
            + " Las DE están en la tabla de arriba y en `results/resumen.md`."
        )
        adv = [s["advance_est_mean"] for s in valid if s["advance_est_n"] > 0]
        lo, hi = claims["adelanto_alarma_min_rango"]
        all_earlier = all(x > 0 for x in adv) and len(adv) == len(valid)
        inside = min(adv) >= lo and max(adv) <= hi
        failing_alarm = [
            s["scenario"] for s in valid
            if not crit["earlier_alarm"]["por_escenario"][s["scenario"]]["cumple"]
        ]
        a(
            f"* **La alarma llega entre {num(lo, 1)} y {num(hi, 0)} min antes en todos los escenarios.** "
            f"Adelanto medio reproducido entre {num(min(adv))} y {num(max(adv))} min en los "
            "escenarios equivalentes, "
            + ("dentro" if inside else "fuera")
            + " del rango exploratorio. El adelanto medio "
            + ("es positivo en todos. " if all_earlier else "no es positivo en todos. ")
            + "Con la regla de `earlier_alarm`, que además exige no tener más falsas alarmas ni "
            "más episodios perdidos que la línea base, no cumplen: "
            + (", ".join(f"`{x}`" for x in failing_alarm) if failing_alarm else "ninguno")
            + "."
        )
        better_true = [
            f"`{s['scenario']}` {num(s['rmse_est_mean'])} contra {num(s['rmse_true_tau_mean'])}"
            for s in valid
        ]
        a(
            "* **Con τ estimado rinde prácticamente igual que con τ real.** RMSE medio en mg/dL, τ "
            "estimado contra τ real: " + ", ".join(better_true) + "."
        )
        beats_single = [s["scenario"] for s in valid if s["rmse_est_mean"] < s["rmse_single_mean"]]
        loses_single = [s["scenario"] for s in valid if s["scenario"] not in beats_single]
        a(
            "* **El error general solo baja con ruido de unos 2 mg/dL o en personas lentas.** "
            "Escenarios equivalentes donde el RMSE medio con dos profundidades y τ estimado es menor "
            "que con una profundidad suavizada: "
            + (", ".join(f"`{x}`" for x in beats_single) if beats_single else "ninguno")
            + ". Donde no es menor: "
            + (", ".join(f"`{x}`" for x in loses_single) if loses_single else "ninguno")
            + ". El conteo de corridas está en `results/resumen.csv`, columna `n_est_beats_single`."
        )
    nr = crit["noise_requirement"]
    lo, hi = claims["requisito_ruido_mg_dl_rango"]
    for fam in nr["familias"]:
        a(
            f"* **Requisito de hardware de {_g(lo)} a {_g(hi)} mg/dL por lectura.** Cruce reproducido "
            f"en la familia típica: {fam['cruce_texto'].replace('.', ',')}."
        )
    a(
        f"* **Un retraso poblacional de {_g(claims['retraso_poblacional_min'])} min da un error de "
        f"{_g(claims['error_retraso_poblacional_hipoglucemia_porcentaje_rango'][0])} a "
        f"{_g(claims['error_retraso_poblacional_hipoglucemia_porcentaje_rango'][1])} % en "
        "hipoglucemia.** No es comparable. Esta corrida usa como línea base poblacional τ1 = 6 y "
        "τ2 = 15 min en el filtro de dos profundidades, no un único retraso de 10 min, y no informa "
        "porcentajes."
    )
    a("")
    a("## Variante secundaria en los escenarios equivalentes")
    a("")
    a("Sin el término del lado derecho que la derivación no respalda. No registrada de antemano.")
    a("")
    a("| Escenario | τ1, media y DE | τ2, media y DE | Corridas válidas |")
    a("|---|---|---|---|")
    for s in matched:
        a(
            f"| `{s['scenario']}` | {pm(s['alt_tau1_mean'], s['alt_tau1_sd'])} | "
            f"{pm(s['alt_tau2_mean'], s['alt_tau2_sd'])} | {s['alt_n_ok']}/{s['n_total']} |"
        )
    a("")
    path.write_text("\n".join(lines), encoding="utf-8")
