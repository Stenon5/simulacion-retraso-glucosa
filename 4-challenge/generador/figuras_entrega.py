"""Figuras del anexo de la Entrega del problema (2 paginas).
Estilo y paleta propios. Ancho 6,9 in a 300 dpi = 2070 px,
sin bbox_inches tight, para que un pt de matplotlib sea un pt impreso.
Correr con (desde cualquier carpeta): py -3.11 figuras_entrega.py [alto_fig1] [alto_fig2]
"""
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

OUT = Path(__file__).resolve().parent.parent / "figuras"  # 4-challenge/figuras/

AZUL = "#1f6fb2"
AZUL_CLARO = "#d6e6f5"
GRIS = "#6e6e6e"
GRIS_CLARO = "#eeeeee"
ROJO = "#c0392b"
VERDE_AGUA = "#1a8a7a"
VERDE_AGUA_CLARO = "#d4efe9"
NEGRO = "#1b1b1b"
AZUL_OSC = "#1F4E79"

W = 6.9
# Por defecto, los altos de la version entregada (2,0 y 2,4 in), con los que el docx cabe en 2 paginas.
H1 = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0
H2 = float(sys.argv[2]) if len(sys.argv) > 2 else 2.4

plt.rcParams.update({
    "font.family": "Arial",
    "font.size": 9,
    "axes.titlesize": 10,
    "axes.labelsize": 9,
    "legend.fontsize": 9,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "mathtext.fontset": "custom",
    "mathtext.rm": "Arial",
    "mathtext.it": "Arial:italic",
    "mathtext.bf": "Arial:bold",
})

AVISOS = []


def guardar(fig, nombre):
    fig.savefig(OUT / nombre, dpi=300, facecolor="white")
    plt.close(fig)


def curva_sangre(t):
    return 120 + 60 * np.exp(-((t - 90) / 30) ** 2) - 70 * np.exp(-((t - 300) / 45) ** 2)


def difundir(gs, tau, dt=1.0):
    a = np.exp(-dt / tau)
    g = np.empty_like(gs)
    g[0] = gs[0]
    for k in range(len(gs) - 1):
        g[k + 1] = a * g[k] + (1 - a) * gs[k] + (1 - (tau / dt) * (1 - a)) * (gs[k + 1] - gs[k])
    return g


def cruce_bajando(t, g, umbral):
    for k in range(len(g) - 1):
        if g[k] >= umbral > g[k + 1]:
            return t[k] + (g[k] - umbral) / (g[k] - g[k + 1]) * (t[k + 1] - t[k])
    raise ValueError("sin cruce")


def caja(ax, x, y, w, h, lineas, fondo, borde, lw=1.5, negrita_primera=True):
    """Caja con texto de varias lineas. lineas es una lista de strings. Devuelve (parche, textos)."""
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.04", fc=fondo, ec=borde, lw=lw)
    ax.add_patch(p)
    n = len(lineas)
    paso = min(0.155, (h - 0.12) / n) if n > 1 else 0.155
    y0 = y + h / 2 + (n - 1) * paso / 2
    textos = []
    for i, ln in enumerate(lineas):
        neg = negrita_primera and i == 0
        tx = ax.text(x + w / 2, y0 - i * paso, ln, ha="center", va="center",
                     fontsize=9.5 if neg else 9, fontweight="bold" if neg else "normal", color=NEGRO)
        textos.append(tx)
    return p, textos


def flecha(ax, x0, y0, x1, y1, color=GRIS, lw=1.5, estilo="-|>", ms=9):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle=estilo, mutation_scale=ms,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def verificar_dentro(fig, pares, nombre):
    """Comprueba que el texto de cada caja quede dentro de ella."""
    fig.canvas.draw()
    r = fig.canvas.get_renderer()
    for parche, textos in pares:
        bb = parche.get_window_extent(r)
        for tx in textos:
            tb = tx.get_window_extent(r)
            if tb.x0 < bb.x0 + 2 or tb.x1 > bb.x1 - 2 or tb.y0 < bb.y0 or tb.y1 > bb.y1:
                AVISOS.append(f"{nombre}: '{tx.get_text()}' se sale de su caja ({tb.width/300*72:.0f} pt vs {bb.width/300*72:.0f} pt)")


