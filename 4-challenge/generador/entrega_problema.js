// Entrega del problema del Challenge, viernes 6 de noviembre de 2026. La version entregada es de una plana (secciones 1 a 5, tabla de la cadena y referencias, cuerpo de 10 pt).
// Uso: node entrega_problema.js [cuerpoPagina1EnMediosPuntos] [cuerpoPagina2] [recortes, ej. R1,R2] [interlineado] [espaciadoP1] [espaciadoP2] [salida.docx]
// La version entregada se arma con (ENTREGA_SALIDA obligatoria, ruta completa del docx, o 8.o argumento):
//   ENTREGA_SALIDA=<ruta del docx> node entrega_problema.js 20 20 ninguno 252 1 1
// Con ENTREGA_ANEXO=1 suma una segunda pagina con el anexo de las dos figuras de ../figuras/ (antes: py -3.11 figuras_entrega.py).
//   pwsh -File exportar_pdf.ps1 <docx>           # exporta el PDF con una instancia propia de Word
//   py -3.11 verificar_pdf.py <pdf> <carpeta>    # paginas, primera y ultima linea, renders PNG
// Todas las rutas son relativas a este archivo. Ver README.md de esta carpeta.
const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, ImageRun,
} = require("docx");

const SCRATCH = path.join(__dirname, "..", "figuras"); // carpeta de las figuras
const SALIDA_ARG = process.argv[8] || process.env.ENTREGA_SALIDA; // obligatoria, sin ruta por defecto
if (!SALIDA_ARG) { console.error("Falta la variable de entorno ENTREGA_SALIDA con la ruta del docx."); process.exit(1); }
const SALIDA = path.resolve(SALIDA_ARG);
const F = "Arial";
const AZUL = "1F4E79";
const GRIS = "404040";
const ROJO = "C0392B";
const C1 = Number(process.argv[2] || 20); // cuerpo de la pagina 1 en medios puntos
const C2 = Number(process.argv[3] || C1); // cuerpo de la pagina 2
const CORTES = new Set((process.argv[4] || "ninguno").split(",").filter((x) => x && x !== "ninguno"));
let C = C1;
const LINEA = Number(process.argv[5] || 252);
const ESP1 = Number(process.argv[6] || 1);
const ESP2 = Number(process.argv[7] || ESP1);
let ESP = ESP1; // factor de espaciado entre parrafos

const t = (text, o = {}) => new TextRun({ text, font: F, size: C, ...o });
const b = (text, o = {}) => t(text, { bold: true, ...o });
const sub = (text, o = {}) => t(text, { subScript: true, ...o });

// Mini marcado: **negrita**, _{subindice}, ⟦rojo⟧. Los tramos [[Rn:texto]] se quitan si Rn esta en CORTES.
function rich(str, base = {}) {
  str = str.replace(/\[\[(R\d):([\s\S]*?)\]\]/g, (_, id, txt) => (CORTES.has(id) ? "" : txt)).replace(/\s+$/, "");
  const runs = [];
  let bold = false, red = false, buf = "";
  const opts = () => ({ ...base, ...(bold ? { bold: true } : {}), ...(red ? { color: ROJO } : {}) });
  const flush = () => { if (buf) { runs.push(t(buf, opts())); buf = ""; } };
  for (let i = 0; i < str.length; i++) {
    if (str.startsWith("**", i)) { flush(); bold = !bold; i++; }
    else if (str[i] === "⟦") { flush(); red = true; }
    else if (str[i] === "⟧") { flush(); red = false; }
    else if (str.startsWith("_{", i)) {
      const j = str.indexOf("}", i);
      flush(); runs.push(sub(str.slice(i + 2, j), opts())); i = j;
    } else buf += str[i];
  }
  flush();
  return runs;
}

const par = (children, o = {}) => new Paragraph({ children, spacing: { after: Math.round(70 * ESP), line: LINEA }, alignment: AlignmentType.JUSTIFIED, ...o });
const titulo = (text) => new Paragraph({ keepNext: true, spacing: { before: Math.round(90 * ESP), after: Math.round(50 * ESP) }, children: [b(text, { color: AZUL, size: C + 2 })] });
const vineta = (children) => new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: Math.round(50 * ESP), line: LINEA }, alignment: AlignmentType.JUSTIFIED, children });
const paso = (children) => new Paragraph({ indent: { left: 280, hanging: 280 }, spacing: { after: Math.round(50 * ESP), line: LINEA }, alignment: AlignmentType.JUSTIFIED, children });

