"""Calculos del analisis dry lab del medidor no invasivo de glucosa.

Solo papel y simulacion. Usa numpy y el simulador del repositorio
simulacion-retraso-glucosa, carpeta 2-simulacion (model, reconstruct, metrics).
Cada calculo guarda su formula, las entradas con su fuente y el resultado.

Fuentes: investigacion-2026-10-29.json, en esta misma carpeta
(los codigos O, E, H y M de las entradas son hallazgos de ese archivo).

Correr desde esta carpeta con: python calculos_dry_lab.py
Escribe resultados-calculos.json en esta misma carpeta.
"""
from __future__ import annotations

import itertools
import json
import math
import sys
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "2-simulacion" / "src"))
from glucose_delay import metrics, model, reconstruct  # noqa: E402

SALIDA = Path(__file__).parent / "resultados-calculos.json"
R: dict = {"meta": {
    "descripcion": "Resultados de calculos_dry_lab.py. Solo papel y simulacion.",
    "fecha_criterios": "2026-10-29",
    "simulador": "simulacion-retraso-glucosa (model, reconstruct, metrics), semilla maestra 1",
}}

# Constante del error normal: E|X| = sigma * sqrt(2/pi)
K_MARD = math.sqrt(2.0 / math.pi)  # 0,7979


def redondear(x, n=4):
    if isinstance(x, dict):
        return {k: redondear(v, n) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [redondear(v, n) for v in x]
    if isinstance(x, (float, np.floating)):
        return None if (math.isnan(x) or math.isinf(x)) else round(float(x), n)
    if isinstance(x, (np.integer,)):
        return int(x)
    return x


# ----------------------------------------------------------------------------
# a) Tiempo de difusion
# ----------------------------------------------------------------------------
def calculo_a():
    um = 1e-4  # cm por um
    epi = 56.6 * um       # epidermis viable, antebrazo dorsal (H41, Sandby-Moller 2003)
    corneo = 18.3 * um
    ders = {"epidermis viable (D = 1,0e-6)": 1.0e-6,
            "epidermis viable (D = 0,075e-6)": 0.075e-6,
            "epidermis viable (D = 0,037e-6)": 0.037e-6}
    D_derm = 2.64e-6  # dermis, H40 (Khalil 2006), cadaver, 32 C

    def t_min(L, D):
        return L**2 / (2 * D) / 60.0

    def tau_losa(L, D):  # constante de tiempo de una losa con fuente en una cara y la otra sellada
        return 4 * L**2 / (math.pi**2 * D) / 60.0

    filas = []
    for nombre, D in ders.items():
        filas.append({"capa": nombre, "L_um": 56.6, "D_cm2_s": D,
                      "t_min": t_min(epi, D), "tau_losa_min": tau_losa(epi, D)})
    filas.append({"capa": "dermis, 100 um", "L_um": 100.0, "D_cm2_s": D_derm,
                  "t_min": t_min(100 * um, D_derm), "tau_losa_min": tau_losa(100 * um, D_derm)})

    # Separacion de retraso entre la capa del IR medio (epidermis) y la del fotoacustico en dermis superior.
    # Fuente de glucosa: la union dermo-epidermica, a 74,9 um (18,3 + 56,6). Las asas capilares estan en la dermis
    # papilar, justo bajo esa union (profundidad exacta: sin dato abierto, vacio de H).
    t_derm_superior = t_min(22.6 * um, D_derm)   # ventana DIROS centrada en 97,5 um: 22,6 um bajo la union
    sep = []
    for nombre, D in ders.items():
        t_epi_total = t_min(epi, D)
        t_epi_ir = t_min(30 * um, D)   # el IR medio llega ~45 um: 45 - 18,3 = ~27 um de epidermis viable, se redondea a 30
        sep.append({"D": nombre,
                    "t_epidermis_completa_min": t_epi_total,
                    "separacion_epidermis_completa_vs_dermis_min": t_epi_total - t_derm_superior,
                    "t_hasta_45um_min": t_epi_ir,
                    "separacion_45um_vs_dermis_min": t_epi_ir - t_derm_superior})
    mejor = max(s["separacion_epidermis_completa_vs_dermis_min"] for s in sep)

    def regla4(x):
        return "viable" if x >= 9 else ("marginal" if x >= 5 else "no viable")

    for s in sep:
        s["regla4_epidermis_completa"] = regla4(s["separacion_epidermis_completa_vs_dermis_min"])
        s["regla4_45um"] = regla4(s["separacion_45um_vs_dermis_min"])
    R["a_difusion"] = {
        "formula": "t = L^2 / (2 D), tiempo en que el desplazamiento cuadratico medio de la glucosa alcanza L (difusion 1-D). "
                   "Control: constante de tiempo de una losa con una cara abierta, tau = 4 L^2 / (pi^2 D), cerca de un 20 % menor",
        "entradas": {
            "epidermis_viable_um": "56,6 (antebrazo dorsal), H41, Sandby-Moller 2003, biopsias",
            "estrato_corneo_um": "18,3, H41",
            "D_dermis_cm2_s": "2,64e-6, H40, Khalil 2006, piel de cadaver in vitro a 32 C",
            "D_epidermis_viable_cm2_s": "1,0e-6, 0,075e-6 y 0,037e-6 segun el metodo, H40",
            "penetracion_IR_medio_um": "~45 (hasta 100), O14, Kottmann 2016",
            "ventana_DIROS_um": "97,5 (40 a 150), solo en ratones, O1, Uluc 2024",
            "retraso_dermico": "0 a 2 min en 93 % de los casos, H38, dato de la empresa Laxmi",
            "retraso_subcutaneo": "5 a 10 min (H36 Rebrin 2010), medianas 5,3 a 6,8 min por trazador (H33, H34)",
        },
        "filas_difusion": filas,
        "separacion": sep,
        "t_dermis_superior_min": t_derm_superior,
        "mejor_separacion_min": mejor,
        "peor_separacion_min": min(s["separacion_epidermis_completa_vs_dermis_min"] for s in sep),
        "regla4_mejor_caso": regla4(mejor),
        "regla4_umbrales": "9 min o mas viable, 5 a 9 marginal, menos de 5 no viable",
        "comparacion_retraso_dermico_min": [0, 2],
        "comparacion_retraso_subcutaneo_min": [5, 10],
        "nota": "La glucosa de piel de cadaver a 32 C no es piel viva a 37 C, y la particion tejido/tampon es menor que 1 en todas las capas (H40). "
                "El calculo ignora el flujo capilar, que acorta los retrasos reales, y la fuente real esta algo mas profunda que la union.",
    }


# ----------------------------------------------------------------------------
# b) Fusion de valores
# ----------------------------------------------------------------------------
def factor_fusion(N, rho):
    return math.sqrt((1 + (N - 1) * rho) / N)


def fusion_gls(mards, rho):
    """Minimos cuadrados generalizados. MARD proporcional a sigma, correlacion rho comun."""
    s = np.array(mards, dtype=float)
    n = len(s)
    corr = np.full((n, n), rho)
    np.fill_diagonal(corr, 1.0)
    cov = np.outer(s, s) * corr
    inv = np.linalg.inv(cov)
    one = np.ones(n)
    var = 1.0 / (one @ inv @ one)
    w = inv @ one * var
    return math.sqrt(var), w


def calculo_b():
    # Estimacion de rho a partir de la redundancia de dos electrodos (Sharifi 2016, E20)
    def rho_de(mard_fus, a, b):
        r = mard_fus / ((a + b) / 2.0)
        return 2 * r**2 - 1, r

    rho_todos, r_todos = rho_de(10.1, 11.4, 12.0)
    rho_ysi, r_ysi = rho_de(9.4, 9.6, 9.9)
    # Con N = 2: (sigma_f / sigma)^2 = (1 + rho) / 2  =>  rho = 2 r^2 - 1

    curvas = {}
    for rho in (0.0, 0.3, 0.5, 0.7):
        curvas[str(rho)] = {str(N): factor_fusion(N, rho) for N in (1, 2, 3, 4, 6, 10, 20, 100)}
        curvas[str(rho)]["limite"] = math.sqrt(rho)

    combos = {"Raman 14,5 / IR medio 20 / tercera 25": [14.5, 20.0, 25.0],
              "Raman 14,5 / IR medio 20": [14.5, 20.0],
              "tres sensores de 20": [20.0, 20.0, 20.0],
              "tres sensores de 25": [25.0, 25.0, 25.0]}
    gls = {}
    for nombre, mards in combos.items():
        gls[nombre] = {}
        for rho in (0.0, 0.3, 0.5, 0.7):
            m, w = fusion_gls(mards, rho)
            gls[nombre][str(rho)] = {"mard_fusionado": m, "pesos": list(w),
                                     "pesos_negativos": bool((w < -1e-9).any())}

    # rho maximo para llegar a 12 % (R-B) y a 10 % (R-C) con la mejor combinacion
    def rho_max(objetivo, mards):
        lo, hi = 0.0, 0.95
        if fusion_gls(mards, 0.0)[0] > objetivo:
            return None
        for _ in range(60):
            mid = (lo + hi) / 2
            if fusion_gls(mards, mid)[0] <= objetivo:
                lo = mid
            else:
                hi = mid
        return lo

    mejor = combos["Raman 14,5 / IR medio 20 / tercera 25"]
    rmax12 = rho_max(12.0, mejor)
    rmax10 = rho_max(10.0, mejor)
    # Con sensores identicos de 14,5 %, rho maximo para llegar a 12 y 10 con N grande
    rho_lim_12 = (12.0 / 14.5) ** 2
    rho_lim_10 = (10.0 / 14.5) ** 2

    R["b_fusion"] = {
        "formulas": {
            "sensores_iguales": "sigma_f / sigma = raiz((1 + (N - 1) rho) / N), limite raiz(rho) cuando N crece",
            "estimar_rho": "con N = 2 y MARD proporcional a sigma: rho = 2 r^2 - 1, r = MARD fusionado / promedio de los MARD individuales",
            "gls": "pesos w = S^-1 1 / (1' S^-1 1), varianza fusionada = 1 / (1' S^-1 1), S_ij = s_i s_j rho_ij, con MARD en lugar de sigma",
        },
        "entradas": {
            "dos_electrodos": "MARD 10,1 % (redundante) frente a 11,4 % y 12,0 % (dias 1 a 7, 3.297 pares, 23 adultos DT1), E20, Sharifi 2016",
            "dos_electrodos_YSI": "MARD 9,4 % frente a 9,6 % y 9,9 % contra YSI dias 4 y 7, 1.237 pares, diferencia no significativa, E20",
            "mejor_no_invasivo": "Raman sin calibrar por persona 14,5 % (O28 Rothenbuhler 2025, O29 Zhang 2025), IR medio 19,6 % y 20,7 % (O8 Kaluza 2025), tercera 25 % (supuesto de la tarea, cerca de RSP en casa 25,8 %, O22)",
        },
        "rho_estimado": {"todos_los_dias": rho_todos, "razon_todos": r_todos,
                         "contra_YSI_dias_4_y_7": rho_ysi, "razon_YSI": r_ysi},
        "curvas_N": curvas,
        "gls": gls,
        "rho_maximo_12": rmax12,
        "rho_maximo_10": rmax10,
        "rho_limite_sensores_de_14_5_para_12": rho_lim_12,
        "rho_limite_sensores_de_14_5_para_10": rho_lim_10,
        "realidad": {
            "GlucoTrack_DF_F": "ARD media 22,3 % en 172 adultos DT2 (E2), 29,9 % en la primera etapa (E1), 25,5 % en casa (E3, Smith)",
            "Solianis_Biovotion": "MARD 18,0 % visita 1 y 27,3 % visita 2 con los mismos coeficientes (E10), 21,1 % global (E12), 35,4 % en casa (E13)",
            "sensor_ortogonal_Medtronic": "10,5 % frente a 11,0 % en la semana, P = 0,34 (E19)",
        },
        "nota": "Los errores de dos electrodos del mismo sensor comparten tejido, retraso y referencia, asi que 0,49 es una cota alta para sensores de principios distintos. "
                "No hay estudio que mida la correlacion de errores entre dos modalidades de glucosa (vacio de E). "
                "Con pesos de minimos cuadrados, rho mayor que s_menor / s_mayor deja pesos negativos, que son frágiles.",
    }


# ----------------------------------------------------------------------------
# c) De MARD a ruido por lectura y simulacion de alarma
# ----------------------------------------------------------------------------
KF = dict(process_noise=1.0 / 30.0, glucose_prior_sd=20.0, slope_prior_sd=1.0)  # escenarios.yaml
DT = 1.0
DURACION = 480.0
TAU1 = 6.0   # persona tipica del repositorio, profundidad 1
UMBRAL = 70.0
N_REP = 40
SEMILLA = 1


def con_silencio(tiempos, silencio_min):
    """Descarta alarmas que llegan antes de `silencio_min` desde la ultima aceptada."""
    out = []
    for t in tiempos:
        if not out or t - out[-1] >= silencio_min:
            out.append(float(t))
    return np.array(out)


TAU_LENTO = 60.0  # min, correlacion del error lento (supuesto del analista)


def error_lento(sigma, n, semilla):
    """Error AR(1) con desviacion estandar estacionaria sigma y correlacion de 60 min."""
    rng = np.random.default_rng(semilla)
    phi = math.exp(-DT / TAU_LENTO)
    e = np.empty(n)
    e[0] = rng.normal(0.0, sigma)
    z = rng.normal(0.0, 1.0, size=n)
    for k in range(1, n):
        e[k] = phi * e[k - 1] + math.sqrt(1 - phi**2) * sigma * z[k]
    return e


def simular_hipo(sigma, n_rep=N_REP, tipo="blanco"):
    blood = model.simulate_blood_glucose(DURACION, DT, SEMILLA)
    episode = metrics.true_episode(blood, UMBRAL, DT)
    alarm_blood = metrics.episode_alarm(blood, episode, UMBRAL, DT).detection_min
    g1_true = model.diffuse(blood, TAU1, DT)
    det, fa, atraso, fa_crudo, det_crudo, rmse_s = [], [], [], [], [], []
    for r in range(n_rep):
        seed1, _ = model.noise_seeds(SEMILLA, r)
        if tipo == "blanco":
            g1 = model.add_noise(g1_true, sigma, seed1)
        else:
            g1 = g1_true + error_lento(sigma, len(g1_true), [SEMILLA, r, 7])
        suav = reconstruct.single_depth_smoother(g1, max(sigma, 0.01), DT, **KF)
        o = metrics.episode_alarm(suav, episode, UMBRAL, DT)
        oc = metrics.episode_alarm(g1, episode, UMBRAL, DT)
        det.append(o.detected)
        fa.append(o.false_alarms)
        if o.detected:
            atraso.append(o.detection_min - alarm_blood)
        det_crudo.append(oc.detected)
        fa_crudo.append(oc.false_alarms)
        rmse_s.append(metrics.rmse(suav, blood))
    return {
        "sigma": sigma,
        "episodio_sangre_min": list(episode),
        "alarma_sangre_min": alarm_blood,
        "fraccion_detectada": float(np.mean(det)),
        "falsas_alarmas_por_registro": float(np.mean(fa)),
        "atraso_medio_min": float(np.mean(atraso)) if atraso else None,
        "atraso_mediano_min": float(np.median(atraso)) if atraso else None,
        "atraso_p10_p90_min": [float(np.percentile(atraso, 10)), float(np.percentile(atraso, 90))] if atraso else None,
        "rmse_suavizado_vs_sangre": float(np.mean(rmse_s)),
        "lectura_cruda": {"fraccion_detectada": float(np.mean(det_crudo)),
                          "falsas_alarmas_por_registro": float(np.mean(fa_crudo))},
    }


def simular_noche_sin_hipo(sigma, g0, n_rep=N_REP, tipo="blanco"):
    """Noche de 8 h sin hipoglucemia: glucosa en torno a g0 con una oscilacion lenta de 8 mg/dL."""
    t = model.time_axis(DURACION, DT)
    blood = g0 + 8.0 * np.sin(2 * np.pi * t / 180.0)
    g_true = model.diffuse(blood, TAU1, DT)
    fa_cruces, fa_sil = [], []
    for r in range(n_rep):
        seed1, _ = model.noise_seeds(SEMILLA, r + 1000)
        if tipo == "blanco":
            g1 = model.add_noise(g_true, sigma, seed1)
        else:
            g1 = g_true + error_lento(sigma, len(g_true), [SEMILLA, r + 1000, 7])
        suav = reconstruct.single_depth_smoother(g1, max(sigma, 0.01), DT, **KF)
        tiempos = reconstruct.alarm_times(suav, UMBRAL, DT)
        fa_cruces.append(len(tiempos))
        fa_sil.append(len(con_silencio(tiempos, 30.0)))
    return {"sigma": sigma, "glucosa_media": g0,
            "falsas_alarmas_por_noche_cruces": float(np.mean(fa_cruces)),
            "falsas_alarmas_por_noche_con_silencio_30min": float(np.mean(fa_sil)),
            "noches_con_alguna_falsa_alarma": float(np.mean([x > 0 for x in fa_sil]))}


def calculo_c():
    glucosas = [70, 85, 100]
    tabla_mard = {}
    for sigma in (5, 8, 13, 18, 25, 35):
        tabla_mard[str(sigma)] = {str(g): 100 * K_MARD * sigma / g for g in glucosas}
    inversa = {}
    for mard in (8.0, 10.0, 12.0, 14.5, 20.0, 25.0):
        inversa[str(mard)] = {str(g): mard / 100 * g / K_MARD for g in glucosas}
    sims = [simular_hipo(s) for s in (0.0, 5, 8, 13, 18, 25, 35)]
    noches = {}
    for sigma in (13, 18, 25, 35):
        noches[str(sigma)] = {str(g0): simular_noche_sin_hipo(sigma, g0) for g0 in (120, 100, 90)}
    sims_lento = [simular_hipo(s, tipo="lento") for s in (5, 8, 13, 18, 25, 35)]
    noches_lento = {}
    for sigma in (13, 18, 25, 35):
        noches_lento[str(sigma)] = {str(g0): simular_noche_sin_hipo(sigma, g0, tipo="lento") for g0 in (120, 100, 90)}
    # sigma maximo para separar 70 de 54 mg/dL con un umbral en 62
    z90, z95 = 1.2816, 1.6449
    R["c_ruido"] = {
        "formula": "sigma = MARD x glucosa / 0,798, porque para un error normal E|X| = sigma raiz(2/pi) = 0,798 sigma",
        "mard_equivalente_porcentaje": tabla_mard,
        "sigma_equivalente_mg_dl": inversa,
        "sigma_de_30_mg_dl_al_90": 30.0 / 1.645,
        "sigma_max_para_separar_70_de_54_90": 8.0 / z90,
        "sigma_max_para_separar_70_de_54_95": 8.0 / z95,
        "simulacion": {
            "descripcion": "Curva de sangre del repositorio (comida a los 90 min y episodio de hipoglucemia con minimo de 50 mg/dL a los 300 min), "
                           "profundidad 1 con tau = 6 min, suavizada con el filtro de una profundidad del repositorio con el sigma conocido, "
                           "alarma al cruzar 70 mg/dL, 40 replicas, semilla maestra 1.",
            "filas": sims,
            "sigma_0_es_referencia": "sigma 0 deja solo el retraso de 6 min de la capa y el suavizado",
        },
        "simulacion_error_lento": {
            "descripcion": "Igual que la simulacion anterior, pero el error es AR(1) con correlacion de 60 min y desviacion estandar sigma, "
                           "sin ruido blanco. Supuesto del analista (Propuesta) para acercarse a la deriva y al sesgo de los sensores reales. "
                           "Los estudios no entregan la forma del error.",
            "filas": sims_lento,
            "noches_sin_hipoglucemia": noches_lento,
        },
        "noches_sin_hipoglucemia": {
            "descripcion": "Noche de 8 h sin hipoglucemia, glucosa media g0 con oscilacion de 8 mg/dL cada 180 min, mismo suavizado, 40 replicas. "
                           "Un silencio de 30 min tras cada alarma evita contar el rebote en el umbral. Calculo del analista, no esta en el repositorio.",
            "filas": noches,
        },
        "aviso": "El ruido es blanco, independiente entre lecturas y sin deriva, y el filtro conoce sigma. "
                 "En sensores reales el error es lento y correlacionado, y el sesgo entre personas domina. Por eso esta simulacion es optimista.",
    }


# ----------------------------------------------------------------------------
# d) Fusion de decisiones para la alarma nocturna
# ----------------------------------------------------------------------------
BASE_SEMANAL = 0.54       # eventos nocturnos por semana, mediana DT1 (H17, Mitter 2025)
HORAS_NOCHE_SEMANA = 56.0  # 8 h por noche, 7 noches
VENTANA_H = 0.5           # ventana de coincidencia de 30 min a cada lado
RHO_DEP = 0.3             # grado de dependencia moderado de la regla 3


def vpp(se, fa, base=BASE_SEMANAL):
    tp = se * base
    return tp / (tp + fa) if (tp + fa) > 0 else float("nan")


def canal(nombre, se, fa, fuente, nota="", valido=True):
    return {"nombre": nombre, "se": se, "fa_semana": fa, "vpp": vpp(se, fa), "tp_semana": se * base_tp(se),
            "fuente": fuente, "nota": nota, "evidencia_valida": valido}


def base_tp(se):
    return BASE_SEMANAL


def fa_and_indep(f1, f2):
    return f1 * f2 * (2 * VENTANA_H) / HORAS_NOCHE_SEMANA


def combinar(nombre, canales, regla, rho=None):
    """regla: 'OR', 'AND' o '2de3'. rho=None -> independencia. rho en [0,1] -> interpolacion hacia la dependencia total."""
    ses = [c["se"] for c in canales]
    fas = [c["fa_semana"] for c in canales]
    if regla == "OR":
        se = 1 - np.prod([1 - s for s in ses])
        fa = sum(fas)
        if rho:
            # con dependencia los eventos detectados se traslapan: Se_OR entre indep y max(Se)
            se = se + rho * (max(ses) - se)
            fa = fa + rho * (max(fas) - fa)
    elif regla == "AND":
        se_i = float(np.prod(ses))
        fa_i = fa_and_indep(fas[0], fas[1]) if len(canales) == 2 else None
        se = se_i
        fa = fa_i
        if rho:
            se = se_i + rho * (min(ses) - se_i)
            fa = fa_i + rho * (min(fas) - fa_i)
    elif regla == "2de3":
        a, b, c = ses
        se_i = a * b + a * c + b * c - 2 * a * b * c
        fa_i = sum(fa_and_indep(x, y) for x, y in itertools.combinations(fas, 2))
        se, fa = se_i, fa_i
        if rho:
            # dependencia: k de n tiende a la mediana de las sensibilidades y a la mediana de las FA
            se = se_i + rho * (sorted(ses)[1] - se_i)
            fa = fa_i + rho * (sorted(fas)[1] - fa_i)
    else:
        raise ValueError(regla)
    return {"nombre": nombre, "regla": regla, "dependencia": rho if rho else 0.0, "se": float(se),
            "fa_semana": float(fa), "vpp": vpp(float(se), float(fa)),
            "canales": [c["nombre"] for c in canales]}


def calculo_d():
    sims = {int(f["sigma"]): f for f in R["c_ruido"]["simulacion"]["filas"] if f["sigma"] > 0}
    noches = R["c_ruido"]["noches_sin_hipoglucemia"]["filas"]

    canales = {}
    # GlucoWatch G2: Se nocturna 0,77 con down alert (H9, E39). Falsos positivos 62 %, razon FA/TP = 0,62/0,38.
    # Supuesto: un episodio inducido por participante-dia (estudio de 24 h con hipoglucemia inducida).
    razon_gw = 0.62 / 0.38
    se_gw = 0.77
    fa_gw_semana_total = razon_gw * 0.88 * 7.0           # por semana de uso las 24 h
    fa_gw_noche = fa_gw_semana_total * (8.0 / 24.0)      # parte nocturna si las falsas alarmas se reparten parejo
    canales["GlucoWatch G2"] = canal(
        "GlucoWatch G2", se_gw, fa_gw_noche,
        "H9 y E39 (DirecNet 2004): Se nocturna 0,77 con la alerta de caida, falsos positivos 62 %",
        "FA/semana = (0,62/0,38) x 0,88 x 7 x (8/24), con el supuesto de un episodio inducido por persona y dia en el estudio")

    # Dexcom G7: Se 0,876 a 0,888 con alerta a 70 mg/dL, alerta verdadera 82,1 a 86,9 % (H2)
    razon_g7 = (1 - 0.845) / 0.845
    se_g7 = 0.882
    canales["Dexcom G7"] = canal(
        "Dexcom G7", se_g7, razon_g7 * se_g7 * BASE_SEMANAL,
        "H1 y H2 (Garg 2022, Welsh 2024): deteccion 87,6 a 88,9 %, alerta verdadera 82,1 a 86,9 % a 70 mg/dL",
        "Optimista: se mantiene la razon falsas/verdaderas del estudio, que indujo excursiones y tenia las alertas apagadas")
    # Variante pesimista del G7: razon de falsas alertas 3 veces mayor
    canales["Dexcom G7 (pesimista)"] = canal(
        "Dexcom G7 (pesimista)", se_g7, 3 * razon_g7 * se_g7 * BASE_SEMANAL,
        "H1 y H2 con un supuesto del analista: el triple de falsas alertas",
        "Supuesto Propuesta: el estudio indujo excursiones, la vida real tiene menos hipoglucemias por falsa alerta contada")

    # EEG subcutaneo
    canales["EEG subcutaneo"] = canal(
        "EEG subcutaneo", 0.90, 0.2,
        "H20 y H21 (Blaabjerg 2019, Snogdal 2012): 9 de 10 durmiendo, 0,2 falsas detecciones por semana de noche",
        "7 y 10 personas con percepcion alterada, ya no es no invasivo", valido=False)

    # Reloj inteligente: Mendez 2026 (H29): Se 0,78, Sp 0,64, 66 noches con hipo de 351
    prev_noche = 66.0 / 351.0
    fa_reloj = 7.0 * (1 - 0.64) * (1 - prev_noche)
    canales["Reloj inteligente"] = canal(
        "Reloj inteligente", 0.78, fa_reloj,
        "H29 (Mendez 2026): Se 0,78, Sp 0,64, VPP 0,25 con 351 noches de 36 adultos",
        "FA/semana = 7 x (1 - Sp) x (1 - prevalencia de noches con hipoglucemia 66/351). Se tomo Sp como especificidad por noche")

    # EEG en el oido: hipotetico con las cifras del preprint de 5 personas (E de H, vacios y verificacion id 14)
    canales["EEG en el oido (hipotetico)"] = canal(
        "EEG en el oido (hipotetico)", 0.90, 7.0 * (1 - 0.82) * (1 - prev_noche),
        "Preprint de 5 personas, Se de 90 % o mas y Sp de 82 % o mas solo en canales contralaterales (Cabrera 2020, verificacion id 14)",
        "Sin evidencia valida por la regla 1. Los canales del mismo oido no superaron el azar. Sp tomada por noche", valido=False)

    # Via optica no invasiva: ruido blanco nominal (calculo c) y error lento (supuesto del analista)
    sims_l = {int(f["sigma"]): f for f in R["c_ruido"]["simulacion_error_lento"]["filas"]}
    noches_l = R["c_ruido"]["simulacion_error_lento"]["noches_sin_hipoglucemia"]
    for sigma in (13, 18, 25, 35):
        if sigma in sims:
            s = sims[sigma]
            canales[f"Via optica sigma {sigma}"] = canal(
                f"Via optica sigma {sigma}", s["fraccion_detectada"], 7.0 * s["falsas_alarmas_por_registro"],
                f"Calculo c: ruido blanco, sigma {sigma} mg/dL, deteccion {s['fraccion_detectada']:.2f}, "
                f"{s['falsas_alarmas_por_registro']:.2f} falsas alarmas por registro",
                "Ruido blanco, optimista. FA/semana = 7 x falsas alarmas por registro", valido=False)
        sl = sims_l[sigma]
        fa_l = 7.0 * noches_l[str(sigma)]["100"]["falsas_alarmas_por_noche_con_silencio_30min"]
        canales[f"Via optica sigma {sigma} (error lento)"] = canal(
            f"Via optica sigma {sigma} (error lento)", sl["fraccion_detectada"], fa_l,
            f"Calculo c con error lento (AR(1), 60 min), sigma {sigma}: deteccion {sl['fraccion_detectada']:.2f}, "
            f"noches a 100 mg/dL con {fa_l / 7:.2f} falsas alarmas",
            "Supuesto del analista (Propuesta). FA/semana = 7 x falsas alarmas por noche a 100 mg/dL con silencio de 30 min", valido=False)

    unitarios = list(canales.values())

    def par(nombre, a, b):
        return [combinar(f"{a['nombre']} O {b['nombre']}", [a, b], "OR"),
                combinar(f"{a['nombre']} Y {b['nombre']}", [a, b], "AND"),
                combinar(f"{a['nombre']} Y {b['nombre']} (dependencia 0,3)", [a, b], "AND", rho=RHO_DEP)]

    def tri(a, b, c):
        return [combinar(f"2 de 3: {a['nombre']}, {b['nombre']}, {c['nombre']}", [a, b, c], "2de3"),
                combinar(f"2 de 3: {a['nombre']}, {b['nombre']}, {c['nombre']} (dependencia 0,3)", [a, b, c], "2de3", rho=RHO_DEP)]

    C = canales
    comb = []
    versiones = {}
    for ver, eeg in (("con EEG subcutaneo", C["EEG subcutaneo"]), ("con EEG en el oido", C["EEG en el oido (hipotetico)"])):
        lista = []
        for sg in (13, 18):
            for suf in ("", " (error lento)"):
                op = C[f"Via optica sigma {sg}{suf}"]
                lista += par("", op, eeg)
                lista += par("", op, C["Reloj inteligente"])
                lista += tri(op, eeg, C["Reloj inteligente"])
        lista += par("", C["Dexcom G7"], eeg)
        lista += par("", C["Dexcom G7"], C["Reloj inteligente"])
        lista += tri(C["Dexcom G7"], eeg, C["Reloj inteligente"])
        lista += par("", eeg, C["Reloj inteligente"])
        versiones[ver] = lista

    def pasa_rb(x):
        return x["se"] >= 0.85 and x["vpp"] >= 0.70

    for ver, lista in versiones.items():
        for x in lista:
            x["cumple_RB"] = bool(pasa_rb(x))
    for c in unitarios:
        c["cumple_RB"] = bool(pasa_rb(c))

    gw = canales["GlucoWatch G2"]
    R["d_alarmas"] = {
        "formulas": {
            "vpp": "VPP = Se x B / (Se x B + FA), con B = 0,54 eventos nocturnos por semana",
            "OR": "Se = 1 - (1 - Se1)(1 - Se2), FA = FA1 + FA2",
            "AND": "Se = Se1 Se2, FA = FA1 FA2 (2 w) / T, con w = 0,5 h y T = 56 h nocturnas por semana (procesos de Poisson independientes)",
            "2de3": "Se = Se1Se2 + Se1Se3 + Se2Se3 - 2 Se1Se2Se3, FA = suma de las coincidencias por pares (el triple es despreciable)",
            "dependencia": "Con dependencia moderada rho = 0,3 se interpola entre el caso independiente y el limite de dependencia total: "
                           "Se_AND entre Se1 Se2 y min(Se1, Se2), FA_AND entre FA1 FA2 (2w)/T y min(FA1, FA2)",
        },
        "base_semanal": BASE_SEMANAL,
        "fuente_base": "H17 (Mitter 2025): mediana 0,54 eventos nocturnos por semana en 3.696 personas con DT1, RIC 0,0 a 1,5. Muchas personas tienen cero.",
        "ventana_coincidencia_min": 30,
        "canales": canales,
        "versiones": versiones,
        "linea_base_glucowatch": {"se": gw["se"], "fa_semana": gw["fa_semana"], "vpp": gw["vpp"]},
        "umbral_regla_0_y_RB": {"se_min": 0.85, "vpp_min": 0.70},
        "aviso": "Estos numeros mezclan estudios con eventos inducidos, pocas personas y definiciones distintas de falsa alarma. "
                 "Sirven para comparar ordenes de magnitud, no para predecir un dispositivo.",
    }


# ----------------------------------------------------------------------------
# f) Rango de efectividad realista (resume a, b, c y d con tres casos)
# ----------------------------------------------------------------------------
def calculo_f():
    C = R["d_alarmas"]["canales"]
    a = R["a_difusion"]
    sep = {x["D"]: x for x in a["separacion"]}
    t_epi_rapida = a["filas_difusion"][0]["t_min"]
    t_epi_media = a["filas_difusion"][1]["t_min"]
    t_epi_lenta = a["filas_difusion"][2]["t_min"]

    def uno(canales, regla, rho=None):
        return combinar("x", canales, regla, rho=rho)

    opt13 = C["Via optica sigma 13 (error lento)"]
    opt18 = C["Via optica sigma 18 (error lento)"]
    opt25 = C["Via optica sigma 25 (error lento)"]
    eeg_oido = C["EEG en el oido (hipotetico)"]
    optimista = uno([opt13, eeg_oido], "AND")
    esperado = uno([opt18, eeg_oido], "AND", rho=RHO_DEP)
    pesimista = {"se": opt25["se"], "fa_semana": opt25["fa_semana"], "vpp": opt25["vpp"]}
    m_opt, _ = fusion_gls([14.5, 20.0, 25.0], 0.3)
    m_esp, w_esp = fusion_gls([20.0, 25.0, 25.0], 0.5)
    R["f_rango"] = {
        "mard_via_optica": {"optimista": 12.8, "esperado": 20.0, "pesimista": 25.8,
                            "fuente": "12,8 % RSP con calibracion de 4 h (O24), 19,6 a 20,7 % DiaMonTech y 20,3 % NIR (O8, O35), 25,8 % RSP en casa (O22)"},
        "mard_fusionado": {"optimista": m_opt, "esperado": m_esp, "pesimista": 25.0,
                           "supuestos": "optimista GLS de 14,5 / 20 / 25 con rho = 0,3, esperado GLS de 20 / 25 / 25 con rho = 0,5 (cerca del 0,49 estimado), "
                                        "pesimista sin ganancia, como GlucoTrack (22 a 30 %) y Biovotion (21 a 27 %)"},
        "retraso_total_min": {
            "optimista": 2.0 + 3.0, "esperado": t_epi_media + 4.0, "pesimista": t_epi_lenta + 8.0,
            "supuestos": "retraso fisiologico mas tiempo por medicion. Optimista: dermis 2 min (H38) y Raman de 3 min (O22). "
                         "Esperado: epidermis con D = 0,075e-6, 3,6 min, y 4 min por lectura de DiaMonTech (O9). "
                         "Pesimista: epidermis con D = 0,037e-6, 7,2 min, y 8 min por medicion del muSORS (O31). No incluye el suavizado del filtro (unos 6 min en la simulacion c)",
            "glucowatch": 20.0},
        "alarma_nocturna": {
            "optimista": {"se": optimista["se"], "fa_semana": optimista["fa_semana"], "vpp": optimista["vpp"],
                          "supuestos": "optica sigma 13 con error lento Y EEG del oido (preprint de 5 personas), independientes"},
            "esperado": {"se": esperado["se"], "fa_semana": esperado["fa_semana"], "vpp": esperado["vpp"],
                         "supuestos": "optica sigma 18 con error lento Y EEG del oido, dependencia 0,3"},
            "pesimista": {**pesimista, "supuestos": "el EEG del oido no aporta (los canales del mismo oido no superaron el azar) y queda la via optica sola con sigma 25"},
        },
        "glucowatch": {"se": C["GlucoWatch G2"]["se"], "fa_semana": C["GlucoWatch G2"]["fa_semana"], "vpp": C["GlucoWatch G2"]["vpp"]},
        "dexcom_g7": {"se": C["Dexcom G7"]["se"], "fa_semana": C["Dexcom G7"]["fa_semana"], "vpp": C["Dexcom G7"]["vpp"]},
    }


# ----------------------------------------------------------------------------
# e) Limites fisicos de senal
# ----------------------------------------------------------------------------
def calculo_e():
    brecha = 16.0  # 70 menos 54 mg/dL
    snr = 2e-3 / 5e-6  # 2 mAU frente a 5 uAU
    lod_ruido = 100.0 / snr
    lod_pa = [100.0, 57.0, 25.0, 12.5]
    mmol_por_brecha = brecha / 18.016
    # Polarimetria
    pol_por_10 = 0.0056
    pol_brecha = pol_por_10 * brecha / 10.0
    # Agua en RF
    coef_agua = -0.45  # % por K
    efecto_glucosa_pct_mmol = (0.01, 0.02)  # sin verificar (solo un resultado de busqueda)
    dT = [mmol_por_brecha * e / abs(coef_agua) for e in efecto_glucosa_pct_mmol]
    # Laser
    def ca(lam_nm):
        return 10 ** (0.002 * (lam_nm - 700.0))

    ap_cm2 = math.pi * (0.35 / 2) ** 2
    lasers = []

    def fila(nombre, p_w, mpe_w_cm2, spot_cm2=None, nota=""):
        a_min = p_w / mpe_w_cm2
        irr_ap = p_w / ap_cm2
        d = {"sistema": nombre, "potencia_W": p_w, "limite_W_cm2": mpe_w_cm2,
             "area_minima_cm2": a_min, "diametro_minimo_mm": 20 * math.sqrt(a_min / math.pi),
             "irradiancia_si_cabe_en_apertura_de_3_5_mm_W_cm2": irr_ap,
             "veces_el_limite_si_cabe_en_apertura_3_5_mm": irr_ap / mpe_w_cm2, "nota": nota}
        if spot_cm2:
            d["irradiancia_con_spot_informado_W_cm2"] = p_w / spot_cm2
            d["veces_el_limite_con_spot_informado"] = p_w / spot_cm2 / mpe_w_cm2
        lasers.append(d)

    fila("DiaMonTech QCL 8-10 um, ~10 mW promedio (O9)", 0.010, 0.1,
         spot_cm2=0.010 / 0.1373,
         nota="La irradiancia medida por los autores es 1373 W/m2 = 0,137 W/cm2. Ellos la comparan con 5000 W/m2 (27 %). "
              "La tabla de piel para 2,6 a 1000 um del manual leido da 0,1 W/cm2 (1000 W/m2). Discrepancia sin resolver: no se abrio IEC 60825-1 ni ANSI Z136.1-2022")
    fila("Kottmann QCL fotoacustico, 2 mW tras reducir de 8 mW (O16)", 0.002, 0.1)
    fila("Raman RSP 830 nm, 300 mW (O22)", 0.300, 0.2 * ca(830),
         nota="Tamano del haz no informado en la fuente leida. Formula CA no verificada en fuente abierta (O44)")
    fila("Raman Kang 2020 830 nm, 250 mW, punto de 1 x 2 mm en cerdos (O27)", 0.250, 0.2 * ca(830), spot_cm2=0.1 * 0.2,
         nota="Dato en cerdos con punto informado")
    fila("Raman Liom, menos de 100 mW (O28)", 0.100, 0.2 * ca(785),
         nota="Longitud de onda no informada, se supone 785 nm para el limite")
    fila("Raman 785 nm, 400 mW (Scholtes-Timmerman 2014, O26)", 0.400, 0.2 * ca(785))

    # Piso de la referencia (ISO 15197:2013, +-15 mg/dL bajo 100 mg/dL y +-15 % desde 100 mg/dL)
    sigma_ref = 15.0 / 1.96
    piso = {str(g): 100 * K_MARD * (sigma_ref if g < 100 else 0.15 * g / 1.96) / g for g in (54, 70, 100, 150)}
    # Combinacion en cuadratura del error del dispositivo y de la referencia (Smith, O34)
    cuad = {str(m): math.sqrt(m**2 + piso["70"]**2) for m in (8.0, 12.0, 14.5, 20.0)}

    R["e_limites"] = {
        "ir_medio": {
            "formula": "razon senal/ruido = 2 mAU / 5 uAU = 400 por 100 mg/dL, limite de ruido = 100 / 400 mg/dL",
            "entradas": "2 mAU por 100 mg/dL y ruido rms de 5 uAU: O13, Delbeck y Heise 2021",
            "snr": snr, "limite_por_ruido_electronico_mg_dl": lod_ruido,
            "interpretacion": "El ruido del instrumento no es el limite. Lo es la variacion de la piel y los otros solutos, que la fuente no cuantifica (vacio de O)",
        },
        "fotoacustico": {
            "limites_de_deteccion_mg_dl": lod_pa,
            "fuente": "100 (2012, ex vivo, O15), 57 (2013), 25 (QCL unico, 2022), 12,5 (doble laser) segun la revision O17. In vivo: +-30 mg/dL al 90 % (O16)",
            "brecha_70_54_mg_dl": brecha,
            "bajo_la_brecha": [x for x in lod_pa if x < brecha],
            "sobre_la_brecha": [x for x in lod_pa if x >= brecha],
            "sigma_de_30_al_90": 30.0 / 1.645,
        },
        "polarimetria": {
            "formula": "rotacion = 0,0056 grados por 10 mg/dL y por mm, rotacion de la brecha = 0,0056 x 16 / 10",
            "rotacion_por_10_mg_dl_y_mm": pol_por_10, "rotacion_de_la_brecha_por_mm": pol_brecha,
            "fuente": "O40, Smith 2023, calculo del autor del libro",
        },
        "agua_rf": {
            "coeficiente_pct_por_K": coef_agua,
            "fuente": "O80/E35: derivada del ajuste de Malmberg y Maryott 1956 a 25 C, calculo del catalogador, valido bajo 100 kHz, a GHz difiere",
            "brecha_mmol_L": mmol_por_brecha,
            "efecto_glucosa_pct_por_mmol_L": efecto_glucosa_pct_mmol,
            "efecto_glucosa_fuente": "SIN VERIFICAR: resultado de busqueda de una revision sin identificar (vacio de E)",
            "temperatura_equivalente_K": dT,
        },
        "laser": {
            "formulas": "limite = 0,1 W/cm2 para 2,6 a 1000 um y 0,2 x CA W/cm2 para 0,4 a 1,4 um, con CA = 10^(0,002 (lambda - 700 nm)), "
                        "area minima = potencia / limite. Apertura de promediado de 3,5 mm (O44, manual de Auburn 2007 basado en ANSI Z136.1 de 2000)",
            "CA_785": ca(785), "CA_830": ca(830),
            "filas": lasers,
            "aviso": "Fuente secundaria. La formula CA se vio en un fragmento de otro manual. No se abrio IEC 60825-1 ni ANSI Z136.1-2022",
        },
        "referencia_iso15197": {
            "formula": "sigma_ref = 15 / 1,96 mg/dL bajo 100 mg/dL, MARD de la referencia = 0,798 sigma_ref / glucosa, error combinado en cuadratura",
            "fuente": "M3, ISO 15197:2013 citada en Sharif-Nia 2025. La proporcion de 95 % no se confirmo en fuente abierta. Los CGM se comparan con YSI, mejor que el limite de la norma",
            "sigma_ref_mg_dl": sigma_ref,
            "mard_de_la_referencia_en_el_limite_pct": piso,
            "mard_visto_con_dispositivo_perfecto_a_70": piso["70"],
            "mard_observado_si_el_real_a_70_es": cuad,
        },
    }


if __name__ == "__main__":
    calculo_a()
    calculo_b()
    calculo_c()
    calculo_d()
    calculo_e()
    calculo_f()
    SALIDA.write_text(json.dumps(redondear(R), ensure_ascii=False, indent=1), encoding="utf-8")
    print("escrito", SALIDA)
    # Resumen en consola
    a = R["a_difusion"]
    print("\n== a) difusion")
    for f in a["filas_difusion"]:
        print(f"  {f['capa']}: t = {f['t_min']:.2f} min, tau losa = {f['tau_losa_min']:.2f} min")
    for s in a["separacion"]:
        print(f"  {s['D']}: separacion epidermis completa {s['separacion_epidermis_completa_vs_dermis_min']:.2f} min ({s['regla4_epidermis_completa']}), 45 um {s['separacion_45um_vs_dermis_min']:.2f} ({s['regla4_45um']})")
    b = R["b_fusion"]
    print("\n== b) fusion; rho estimado", b["rho_estimado"])
    for n, d in b["gls"].items():
        print("  ", n, {r: round(v["mard_fusionado"], 2) for r, v in d.items()}, {r: [round(x, 2) for x in v["pesos"]] for r, v in d.items()})
    print("   rho max 12:", b["rho_maximo_12"], "rho max 10:", b["rho_maximo_10"], b["rho_limite_sensores_de_14_5_para_12"], b["rho_limite_sensores_de_14_5_para_10"])
    c = R["c_ruido"]
    print("\n== c) simulacion")
    for f in c["simulacion"]["filas"]:
        print(f"  sigma {f['sigma']}: detecta {f['fraccion_detectada']:.2f}, FA/registro {f['falsas_alarmas_por_registro']:.2f}, atraso medio {f['atraso_medio_min']}, mediana {f['atraso_mediano_min']}, p10-p90 {f['atraso_p10_p90_min']}, rmse {f['rmse_suavizado_vs_sangre']:.1f} | crudo: det {f['lectura_cruda']['fraccion_detectada']:.2f} FA {f['lectura_cruda']['falsas_alarmas_por_registro']:.2f}")
    for f in c["simulacion_error_lento"]["filas"]:
        print(f"  LENTO sigma {f['sigma']}: detecta {f['fraccion_detectada']:.2f}, FA/registro {f['falsas_alarmas_por_registro']:.2f}, atraso medio {f['atraso_medio_min']}, p10-p90 {f['atraso_p10_p90_min']}, rmse {f['rmse_suavizado_vs_sangre']:.1f}")
    for s, d in c["simulacion_error_lento"]["noches_sin_hipoglucemia"].items():
        for g, v in d.items():
            print(f"  LENTO noche sigma {s} g0 {g}: con silencio {v['falsas_alarmas_por_noche_con_silencio_30min']:.2f}, noches con FA {v['noches_con_alguna_falsa_alarma']:.2f}")
    for s, d in c["noches_sin_hipoglucemia"]["filas"].items():
        for g, v in d.items():
            print(f"  noche sigma {s} g0 {g}: cruces {v['falsas_alarmas_por_noche_cruces']:.2f}, con silencio {v['falsas_alarmas_por_noche_con_silencio_30min']:.2f}, noches con FA {v['noches_con_alguna_falsa_alarma']:.2f}")
    d = R["d_alarmas"]
    print("\n== d) canales")
    for k, v in d["canales"].items():
        print(f"  {k}: Se {v['se']:.2f} FA/sem {v['fa_semana']:.2f} VPP {v['vpp']:.2f} RB {v['cumple_RB']}")
    for ver, lst in d["versiones"].items():
        print("  --", ver)
        for x in lst:
            print(f"    {x['nombre']}: Se {x['se']:.2f} FA {x['fa_semana']:.3f} VPP {x['vpp']:.2f} RB {x['cumple_RB']}")
    e = R["e_limites"]
    print("\n== e)")
    print(json.dumps(redondear({k: e[k] for k in ("ir_medio", "fotoacustico", "polarimetria", "agua_rf")}), ensure_ascii=False)[:1800])
    for f in e["laser"]["filas"]:
        print("  ", f["sistema"], round(f["limite_W_cm2"], 3), "area min", round(f["area_minima_cm2"], 3), "diam", round(f["diametro_minimo_mm"], 1), "x lim ap3.5", round(f["veces_el_limite_si_cabe_en_apertura_3_5_mm"], 2), f.get("veces_el_limite_con_spot_informado"))
    print(json.dumps(redondear(e["referencia_iso15197"]), ensure_ascii=False)[:900])