# ---------------------------------------------------------------- Figura 1
def fig1():
    fig = plt.figure(figsize=(W, H1))
    # Panel izquierdo: coordenadas en pulgadas
    axl = fig.add_axes([0.0, 0.0, 3.3 / W, 1.0])
    axl.set_xlim(0, 3.3)
    axl.set_ylim(0, H1)
    axl.axis("off")
    axl.text(0.02, H1 - 0.05, "Modelo: el medidor ve las capas, no la sangre", fontsize=10, fontweight="bold",
             ha="left", va="top", color=NEGRO)

    yc = H1 - 1.0  # centro vertical del diagrama
    pares = []
    # Sangre
    ps, ts = caja(axl, 0.04, yc - 0.31, 0.72, 0.62, ["Sangre", "$G_s$"], GRIS_CLARO, GRIS)
    pares.append((ps, ts))
    axl.text(0.40, yc - 0.37, "no se mide", fontsize=9, style="italic", color=GRIS, ha="center", va="top")
    # Capas
    y1, y2 = yc + 0.36, yc - 0.40
    p1, t1 = caja(axl, 1.52, y1 - 0.25, 0.68, 0.50, ["Capa 1", "$G_1$"], AZUL_CLARO, AZUL)
    p2, t2 = caja(axl, 1.52, y2 - 0.25, 0.68, 0.50, ["Capa 2", "$G_2$"], VERDE_AGUA_CLARO, VERDE_AGUA)
    pares += [(p1, t1), (p2, t2)]
    flecha(axl, 0.76, yc + 0.14, 1.52, y1 - 0.02, color=AZUL, lw=1.6)
    flecha(axl, 0.76, yc - 0.14, 1.52, y2 + 0.02, color=VERDE_AGUA, lw=1.6)
    axl.text(1.14, yc + 0.32, "difusión,\n$\\tau_1$ corto", fontsize=9, color=AZUL, ha="center", va="bottom",
             linespacing=1.1)
    axl.text(1.14, yc - 0.32, "difusión,\n$\\tau_2$ largo", fontsize=9, color=VERDE_AGUA, ha="center", va="top",
             linespacing=1.1)
    # Lecturas
    q1, u1 = caja(axl, 2.50, y1 - 0.25, 0.78, 0.50, ["Lectura $y_1$", "$G_1$ + ruido"], "white", AZUL)
    q2, u2 = caja(axl, 2.50, y2 - 0.25, 0.78, 0.50, ["Lectura $y_2$", "$G_2$ + ruido"], "white", VERDE_AGUA)
    pares += [(q1, u1), (q2, u2)]
    flecha(axl, 2.20, y1, 2.50, y1, color=GRIS, lw=1.5)
    flecha(axl, 2.20, y2, 2.50, y2, color=GRIS, lw=1.5)
    axl.text(1.66, 0.13, "Cada capa: $dG_i/dt = (G_s - G_i)/\\tau_i$", fontsize=9, color=NEGRO, ha="center", va="center")
    verificar_dentro(fig, pares, "fig1")

    # Panel derecho
    ax = fig.add_axes([3.98 / W, 0.40 / H1, (W - 3.98 - 0.20) / W, (H1 - 0.40 - 0.30) / H1])
    t = np.arange(0.0, 481.0, 1.0)
    gs = curva_sangre(t)
    g1 = difundir(gs, 6.0)
    g2 = difundir(gs, 15.0)
    ax.plot(t, gs, color=NEGRO, lw=2.2, label="Sangre (no se mide)")
    ax.plot(t, g1, color=AZUL, lw=2.0, label="Capa 1, $\\tau_1$ = 6 min")
    ax.plot(t, g2, color=VERDE_AGUA, lw=2.0, label="Capa 2, $\\tau_2$ = 15 min")
    ax.axhline(70, color=ROJO, ls=":", lw=1.6)
    x0, x1 = 220, 380
    ax.set_xlim(x0, x1)
    ax.set_ylim(36, 142)
    ax.set_xticks([220, 260, 300, 340, 380])
    ax.set_yticks([40, 70, 100, 130])
    ax.text(x1 - 1, 71.5, "70 mg/dL", color=ROJO, fontsize=9, ha="right", va="bottom")
    ts_, tc2 = cruce_bajando(t, gs, 70.0), cruce_bajando(t, g2, 70.0)
    n = int(round(tc2 - ts_))
    ax.plot([ts_, tc2], [70, 70], "o", color=NEGRO, ms=3.2, zorder=5, clip_on=False)
    ax.plot([tc2], [70], "o", color=VERDE_AGUA, ms=3.2, zorder=6)
    ya = 61
    for tx in (ts_, tc2):
        ax.plot([tx, tx], [70, ya], color=GRIS, lw=0.7, ls="-")
    ax.add_patch(FancyArrowPatch((ts_, ya), (tc2, ya), arrowstyle="<|-|>", mutation_scale=7, color=VERDE_AGUA,
                                 lw=1.3, shrinkA=0, shrinkB=0))
    ax.text(ts_ + 1.5, 50.5, f"la capa 2 cruza\n{n} min después", color=VERDE_AGUA, fontsize=9, ha="right", va="center",
            linespacing=1.1)
    ax.set_xlabel("Tiempo (min)", labelpad=1)
    ax.set_ylabel("Glucosa (mg/dL)", labelpad=2)
    ax.legend(loc="upper center", frameon=False, handlelength=1.6, borderaxespad=0.1, labelspacing=0.25,
              bbox_to_anchor=(0.5, 1.03))
    ax.tick_params(length=3, pad=2)
    fig.text(3.5 / W, 1 - 0.05 / H1, "Una hipoglucemia vista por cada capa", fontsize=10, fontweight="bold",
             ha="left", va="top", color=NEGRO)
    print("fig1: cruce sangre", round(ts_, 1), "capa 2", round(tc2, 1), "N =", n)
    guardar(fig, "fig1-modelo.png")