const ANCHO = 12240 - 2 * 1150;
const COL1 = 2150;
const celda = (children, ancho, fondo) => new TableCell({
  width: { size: ancho, type: WidthType.DXA },
  shading: fondo ? { type: ShadingType.CLEAR, color: "auto", fill: fondo } : undefined,
  margins: { top: Math.round(30 * ESP), bottom: Math.round(30 * ESP), left: 80, right: 80 },
  children: [new Paragraph({ spacing: { after: 0, line: 230 }, children })],
});
const fila = (casilla, texto) => new TableRow({ children: [
  celda([t(casilla, { bold: true, size: C - 2, color: AZUL })], COL1, "E7F1FB"),
  celda(Array.isArray(texto) ? texto : [t(texto, { size: C - 2 })], ANCHO - COL1),
] });

const REF = 15; // referencias 7,5 pt
const ref = (partes) => new Paragraph({ spacing: { after: 10, line: 216 }, indent: { left: 300, hanging: 300 },
  children: partes.map(([texto, cursiva]) => t(texto, { size: REF, italics: !!cursiva })) });

// Figuras: PNG de 2070 px de ancho = 6,9 in = 662 px a 96 px/in
const figura = (archivo, descripcion) => {
  const data = fs.readFileSync(path.join(SCRATCH, archivo));
  const w = data.readUInt32BE(16), h = data.readUInt32BE(20);
  return new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 40, after: 20 },
    children: [new ImageRun({ type: "png", data, transformation: { width: 662, height: Math.round(662 * h / w) },
      altText: { title: descripcion, description: descripcion, name: archivo } })] });
};
const pie = (texto) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 240 },
  children: rich(texto, { size: 18, italics: true, color: GRIS }) });

