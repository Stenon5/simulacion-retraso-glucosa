"""Figuras del documento de onboarding del medidor no invasivo de glucosa.

Las cifras salen de results/resumen.md del repo Stenon5/simulacion-retraso-glucosa
(corrida python run_all.py --seed 1). La curva de sangre y la difusion repiten
docs/decisiones-de-implementacion.md, secciones 1 y 2.
Correr con: py -3.11 figuras.py
"""
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle

OUT = Path(__file__).parent / "figuras"
OUT.mkdir(exist_ok=True)
CALCULOS = Path(__file__).resolve().parent.parent.parent / "3-analisis-de-viabilidad" / "resultados-calculos.json"

AZUL = "#1f6fb2"
AZUL_CLARO = "#d6e6f5"
GRIS = "#6e6e6e"
GRIS_CLARO = "#eeeeee"
ROJO = "#c0392b"
ROJO_CLARO = "#f8dcd8"
VERDE_AGUA = "#1a8a7a"
VERDE_AGUA_CLARO = "#d4efe9"
AMBAR = "#b8860b"
AMBAR_CLARO = "#f7ecd0"
NEGRO = "#1b1b1b"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 14,
    "axes.titlesize": 14,
    "axes.labelsize": 14,
    "legend.fontsize": 13,
    "xtick.labelsize": 13,
    "ytick.labelsize": 13,
    "axes.spines.top": False,
    "axes.spines.right": False,
})


def guardar(fig, nombre):
    fig.savefig(OUT / nombre, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# Ancho de las figuras: 8,6 pulgadas, que impresas a 640 px (6,67 pulgadas) dejan toda letra de 13 pt en unos 10 pt.
def lienzo(w, h, xmax, ymax):
    fig = plt.figure(figsize=(w, h))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, xmax)
    ax.set_ylim(0, ymax)
    ax.axis("off")
    return fig, ax


def caja(ax, x, y, w, h, texto, fondo, borde, size=13, peso="normal", color=NEGRO, estilo="round,pad=0.02,rounding_size=0.02"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=estilo, fc=fondo, ec=borde, lw=1.8))
    ax.text(x + w / 2, y + h / 2, texto, ha="center", va="center", fontsize=size,
            fontweight=peso, color=color, wrap=True)


def flecha(ax, x0, y0, x1, y1, color=GRIS, lw=2.0):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle="-|>", mutation_scale=20,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


# Figura 1. Mapa de tecnologias no invasivas, agrupadas como Tang et al. 2020.
def f01_mapa_tecnologias():
    fig, ax = lienzo(8.4, 5.2, 12, 7.4)

    # Especificidad segun el ranking de viabilidad del documento del medidor.
    # Fluorescencia, OCT e iontoforesis no aparecen en ese ranking.
    colores = {"alta": (AZUL_CLARO, AZUL), "media": (AMBAR_CLARO, AMBAR), "baja": (GRIS_CLARO, GRIS),
               "sin": ("white", GRIS)}
    familias = [
        ("Ópticas", [("Infrarrojo medio", "alta"), ("Raman", "alta"), ("Polarimetría", "media"),
                     ("Infrarrojo cercano", "baja"), ("Fluorescencia y OCT", "sin")]),
        ("Microondas y\nradiofrecuencia", [("Radiofrecuencia", "baja"), ("Microondas", "baja"),
                                           ("Bioimpedancia", "baja")]),
        ("Electroquímicas\n(fluidos)", [("Iontoforesis inversa\n(GlucoWatch)", "sin"), ("Sudor", "alta"),
                                        ("Lágrimas y saliva", "alta")]),
    ]
    xs = [0.15, 4.15, 8.15]
    for (titulo, items), x in zip(familias, xs):
        caja(ax, x, 6.2, 3.7, 0.95, titulo, NEGRO, NEGRO, size=14, peso="bold", color="white")
        for i, (nombre, nivel) in enumerate(items):
            fc, ec = colores[nivel]
            caja(ax, x, 5.15 - i * 1.0, 3.7, 0.82, nombre, fc, ec, size=13)
    # Leyenda de especificidad
    ax.text(0.15, 0.25, "Especificidad para la glucosa:", fontsize=13, va="center")
    for j, (nivel, etiqueta) in enumerate([("alta", "alta"), ("media", "media"), ("baja", "baja"), ("sin", "no evaluada")]):
        fc, ec = colores[nivel]
        x0 = [4.95, 6.35, 8.0, 9.35][j]
        ax.add_patch(Rectangle((x0, 0.1), 0.3, 0.3, fc=fc, ec=ec, lw=1.5))
        ax.text(x0 + 0.4, 0.25, etiqueta, fontsize=13, va="center")
    guardar(fig, "f01-mapa-tecnologias.png")


# Curva de sangre y difusion exactas del repo.
def curva_sangre(t):
    return 120 + 60 * np.exp(-((t - 90) / 30) ** 2) - 70 * np.exp(-((t - 300) / 45) ** 2)


def difundir(gs, tau, dt=1.0):
    a = np.exp(-dt / tau)
    g = np.empty_like(gs)
    g[0] = gs[0]
    for k in range(len(gs) - 1):
        g[k + 1] = a * g[k] + (1 - a) * gs[k] + (1 - (tau / dt) * (1 - a)) * (gs[k + 1] - gs[k])
    return g