# ---------------------------------------------------------------- Figura 2
def fig2():
    fig = plt.figure(figsize=(W, H2))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(0, H2)
    ax.set_aspect("equal")
    ax.axis("off")

    gap_v = 0.15
    bw = 1.2
    bh = min(0.62, (H2 - 0.05 - 0.23 - 2 * gap_v) / 3)
    x_ini = 0.05
    gap = (W - 2 * x_ini - 5 * bw) / 4
    xs = [x_ini + i * (bw + gap) for i in range(5)]
    yr3 = 0.05
    yr2 = yr3 + bh + gap_v
    yr1 = yr2 + bh + gap_v
    pares = []

    def c(i):
        return xs[i]

    # fila 1
    b1 = caja(ax, c(0), yr1, bw, bh, ["Lecturas", "$y_1$ y $y_2$,", "una por minuto"], "white", GRIS)
    b2 = caja(ax, c(1), yr1, bw, bh, ["1. Ruido", "σ² ≈ Var(Δ²$y$)/6"], AZUL_CLARO, AZUL)
    b3 = caja(ax, c(2), yr1, bw, bh, ["2. Retrasos", "$\\tau_1$ y $\\tau_2$ sin", "medir la sangre"], AZUL_CLARO, AZUL)
    b4 = caja(ax, c(3), yr1, bw, bh, ["3. Kalman", "reconstruye", "la sangre"], AZUL_CLARO, AZUL)
    b5 = caja(ax, c(4), yr1, bw, bh, ["Vía 1", "sangre estimada", "bajo 70 mg/dL"], "white", AZUL)
    # fila 2
    c1 = caja(ax, c(0), yr2, bw, bh, ["Otra señal", "EEG del oído", "o pulso"], "white", VERDE_AGUA)
    c2 = caja(ax, c(1), yr2, bw, bh, ["Vía 2", "patrón de", "hipoglucemia"], VERDE_AGUA_CLARO, VERDE_AGUA)
    d1 = caja(ax, c(4), yr2, bw, bh, ["Regla de", "decisión", "Y, O o 2 de 3"], GRIS_CLARO, GRIS)
    # fila 3
    d2 = caja(ax, c(4), yr3, bw, bh, ["Alarma", "a la persona o", "su cuidador"], "white", AZUL_OSC, lw=2.5)
    pares = [b1, b2, b3, b4, b5, c1, c2, d1, d2]

    ym1, ym2 = yr1 + bh / 2, yr2 + bh / 2
    for i in range(4):
        flecha(ax, c(i) + bw, ym1, c(i + 1), ym1)
    flecha(ax, c(0) + bw, ym2, c(1), ym2)
    flecha(ax, c(1) + bw, ym2, c(4), ym2)
    flecha(ax, c(4) + bw / 2, yr1, c(4) + bw / 2, yr2 + bh)
    flecha(ax, c(4) + bw / 2, yr2, c(4) + bw / 2, yr3 + bh)

    # contorno discontinuo B2 a B4
    pad = 0.06
    ax.add_patch(FancyBboxPatch((c(1) - pad, yr1 - pad), c(3) + bw - c(1) + 2 * pad, bh + 2 * pad,
                                boxstyle="round,pad=0,rounding_size=0.08", fc="none", ec=AZUL, lw=1.6, ls=(0, (4, 3))))
    ax.text((c(1) + c(3) + bw) / 2, yr1 + bh + pad + 0.03, "Programado y probado en simulación", fontsize=9,
            fontweight="bold", color=AZUL, ha="center", va="bottom")

    # texto de reglas
    regla = ("Regla Y: suena solo si las dos vías coinciden, con menos falsas alarmas y más episodios "
             "perdidos. Regla O: basta una vía, y pasa lo contrario. Regla 2 de 3: manda la mayoría de tres señales.")
    ancho_max = 4.6
    fig.canvas.draw()
    r0 = fig.canvas.get_renderer()
    lineas, actual = [], ""
    for palabra in regla.split():
        prueba = (actual + " " + palabra).strip()
        tmp = ax.text(0, 0, prueba, fontsize=9)
        wpx = tmp.get_window_extent(r0).width / fig.dpi
        tmp.remove()
        if wpx > ancho_max and actual:
            lineas.append(actual)
            actual = palabra
        else:
            actual = prueba
    lineas.append(actual)
    tr = ax.text(c(0), yr3 + bh / 2, "\n".join(lineas), fontsize=9, color=GRIS, ha="left", va="center", linespacing=1.3)
    fig.canvas.draw()
    r = fig.canvas.get_renderer()
    ancho_disp = (c(3) + bw - c(0))
    tb = tr.get_window_extent(r)
    ancho_txt = tb.width / 300  # in, a dpi de figura 100 -> se recalcula abajo
    ancho_txt = tb.width / fig.dpi
    print("fig2: texto de reglas", round(ancho_txt, 2), "in de", round(ancho_disp, 2), "in disponibles")
    if ancho_txt > ancho_disp:
        AVISOS.append("fig2: el texto de reglas excede las columnas 1 a 4")
    verificar_dentro(fig, pares, "fig2")
    guardar(fig, "fig2-algoritmo.png")


if __name__ == "__main__":
    import warnings
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        fig1()
        fig2()
    for x in w:
        print("AVISO:", x.message)
    for a in AVISOS:
        print("AVISO:", a)
    print("listo")