// ---------------------------------------------------------------- Pagina 1
const pagina1 = [
  new Paragraph({ spacing: { after: 20 }, children: [b("Challenge de Ingeniería Biomédica · Entrega del problema", { size: C + 7, color: AZUL })] }),
  new Paragraph({ spacing: { after: 0 }, children: [t("Fisiología y Anatomía Humana · Ingeniería Civil Biomédica · UTEM · Sección 572 · Grupo 1 · Docente: María de Jesús Triolo", { size: C - 3, color: GRIS })] }),
  new Paragraph({ spacing: { after: Math.round(110 * ESP) }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AZUL, space: 4 } },
    children: [t("Integrantes: Eddie Andrés Ríos Elgueta, Lucas Valdebenito Maldonado y Nicolás Frieri · Viernes 6 de noviembre de 2026", { size: C - 3, color: GRIS })] }),

  titulo("1. El problema"),
  par(rich("La hipoglucemia nocturna en personas con diabetes que usan insulina. En 2017 había unos 451 millones de adultos con diabetes en el mundo (Cho et al., 2018). Mientras duerme, la persona no percibe los síntomas y depende de una alarma, pero los monitores continuos (CGM) miden el líquido intersticial, que va atrasado respecto de la sangre. El único monitor no invasivo aprobado por la FDA, GlucoWatch, fracasó en sus alarmas: ⟦62 de cada 100 fueron falsas⟧ en niños y adolescentes (Tsalikian et al., 2004).")),

  titulo("2. El mecanismo fisiológico"),
  vineta(rich("**Falla del control (núcleo 2, homeostasis).** La glicemia se regula por retroalimentación negativa: el páncreas la detecta y ajusta la insulina y el glucagón. La insulina inyectada queda fuera de ese bucle y sigue actuando aunque la glucosa baje.")),
  vineta(rich("**Aviso que no llega (núcleo 6, sistema nervioso autónomo).** La respuesta simpática a la glucosa baja, con sudor, temblor y taquicardia, alerta de día, pero durante el sueño puede pasar inadvertida.")),
  vineta(rich("**Retraso por difusión (núcleo 3, membrana y transporte).** La glucosa difunde del capilar al líquido intersticial y entra a las células por transportadores GLUT. Por la ley de Fick, la glucosa del tejido G sigue a la de la sangre G_{s} como un sistema de primer orden, dG/dt = (G_{s} − G)/τ, con τ = V/(P·A) (volumen de tejido sobre permeabilidad por área de intercambio), y llega con 5 a 10 min de atraso (Rebrin et al., 2010).")),

  titulo("3. Lo que planteamos y dónde estamos"),
  par(rich("Medir la glucosa con luz infrarroja media en dos capas de la piel que siguen a la sangre con retrasos distintos, estimar con un algoritmo (filtro de Kalman) la glucosa en sangre y adelantar la alarma, confirmándola con EEG del oído. En simulación, la alarma llegó 5,2 a 14,8 min antes. Pero esa luz penetra solo unos 45 µm (Kottmann et al., 2016), y ⟦las capas a su alcance difieren en apenas 0,25 a 7,2 min de retraso, cuando se necesitan 9⟧. ⟦Tal como está, el diseño no supera a GlucoWatch ni a los CGM actuales.⟧ El modelo, los algoritmos y los cálculos están en el repositorio.")),

  titulo("4. Cadena de trazabilidad"),
  new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: [COL1, ANCHO - COL1], rows: [
    fila("01 · Problema de salud", "Hipoglucemia nocturna en personas con diabetes que usan insulina"),
    fila("02 · Mecanismo", "Bucle de la glicemia sin freno, aviso simpático perdido al dormir y retraso por difusión"),
    fila("03 · Contenido", "Núcleos 2 (homeostasis), 3 (membrana y transporte) y 6 (sistema nervioso autónomo)"),
    fila("04 · Variable medible", "Glucosa intersticial y su retraso respecto de la sangre, continua durante la noche"),
    fila("05 · Transducción", rich("En evaluación. ⟦Infrarrojo medio descartado.⟧ Propuesta: CGM electroquímico más señales no invasivas, como el pulso, que confirmen la alarma", { size: C - 2 })),
    fila("06 · Salida esperada", "Alarma nocturna para la persona o su cuidador, más temprana y con menos falsas alarmas"),
  ] }),

  titulo("5. Pregunta para su retroalimentación"),
  par([t("¿Seguimos con un CGM más biomarcadores no invasivos (opción B), corregimos el diseño no invasivo con espectroscopía Raman (opción A), o un resultado negativo bien fundamentado cumple el objetivo del ramo (opción C)?")]),

  new Paragraph({ spacing: { before: Math.round(60 * ESP), after: 20 }, children: [b("Referencias", { size: REF + 1, color: AZUL })] }),
  ref([["Cho, N. H., Shaw, J. E., Karuranga, S., Huang, Y., da Rocha Fernandes, J. D., Ohlrogge, A. W., & Malanda, B. (2018). IDF Diabetes Atlas: Global estimates of diabetes prevalence for 2017 and projections for 2045. "], ["Diabetes Research and Clinical Practice, 138", 1], [", 271-281. https://doi.org/10.1016/j.diabres.2018.02.023"]]),
  ref([["Kottmann, J., Rey, J. M., & Sigrist, M. W. (2016). Mid-infrared photoacoustic detection of glucose in human skin: Towards non-invasive diagnostics. "], ["Sensors, 16", 1], ["(10), 1663. https://doi.org/10.3390/s16101663"]]),
  ref([["Rebrin, K., Sheppard, N. F., Jr., & Steil, G. M. (2010). Use of subcutaneous interstitial fluid glucose to estimate blood glucose: Revisiting delay and sensor offset. "], ["Journal of Diabetes Science and Technology, 4", 1], ["(5), 1087-1098. https://doi.org/10.1177/193229681000400507"]]),
  ref([["Tsalikian, E., Kollman, C., Mauras, N., Weinzimer, S., Buckingham, B., Xing, D., Beck, R., Ruedy, K., Tamborlane, W., Fiallo-Scharer, R., & DirecNet Study Group. (2004). GlucoWatch G2 Biographer alarm reliability during hypoglycemia in children. "], ["Diabetes Technology & Therapeutics, 6", 1], ["(5), 559-566. https://doi.org/10.1089/dia.2004.6.559"]]),
  ref([["Ríos Elgueta, E. A. (2026). "], ["simulacion-retraso-glucosa", 1], [" [Repositorio con la simulación y el análisis de viabilidad]. GitHub. https://github.com/Stenon5/simulacion-retraso-glucosa"]]),
];