# Figura 2. La idea de las dos profundidades.
def f02_dos_profundidades():
    fig = plt.figure(figsize=(8.4, 5.3))
    gs_ = fig.add_gridspec(1, 2, width_ratios=[1, 1.45], wspace=0.34, left=0.01, right=0.99, top=0.84, bottom=0.14)

    ax = fig.add_subplot(gs_[0])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 11)
    ax.axis("off")
    capas = [(9.2, 1.8, "#f3e1cf", "Epidermis"), (4.6, 4.6, "#f7d3c4", "Dermis"), (0.6, 4.0, "#f9e7b9", "Tejido profundo")]
    for y, h, c, nombre in capas:
        ax.add_patch(Rectangle((0.3, y), 9.4, h, fc=c, ec="#b9a38e", lw=1))
        ax.text(9.5, y + h - 0.25, nombre, va="top", ha="right", fontsize=13, color="#5a4a3a", style="italic")
    # capilar
    ax.add_patch(Rectangle((0.3, 1.0), 9.4, 1.9, fc="#e8a0a0", ec=ROJO, lw=1.5))
    ax.text(5.0, 1.95, "Capilar:\nglucosa en sangre", ha="center", va="center", fontsize=13, color="#7a1f1f")
    # profundidades
    for y, etiqueta, col in [(7.0, "Profundidad 1\nretraso corto (τ1)", AZUL), (4.9, "Profundidad 2\nretraso largo (τ2)", VERDE_AGUA)]:
        ax.plot([1.5, 8.5], [y, y], ls="--", color=col, lw=2.2)
        ax.text(5.0, y + 0.2, etiqueta, ha="center", va="bottom", fontsize=13, color=col, fontweight="bold")
    flecha(ax, 0.9, 3.0, 0.9, 6.8, color=ROJO, lw=2)
    ax.text(0.9, 5.0, "difusión", rotation=90, va="center", ha="center", fontsize=13, color=ROJO,
            bbox=dict(fc="#f7d3c4", ec="none", pad=1))
    ax.set_title("Un sensor,\ndos profundidades", pad=8)

    ax2 = fig.add_subplot(gs_[1])
    t = np.arange(480.0)
    gs = curva_sangre(t)
    g1 = difundir(gs, 6.0)
    g2 = difundir(gs, 15.0)
    ax2.plot(t, gs, color=NEGRO, lw=2.6, label="Sangre (nunca se mide)")
    ax2.plot(t, g1, color=AZUL, lw=2.4, label="Profundidad 1, τ1 = 6 min")
    ax2.plot(t, g2, color=VERDE_AGUA, lw=2.4, label="Profundidad 2, τ2 = 15 min")
    ax2.axhline(70, color=ROJO, ls=":", lw=1.8)
    ax2.text(5, 72, "umbral de\nhipoglucemia,\n70 mg/dL", color=ROJO, fontsize=13)
    ax2.set_xlabel("Tiempo (min)")
    ax2.set_ylabel("Glucosa (mg/dL)")
    ax2.set_xlim(0, 480)
    ax2.set_ylim(40, 215)
    ax2.legend(loc="upper right", frameon=False)
    ax2.set_title("Las dos lecturas llegan tarde,\ncada una con su retraso", pad=8)
    guardar(fig, "f02-dos-profundidades.png")


# Figura 3. Arquitectura propuesta del medidor (vision completa).
def f03_arquitectura():
    fig, ax = lienzo(8.4, 9.4, 8.4, 9.4)
    w = 3.8
    x1, x2 = 0.15, 4.45
    h = 1.0

    # resalte de lo que prueba el repo hoy
    ax.add_patch(FancyBboxPatch((x1 - 0.05, 4.7), w + 0.1, 2.7, boxstyle="round,pad=0.05,rounding_size=0.15",
                                fc="none", ec=AZUL, lw=2.4, ls="--"))
    ax.text(1.15, 7.8, "Lo que el repositorio\nprueba hoy,\nen simulación", ha="left", va="center", fontsize=13,
            color=AZUL, fontweight="bold")

    yA, yB, yC, yD = 8.25, 6.3, 4.85, 3.3
    caja(ax, x1, yA, w, h, "Sensor óptico\ninfrarrojo medio", AZUL_CLARO, AZUL, size=13)
    caja(ax, x1, yB, w, h, "Dos profundidades\n(+ filtro de latido,\nfuturo)", AZUL_CLARO, AZUL, size=13)
    caja(ax, x1, yC, w, h, "Estimar el retraso\ny reconstruir la\nsangre (Kalman)", AZUL_CLARO, AZUL, size=13)
    caja(ax, x1, yD, w, h, "Vía 1: glucosa\nestimada bajo\n70 mg/dL", AZUL_CLARO, AZUL, size=13)
    flecha(ax, 0.6, yA, 0.6, yB + h)
    flecha(ax, x1 + w / 2, yB, x1 + w / 2, yC + h)
    flecha(ax, x1 + w / 2, yC, x1 + w / 2, yD + h)

    caja(ax, x2, yA, w, h, "Audífono\nnocturno", VERDE_AGUA_CLARO, VERDE_AGUA, size=13)
    caja(ax, x2, yC, w, yB + h - yC, "EEG en el oído, pulso y\ntemperatura del tímpano:\ncómo reacciona el cerebro\na la falta de glucosa",
         VERDE_AGUA_CLARO, VERDE_AGUA, size=13)
    caja(ax, x2, yD, w, h, "Vía 2: señal\ncerebral de\nhipoglucemia", VERDE_AGUA_CLARO, VERDE_AGUA, size=13)
    flecha(ax, x2 + w / 2, yA, x2 + w / 2, yB + h)
    flecha(ax, x2 + w / 2, yC, x2 + w / 2, yD + h)

    # compuerta
    caja(ax, 3.1, 1.0, 2.2, 1.25, "Alarma\nsolo si ambas\ncoinciden", "white", ROJO, size=13, peso="bold", color=ROJO)
    flecha(ax, x1 + w / 2, yD, 3.6, 2.25)
    flecha(ax, x2 + w / 2, yD, 4.8, 2.25)
    ax.text(0.15, 0.35, "Cada vía es independiente. Exigir que coincidan ataca las falsas\nalarmas, la falla que hundió a GlucoWatch.",
            fontsize=13, color=GRIS, va="center")
    guardar(fig, "f03-arquitectura-medidor.png")


# Figura 4. Como fluye el codigo del repo.
def f04_flujo_codigo():
    fig, ax = lienzo(8.4, 5.4, 8.4, 5.4)
    pasos = [
        ("escenarios.yaml\numbrales.yaml", "qué se corre y\nqué cuenta\ncomo éxito", GRIS_CLARO, GRIS),
        ("model.py", "sangre sintética,\ndifusión\ny ruido", AZUL_CLARO, AZUL),
        ("estimator.py", "ruido σ y\nretrasos τ1, τ2", AZUL_CLARO, AZUL),
        ("reconstruct.py", "Kalman y\nlíneas base", AZUL_CLARO, AZUL),
        ("evaluation.py\nmetrics.py", "error, alarma\ny umbrales", AZUL_CLARO, AZUL),
        ("results/\nfigures/", "CSV, resumen,\nfigura y\nregistro", GRIS_CLARO, GRIS),
    ]
    w, h, gap = 2.3, 1.55, 0.55
    ys = [3.0, 0.6]
    cx = []
    for i, (archivo, que, fc, ec) in enumerate(pasos):
        fila, col = divmod(i, 3)
        x, y = 0.1 + col * (w + gap), ys[fila]
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.02", fc=fc, ec=ec, lw=1.8))
        ax.text(x + w / 2, y + h - 0.12, archivo, ha="center", va="top", fontsize=13, fontweight="bold", color=NEGRO)
        ax.text(x + w / 2, y + 0.1, que, ha="center", va="bottom", fontsize=13, color=NEGRO)
        if col < 2:
            flecha(ax, x + w, y + h / 2, x + w + gap, y + h / 2)
        if i == 2:
            xe, ye = x + w / 2, y
        if i == 3:
            xs, ysu = x + w / 2, y + h
    # recodo de la fila 1 a la fila 2
    ymid = (ye + ysu) / 2
    ax.plot([xe, xe, xs], [ye, ymid, ymid], color=GRIS, lw=2.0, solid_capstyle="butt")
    flecha(ax, xs, ymid, xs, ysu)
    ax.text(4.2, 5.05, "python run_all.py --seed 1  regenera todo, idéntico", ha="center", va="center", fontsize=13,
            family="DejaVu Sans Mono", color=NEGRO)
    guardar(fig, "f04-flujo-codigo.png")


# Datos de results/resumen.md
ESC = ["típico\nruido 2", "típico\nruido 5", "típico\nruido 8", "persona\nlenta", "persona\nrápida",
       "réplica\nlenta", "réplica\nrápida"]
T1_REAL = [6, 6, 6, 15, 3, 12, 3]
T1 = [(6.21, 1.10), (6.73, 3.00), (9.24, 7.00), (16.16, 3.85), (7.51, 9.01), (12.71, 2.69), (5.33, 4.13)]
T2_REAL = [15, 15, 15, 30, 6, 30, 8]
T2 = [(15.29, 1.32), (15.98, 3.48), (18.85, 7.67), (31.58, 4.79), (10.92, 9.33), (31.09, 3.58), (10.65, 4.35)]
VALIDAS = [40, 40, 37, 40, 24, 40, 33]


# Figura 6. Retrasos estimados frente a reales.
def f06_retrasos():
    fig, axes = plt.subplots(2, 1, figsize=(8.4, 6.6), sharey=False)
    x = np.arange(len(ESC))
    for ax, reales, est, titulo in [(axes[0], T1_REAL, T1, "Retraso corto, τ1"), (axes[1], T2_REAL, T2, "Retraso largo, τ2")]:
        medias = [m for m, _ in est]
        des = [d for _, d in est]
        colores = [ROJO if v < 40 else AZUL for v in VALIDAS]
        for i in range(len(x)):
            ax.errorbar(x[i], medias[i], yerr=des[i], fmt="o", color=colores[i], ms=8, capsize=5, lw=2)
        ax.scatter(x, reales, marker="_", s=600, color=NEGRO, lw=3, zorder=3)
        ax.set_xticks(x, ESC, fontsize=13)
        ax.set_ylabel("Minutos")
        ax.set_title(titulo)
        ax.grid(axis="y", alpha=0.3)
    axes[0].plot([], [], "_", color=NEGRO, ms=20, mew=3, label="valor real")
    axes[0].errorbar([], [], yerr=[], fmt="o", color=AZUL, label="estimado, media ± DE (40/40 válidas)")
    axes[0].errorbar([], [], yerr=[], fmt="o", color=ROJO, label="estimado, con corridas fallidas")
    axes[0].set_ylim(-3, 36)
    axes[0].legend(loc="upper left", frameon=False, fontsize=13)
    axes[1].set_ylim(-3, 48)
    fig.tight_layout(h_pad=1.5)
    guardar(fig, "f06-retrasos-estimados.png")


# Figura 7. Cuanto ruido tolera el metodo.
def f07_requisito_ruido():
    ruido = np.array([2, 5, 8])
    metodo = np.array([2.40, 4.60, 7.70])
    metodo_de = np.array([0.33, 1.16, 4.72])
    una = np.array([4.68, 5.31, 6.08])
    una_de = np.array([0.10, 0.24, 0.38])
    fig, ax = plt.subplots(figsize=(8.4, 6.0))
    ax.axvspan(2, 3, color=ROJO_CLARO, alpha=0.8)
    ax.text(2.5, 9.0, "lo que afirmaba\nla corrida\nexploratoria\n(no se reprodujo)", ha="center", va="bottom", fontsize=13, color=ROJO)
    ax.errorbar(ruido, una, yerr=una_de, fmt="s-", color=GRIS, lw=2.4, ms=8, capsize=5, label="Una profundidad suavizada (línea base)")
    ax.errorbar(ruido, metodo, yerr=metodo_de, fmt="o-", color=AZUL, lw=2.4, ms=8, capsize=5, label="Dos profundidades, τ estimado")
    ax.axvline(5.92, color=AZUL, ls="--", lw=1.8)
    ax.text(6.0, 14.3, "cruce ≈ 5,9 mg/dL", color=AZUL, fontsize=13, fontweight="bold")
    ax.axvline(4, color=AMBAR, ls=":", lw=2)
    ax.text(4.08, 10.8, "un montaje de infrarrojo\nmedio: 4 mg/dL\n(in vitro, 50 s)", color=AMBAR, fontsize=13)
    ax.set_xlabel("Ruido del sensor por lectura (mg/dL)")
    ax.set_ylabel("Error de la glucosa reconstruida\nRMSE (mg/dL), media ± DE")
    ax.set_xlim(1.5, 8.6)
    ax.set_ylim(0, 16)
    ax.set_xticks([2, 3, 4, 5, 6, 7, 8])
    ax.legend(loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=1, frameon=False, fontsize=13)
    ax.grid(alpha=0.3)
    guardar(fig, "f07-requisito-ruido.png")