// ---------------------------------------------------------------- Pagina 2 (anexo)
C = C2; ESP = ESP2;
const pagina2 = [
  new Paragraph({ pageBreakBefore: true, keepNext: true, spacing: { before: 0, after: 50 },
    children: [b("Anexo. El modelo, los algoritmos y cómo se integran las lecturas del medidor", { color: AZUL, size: C + 4 })] }),

  figura("fig1-modelo.png", "Modelo de dos capas y una hipoglucemia simulada"),
  pie("Figura 1. Modelo de dos capas. Cada capa de tejido sigue a la sangre con su propio retraso τ, y el medidor solo ve las capas. A la derecha, una hipoglucemia simulada con τ_{1} = 6 min y τ_{2} = 15 min."),

  par(rich("**El modelo.** Cada capa sigue a la sangre con la ecuación de la sección 2 y su propio τ. Despejando, G_{s} = G_{i} + τ_{i}·dG_{i}/dt: con τ y la pendiente de una capa se podría reconstruir la sangre. Pero τ cambia de una persona a otra y la sangre no se mide, así que el medidor lee dos capas con retrasos distintos y el algoritmo los estima.")),

  figura("fig2-algoritmo.png", "De las lecturas a la alarma"),
  pie("Figura 2. De las lecturas a la alarma. Los pasos 1 a 3 están programados y probados en simulación. La vía 2 y la regla de decisión se evaluaron con cifras publicadas."),

  paso(rich("**1. Ruido de cada lectura.** La glucosa cambia de forma suave, así que la segunda diferencia de la serie de lecturas, Δ²y, es casi solo ruido, y en un ruido blanco su varianza vale 6σ². Por eso σ² ≈ Var(Δ²y)/6. [[R7:En las 280 corridas simuladas recuperó el ruido real con menos de 10 % de error.]]")),
  paso(rich("**2. Retrasos sin medir la sangre.** Como las dos capas siguen a la misma sangre, G_{1} + τ_{1}·dG_{1}/dt = G_{2} + τ_{2}·dG_{2}/dt, y la sangre desaparece. Se integra en vez de derivar, porque derivar amplifica el ruido, y queda ∫(G_{1} − G_{2})dt = c − τ_{1}·G_{1}(t) + τ_{2}·G_{2}(t), una ecuación lineal en τ_{1} y τ_{2} que se ajusta por mínimos cuadrados. El ruido de las lecturas sesga ese ajuste hacia abajo, y se corrige con el σ del paso 1[[R6: (corrección por error en las variables)]]. Si el ajuste queda mal condicionado o da un τ negativo, el método no entrega cifra. Con 2 mg/dL de ruido recuperó τ_{2} − τ_{1} = 9,08 ± 0,40 min frente a 9 reales.")),
  paso(rich("**3. Filtro de Kalman.** Su estado es [sangre, pendiente, G_{1}, G_{2}]. Cada minuto predice con el modelo y corrige con las dos lecturas, pesadas según el ruido estimado. Usa solo lecturas pasadas, aunque en la simulación los τ se estimaron antes con la noche completa.")),
  paso(rich("**4. Alarma.** Suena cuando la sangre estimada baja de 70 mg/dL. De aquí sale el adelanto de 5,2 a 14,8 min de la página 1. ⟦Con una persona rápida, de retrasos 3 y 6 min, el método falló en 16 de 40 corridas⟧, porque los dos retrasos se parecen demasiado.")),

  par(rich("**Cómo se integran varias señales.** Hay dos niveles. Al promediar lecturas de glucosa de N sensores, el ruido baja según σ_{f}/σ = √((1 + (N − 1)ρ)/N), donde ρ es la correlación entre sus errores, y nunca baja de √ρ. Dos electrodos de un mismo sensor ya tienen ρ ≈ 0,49, así que ⟦combinar Raman, infrarrojo medio y una tercera señal dejaría el error medio (MARD) en 13 a 14 %, sobre el 12 % fijado⟧. El segundo nivel combina decisiones con la regla Y, O o 2 de 3 de la figura 2. Como la mediana es de 0,54 hipoglucemias nocturnas por semana, cada falsa alarma pesa mucho, y por eso ⟦la vía óptica con EEG del oído, con errores algo dependientes entre sí, acertaría solo 54 a 57 de cada 100 alarmas con error lento supuesto⟧. Las fuentes y los cálculos de cada cifra están en el repositorio.")),

  par(rich("⟦**Límites.**⟧ Los datos simulados salen del mismo modelo que supone el estimador, así que la simulación prueba que el algoritmo resuelve sus ecuaciones, no que el cuerpo funcione así. Además supone un retraso constante y ruido blanco. [[R5:Las cifras de alarmas mezclan estudios distintos y sirven para comparar órdenes de magnitud.]]")),
];

const doc = new Document({
  creator: "Eddie Andrés Ríos Elgueta",
  title: "Challenge de Ingeniería Biomédica · Entrega del problema",
  styles: { default: { document: { run: { font: F, size: C1 } } } },
  numbering: { config: [{ reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 280, hanging: 200 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 900, bottom: 800, left: 1150, right: 1150 } } },
    children: [...pagina1, ...(process.env.ENTREGA_ANEXO === "1" ? pagina2 : [])],
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(SALIDA, buf); console.log("escrito", SALIDA, "cuerpo p1", C1 / 2, "pt, p2", C2 / 2, "pt, cortes", [...CORTES].join(",") || "ninguno"); });