# Figura 8. Hoja de ruta por fases.
def f08_hoja_ruta():
    fig, ax = lienzo(8.4, 7.4, 8.4, 7.4)
    fases = [
        ("Fase 0", "Construir", ["Generador sintético", "Estimador de ruido", "Estimador del retraso", "Filtro de Kalman", "Escenarios y run_all.py"], [1] * 5, 0.1, 7.3),
        ("Fase 1", "Informar", ["Tabla de resultados", "Figura en el README", "Conciliar la bitácora", "Informe de factibilidad"], [1, 1, 0, 0], 0.1, 3.9),
        ("Fase 2", "Romperlo a propósito", ["Retraso variable", "Ruido correlacionado", "Deriva del sensor", "Otra cinética", "Muestreo y duración", "Separación de capas", "Dominio de validez", "Modelos de fusión"], [0] * 8, 4.3, 7.3),
        ("Fase 3", "Condicional", ["Curvas de simglucose", "¿Versión con DOI?"], [0, 0], 4.3, 2.7),
    ]
    w = 4.0
    for fase, lema, items, hechos, x, ytop in fases:
        completa = all(hechos)
        fc = AZUL if completa else ("#5b8fc4" if any(hechos) else GRIS)
        caja(ax, x, ytop - 0.8, w, 0.8, f"{fase}\n{lema}", fc, fc, size=13, peso="bold", color="white")
        for j, (item, hecho) in enumerate(zip(items, hechos)):
            y = ytop - 1.2 - j * 0.42
            ax.add_patch(Rectangle((x + 0.1, y - 0.15), 0.3, 0.3, fc=AZUL if hecho else "white", ec=AZUL if hecho else GRIS, lw=1.6))
            if hecho:
                ax.text(x + 0.25, y, "✓", ha="center", va="center", color="white", fontsize=13, fontweight="bold")
            ax.text(x + 0.55, y, item, va="center", fontsize=13)
    ax.text(0.1, 0.5, "Cuadro azul: cerrado en GitHub (issues 1 a 8).\nCuadro blanco: abierto (issues 9 a 18).\nFase 3 no está prometida.",
            fontsize=13, color=GRIS, va="center")
    guardar(fig, "f08-hoja-de-ruta.png")


# Figura 9. Bucle de control de la glicemia y donde entra el medidor.
def f09_bucle_glicemia():
    fig, ax = lienzo(8.4, 6.9, 8.4, 6.9)
    w, h = 3.4, 1.2
    xl, xr = 0.9, 4.9
    yt, yb = 4.5, 2.3
    caja(ax, xl, yt, w, h, "Glicemia\n(variable regulada)", GRIS_CLARO, GRIS, size=13)
    caja(ax, xr, yt, w, h, "Sensor\ncélulas del páncreas", AZUL_CLARO, AZUL, size=13)
    caja(ax, xr, yb, w, h, "Controlador\npáncreas endocrino", AZUL_CLARO, AZUL, size=13)
    caja(ax, xl, yb, w, h, "Efectores\nhígado y células adiposas", AZUL_CLARO, AZUL, size=13)
    flecha(ax, xl + w, yt + h / 2, xr, yt + h / 2)
    flecha(ax, xr + w / 2, yt, xr + w / 2, yb + h)
    flecha(ax, xr, yb + h / 2, xl + w, yb + h / 2)
    # Retroalimentacion negativa: de Efectores de vuelta a Glicemia.
    xa = xl + 0.5
    flecha(ax, xa, yb + h, xa, yt)
    ax.text(xa + 0.2, (yb + h + yt) / 2, "retroalimentación negativa", ha="left", va="center", fontsize=13,
            color=GRIS, bbox=dict(fc="white", ec="none", pad=3))

    # Nota roja
    ax.text(4.35, 6.4, "En la diabetes este bucle falla", ha="center", va="center",
            fontsize=14, color=ROJO, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.35", fc=ROJO_CLARO, ec=ROJO, lw=1.6))

    # Ruta externa, en azul y punteada.
    y2, h2 = 0.35, 1.1
    yl = y2 + h2 / 2
    xi = 0.4
    ax.plot([xl, xi, xi], [yt + h / 2, yt + h / 2, yl], color=AZUL, lw=2.4, ls=":", solid_capstyle="butt")
    caja(ax, 2.9, y2, 2.6, h2, "Medidor no invasivo\n(sensor externo)", "white", AZUL, size=13, peso="bold", color=AZUL)
    caja(ax, 6.0, y2, 2.2, h2, "Alarma a\nla persona", "white", AZUL, size=13, peso="bold", color=AZUL)
    ax.plot([xi, 2.6], [yl, yl], color=AZUL, lw=2.4, ls=":", solid_capstyle="butt")
    flecha(ax, 2.6, yl, 2.9, yl, color=AZUL, lw=2.4)
    flecha(ax, 5.5, yl, 6.0, yl, color=AZUL, lw=2.4)
    ax.text(1.6, yl + 0.15, "retraso del líquido\nintersticial", ha="center", va="bottom", fontsize=13, color=AZUL)
    ax.text(xi + 0.12, 3.0, "ruta externa", ha="left", va="center", fontsize=13, color=AZUL, style="italic", rotation=90)
    guardar(fig, "f09-bucle-glicemia.png")


# ---------------------------------------------------------------------------
# Figuras del analisis dry lab (usan 3-analisis-de-viabilidad/resultados-calculos.json)
# ---------------------------------------------------------------------------
def cargar_calculos():
    return json.loads(CALCULOS.read_text(encoding="utf-8"))


# Figura 10. Capas de la piel y profundidad que muestrea cada tecnologia.
def f10_profundidades():
    fig, ax = plt.subplots(figsize=(8.4, 6.9))
    fig.subplots_adjust(left=0.265, right=0.985, top=0.99, bottom=0.14)
    ax.set_xscale("log")
    ax.set_xlim(3, 2e5)
    filas = [
        ("Estrato córneo", 3, 18.3, "#f3e1cf", "#b9a38e"),
        ("Epidermis viable", 18.3, 74.9, "#f7d3c4", "#b9a38e"),
        ("Dermis", 74.9, 4000, "#f9e7b9", "#b9a38e"),
    ]
    techs = [
        ("Infrarrojo medio", 3, 45, AZUL, "penetración de unos 45 µm,\nsiempre bajo 100 µm"),
        ("DIROS (en ratones)", 40, 150, VERDE_AGUA, "ventana de 40 a 150 µm,\nmejor a 97,5 µm"),
        ("mμSORS (Raman)", 100, 150, AZUL, "desplazamientos de\n100 y 150 µm"),
        ("Raman de\nprofundidad crítica", 250, 300, AZUL, "250 a 300 µm"),
        ("Radiofrecuencia", 3800, 41500, AMBAR, "de 3,8 mm (10 GHz)\na 41,5 mm (835 MHz)"),
    ]
    n_capas = len(filas)
    n_total = n_capas + len(techs) + 1
    ys = list(range(n_total))[::-1]
    etiquetas = []
    for i, (nombre, a, b, fc, ec) in enumerate(filas):
        y = ys[i]
        ax.barh(y, b - a, left=a, height=0.62, color=fc, edgecolor=ec, lw=1.4)
        etiquetas.append((y, nombre))
    ax.text(18.3 * 0.92, ys[0], "18,3 µm", ha="right", va="center", fontsize=13, color=NEGRO)
    ax.text(np.sqrt(18.3 * 74.9), ys[1], "56,6 µm", ha="center", va="center", fontsize=13, color=NEGRO)
    ax.text(100, ys[2], "desde 74,9 µm,\nespesor sin dato", ha="left", va="center", fontsize=13, color=NEGRO)
    for i, (nombre, a, b, col, texto) in enumerate(techs):
        y = ys[n_capas + i]
        ax.barh(y, b - a, left=a, height=0.62, color=col, edgecolor=col, lw=1.2, alpha=0.9)
        etiquetas.append((y, nombre))
        if nombre == "Radiofrecuencia":
            ax.text(a / 1.25, y, texto, ha="right", va="center", fontsize=13, color=NEGRO)
        else:
            ax.text((100 if nombre == "Infrarrojo medio" else b) * 1.25, y, texto, ha="left", va="center", fontsize=13, color=NEGRO)
    y_ir = ys[n_capas]
    ax.barh(y_ir, 100 - 45, left=45, height=0.62, color=AZUL_CLARO, edgecolor=AZUL, lw=1.2, hatch="//")
    y_d = ys[n_capas + 1]
    ax.plot([97.5, 97.5], [y_d - 0.31, y_d + 0.31], color="white", lw=3)
    y_c = ys[-1]
    etiquetas.append((y_c, "CGM subcutáneo"))
    ax.annotate("", xy=(1.6e5, y_c), xytext=(2000, y_c), arrowprops=dict(arrowstyle="-|>", color=GRIS, lw=3))
    ax.text(1.6e5, y_c - 0.42, "más hondo que el sensor dérmico\nde 1,8 a 2,0 mm", ha="right", va="top", fontsize=13, color=NEGRO)
    ax.axvline(74.9, color=ROJO, ls=":", lw=1.8)
    ax.text(74.9 * 1.08, ys[0] + 0.55, "unión epidermis-dermis,\n74,9 µm", color=ROJO, fontsize=13, ha="left", va="bottom")
    ax.set_yticks([y for y, _ in etiquetas], [n for _, n in etiquetas])
    ax.set_ylim(-1.5, ys[0] + 1.6)
    ax.set_xlabel("Profundidad desde la superficie de la piel\n(µm, eje logarítmico, antebrazo)")
    ax.grid(axis="x", alpha=0.3)
    ax.tick_params(axis="y", length=0)
    ax.spines["left"].set_visible(False)
    guardar(fig, "f10-profundidades.png")


# Figura 11. Mejor evidencia por tecnologia: MARD frente al numero de participantes.
def f11_evidencia():
    # (n, MARD, familia, es_empresa, texto de la clave). Algunos n se corrieron un poco en x para que no se tapen.
    pts = [
        (230, 14.6, "raman", False, "mμSORS, 230 personas, 14,6 %"),
        (18.5, 14.5, "raman", True, "Raman Liom, 20 personas (5 en validación), 14,5 %"),
        (35, 25.8, "raman", True, "Raman RSP en casa, 35 personas, 25,8 %"),
        (50, 12.8, "raman", True, "Raman RSP con calibración de 4 h, 50 personas, 12,8 %"),
        (35, 20.2, "ir", True, "IR medio DiaMonTech, 36 personas, 19,6 y 20,7 %"),
        (105, 20.3, "ir", True, "NIR Glucube, 105 personas, 20,3 %"),
        (48, 16.3, "ir", False, "NIR 2026, 48 personas, 16,3 %"),
        (35, 14.4, "otra", True, "Cnoga TensorTip, 36 personas, 14,4 %"),
        (172, 22.3, "multi", True, "GlucoTrack, tres técnicas, 172 personas, 22,3 %"),
        (10, 27.3, "multi", True, "Solianis, visita 2, 10 personas, 27,3 %"),
        (20, 35.4, "multi", True, "Biovotion en casa, 20 personas, 35,4 %"),
        (29, 28.0, "rf", True, "Afon, etapa 2, 29 personas, 28 %"),
        (20, 10.3, "rf", True, "Afon con IA, 20 personas, 10,3 % (partición al azar)"),
        (6, 38.0, "imp", False, "Pendra, 6 personas, 52 % (fuera de escala)"),
        (75, 11.9, "ion", True, "SugarBEAT, 75 personas, 11,9 %"),
        (23, 14.8, "ion", False, "Iontoforesis con calibración por pH, 21 personas, 14,8 %"),
    ]
    colores = {"raman": AZUL, "ir": VERDE_AGUA, "multi": AMBAR, "rf": "#8e44ad", "imp": GRIS, "ion": "#5d6d7e", "otra": "#2c3e50"}
    nombres = {"raman": "Raman", "ir": "Infrarrojo medio y cercano", "multi": "Varias técnicas juntas",
               "rf": "Radiofrecuencia", "imp": "Bioimpedancia", "ion": "Iontoforesis inversa", "otra": "Óptico de dedo con calibración"}
    alto_graf, paso = 3.5, 0.21
    n_clave = 9 + len(pts)  # 4 filas de familias, 2 de forma, 3 de lineas y las 16 entradas, con un hueco
    alto_clave = (n_clave + 1) * paso + 0.15
    fig = plt.figure(figsize=(8.4, alto_graf + alto_clave + 0.9))
    H = fig.get_figheight()
    ax = fig.add_axes([0.105, (alto_clave + 0.75) / H, 0.89, alto_graf / H])
    ax.set_xscale("log")
    ax.set_xlim(4, 450)
    ax.set_ylim(0, 42)
    ax.set_xticks([5, 10, 20, 50, 100, 200], ["5", "10", "20", "50", "100", "200"])
    ax.minorticks_off()
    ax.axhline(15, color=ROJO, ls="--", lw=2)
    ax.axhspan(11.6, 12.0, color=AMBAR_CLARO, alpha=1.0, zorder=0)
    ax.axhline(8, color=GRIS, ls=":", lw=2)
    for k, (n, m, fam, emp, et) in enumerate(pts, start=1):
        ax.scatter([n], [m], s=520, marker="D" if emp else "o", color=colores[fam], edgecolor="white", lw=1.2, zorder=3)
        ax.text(n, m, str(k), ha="center", va="center", fontsize=13, color="white", fontweight="bold", zorder=4)
    ax.annotate("", xy=(6, 41.6), xytext=(6, 39.9), arrowprops=dict(arrowstyle="-|>", color=GRIS, lw=2))
    ax.set_xlabel("Participantes del estudio (eje logarítmico)")
    ax.set_ylabel("MARD (%), mejor evidencia publicada")
    ax.grid(alpha=0.25)
    axk = fig.add_axes([0.0, 0.0, 1.0, alto_clave / H])
    axk.axis("off")
    axk.set_xlim(0, 1)
    axk.set_ylim(0, n_clave + 1)
    top = n_clave + 0.4
    for j, k in enumerate(("raman", "ir", "multi", "rf", "imp", "ion", "otra")):
        yy = top - (j % 4)
        xx = 0.02 if j < 4 else 0.52
        axk.scatter([xx + 0.015], [yy], s=170, marker="s", color=colores[k])
        axk.text(xx + 0.045, yy, nombres[k], fontsize=13, va="center")
    axk.scatter([0.035], [top - 4], s=170, marker="o", color=GRIS)
    axk.text(0.065, top - 4, "Círculo: sin vínculo declarado con la empresa", fontsize=13, va="center")
    axk.scatter([0.035], [top - 5], s=170, marker="D", color=GRIS)
    axk.text(0.065, top - 5, "Rombo: dato de la empresa o de autores de la empresa", fontsize=13, va="center")
    for j, (color, estilo, grosor, texto) in enumerate([(ROJO, "--", 2, "regla 1: 15 %"),
                                                       (AMBAR_CLARO, "-", 5, "CGM independiente: 11,6 a 12 %"),
                                                       (GRIS, ":", 2.4, "CGM, empresas: unos 8 %")]):
        yy = top - 6 - j
        axk.plot([0.0, 0.05], [yy, yy], color=color, ls=estilo, lw=grosor, solid_capstyle="butt")
        axk.text(0.065, yy, texto, fontsize=13, va="center", color=AMBAR if color == AMBAR_CLARO else color)
    for i, (n, m, fam, emp, et) in enumerate(pts):
        y = top - 9.4 - i
        axk.text(0.02, y, f"{i + 1}", fontsize=13, va="center", fontweight="bold")
        axk.text(0.075, y, et, fontsize=13, va="center")
    guardar(fig, "f11-evidencia.png")


# Figura 12. Fusion de sensores iguales con errores correlacionados.
def f12_fusion():
    c = cargar_calculos()["b_fusion"]
    rho_est = c["rho_estimado"]["todos_los_dias"]
    rho_ysi = c["rho_estimado"]["contra_YSI_dias_4_y_7"]
    N = np.linspace(1, 10, 200)
    fig, ax = plt.subplots(figsize=(8.4, 5.6))
    cols = {0.0: AZUL, 0.3: VERDE_AGUA, 0.5: AMBAR, 0.7: ROJO}
    for rho, col in cols.items():
        y = np.sqrt((1 + (N - 1) * rho) / N)
        ax.plot(N, y, color=col, lw=2.8, label=f"ρ = {str(rho).replace('.', ',')}")
        if rho > 0:
            ax.hlines(np.sqrt(rho), 1, 10, color=col, ls=":", lw=1.6)
            ax.text(10.15, np.sqrt(rho), f"√ρ = {np.sqrt(rho):.2f}".replace(".", ","), color=col, fontsize=13, va="center")
    ax.text(10.15, 0.06, "→ 0", color=AZUL, fontsize=13, va="center")
    for rho_p, etiqueta, ytxt, col in [
        (rho_ysi, f"ρ estimado contra YSI\n(días 4 y 7): {rho_ysi:.2f}".replace(".", ","), 1.42, ROJO),
        (rho_est, f"ρ estimado con dos electrodos\ndel mismo sensor: {rho_est:.2f}".replace(".", ","), 1.18, NEGRO),
    ]:
        r = np.sqrt((1 + rho_p) / 2)
        ax.scatter([2], [r], s=170, color=col, zorder=5, edgecolor="white", lw=1.4)
        ax.annotate(etiqueta, (2, r), xytext=(2.6, ytxt), fontsize=13, color=col, va="center",
                    arrowprops=dict(arrowstyle="-", color=col, lw=1.4, relpos=(0.0, 0.5)))
    ax.set_xlim(1, 11.8)
    ax.set_ylim(0, 1.58)
    ax.set_xlabel("Número de sensores iguales, N")
    ax.set_ylabel("Ruido fusionado / ruido de un sensor")
    ax.set_xticks(range(1, 11))
    ax.legend(loc="lower left", frameon=False, fontsize=13, bbox_to_anchor=(0.02, 0.02))
    ax.grid(alpha=0.3)
    guardar(fig, "f12-fusion.png")


# Figura 13. Sensibilidad frente a valor predictivo positivo de la alarma nocturna.
def f13_alarmas():
    d = cargar_calculos()["d_alarmas"]
    C = d["canales"]
    V = d["versiones"]

    def buscar(version, nombre):
        for x in V[version]:
            if x["nombre"] == nombre:
                return x
        raise KeyError(nombre)

    oido, subc = "con EEG en el oido", "con EEG subcutaneo"
    O13 = "Via optica sigma 13 (error lento)"
    puntos = [
        (1, "GlucoWatch G2, a tasa base real", C["GlucoWatch G2"], "c"),
        (2, "Dexcom G7, optimista", C["Dexcom G7"], "c"),
        (3, "Dexcom G7, pesimista", C["Dexcom G7 (pesimista)"], "c"),
        (4, "EEG subcutáneo (ya no es no invasivo)", C["EEG subcutaneo"], "c"),
        (5, "Reloj inteligente", C["Reloj inteligente"], "c"),
        (6, "EEG en el oído, hipotético", C["EEG en el oido (hipotetico)"], "c"),
        (7, "Vía óptica σ 13, ruido blanco", C["Via optica sigma 13"], "c"),
        (8, "Vía óptica σ 13, error lento", C[O13], "c"),
        (9, "Vía óptica σ 18, error lento", C["Via optica sigma 18 (error lento)"], "c"),
        (10, "Óptica σ 13 lento Y EEG oído, independientes", buscar(oido, f"{O13} Y EEG en el oido (hipotetico)"), "k"),
        (11, "Lo mismo con dependencia 0,3", buscar(oido, f"{O13} Y EEG en el oido (hipotetico) (dependencia 0,3)"), "k"),
        (12, "Óptica σ 13 lento O EEG oído", buscar(oido, f"{O13} O EEG en el oido (hipotetico)"), "k"),
        (13, "2 de 3: óptica, EEG oído, reloj, independientes", buscar(oido, f"2 de 3: {O13}, EEG en el oido (hipotetico), Reloj inteligente"), "k"),
        (14, "Lo mismo con dependencia 0,3", buscar(oido, f"2 de 3: {O13}, EEG en el oido (hipotetico), Reloj inteligente (dependencia 0,3)"), "k"),
        (15, "G7 Y EEG subcutáneo, dependencia 0,3", buscar(subc, "Dexcom G7 Y EEG subcutaneo (dependencia 0,3)"), "k"),
        (16, "2 de 3: G7, EEG subcutáneo, reloj, dependencia 0,3", buscar(subc, "2 de 3: Dexcom G7, EEG subcutaneo, Reloj inteligente (dependencia 0,3)"), "k"),
        (17, "EEG oído Y reloj, dependencia 0,3", buscar(oido, "EEG en el oido (hipotetico) Y Reloj inteligente (dependencia 0,3)"), "k"),
    ]
    alto_graf, paso = 4.0, 0.225
    n_clave = 3 + len(puntos) + 1
    alto_clave = (n_clave + 1) * paso + 0.15
    fig = plt.figure(figsize=(8.4, alto_graf + alto_clave + 0.9))
    H = fig.get_figheight()
    ax = fig.add_axes([0.125, (alto_clave + 0.75) / H, 0.865, alto_graf / H])
    ax.add_patch(Rectangle((0.85, 0.70), 0.2, 0.6, fc=AZUL_CLARO, ec=AZUL, lw=1.6, alpha=0.8, zorder=0))
    ax.text(0.857, 1.285, "zona de la regla 0 y de R-B:\nsensibilidad de 85 % o más\ny VPP de 70 % o más", color=AZUL, fontsize=13, va="top", fontweight="bold")
    for k, nombre, x, tipo in puntos:
        se, vp = x["se"], x["vpp"]
        dentro = se >= 0.85 and vp >= 0.70
        col = AZUL if dentro else ROJO
        ax.scatter([min(se, 1.0)], [min(vp, 1.0)], s=470, color=col if tipo == "c" else "white", edgecolor=col, lw=2.2, zorder=3, marker="o")
        ax.text(min(se, 1.0), min(vp, 1.0), str(k), ha="center", va="center", fontsize=13,
                color="white" if tipo == "c" else col, fontweight="bold", zorder=4)
    ax.scatter([0.77], [0.38], s=470, facecolor="none", edgecolor=ROJO, lw=2.2, ls="--", zorder=3)
    ax.text(0.77, 0.38, "1'", ha="center", va="center", fontsize=13, color=ROJO, fontweight="bold", zorder=4)
    ax.set_xlim(0.66, 1.03)
    ax.set_ylim(-0.02, 1.3)
    ax.set_xlabel("Sensibilidad por evento nocturno")
    ax.set_ylabel("Valor predictivo positivo\n(con 0,54 eventos por semana)")
    ax.grid(alpha=0.3)
    axk = fig.add_axes([0.0, 0.0, 1.0, alto_clave / H])
    axk.axis("off")
    axk.set_xlim(0, 1)
    axk.set_ylim(0, n_clave + 1)
    top = n_clave + 0.4
    axk.text(0.02, top - 0.5, "Círculo lleno: una vía sola. Círculo vacío: combinación.\nAzul: dentro de la zona. Rojo: fuera.", fontsize=13, va="center", color=NEGRO)
    axk.text(0.02, top - 2.0, "1'  GlucoWatch G2 con el VPP del estudio (38 %)", fontsize=13, va="center", color=ROJO)
    for i, (k, nombre, x, tipo) in enumerate(puntos):
        y = top - 3.2 - i
        axk.text(0.02, y, f"{k}", fontsize=13, va="center", fontweight="bold")
        axk.text(0.085, y, f"{nombre}", fontsize=13, va="center")
    guardar(fig, "f13-alarmas.png")


# Figura 14. Mapa de las ocho ideas: evidencia en personas frente a lo que hemos desarrollado.
def f14_mapa_propuestas():
    fig = plt.figure(figsize=(8.4, 7.4))
    ax = fig.add_axes([0.2, 0.30, 0.79, 0.67])
    ax.set_xlim(0, 4)
    ax.set_ylim(0, 3)
    for i in range(4):
        for j in range(3):
            fc = "#f7f7f7" if (i + j) % 2 == 0 else "white"
            ax.add_patch(Rectangle((i, j), 1, 1, fc=fc, ec="#c9c9c9", lw=1.2))
    ax.set_xticks([0.5, 1.5, 2.5, 3.5], ["Ninguna", "Indirecta", "Estudios\npequeños", "Estudios de 20\npersonas o más"])
    ax.set_yticks([0.5, 1.5, 2.5], ["Solo idea", "Analizada\nen el\ndry lab", "Simulada\nen el\nrepositorio"])
    ax.tick_params(length=0, labelsize=13)
    for sp in ax.spines.values():
        sp.set_visible(False)
    ax.set_xlabel("Evidencia en personas", fontsize=14, labelpad=8)
    ax.set_ylabel("Qué hemos desarrollado", fontsize=14, labelpad=8)
    # (n, columna, fila, estilo, nombre)
    ideas = [
        (1, 1, 1, "gris", "Infrarrojo\nmedio con\ndoble filtro"),
        (2, 0, 2, "rojo", "Tomografía\ndel retraso"),
        (3, 1, 2, "azul", "Asimilación\nde datos"),
        (4, 2, 1, "rojo", "Audífono\nnocturno"),
        (5, 2, 0, "gris", "Peine de\nfrecuencias"),
        (6, 0, 0, "gris", "Quiralidad"),
        (7, 1, 0, "gris", "Aquafotómica"),
        (8, 3, 1, "punteado", "Alarma anclada\nen un CGM"),
    ]
    estilos = {"rojo": (ROJO, ROJO, "-", "white"), "gris": (GRIS, GRIS, "-", "white"),
               "azul": (AZUL, AZUL, "-", "white"), "punteado": (AZUL_CLARO, AZUL, "--", AZUL)}
    for n, c, r, est, nombre in ideas:
        fc, ec, ls, tc = estilos[est]
        ax.scatter([c + 0.5], [r + 0.74], s=1100, facecolor=fc, edgecolor=ec, linewidths=3.0, linestyles=ls, zorder=3)
        ax.text(c + 0.5, r + 0.74, str(n), ha="center", va="center", fontsize=15, color=tc, fontweight="bold", zorder=4)
        ax.text(c + 0.5, r + 0.28, nombre, ha="center", va="center", fontsize=13, color=NEGRO, zorder=4)
    # Leyenda
    axl = fig.add_axes([0.02, 0.01, 0.97, 0.19])
    axl.set_xlim(0, 8.4)
    axl.set_ylim(0, 5)
    axl.axis("off")
    entradas = [
        (0.15, 4.5, "rojo", "Rojo: el dry lab la dejó no viable como está (2 y 4)"),
        (0.15, 3.5, "gris", "Gris: no analizada a fondo (1, 5, 6 y 7)"),
        (0.15, 2.5, "azul", "Azul: herramienta útil (3)"),
        (0.15, 1.5, "punteado", "Azul con borde punteado: Propuesta (8)"),
    ]
    for x, y, est, texto in entradas:
        fc, ec, ls, tc = estilos[est]
        axl.scatter([x + 0.15], [y], s=330, facecolor=fc, edgecolor=ec, linewidths=2.4, linestyles=ls)
        axl.text(x + 0.45, y, texto, ha="left", va="center", fontsize=13)
    axl.text(0.15, 0.5, "Ubicación aproximada según el análisis dry lab.", ha="left", va="center", fontsize=13, color=GRIS, style="italic")
    guardar(fig, "f14-mapa-propuestas.png")


if __name__ == "__main__":
    f01_mapa_tecnologias()
    f02_dos_profundidades()
    f03_arquitectura()
    f04_flujo_codigo()
    f06_retrasos()
    f07_requisito_ruido()
    f08_hoja_ruta()
    f09_bucle_glicemia()
    f10_profundidades()
    f11_evidencia()
    f12_fusion()
    f13_alarmas()
    f14_mapa_propuestas()
    # La f05 no se dibuja aqui: es la figura que genera la simulacion.
    import shutil
    shutil.copyfile(Path(__file__).resolve().parent.parent.parent / "2-simulacion" / "figures" / "delay-recovery.png", OUT / "f05-registro-representativo.png")
    print("listo:", sorted(p.name for p in OUT.glob("*.png")))
