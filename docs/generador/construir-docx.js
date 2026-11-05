// Genera guia-del-proyecto.docx (propuesta de proyecto y guia del equipo) a partir de las figuras de ./figuras.
// Con --resumen genera resumen-para-la-profesora.docx con el mismo generador y los mismos bloques.
// Correr con: node construir-docx.js            (guia completa)
//             node construir-docx.js --resumen  (resumen para la profesora)
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, HeadingLevel, LevelFormat,
  ExternalHyperlink, Header, Footer, PageNumber, VerticalAlign, TableOfContents,
} = require("docx");

const RESUMEN = process.argv.includes("--resumen");
const FIG = path.join(__dirname, "figuras");
const DOCS = path.join(__dirname, "..") + path.sep;
const SALIDA = DOCS + (RESUMEN ? "resumen-para-la-profesora.docx" : "guia-del-proyecto.docx");

const AZUL = "1F6FB2";
const AZUL_CLARO = "E3EEF8";
const ROJO = "C0392B";
const ROJO_CLARO = "FBE7E4";
const GRIS = "6E6E6E";
const GRIS_CLARO = "F2F2F2";
const ANCHO = 9638; // A4 con margenes de 2 cm, en DXA

// Texto enriquecido: **negrita**, [[rojo]], `codigo`, {{cursiva}}.
function rich(s, base = {}) {
  const partes = s.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\]|`[^`]+`|\{\{[^}]+\}\})/).filter(Boolean);
  return partes.map((p) => {
    if (p.startsWith("**")) return new TextRun({ ...base, text: p.slice(2, -2), bold: true });
    if (p.startsWith("[[")) return new TextRun({ ...base, text: p.slice(2, -2), color: ROJO, bold: true });
    if (p.startsWith("`")) return new TextRun({ ...base, text: p.slice(1, -1), font: "Consolas", size: 20 });
    if (p.startsWith("{{")) return new TextRun({ ...base, text: p.slice(2, -2), italics: true });
    return new TextRun({ ...base, text: p });
  });
}

const P = (s, opts = {}) => new Paragraph({ children: typeof s === "string" ? rich(s) : s, spacing: { after: 140, line: 300 }, ...opts });
// H1 empieza pagina nueva salvo que se pida lo contrario.
const H1 = (s, salto = true) => new Paragraph({
  heading: HeadingLevel.HEADING_1, children: [new TextRun(s)],
  ...(salto ? { pageBreakBefore: true } : { spacing: { before: 240, after: 160 } }),
});
const H2 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(s)] });
const H3 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(s)] });
const B = (s, nivel = 0, despues = 80) => new Paragraph({ numbering: { reference: "vinetas", level: nivel }, children: rich(s), spacing: { after: despues, line: 290 } });
const N = (s, ref = "numeros") => new Paragraph({ numbering: { reference: ref, level: 0 }, children: rich(s), spacing: { after: 80, line: 290 } });
const nota = (s) => new Paragraph({ spacing: { after: 160 }, children: rich(s, { size: 19, color: GRIS }) });

function link(texto, url, base = {}) {
  return new ExternalHyperlink({ link: url, children: [new TextRun({ ...base, text: texto, style: "Hyperlink" })] });
}

function tamanoPng(archivo) {
  const b = fs.readFileSync(archivo);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b };
}

// Cada documento numera sus figuras con su propio contador, en el orden en que se crean.
function crearFigura() {
  let nFig = 0;
  return function figura(nombre, pie, anchoPx = 620) {
    nFig += 1;
    const { w, h, data } = tamanoPng(path.join(FIG, nombre));
    // Letra impresa legible: las figuras generadas aqui miden 8,4 a 8,6 pulgadas con letra de 13 pt o mas.
    // Se imprimen a su ancho natural por 0,79 (nunca mas de 640 px, el ancho util), lo que deja toda letra en 10 pt o mas.
    // La f05 viene del repositorio y conserva el ancho que se pida.
    if (!nombre.startsWith("f05")) anchoPx = Math.min(640, Math.round((w / 200) * 96 * 0.79));
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, keepNext: true,
        children: [new ImageRun({ type: "png", data, transformation: { width: anchoPx, height: Math.round(anchoPx * h / w) },
          altText: { title: `Figura ${nFig}`, description: pie, name: nombre } })],
      }),
      new Paragraph({
        spacing: { after: 220 },
        children: [new TextRun({ text: `Figura ${nFig}. `, bold: true, size: 19, color: GRIS }), ...rich(pie, { size: 19, color: GRIS })],
      }),
    ];
  };
}
const figura = crearFigura(); // guia completa
const figuraR = crearFigura(); // resumen

const borde = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const bordes = { top: borde, bottom: borde, left: borde, right: borde };

function tabla(encabezados, filas, anchos, opts = {}) {
  const juntas = opts.juntas !== undefined ? opts.juntas : filas.length <= 8;
  const tam = opts.size || 19;
  const fila = (celdas, esEncabezado, ultima = false) => new TableRow({
    tableHeader: esEncabezado,
    cantSplit: true,
    children: celdas.map((c, i) => new TableCell({
      borders: bordes,
      width: { size: anchos[i], type: WidthType.DXA },
      shading: esEncabezado ? { fill: AZUL, type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: opts.pad || 70, bottom: opts.pad || 70, left: opts.padX || 110, right: opts.padX || 110 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        keepNext: juntas && !ultima,
        alignment: opts.centrar && i > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: esEncabezado ? [new TextRun({ text: c, bold: true, color: "FFFFFF", size: tam })] : rich(c, { size: tam }),
      })],
    })),
  });
  return [
    new Table({
      width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: anchos,
      rows: [fila(encabezados, true), ...filas.map((f, k) => fila(f, false, k === filas.length - 1))],
    }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ];
}

// Tabla de dos columnas con filas de grupo sombreadas que abarcan todo el ancho.
function tablaGrupos(encabezados, grupos, anchos) {
  const celda = (contenido, i, extra = {}) => new TableCell({
    borders: bordes, width: { size: anchos[i], type: WidthType.DXA },
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER, ...extra,
    children: contenido,
  });
  const filas = [new TableRow({ tableHeader: true, cantSplit: true, children: encabezados.map((t, i) => celda(
    [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 19 })] })], i,
    { shading: { fill: AZUL, type: ShadingType.CLEAR, color: "auto" } })) })];
  for (const [titulo, items] of grupos) {
    filas.push(new TableRow({ cantSplit: true, children: [celda(
      [new Paragraph({ keepNext: true, children: [new TextRun({ text: titulo, bold: true, color: AZUL, size: 20 })] })], 0,
      { columnSpan: 2, width: { size: anchos[0] + anchos[1], type: WidthType.DXA }, shading: { fill: AZUL_CLARO, type: ShadingType.CLEAR, color: "auto" } })] }));
    for (const [a, b] of items) {
      filas.push(new TableRow({ cantSplit: true, children: [
        celda([new Paragraph({ children: rich(a, { size: 19 }) })], 0),
        celda([new Paragraph({ children: rich(b, { size: 19 }) })], 1),
      ] }));
    }
  }
  return [new Table({ width: { size: anchos[0] + anchos[1], type: WidthType.DXA }, columnWidths: anchos, rows: filas }),
    new Paragraph({ spacing: { after: 160 }, children: [] })];
}

// Recuadro destacado: una tabla de una celda con fondo y borde izquierdo grueso.
function recuadro(titulo, parrafos, fondo = AZUL_CLARO, color = AZUL) {
  const hijos = [];
  if (titulo) hijos.push(new Paragraph({ spacing: { after: 100 }, keepNext: true, children: [...rich(titulo, { bold: true, color, size: 23 })] }));
  for (const p of parrafos) hijos.push(p instanceof Paragraph ? p : new Paragraph({ spacing: { after: 90, line: 290 }, children: rich(p) }));
  return [
    new Table({
      width: { size: ANCHO, type: WidthType.DXA },
      columnWidths: [ANCHO],
      rows: [new TableRow({ cantSplit: true, children: [new TableCell({
        width: { size: ANCHO, type: WidthType.DXA },
        shading: { fill: fondo, type: ShadingType.CLEAR, color: "auto" },
        borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.SINGLE, size: 36, color } },
        margins: { top: 160, bottom: 120, left: 240, right: 200 },
        children: hijos,
      })] })],
    }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ];
}

function codigo(lineas) {
  return lineas.map((l, i) => new Paragraph({
    shading: { fill: GRIS_CLARO, type: ShadingType.CLEAR, color: "auto" },
    spacing: { after: i === lineas.length - 1 ? 200 : 0, line: 260 },
    indent: { left: 200, right: 200 },
    keepNext: i < lineas.length - 1,
    children: [new TextRun({ text: l || " ", font: "Consolas", size: 19, color: l.startsWith("#") ? "4E7A3A" : "1B1B1B" })],
  }));
}

// Referencia APA: lista de partes, texto (con {{cursiva}}) o [texto, url] para un enlace.
const REF_SIZE = RESUMEN ? 17 : 20; // el resumen usa letra mas chica en la lista de fuentes
const REF_DESPUES = RESUMEN ? 60 : 100;
function ref(partes) {
  const hijos = [];
  for (const p of partes) {
    if (typeof p === "string") hijos.push(...rich(p, { size: REF_SIZE }));
    else hijos.push(link(p[0], p[1], { size: REF_SIZE }));
  }
  const para = new Paragraph({ spacing: { after: REF_DESPUES, line: RESUMEN ? 240 : 270 }, indent: { left: 567, hanging: 567 }, children: hijos });
  para.claveOrden = partes.filter((p) => typeof p === "string").join("").replace(/[{}]/g, "");
  para.urlOrden = (partes.find((p) => typeof p !== "string") || ["", ""])[1];
  return para;
}
// Rotulo de parte dentro de una seccion (no entra al indice).
const rotulo = (s) => new Paragraph({
  keepNext: true, spacing: { before: 200, after: 140 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AZUL, space: 2 } },
  children: [new TextRun({ text: s, bold: true, color: AZUL, size: 26 })],
});
const doi = (d) => [`https://doi.org/${d}`, `https://doi.org/${d}`];

const REPO = "https://github.com/Stenon5/simulacion-retraso-glucosa";
const REPO_CORTO = "github.com/Stenon5/simulacion-retraso-glucosa";

// ------------------------------------------------------------------ contenido
// (a) Portada. La guia completa y el resumen comparten ramo, equipo y fecha, y cambian el antetitulo, el subtitulo y los recuadros.
const AVISO_NO_MEDICO = recuadro("Antes de empezar", [
  "Este proyecto es un **estudio en simulación**. [[No es un dispositivo médico]], no hay hardware ni mediciones en personas, y nada de lo que aparece aquí sirve para decidir sobre la salud de nadie.",
  "Parte del contenido se redactó con ayuda de IA. El detalle está al final, en Uso de inteligencia artificial.",
], ROJO_CLARO, ROJO);
function portadaDe({ antetitulo, subtitulo, avisos, enlace, antes = 1500, tras = 700 }) {
  return [
    new Paragraph({ spacing: { before: antes, after: 120 }, children: [new TextRun({ text: antetitulo, bold: true, color: AZUL, size: 22, characterSpacing: 40 })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Medidor no invasivo de glucosa", bold: true, size: 60, color: "1B1B1B" })] }),
    new Paragraph({ spacing: { after: tras }, children: [new TextRun({ text: subtitulo, size: 30, color: GRIS })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Fisiología y Anatomía Humana", bold: true, size: 26 })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Ingeniería Civil Biomédica · Universidad Tecnológica Metropolitana", size: 23, color: GRIS })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Sección 572 · Segundo semestre de 2026", size: 23, color: GRIS })] }),
    new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "Profesora: María de Jesús Triolo", size: 23, color: GRIS })] }),
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Equipo (grupo 1): Eddie Andrés Ríos Elgueta, Lucas Valdebenito Maldonado y Nicolás Frieri", bold: true, size: 26 })] }),
    new Paragraph({ spacing: { after: RESUMEN ? 400 : 800 }, children: [new TextRun({ text: "29 de octubre de 2026 · versión revisada del 5 de noviembre de 2026", size: 22, color: GRIS })] }),
    ...avisos,
    ...(enlace || []),
  ];
}
const portada = portadaDe({
  antetitulo: "ANÁLISIS DE VIABILIDAD Y GUÍA DEL EQUIPO",
  subtitulo: "Diseño en papel de un medidor multibiomarcador, sus límites y su viabilidad frente a GlucoWatch y al mercado",
  avisos: AVISO_NO_MEDICO,
});

// (b) Como leer este documento, con el indice
const comoLeer = [
  H1("Cómo leer este documento"),
  ...recuadro(null, [
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 90, line: 290 }, children: rich("**La propuesta en una página** resume todo para una lectura de cinco minutos.") }),
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 90, line: 290 }, children: rich("**Las secciones 1 a 5** son la propuesta completa, en formato IMRyD. La sección 5 trae las preguntas en que más nos ayudaría su retroalimentación.") }),
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 90, line: 290 }, children: rich("**El veredicto** está en la sección 4. El análisis de viabilidad ocupa 2.1, 2.2 y desde la 3.5.") }),
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 90, line: 290 }, children: rich("**Los anexos A, B y C** son para colegas que se suman al repositorio. **El anexo D** trae los cálculos del análisis de viabilidad.") }),
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 40, line: 290 }, children: rich("Hay un resumen para la profesora en `docs/resumen-para-la-profesora.pdf`. El anexo E reúne las propuestas que estamos evaluando y las opciones si hay que cambiar de rumbo.") }),
  ]),
  new Paragraph({ spacing: { before: 60, after: 60 }, keepNext: true, children: [new TextRun({ text: "Índice", bold: true, size: 30, color: AZUL })] }),
  new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
];

// (c) La propuesta en una pagina (debe caber en una sola)
const T = 22; // tamano compacto de esta pagina
const bloqueTitulo = (s) => new Paragraph({ keepNext: true, spacing: { before: 130, after: 30 }, children: [new TextRun({ text: s, bold: true, color: AZUL, size: 24 })] });
const bloque = (s) => new Paragraph({ spacing: { after: 50, line: 276 }, children: rich(s, { size: T }) });
const unaPagina = [
  H1("La propuesta en una página"),
  bloqueTitulo("El problema"),
  bloque("Según el Atlas de Diabetes de la Federación Internacional de Diabetes (IDF), en 2017 había unos 451 millones de adultos con diabetes en el mundo, y podrían llegar a 693 millones en 2045 (Cho et al., 2018). Una hipoglucemia que pasa inadvertida, por ejemplo durante el sueño, es peligrosa. Los monitores continuos actuales usan un filamento bajo la piel y miden el líquido intersticial, que va atrasado respecto de la sangre, así que la alarma puede llegar tarde."),
  bloqueTitulo("La base fisiológica"),
  bloque("La glicemia es una variable regulada por retroalimentación negativa. Las células del páncreas la detectan, el páncreas endocrino la controla, y el hígado y el tejido adiposo responden (Tema 2 del curso). En la diabetes ese bucle falla y hay que medir desde fuera. La glucosa pasa del capilar al líquido intersticial por difusión. Por la ley de Fick (Guía 2 del curso), el flujo es proporcional a la diferencia de concentración, así que el tejido sigue a la sangre con un retraso. El proyecto supone que ese retraso es mayor mientras más lejos del capilar se mide."),
  bloqueTitulo("La solución de ingeniería"),
  bloque("**Variable medida:** la glucosa del líquido intersticial a dos profundidades de la piel. **Principio de transducción:** la absorción de luz infrarroja media en bandas propias de la glucosa, entre 8 y 10 µm. **Tecnología:** un sensor con láser de cascada cuántica, hoy hipotético, y un algoritmo que estima los dos retrasos sin sacar sangre y reconstruye la glucosa en sangre con un filtro de Kalman. Una segunda vía independiente, el EEG desde el oído, confirma la alarma."),
  bloqueTitulo("Viabilidad y veredicto"),
  bloque("Hicimos un análisis de viabilidad, solo con papel, literatura y cálculo, con criterios de decisión fijados el 29 de octubre de 2026 antes de ver los datos. [[El resultado es negativo: el medidor propuesto, con infrarrojo medio y EEG en el oído, no supera a GlucoWatch ni tiene sentido hoy frente a los CGM del mercado.]] La separación de retraso entre capas de piel llega a 7,2 min en el mejor caso, y la regla pedía 9 min o más. La fusión de valores da un MARD de 13,0 % con la mejor combinación y ρ = 0,3, y R-B pedía 12 % o menos. La alarma nocturna combinada queda con un valor predictivo positivo de 54 a 57 %, bajo el 70 % exigido. Esa cifra supone un error lento del sensor (σ de 18 y de 13 mg/dL, AR(1) de 60 min, sin estudio que lo mida). Con ruido blanco el VPP sería 100 %. Los intentos reales de combinar técnicas (GlucoTrack, Biovotion) tampoco mejoraron a su mejor componente. Cálculos y fuentes en las secciones 3.5 a 3.9 y en el anexo D. **Propuesta:** invertir el orden y anclar la alarma en un CGM, sumándole biomarcadores no invasivos para bajar las falsas alarmas, con un primer paso barato que es medir con datos ya existentes cuánto se correlacionan sus falsas alarmas."),
  bloqueTitulo("En una frase"),
  bloque("Un medidor que estima su propio retraso para avisar antes de una hipoglucemia, pensado para personas con diabetes."),
  bloqueTitulo("Referencias"),
  new Paragraph({ spacing: { after: 40, line: 250 }, indent: { left: 567, hanging: 567 }, children: [
    ...rich("Cho, N. H., Shaw, J. E., Karuranga, S., Huang, Y., da Rocha Fernandes, J. D., Ohlrogge, A. W., & Malanda, B. (2018). IDF Diabetes Atlas: Global estimates of diabetes prevalence for 2017 and projections for 2045. {{Diabetes Research and Clinical Practice, 138}}, 271-281. ", { size: 17 }),
    link(`https://doi.org/10.1016/j.diabres.2018.02.023`, `https://doi.org/10.1016/j.diabres.2018.02.023`, { size: 17 })] }),
  new Paragraph({ spacing: { after: 0, line: 250 }, indent: { left: 567, hanging: 567 }, children: [
    ...rich("Vrančić, C., Fomichova, A., Gretz, N., Herrmann, C., Neudecker, S., Pucci, A., & Petrich, W. (2011). Continuous glucose monitoring by means of mid-infrared transmission laser spectroscopy in vitro. {{Analyst, 136}}(6), 1192-1198. ", { size: 17 }),
    link(`https://doi.org/10.1039/C0AN00537A`, `https://doi.org/10.1039/C0AN00537A`, { size: 17 })] }),
];

// Figuras que reutilizan las dos versiones: [archivo, pie]. Los pies viven aqui para que no se copien.
const FIGDEF = {
  f02: ["f02-dos-profundidades.png", "Izquierda, el esquema. Derecha, la curva sintética que usa el repositorio: la sangre sube con una comida a los 90 minutos y baja a 50 mg/dL a los 300. Cada profundidad ve la misma curva, más tarde y más suavizada."],
  f07: ["f07-requisito-ruido.png", "Error de la glucosa reconstruida en la persona típica. Con poco ruido, dos profundidades ganan. Sobre unos 5,9 mg/dL, corregir el retraso empeora el resultado. El cruce sale de solo tres niveles de ruido."],
};

// Bloque 1.2 de la guia completa. Lo usan las dos versiones, cada una con su propio numerador de figuras.
const baseFisiologica = (fig) => [
  H2("1.2 Base fisiológica y anatómica"),
  P("El curso fija un criterio para todo el semestre: “toda variable que un dispositivo mide corresponde a un mecanismo fisiológico que es necesario poder nombrar y explicar” (Presentación de la asignatura). Esta sección nombra esos mecanismos para el medidor propuesto."),
  H3("La glicemia es una variable regulada"),
  P("El Tema 2 del curso presenta la homeostasis como un bucle de control biológico. Para la glicemia, el sensor son células del páncreas, el controlador es el páncreas endocrino y los efectores son el hígado y las células adiposas. Es una retroalimentación negativa. En la diabetes este bucle falla, y por eso hay que medir la glucosa desde fuera."),
  ...fig("f09-bucle-glicemia.png", "Bucle de control de la glicemia según el Tema 2 del curso, y dónde entra el medidor propuesto."),
  H3("Del capilar al líquido intersticial"),
  P("La glucosa sale del capilar por difusión y entra a las células por transporte a través de la membrana, que el Tema 3 del curso clasifica en difusión simple, difusión facilitada y transporte activo. Con la ley de Fick se puede escribir el paso de la sangre al tejido como un modelo simple:"),
  ...recuadro("De la ley de Fick al modelo del proyecto", [
    "La ley de Fick del curso dice J = −P·A·(C1 − C2). Si un compartimento de tejido de volumen V recibe glucosa desde la sangre a través de un área A con permeabilidad P, entonces V·dC/dt = P·A·(Csangre − C). Dividiendo por V queda dC/dt = (Csangre − C)/τ, con τ = V/(P·A). Es exactamente el modelo del proyecto: la constante de tiempo τ junta la permeabilidad, el área y el volumen del tejido.",
  ]),
  H3("La piel por capas"),
  P("La epidermis no tiene vasos sanguíneos. La dermis sí contiene vasos sanguíneos y linfáticos (Betts et al., 2022). Por eso una lectura cerca de los capilares de la dermis sigue a la sangre más rápido que una más alejada. El proyecto supone dos profundidades, con retrasos de 6 y 15 minutos en la persona típica de la simulación. Ese es un supuesto del proyecto y no un dato medido en personas."),
  P("Hay una pista a favor de leer a distintas profundidades. Un sensor optoacústico con selección de profundidad, probado en orejas de ratones, tuvo un error de 34 mg/dL en una zona rica en sangre contra 47 mg/dL en el tejido completo (Uluç et al., 2024). [[Solo se probó en ratones.]]"),
  H3("La hipoglucemia y el cerebro"),
  P("El proyecto usa 70 mg/dL como umbral de hipoglucemia. La vía del EEG busca el efecto de la falta de glucosa en el cerebro, que no depende del sudor. La evidencia todavía es poca. Un preprint con 5 personas encontró que los canales con ambos electrodos en el mismo oído no superaron el azar, mientras que los canales con referencia en el otro lado lograron una sensibilidad de 90 % o más (Cabrera et al., 2020). Un estudio de prueba de concepto con 2 personas con diabetes tipo 1 clasificó la hipoglucemia con EEG, con una exactitud de 0,96 dentro de cada persona (Kubaščík et al., 2026)."),
  P("Según el documento de trabajo del autor, las respuestas del cuerpo como el sudor fallan justo en los pacientes de mayor riesgo. [[Esa afirmación no se pudo verificar en su fuente.]]"),
];

// (d) 1. Introduccion
const introduccion = [
  H1("1. Introducción"),
  H2("1.1 El problema"),
  P("Según el Atlas de Diabetes de la Federación Internacional de Diabetes (IDF), en 2017 había unos 451 millones de adultos con diabetes en el mundo, y podrían llegar a 693 millones en 2045 (Cho et al., 2018)."),
  P("Los monitores continuos de glucosa (CGM) que se usan hoy funcionan con un filamento bajo la piel. Funcionan bien, pero implican una aguja. Medir lo mismo solo con luz, ondas o corriente sobre la piel intacta es físicamente posible, pero la señal es diminuta."),
  ...tabla(["Magnitud", "Valor"], [
    ["Glucosa normal en sangre", "90 mg/dL, o sea 5 mmol/L"],
    ["Agua del tejido", "cerca de 1.000 g/L, o sea 55,5 mol/L"],
    ["Proporción de moléculas", "1 glucosa por cada 11.000 de agua, aproximadamente"],
    ["Cambio clínico que hay que detectar (unos 10 mg/dL)", "0,01 % de la masa del tejido"],
  ], [5200, 4438]),
  nota("Cálculo del documento de trabajo del autor, disponible a pedido."),
  P("Casi todo lo que cambia en la piel produce una señal mayor que la de la glucosa: temperatura, hidratación, sudor, presión del sensor, melanina, grosor de la piel, hemoglobina y proteínas. Por eso los métodos no invasivos dependen de calibraciones con aprendizaje automático y tienden a desviarse con el tiempo."),
  H3("La vara con la que se compara todo"),
  P("La exactitud se resume con el **MARD**, el error porcentual medio frente a la sangre. Mientras más bajo, mejor. Los dispositivos con aguja o mínimamente invasivos están entre 4 % y 9 % (Lux Research, 2026). Estas son las cifras de algunas tecnologías:"),
  ...tabla(["Tecnología", "MARD reportado", "Estado", "Fuente"], [
    ["CGM con aguja (Dexcom G7, FreeStyle Libre 3)", "8,2 % y 7,6 %", "Comercial", "Whooley (2024)"],
    ["Radiofrecuencia (Know Labs)", "11,3 %, antes 20,6 %", "Prototipo", "Whooley (2023a, 2023b)"],
    ["Raman sin calibrar por persona", "14,5 %", "Piloto clínico", "Rothenbühler et al. (2026)"],
    ["Prototipos no invasivos en general", "entre 15 % y 25 %", "Investigación", "Lux Research (2026)"],
  ], [3500, 1900, 1700, 2538], { centrar: true }),
  H3("El retraso: el detalle que importa en la hipoglucemia"),
  P("Casi todos los métodos, con o sin aguja, no miden la sangre sino el **líquido intersticial**, el que baña las células. La glucosa tarda en pasar de la sangre a ese líquido. Una revisión no encontró evidencia de un retraso fisiológico mayor a 5 a 10 minutos, y explica los valores más largos por los filtros de los monitores (Rebrin et al., 2010). Aun así, una patente sobre sensores recoge retrasos que van de 0 a 30 minutos (Mastrototaro et al., 2014)."),
  P("En una hipoglucemia ese retraso es justo lo que no se puede regalar: una alarma que llega tarde llega cuando la persona ya está mal. Este proyecto pone el retraso en el centro."),

  ...baseFisiologica(figura),

  H2("1.3 Antecedentes: el seminario y GlucoWatch"),
  P("En la presentación de nuestro seminario 1 dejamos planteada una pregunta para el curso: si un sensor mide el líquido intersticial con 4 a 10 minutos de retardo, ¿conviene más reducir ese retardo o corregirlo con un modelo predictivo? Este proyecto explora la segunda opción, y le suma una forma de estimar el retardo sin sacar sangre."),
  P("El punto de partida fue la revisión de **Tang et al. (2020)**, “Non-Invasive Blood Glucose Monitoring Technology: A Review”, publicada en Sensors 20(23):6925. La revisión ordena las tecnologías no invasivas en tres familias según su principio de medición: ópticas, de microondas y electroquímicas."),
  ...figura("f01-mapa-tecnologias.png", "Tecnologías no invasivas agrupadas en las tres familias de Tang et al. (2020). El color indica qué tan específica es la señal para la glucosa, según el ranking de viabilidad del documento de trabajo del autor. Las que ese ranking no evalúa van en blanco."),
  P("La lección que sale de la figura es la que guía todo el proyecto. Las tecnologías baratas y fáciles de miniaturizar, como el infrarrojo cercano que usan los relojes, casi no tienen señal propia de la glucosa. Las que sí ven la molécula, como el **infrarrojo medio** y **Raman**, son las más difíciles de llevar a un aparato."),
  H3("Los ejes del seminario"),
  P("El seminario comparó las tecnologías con tres ejes: qué variable mide cada una, con qué transductor y cuál es su limitación principal."),
  ...tabla(["Tecnología", "Variable medida", "Transductor", "Limitación principal"], [
    ["Infrarrojo medio", "Absorción de la glucosa entre 8 y 10 µm", "Láser de cascada cuántica y detector", "El agua absorbe fuerte y limita la profundidad"],
    ["Raman", "Huella vibracional de la molécula", "Láser y espectrómetro", "Señal muy débil y fluorescencia de la piel"],
    ["Radiofrecuencia", "Cambio dieléctrico del tejido", "Antena", "La hidratación cambia la misma propiedad"],
    ["Iontoforesis inversa, como GlucoWatch", "Glucosa extraída del líquido intersticial", "Electrodos con glucosa oxidasa", "Calibración con pinchazo, sudor e irritación de la piel"],
  ], [1900, 2650, 2400, 2688]),
  H3("GlucoWatch: el antecedente que no se puede ignorar"),
  P("GlucoWatch fue el **primer monitor no invasivo aprobado por la FDA**. Usaba iontoforesis inversa: una pequeña corriente eléctrica sacaba líquido intersticial a través de la piel y un sensor con la enzima glucosa oxidasa medía la glucosa extraída. Tang et al. (2020) describen sus limitaciones:"),
  B("necesitaba un glucómetro de dedo para calibrarse,"),
  B("tenía un tiempo de calentamiento largo y había que cambiar sus discos cada 12 horas,"),
  B("no funcionaba con sudor y la corriente prolongada podía dañar la piel."),
  P("Su descontinuación fue efectiva el 31 de julio de 2007, con soporte hasta 2008 (DiabetesNet, 2026). El documento de trabajo del autor reúne lo que enseñó, y cada lección se transformó en un requisito de diseño:"),
  ...tabla(["Lección", "Qué pasó", "Cómo responde nuestro diseño"], [
    ["El retraso quita utilidad", "Según el documento de trabajo del autor, las lecturas iban 18 minutos atrasadas respecto al pinchazo. [[No se pudo verificar en su fuente.]]", "Estimar el retraso y corregirlo"],
    ["Las falsas alarmas destruyen la confianza", "En un estudio de 2005 citado por Dotinga (2022), más de la mitad de 240 alarmas nocturnas avisaron mal a niños con diabetes", "Alarma solo si dos vías independientes coinciden"],
    ["Calibrar con un medidor impreciso suma errores", "Se calibraba con el glucómetro de dedo (Tang et al., 2020)", "Estimar el retraso sin pinchazos"],
    ["La señal al límite no alcanza", "La glucosa extraída quedaba en rango micromolar, frente al milimolar de la sangre (Poddar et al., 2008)", "Leer la molécula con luz, sin extraer fluido"],
    ["El fracaso tiene costo regulatorio", "Un médico citado por Dotinga (2022) opina que la FDA quedó más cauta para aprobar estos aparatos", "Estándar de evidencia alto desde el inicio"],
  ], [2400, 4000, 3238]),

  H2("1.4 Pregunta, hipótesis y objetivos"),
  H3("Pregunta"),
  ...recuadro(null, ["¿Se puede estimar el retraso entre la glucosa en sangre y la glucosa en el tejido usando solo dos profundidades ópticas, sin ninguna muestra de sangre? ¿Y conocer ese retraso hace que una alarma de hipoglucemia se active antes?"]),
  H3("Hipótesis"),
  P("Dos lecturas de glucosa a distinta profundidad bastan para estimar ambos retrasos sin sangre, y con ellos la alarma de hipoglucemia llega antes que con una sola profundidad, sin más falsas alarmas, siempre que el ruido del sensor sea bajo. Los criterios para aceptarla o rechazarla quedaron registrados el 22 de octubre de 2026, antes del código que los revisa."),
  H3("Objetivo general"),
  P("Evaluar en simulación si estimar el retraso entre la sangre y el tejido con dos profundidades de medición permite reconstruir la glucosa en sangre y adelantar la alarma de hipoglucemia, y qué ruido de sensor exige."),
  H3("Objetivos específicos"),
  N("Formular el paso de la glucosa de la sangre al tejido a dos profundidades como un modelo basado en la ley de Fick.", "objetivos"),
  N("Estimar los dos retrasos sin muestras de sangre y reconstruir la glucosa en sangre usando solo datos pasados.", "objetivos"),
  N("Comparar el método con una sola profundidad y con un retraso poblacional fijo, en siete escenarios y con criterios fijados de antemano.", "objetivos"),
  N("Determinar el ruido máximo por lectura con que el método todavía ayuda, como requisito para el hardware.", "objetivos"),
  N("Identificar dónde deja de funcionar el método y qué modelos sirven para combinar aparatos distintos.", "objetivos"),
  N("Contrastar las limitaciones de cada tecnología y biomarcador con la física, la práctica y el mercado.", "objetivos"),
  N("Calcular cuánto puede mejorar la combinación de biomarcadores y decidir, con reglas fijadas antes, si el artefacto supera a GlucoWatch y si tiene sentido hoy.", "objetivos"),
];

// (e) 2. Metodos
const metodosResto = [
  H2("2.3 La propuesta completa del medidor"),
  P("El documento de trabajo del autor (16 de octubre de 2026) concluye que casi todos los trucos físicos por separado ya se probaron. La novedad está en **combinar trucos que fallaron solos con hardware que no existía cuando se probaron**, y en cruzar mediciones de distinto origen para que una compense las debilidades de la otra."),
  ...figura("f03-arquitectura-medidor.png", "Arquitectura propuesta. La vía óptica estima la glucosa en sangre, la vía del oído detecta cómo reacciona el cerebro. El recuadro punteado es lo único que hoy existe, y solo en simulación."),
  H3("Las piezas, una por una"),
  ...tabla(["Pieza", "Qué hace", "Estado hoy"], [
    ["Infrarrojo medio", "Lee bandas de absorción propias de la glucosa. Es la tecnología con mayor techo físico del ranking del documento de trabajo. Un láser de cascada cuántica en la palma de 3 personas sanas dio 84 % de predicciones clínicamente exactas (Liakat et al., 2014)", "Idea. No hay sensor"],
    ["Dos profundidades", "Compara dos capas de piel para estimar el retraso sin sangre", "**Simulada en el repositorio**"],
    ["Filtro de latido", "Sincroniza con el pulso para aislar la parte que viene de la sangre", "Idea. La parte pulsátil es cerca del 1 % de la señal (Braig et al., 1996)"],
    ["Kalman y modelo fisiológico", "Junta mediciones ruidosas con un modelo de cómo cambia la glucosa", "**Simulado en el repositorio**"],
    ["Audífono con EEG", "Detecta la reacción del cerebro a la falta de glucosa, sin depender del sudor", "Idea. Con 5 personas, los canales con ambos electrodos en el mismo oído no superaron el azar (Cabrera et al., 2020)"],
    ["Alarma con dos vías", "Avisa solo si ambas vías coinciden", "Idea"],
  ], [2000, 4500, 3138]),
  H3("Cruzar datos usando lo más maduro como referencia"),
  P("La fusión de mediciones tiene dos niveles. El primero, dentro del sensor óptico, es el que ya se simula: dos lecturas del mismo aparato que se combinan con un modelo físico. El segundo es combinar **aparatos distintos**, por ejemplo un sensor óptico con uno de radiofrecuencia o con un EEG, y validar contra la tecnología más madura, el CGM con aguja."),
  P("[[Qué familias de modelos matemáticos sirven para ese segundo nivel todavía no está decidido.]] Es el issue 18 del repositorio, y su regla es explícita: listar las candidatas con sus supuestos y dónde se espera que fallen, sin declarar una ganadora antes de probarlas."),
  H3("Primer producto realista"),
  P("No un reloj que mida glucosa todo el día, sino una **alarma de hipoglucemia nocturna** con dos vías independientes. La glucosa es el primer biomarcador. La misma plataforma óptica podría extenderse a otras moléculas, pero cada una exige su propia banda de absorción, su referencia en sangre y su validación."),

  H2("2.4 Trazabilidad fisiológica"),
  P("Siguiendo el criterio del curso, cada variable que mide el dispositivo se liga a un mecanismo del cuerpo que se puede nombrar.", { keepNext: true }),
  ...tabla(["Qué mide", "Mecanismo fisiológico", "Transductor", "Estado"], [
    ["Glucosa del líquido intersticial a dos profundidades", "Difusión del capilar al intersticio, ley de Fick", "Absorción en infrarrojo medio con láser de cascada cuántica", "Algoritmo simulado, sensor inexistente"],
    ["Componente pulsátil de la señal óptica", "Sangre arterial que llega con cada latido", "Sincronía con el pulso", "Idea. La parte pulsátil es cerca del 1 % de la señal (Braig et al., 1996)"],
    ["Actividad eléctrica del cerebro", "La falta de glucosa altera la función cerebral", "Electrodos de EEG en el oído", "Idea. Con 5 personas, los canales con ambos electrodos en el mismo oído no superaron el azar (Cabrera et al., 2020)"],
    ["Sudor o conductancia de la piel", "Respuesta autonómica a la hipoglucemia", "Electrodos de piel", "[[Descartada: falla en los pacientes de mayor riesgo]]"],
  ], [2300, 2500, 2400, 2438]),
  nota("La falla del sudor en los pacientes de mayor riesgo viene del documento de trabajo del autor. No se pudo verificar en su fuente."),

  H2("2.5 La tomografía del retraso"),
  P("Al método que prueba el repositorio le llamamos **tomografía del retraso**. Responde la pregunta de la sección 1.4 con dos lecturas a distinta profundidad y sin ninguna muestra de sangre."),
  H3("La intuición"),
  P("Imagina dos termómetros enterrados a distinta profundidad en la arena mientras el sol calienta la superficie. El de arriba reacciona rápido, el de abajo tarde. Si conoces cuánto tarda cada uno, puedes deducir la temperatura de la superficie sin medirla. Aquí la superficie es la sangre y los termómetros son dos lecturas del sensor a distinta profundidad."),
  ...figura(...FIGDEF.f02),
  H3("Los cuatro pasos del método"),
  N("**Modelo.** Cada profundidad sigue a la sangre con su propia constante de tiempo τ: dG/dt = (Gsangre − G) / τ. Es la ley de Fick de la sección 1.2.", "pasos"),
  N("**Eliminar la sangre.** Si se escribe la sangre a partir de cada profundidad y se igualan las dos expresiones, la sangre desaparece. Se integra en vez de derivar, porque derivar una señal ruidosa amplifica el ruido. Queda una ecuación lineal en τ1 y τ2.", "pasos"),
  N("**Corregir el ruido.** Como las dos lecturas traen ruido, una regresión común subestima los retrasos. Se aplica una corrección por error en las variables, con el ruido estimado desde la propia señal.", "pasos"),
  N("**Reconstruir.** Con los retrasos estimados, un filtro de Kalman reconstruye la glucosa en sangre usando solo datos pasados, como lo haría un aparato real.", "pasos"),
  H3("Cómo se llegó ahí"),
  P("Cada intento fallido dejó una regla. La bitácora del repositorio los registra con fecha:"),
  B("Con derivadas, una constante de tiempo salió [[negativa]], algo físicamente imposible. Desde entonces una τ negativa se informa como falla y nunca se recorta a cero."),
  B("La forma integral acertó la diferencia entre los retrasos pero [[subestimó ambos]]. Desde entonces cada cantidad se compara con su propio valor real."),
  B("La corrección por error en las variables resolvió ese sesgo, pero supone que el ruido de las dos profundidades es independiente. Ese supuesto todavía no se pone a prueba."),

  H2("2.6 Diseño de la simulación"),
  P("Cada escenario simula un registro de 8 horas con una lectura por minuto, o sea 480 lecturas. La glucosa en sangre sigue una curva fija: parte en 120 mg/dL, sube a unos 180 mg/dL con una comida a los 90 minutos, baja a 50 mg/dL a los 300 minutos y vuelve a 120. Cada escenario se repite en 40 réplicas, que solo cambian en el ruido del sensor."),
  ...tabla(["Escenario", "τ1 (min)", "τ2 (min)", "Ruido por lectura (mg/dL)"], [
    ["Típico, ruido bajo", "6", "15", "2"],
    ["Típico, ruido medio", "6", "15", "5"],
    ["Típico, ruido alto", "6", "15", "8"],
    ["Persona lenta", "15", "30", "5"],
    ["Persona rápida", "3", "6", "5"],
    ["Réplica lenta", "12", "30", "5"],
    ["Réplica rápida", "3", "8", "5"],
  ], [3200, 1700, 1700, 3038], { centrar: true }),
  nota("Los dos escenarios de réplica repiten situaciones de la prueba exploratoria del 16 de octubre que no caben en la grilla principal. Fuente: escenarios.yaml."),
  P("El método con retraso estimado se compara con tres líneas base:"),
  B("**Una profundidad suavizada:** lo que haría un aparato simple, sin corregir el retraso."),
  B("**Un retraso poblacional fijo** de 6 y 15 minutos, sin estimar nada en cada persona."),
  B("**Los retrasos reales:** el mejor caso posible, para medir cuánto se pierde por no conocerlos."),
  P("Los cinco criterios para aceptar o rechazar el método quedaron registrados el 22 de octubre de 2026 en umbrales.yaml, antes del código que los revisa. Se evalúan por escenario:"),
  ...tabla(["Criterio", "Se cumple si"], [
    ["Sesgo del retraso", "El sesgo medio de cada constante de tiempo es menor a 1 minuto, y se informa junto a su desviación estándar"],
    ["Requisito de ruido", "El ruido por lectura con que el método todavía supera a una sola profundidad es de 3 mg/dL o más"],
    ["Alarma más temprana", "La alarma suena antes que con una sola profundidad, sin más falsas alarmas"],
    ["Mejor que el retraso fijo", "El error de la glucosa reconstruida es menor que el de un retraso poblacional fijo"],
    ["Ruido bien estimado", "El ruido estimado desde la señal queda a menos de 10 % del ruido inyectado"],
  ], [2900, 6738]),
  P("Dos reglas de parada completan el diseño. Una constante de tiempo negativa es una falla y no se recorta a cero. Un caso casi singular se informa como no identificable. [[Los criterios se eligieron después de una prueba exploratoria anterior, así que son la especificación de una replicación y no criterios fijados a ciegas.]]"),
];

// Recuadro de la replicacion. Lo usan las dos versiones.
const recuadroReplicacion = () => {
  return recuadro("La replicación no reprodujo la primera prueba", [
    "Las cifras del documento de trabajo del autor salieron de scripts exploratorios del 16 de octubre que se perdieron. Al reimplementar todo desde la especificación:",
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 60 }, children: rich("las desviaciones salieron entre 2 y 2,6 veces mayores,") }),
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 60 }, children: rich("en los escenarios equivalentes, el sesgo llegó a 3,85 minutos y no a 0,8 o menos,") }),
    new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 100 }, children: rich("el requisito de ruido salió en 5,9 mg/dL y no entre 2 y 3.") }),
    "**Manda la replicación.** Si lees el documento de trabajo, toma sus cifras del prototipo como superadas. Además, al implementar se descubrió que un término de la fórmula de corrección no se puede derivar. Se dejó la fórmula registrada como versión principal y se informa aparte una variante sin ese término, que cambia las medias en 0,18 minutos o menos.",
  ], ROJO_CLARO, ROJO);
};

// (f) 3. Resultados
const VERDICT = (s) => (s.startsWith("no") ? `[[${s}]]` : s);
const resultados = [
  H1("3. Resultados"),
  P("Esta sección tiene dos partes. La parte A (3.1 a 3.4) muestra los resultados de la simulación del retraso. La parte B (3.5 a 3.9) muestra los del análisis de viabilidad, cuyo veredicto está en la sección 4."),
  rotulo("Parte A. Resultados de la simulación del retraso"),
  P("Se simularon siete escenarios: una persona típica con ruido bajo, medio y alto, una persona lenta y una rápida, más dos escenarios agregados para replicar la prueba exploratoria. Cada uno con **40 réplicas** de un registro de 8 horas, una lectura por minuto."),
  ...figura("f05-registro-representativo.png", "Una réplica del escenario típico con ruido de 5 mg/dL, elegida antes de ver los resultados. En azul la reconstrucción con dos profundidades, en gris una sola profundidad suavizada. Figura generada por el repositorio."),
  H2("3.1 ¿Se recuperan los retrasos?"),
  ...figura("f06-retrasos-estimados.png", "Retraso estimado, media ± desviación estándar entre las corridas válidas, frente al valor real (raya negra). En rojo, los escenarios donde parte de las corridas falló."),
  ...tabla(["Escenario", "τ1 real", "τ1 estimado", "τ2 real", "τ2 estimado", "Corridas válidas"], [
    ["Típico, ruido 2", "6", "6,21 ± 1,10", "15", "15,29 ± 1,32", "40 de 40"],
    ["Típico, ruido 5", "6", "6,73 ± 3,00", "15", "15,98 ± 3,48", "40 de 40"],
    ["Típico, ruido 8", "6", "9,24 ± 7,00", "15", "18,85 ± 7,67", "[[37 de 40]]"],
    ["Persona lenta", "15", "16,16 ± 3,85", "30", "31,58 ± 4,79", "40 de 40"],
    ["Persona rápida", "3", "7,51 ± 9,01", "6", "10,92 ± 9,33", "[[24 de 40]]"],
    ["Réplica lenta", "12", "12,71 ± 2,69", "30", "31,09 ± 3,58", "40 de 40"],
    ["Réplica rápida", "3", "5,33 ± 4,13", "8", "10,65 ± 4,35", "[[33 de 40]]"],
  ], [2000, 1000, 1800, 1000, 1800, 2038], { centrar: true }),
  P("Minutos, media ± desviación estándar. Ruido en mg/dL por lectura. Una corrida no es válida si dio una τ negativa o si fue no identificable."),
  P("**Lo que funciona:** la diferencia entre los dos retrasos se recupera con precisión, por ejemplo 9,08 ± 0,40 minutos frente a 9 reales con ruido de 2 mg/dL. **Lo que no:** [[el nivel de cada retraso por separado tiene una cola hacia valores altos]], y [[en la persona rápida falló 16 de 40 corridas]] (11 con τ negativa y 5 no identificables)."),
  H2("3.2 ¿Cuánto ruido tolera el sensor?"),
  ...figura(...FIGDEF.f07),
  P("Este es el número que conecta la simulación con el hardware. Como referencia, un montaje de infrarrojo medio con láser de cascada cuántica logró un ruido equivalente a **4 mg/dL**, pero in vitro, con 50 segundos de integración (Vrančić et al., 2011). Nada equivalente se ha demostrado en una persona."),
  H2("3.3 ¿La alarma suena antes?"),
  P("Sí, en promedio entre **5,2 y 14,8 minutos antes** que con una sola profundidad, según el escenario (el rango es por escenario y no depende de un solo nivel de ruido). El mayor beneficio aparece en las personas con retraso largo. Pero [[con ruido de 8 mg/dL aparecieron 2 falsas alarmas en 37 corridas]] y [[en la persona rápida 1 en 24]], contra ninguna de la línea base."),
  H2("3.4 Umbral por umbral"),
  ...tabla(["Escenario", "Sesgo menor a 1 min", "Alarma antes sin más falsas", "Gana al retraso fijo", "Ruido bien estimado"], [
    ["Típico, ruido 2", "cumple", "cumple", VERDICT("no cumple"), "cumple"],
    ["Típico, ruido 5", "cumple, con DE alta", "cumple", VERDICT("no cumple"), "cumple"],
    ["Típico, ruido 8", VERDICT("no cumple"), VERDICT("no cumple"), VERDICT("no cumple"), "cumple"],
    ["Persona lenta", VERDICT("no cumple"), "cumple", "cumple", "cumple"],
    ["Persona rápida", VERDICT("no cumple"), VERDICT("no cumple"), VERDICT("no cumple"), "cumple"],
    ["Réplica lenta", VERDICT("no cumple"), "cumple", "cumple", "cumple"],
    ["Réplica rápida", VERDICT("no cumple"), "cumple", "cumple", "cumple"],
  ], [2000, 1950, 2050, 1800, 1838], { centrar: true }),
  P("En la persona típica no se puede ganar al retraso fijo, porque ese valor fijo (6 y 15 min) coincide con el real. El requisito de ruido, al menos 3 mg/dL, se cumple con el cruce en 5,9 mg/dL."),
  ...recuadroReplicacion(),
];

// (g) 4. Discusion
// Modulo dry lab. Se carga aqui para que sus figuras se numeren despues de las de la simulacion (f05 a f07) y antes de f08.
const dry = require("./seccion-dry-lab.js")({ P, H1, H2, H3, B, N, figura, tabla, recuadro, codigo, link, rich, refSize: REF_SIZE, refAfter: REF_DESPUES, refLine: RESUMEN ? 240 : 270 });
const resultadosB = [
  rotulo("Parte B. Resultados del análisis de viabilidad"),
  ...dry.resultados,
];
const discusionA = [
  H1("4. Discusión"),
  H2("4.1 Qué significan los resultados"),
  P("Los resultados se leen en dos partes. La primera viene de la simulación del retraso (secciones 3.1 a 3.4). La segunda viene del análisis de viabilidad (secciones 3.5 a 3.9), y su veredicto completo está en la sección 4.3."),
  H3("De la simulación del retraso"),
  B("El método recupera bien la diferencia entre los dos retrasos (9,08 ± 0,40 min frente a 9 reales con ruido de 2 mg/dL) pero [[no el nivel de cada uno cuando sube el ruido]]."),
  B("La persona rápida es el caso más difícil, porque sus dos retrasos (3 y 6 min) están tan cerca que las lecturas casi no se distinguen, y [[16 de 40 corridas fallaron]]."),
  B("El cuello de botella es el sensor y no el algoritmo, porque el método solo supera a una sola profundidad, en la persona típica, con menos de unos 5,9 mg/dL de ruido por lectura."),
  H3("Del análisis de viabilidad"),
  B("[[El diseño propuesto no supera a GlucoWatch.]] La separación de retraso entre capas llega a 7,2 min en el mejor caso, y la regla 4 pedía 9 min o más (sección 3.6). La alarma nocturna combinada queda con un valor predictivo positivo de 54 a 57 %, y las reglas 0 y 3 pedían 70 % o más (sección 3.8). La cifra de 54 a 57 % supone un error lento del sensor (σ de 18 y de 13 mg/dL, AR(1) de 60 min, sin estudio que lo mida). Con ruido blanco el VPP sería 100 %."),
  B("[[La fusión de valores no alcanza.]] Con ρ = 0,3 el MARD fusionado es 13,0 % en el mejor caso, y R-B pedía 12 % o menos. Los intentos reales de combinar técnicas (GlucoTrack, Biovotion) no mejoraron a su mejor componente (sección 3.8)."),
  B("[[Hoy no tiene sentido frente al mercado.]] Hay CGM de venta libre desde USD 54 por 2 semanas (Abbott, s. f.), y un no invasivo con MARD de 15 % o más no ofrece algo que ellos no ofrezcan, salvo no tener aguja (sección 3.9)."),
  B("El análisis es de papel. Verifica cálculos y no valida un cuerpo. Lo único que queda en pie es una Propuesta, anclar la alarma en un CGM (sección 4.4)."),
];
const discusionB = [
  H2("4.6 Limitaciones de la simulación"),
  P("Lo que esto no es:"),
  B("[[Circularidad.]] Los datos sintéticos se generan con el mismo modelo que supone el estimador. Recuperar el retraso así verifica el estimador, no valida el modelo frente a un cuerpo real."),
  B("[[Retraso constante.]] En la realidad cambia con el ejercicio, la temperatura y la postura."),
  B("[[Ruido blanco.]] Sin deriva ni correlación entre profundidades, cuando en sensores ópticos reales la deriva lenta suele dominar."),
  B("[[Un solo día sintético]] de 8 horas con una hipoglucemia. Eso no es un día de vida con diabetes."),
  B("[[No hay sensor.]] El ruido es una entrada de la simulación, no algo medido."),
  B("[[Los retrasos se estiman con el registro completo]] antes de filtrar. Un aparato real tendría que estimarlos solo con datos pasados."),
  H2("4.7 Traslación a un dispositivo de uso clínico"),
  P("Esta sección responde la pregunta de traslación del curso: qué haría falta para llegar a un dispositivo de uso clínico."),
  B("Un sensor con menos de unos 5,9 mg/dL de ruido por lectura en una persona. [[Hoy 4 mg/dL solo se logró in vitro]] (Vrančić et al., 2011)."),
  B("Validar el modelo de retraso en personas, contra un monitor continuo o una muestra de sangre."),
  B("Apuntar a un MARD de 15 % o menos en un piloto, parecido al 14,5 % de un piloto sin calibración por persona (Rothenbühler et al., 2026), y a largo plazo acercarse a los monitores con aguja, que están entre 7,6 % y 8,2 % (Whooley, 2024)."),
  B("Incluir desde el inicio distintos tonos y grosores de piel."),
  B("Respetar los límites de exposición de la piel al láser durante toda la noche."),
  B("Asumir un estándar regulatorio alto. La FDA informó que no ha autorizado ningún reloj o anillo que mida glucosa sin aguja, y el Dr. Robert Gabbay, de la ADA, advirtió que podrían dar mediciones inexactas (Associated Press, 2024). Tras GlucoWatch, un médico citado por Dotinga (2022) opina que la FDA quedó más cauta."),
  H2("4.8 Próximos pasos"),
  ...figura("f08-hoja-de-ruta.png", "Estado de las tareas en GitHub al 29 de octubre de 2026.", 620),
  P("La fase 2 va antes que cualquier curva más realista. Usar un simulador de diabetes tipo 1 como simglucose, una implementación en Python de la versión 2008 del simulador UVa/Padova para uso en investigación (jxx123, s. f.), cambiaría la curva de la sangre, pero no el modelo del tejido, que es justo el supuesto que hay que atacar."),
  ...tabla(["Issue", "Tarea", "Qué se espera"], [
    ["9", "Conciliar la bitácora", "Cerrar la entrada pendiente con las cifras que el código sí reproduce"],
    ["10", "Informe de factibilidad", "Rellenar `2-simulacion/informe/factibilidad.md` solo desde `2-simulacion/results/`"],
    ["11", "Retraso variable", "Velocidad de cambio a la que el método deja de cumplir"],
    ["12", "Ruido correlacionado", "Si la corrección empeora las cosas cuando el ruido es compartido"],
    ["13", "Deriva del sensor", "Si el ruido se estima bien mientras el retraso falla en silencio"],
    ["14", "Otra cinética", "Si el estimador avisa cuando el modelo está equivocado"],
    ["15", "Muestreo y duración", "El registro más corto que todavía identifica ambos retrasos"],
    ["16", "Separación entre profundidades", "Cuánto deben diferir las capas, como requisito de hardware"],
    ["17", "Dominio de validez", "Dónde funciona el método y dónde no, en una sección corta"],
    ["18", "Modelos para combinar aparatos", "Familias candidatas con sus supuestos, sin elegir ganadora"],
  ], [900, 3000, 5738]),
  H3("Preguntas abiertas"),
  B("¿Qué separación de profundidades da dos retrasos lo bastante distintos para identificarlos?"),
  B("¿El retraso crece con el cuadrado de la profundidad, como predice la difusión? Si es así, una restricción física simplificaría la estimación."),
  B("¿El infrarrojo medio llega a la capa vascular en humanos? La selección de profundidad (DIROS) solo se probó en orejas de ratón (Uluç et al., 2024)."),
  B("¿Qué fracción de las personas con hipoglucemia inadvertida muestra cambios detectables en un EEG desde el oído?"),
];

const discusion = [...discusionA, ...dry.discusion, ...discusionB];

// (h) 5. Retroalimentacion que buscamos
const GRUPOS_RETRO = [
  ["Criterio: pertinencia fisiológica y anatómica", [
    "¿Es correcto explicar el paso de la glucosa del capilar al líquido intersticial con la ley de Fick y un compartimento de primer orden? ¿Qué mecanismo agregaría primero: perfusión variable, temperatura o ejercicio?",
    "¿Es razonable suponer que dos capas de la piel tienen retrasos distintos, de 6 y 15 minutos en la simulación? ¿Qué fuente recomienda sobre el grosor y la vascularización de la dermis?",
    "¿Tiene sustento fisiológico suficiente buscar la reacción del cerebro a la hipoglucemia con EEG desde el oído?",
  ]],
  ["Criterio: calidad de la solución de ingeniería", [
    "¿Es plausible el infrarrojo medio como principio de transducción, o conviene partir por una tecnología con más evidencia en humanos, como Raman?",
    "¿Una alarma de hipoglucemia nocturna es el objetivo clínico correcto para un primer prototipo?",
  ]],
  ["Criterio: evidencia y viabilidad", [
    "¿Es válido presentar como resultado que el sensor necesario todavía no existe? ¿Qué barrido de la fase 2 priorizaría?",
  ]],
  ["Criterio: veredicto y próximos pasos", [
    "Profesora, el análisis concluye que el diseño propuesto no supera a GlucoWatch porque la separación de retraso entre capas llega a 7,2 min en el mejor caso (se pedía 9 min o más) y el VPP de la alarma queda en 54 a 57 % (con un error lento supuesto de σ 18 y σ 13 mg/dL, AR(1) de 60 min, que ningún estudio mide, y con ruido blanco sería 100 %). ¿Le parece que el criterio de 9 min y el de 70 % de VPP son razonables como exigencias, o los cambiaría antes de dar por cerrado el veredicto?",
    "Propuesta alternativa: anclar la alarma nocturna en un CGM y sumarle biomarcadores no invasivos para bajar falsas alarmas y detectar fallas del sensor, partiendo por medir con datos pareados ya existentes cuánto se parecen sus errores. ¿Le parece que ese giro todavía cumple el espíritu del proyecto de mezclar biomarcadores distintos para superar a GlucoWatch, o debemos acordar antes una nueva meta?",
  ]],
  ["Criterio: claridad y estructura", [
    "¿Qué parte de este documento quedó confusa o sobra?",
  ]],
];
function tablaRetro(grupos = GRUPOS_RETRO, juntas = false, lineas = 3) {
  const W = [5800, 3838];
  const celda = (hijos, i, extra = {}) => new TableCell({
    borders: bordes, width: { size: W[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 110, right: 110 }, ...extra, children: hijos,
  });
  const filas = [new TableRow({ tableHeader: true, cantSplit: true, children: ["Pregunta", "Sus comentarios"].map((t, i) => celda(
    [new Paragraph({ keepNext: juntas, children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 19 })] })], i,
    { shading: { fill: AZUL, type: ShadingType.CLEAR, color: "auto" } })) })];
  let k = 0;
  for (const [titulo, preguntas] of grupos) {
    filas.push(new TableRow({ cantSplit: true, children: [celda(
      [new Paragraph({ keepNext: true, children: [new TextRun({ text: titulo, bold: true, color: AZUL, size: 20 })] })], 0,
      { columnSpan: 2, width: { size: W[0] + W[1], type: WidthType.DXA }, shading: { fill: AZUL_CLARO, type: ShadingType.CLEAR, color: "auto" } })] }));
    for (const q of preguntas) {
      k += 1;
      filas.push(new TableRow({ cantSplit: true, children: [
        celda([new Paragraph({ keepNext: juntas, children: rich(`**${k}.** ${q}`, { size: 20 }) })], 0),
        celda(Array.from({ length: lineas }, () => new Paragraph({ keepNext: juntas, spacing: { after: 240 }, children: [] })), 1),
      ] }));
    }
  }
  return new Table({ width: { size: W[0] + W[1], type: WidthType.DXA }, columnWidths: W, rows: filas });
}
const comentariosGenerales = (lineas = 5) => recuadro("Comentarios generales", Array.from({ length: lineas }, () => new Paragraph({ spacing: { after: 240 }, children: [] })));
const retro = [
  H1("5. Retroalimentación que buscamos"),
  P("Para que su revisión sea cómoda, estas son las preguntas en que más nos ayudaría su opinión. Están ordenadas según los criterios del curso. Puede responder en la columna de la derecha."),
  tablaRetro(),
  new Paragraph({ spacing: { after: 200 }, children: [] }),
  ...comentariosGenerales(),
];

// (i) Referencias
const refsPrincipales = [
  ref(["Associated Press. (2024, 22 de febrero). {{FDA warns against smartwatches, rings that claim to measure blood sugar without needles}}. CBS News. ", ["https://www.cbsnews.com/news/fda-warns-against-smartwatches-rings-claim-measure-blood-sugar-without-needles/", "https://www.cbsnews.com/news/fda-warns-against-smartwatches-rings-claim-measure-blood-sugar-without-needles/"]]),
  ref(["Betts, J. G., Young, K. A., Wise, J. A., Johnson, E., Poe, B., Kruse, D. H., Korol, O., Johnson, J. E., Womble, M., & DeSaix, P. (2022). Layers of the skin. En {{Anatomy and physiology 2e}} (sección 5.1). OpenStax. ", ["https://openstax.org/books/anatomy-and-physiology-2e/pages/5-1-layers-of-the-skin", "https://openstax.org/books/anatomy-and-physiology-2e/pages/5-1-layers-of-the-skin"]]),
  ref(["Braig, J. R., Goldberger, D. S., Herrera, R. O., & Sterling, B. B. (1996). {{Self-emission noninvasive infrared spectrophotometer}} (U.S. Patent No. 5,515,847). U.S. Patent and Trademark Office. ", ["https://patents.google.com/patent/US5515847", "https://patents.google.com/patent/US5515847"]]),
  ref(["Cabrera, A. F., Kappel, S. L., Remvig, L. S., Toft, H. O., Madsen, R. E., Kildmose, P., & Rank, M. L. (2020). {{Hypoglycemia detection based on ear-EEG}} [Preprint]. Research Square. ", doi("10.21203/rs.3.rs-122971/v1")]),
  ref(["Cho, N. H., Shaw, J. E., Karuranga, S., Huang, Y., da Rocha Fernandes, J. D., Ohlrogge, A. W., & Malanda, B. (2018). IDF Diabetes Atlas: Global estimates of diabetes prevalence for 2017 and projections for 2045. {{Diabetes Research and Clinical Practice, 138}}, 271-281. ", doi("10.1016/j.diabres.2018.02.023")]),
  ref(["DiabetesNet. (2026, 21 de septiembre). {{GlucoWatch: The first non-invasive glucose monitor and its legacy in diabetes tech}} [Fecha de última actualización, sin fecha original ni autor]. DiabetesNet.com. ", ["https://www.diabetesnet.com/diabetes-technology/meters-monitors/animas-glucowatch/", "https://www.diabetesnet.com/diabetes-technology/meters-monitors/animas-glucowatch/"]]),
  ref(["Dotinga, R. (2022, 3 de mayo). {{Hope and hype: Inside the push for wearable diabetes technology}}. MDedge. ", ["https://www.mdedge.com/endocrinology/article/162275/diabetes/hope-and-hype-inside-push-wearable-diabetes-technology", "https://www.mdedge.com/endocrinology/article/162275/diabetes/hope-and-hype-inside-push-wearable-diabetes-technology"]]),
  ref(["Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026a). {{Guía 2 de estudio autónomo}} [Material del curso, sección 3.4]."]),
  ref(["Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026b). {{Presentación de la asignatura}} [Material del curso]."]),
  ref(["Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026c). {{Tema 2: Homeostasis, el bucle de control biológico}} [Material del curso]."]),
  ref(["Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026d). {{Tema 3 (1ra parte): Transporte por membrana}} [Material del curso]."]),
  ref(["jxx123. (s. f.). {{simglucose: A Type-1 Diabetes simulator implemented in Python}} [Software]. GitHub. ", ["https://github.com/jxx123/simglucose", "https://github.com/jxx123/simglucose"]]),
  ref(["Kubaščík, M., Aggarwal, S., Karpiš, O., Tupý, A., Šarafín, P., & Chochul, M. (2026). EEG-based hypoglycemia detection in type 1 diabetes: Proof-of-concept study. {{Frontiers in Human Neuroscience, 20}}, Article 1852403. ", doi("10.3389/fnhum.2026.1852403")]),
  ref(["Liakat, S., Bors, K. A., Xu, L., Woods, C. M., Doyle, J., & Gmachl, C. F. (2014). Noninvasive in vivo glucose sensing on human subjects using mid-infrared light. {{Biomedical Optics Express, 5}}(7), 2397-2404. ", doi("10.1364/BOE.5.002397")]),
  ref(["Lux Research. (2026, 29 de enero). {{The innovator's guide to noninvasive glucose monitoring}} [Entrada de blog]. Lux Research. ", ["https://luxresearchinc.com/nl/blog/the-innovators-guide-to-noninvasive-glucose-monitoring/", "https://luxresearchinc.com/nl/blog/the-innovators-guide-to-noninvasive-glucose-monitoring/"]]),
  ref(["Mastrototaro, J. J., Yoon, R. K., & Keenan, D. B. (2014). {{Method and system for providing sensor redundancy}} (U.S. Patent No. 8,679,016 B2). U.S. Patent and Trademark Office. ", ["https://patents.google.com/patent/US8679016", "https://patents.google.com/patent/US8679016"]]),
  ref(["Poddar, R., Andrews, J. T., Shukla, P., & Sen, P. (2008). {{Non-invasive glucose monitoring techniques: A review and current trends}}. arXiv. ", ["https://arxiv.org/abs/0810.5755", "https://arxiv.org/abs/0810.5755"]]),
  ref(["Rebrin, K., Sheppard, N. F., Jr., & Steil, G. M. (2010). Use of subcutaneous interstitial fluid glucose to estimate blood glucose: Revisiting delay and sensor offset. {{Journal of Diabetes Science and Technology, 4}}(5), 1087-1098. ", doi("10.1177/193229681000400507")]),
  ref(["Ríos Elgueta, E. A. (2026a). {{Medidor no invasivo de biomarcadores}} [Documento de trabajo del autor, 16 de octubre de 2026]. Disponible a pedido."]),
  ref(["Ríos Elgueta, E. A. (2026b). {{simulacion-retraso-glucosa}} [Repositorio de código]. GitHub. ", [REPO, REPO]]),
  ref(["Rothenbühler, M., Lizoain, A., Rebeaud, F., Perotte, A., Stoffel, M., & DeVries, J. H. (2026). A prospective pilot study demonstrating noninvasive calibration-free glucose measurement. {{Journal of Diabetes Science and Technology, 20}}(3), 922-929. ", doi("10.1177/19322968251313811")]),
  ref(["Tang, L., Chang, S. J., Chen, C. J., & Liu, J. T. (2020). Non-invasive blood glucose monitoring technology: A review. {{Sensors, 20}}(23), 6925. ", doi("10.3390/s20236925")]),
  ref(["Uluç, N., Glasl, S., Gasparin, F., Yuan, T., He, H., Jüstel, D., Pleitez, M. A., & Ntziachristos, V. (2024). Non-invasive measurements of blood glucose levels by time-gating mid-infrared optoacoustic signals. {{Nature Metabolism, 6}}(4), 678-686. ", doi("10.1038/s42255-024-01016-9")]),
  ref(["Vrančić, C., Fomichova, A., Gretz, N., Herrmann, C., Neudecker, S., Pucci, A., & Petrich, W. (2011). Continuous glucose monitoring by means of mid-infrared transmission laser spectroscopy in vitro. {{Analyst, 136}}(6), 1192-1198. ", doi("10.1039/C0AN00537A")]),
  ref(["Whooley, S. (2023a, 26 de julio). {{Know Labs has more positive data for its non-invasive glucose monitor}}. Drug Delivery Business. ", ["https://www.drugdeliverybusiness.com/know-labs-more-positive-data-glucose-monitor/", "https://www.drugdeliverybusiness.com/know-labs-more-positive-data-glucose-monitor/"]]),
  ref(["Whooley, S. (2023b, 5 de mayo). {{Study supports feasibility of Know Labs non-invasive CGM}}. Drug Delivery Business. ", ["https://www.drugdeliverybusiness.com/study-feasibility-know-labs-non-invasive-cgm/", "https://www.drugdeliverybusiness.com/study-feasibility-know-labs-non-invasive-cgm/"]]),
  ref(["Whooley, S. (2024, 8 de marzo). {{Know Labs has positive accuracy data for non-invasive glucose monitor}}. Drug Delivery Business (publicado también en MassDevice). ", ["https://www.drugdeliverybusiness.com/know-labs-positive-accuracy-data-sensor/", "https://www.drugdeliverybusiness.com/know-labs-positive-accuracy-data-sensor/"]]),
];

// (j) Uso de inteligencia artificial
const usoIA = [
  H1("Uso de inteligencia artificial", false),
  P("Este proyecto usa asistentes de IA (Claude, de Anthropic) para apoyar el modelado matemático, el código y la redacción de este documento. Las fallas de ese trabajo asistido y cómo se detectaron se registran en el archivo `BITACORA_DE_AGENTES.md` del repositorio. El equipo revisa y responde por el contenido."),
];

// (k) Anexo A
const anexoA = [
  H1("Anexo A. El repositorio"),
  new Paragraph({ spacing: { after: 140 }, children: [new TextRun("Repositorio público: "), link(REPO_CORTO, REPO), new TextRun(". Código en Python con licencia MIT. Documentos y resultados con licencia CC BY 4.0. Las tareas viven en los issues de GitHub.")] }),
  ...figura("f04-flujo-codigo.png", "Recorrido de una corrida. Un solo comando lee la configuración, simula, estima, reconstruye, evalúa y escribe los resultados.", 600),
  ...tablaGrupos(["Archivo o carpeta", "Para qué sirve"], [
    ["Para leer", [
      ["`README.md` y `2-simulacion/README.md`", "La pregunta y el estado del proyecto, y los resultados y límites de la simulación. Empieza aquí"],
      ["`docs/guia-del-proyecto.pdf` y `.docx`", "Esta guía, para colegas y para la profesora"],
      ["`2-simulacion/docs/especificacion.md`", "El modelo y el estimador, con detalle para implementarlos"],
      ["`2-simulacion/docs/decisiones-de-implementacion.md`", "Lo que la especificación dejaba abierto, decidido antes de correr"],
      ["`2-simulacion/docs/barridos-de-mala-especificacion.md`", "Dónde se espera que se rompa el estimador"],
      ["`2-simulacion/informe/factibilidad.md`", "La estructura del informe, todavía sin rellenar"],
      ["`BITACORA_DE_AGENTES.md`", "En qué se equivocó el trabajo asistido por IA, con fechas"],
    ]],
    ["Para correr", [
      ["`2-simulacion/run_all.py`", "Punto de entrada, regenera todo"],
      ["`2-simulacion/escenarios.yaml`", "Los siete escenarios simulados"],
      ["`2-simulacion/umbrales.yaml`", "Criterios de aprobado y reprobado, registrados primero"],
      ["`2-simulacion/src/glucose_delay/`", "El modelo, el estimador y el filtro"],
      ["`2-simulacion/tests/`", "Pruebas automáticas"],
      ["`2-simulacion/docs/cifras-corrida-exploratoria.yaml`", "Cifras de la primera prueba, solo para compararlas"],
    ]],
    ["Lo genera el código, no se edita a mano", [
      ["`2-simulacion/results/`", "Resultados por escenario y resumen"],
      ["`2-simulacion/figures/`", "Figura del registro representativo"],
    ]],
  ], [3900, 5738]),
  H3("Cómo correrlo"),
  ...codigo([
    "# Descarga el repositorio a tu computador",
    "git clone https://github.com/Stenon5/simulacion-retraso-glucosa",
    "# Entra a la carpeta del proyecto",
    "cd simulacion-retraso-glucosa",
    "# Entra a la carpeta de la simulación",
    "cd 2-simulacion",
    "# Instala el paquete y sus herramientas de desarrollo (pytest y ruff)",
    "python -m pip install -e \".[dev]\"",
    "# Corre los siete escenarios con la semilla 1 y regenera 2-simulacion/results/ y 2-simulacion/figures/",
    "python run_all.py --seed 1",
    "# Corre las pruebas automáticas",
    "python -m pytest",
  ]),
  P("Todos los comandos se corren desde `2-simulacion/`, que trae su propio `pyproject.toml`. Con la semilla 1 la corrida reproduce las cifras de `2-simulacion/README.md`. Comprobado el 29 de octubre de 2026: las 16 pruebas automáticas pasan."),
  H3("Las reglas del juego"),
  P("El repositorio está diseñado para que sea difícil engañarse. Antes de proponer cualquier cambio conviene conocer estas reglas:"),
  B("**Umbrales fijados de antemano.** `2-simulacion/umbrales.yaml` quedó escrito antes que el código. No se edita después de ver un resultado. Una enmienda va en un archivo nuevo con su razón.", 0, 30),
  B("**El sesgo nunca va solo.** Siempre junto a la desviación estándar entre corridas, escenario por escenario.", 0, 30),
  B("**Conteos con su denominador.** Se escribe 37 de 40, no 92 %.", 0, 30),
  B("**Semillas fijas.** Cada cifra se puede rehacer con su semilla y su configuración.", 0, 30),
  B("**Una τ negativa es una falla, no un dato.** Y un caso casi singular se informa como no identificable.", 0, 30),
  B("**Decisiones antes de correr.** Lo que la especificación deja abierto se decide por escrito antes de ejecutar, y no se cambia al ver resultados.", 0, 30),
  B("**Un resultado negativo es un resultado.** Si el método exige un sensor que no existe, ese límite es el entregable.", 0, 30),
];

// (l) Anexo B
const anexoB = [
  H1("Anexo B. Cómo sumarte"),
  P("Una ruta sugerida para la primera semana. Es una propuesta de esta guía, no una regla del repositorio."),
  N("Lee el README y `2-simulacion/docs/especificacion.md`.", "ruta"),
  N("Clona el repositorio, entra a `2-simulacion/`, corre `python run_all.py --seed 1` y confirma que obtienes las mismas cifras.", "ruta"),
  N("Lee `2-simulacion/umbrales.yaml` y la bitácora para entender por qué las reglas son tan estrictas.", "ruta"),
  N("Elige un issue abierto. Los barridos de la fase 2 son independientes entre sí.", "ruta"),
  N("Abre tu trabajo con la plantilla que corresponde: Implementación, Afirmación de resultado o Barrido de mala especificación. Cada una trae sus criterios de aceptación.", "ruta"),
  ...recuadro("Tres cosas que no se hacen nunca", [
    "[[Editar umbrales.yaml después de ver un resultado.]]",
    "[[Publicar un sesgo sin su desviación estándar, o una cifra sin su escenario y su semilla.]]",
    "[[Afirmar algo sobre la exactitud en una persona o sobre un dispositivo.]]",
  ], ROJO_CLARO, ROJO),
];

// (m) Anexo C
const anexoC = [
  H1("Anexo C. Glosario"),
  P("Solo los términos que se usan con un sentido particular en este proyecto."),
  ...tabla(["Término", "Cómo se usa aquí"], [
    ["CGM", "Monitor continuo de glucosa con filamento bajo la piel. Es la referencia madura contra la que se compara todo"],
    ["MARD", "Error porcentual medio frente a la sangre. Menos es mejor"],
    ["Líquido intersticial", "El líquido entre las células. Casi todos los métodos lo miden a él, no a la sangre"],
    ["Constante de tiempo τ", "Cuánto tarda una profundidad en seguir a la sangre. Es el \"retraso\" que se estima"],
    ["Ley de Fick", "El flujo de un soluto a través de una barrera es proporcional a la diferencia de concentración. Explica por qué el tejido sigue a la sangre con retraso"],
    ["Compartimento", "Un volumen que se trata como si tuviera una sola concentración, como el líquido intersticial a una profundidad"],
    ["Trazabilidad fisiológica", "Poder nombrar el mecanismo del cuerpo que explica cada variable que mide un dispositivo"],
    ["Error en las variables", "Sesgo que aparece cuando los datos de entrada de una regresión también traen ruido. Empuja los retrasos hacia cero"],
    ["Filtro de Kalman", "Algoritmo que combina un modelo de cómo cambia algo con mediciones ruidosas, usando solo el pasado"],
    ["No identificable", "Caso en que los datos no alcanzan para separar τ1 de τ2. Se informa sin dar números"],
    ["Número de condición", "Qué tan cerca está el cálculo de volverse inestable. Alto es mala señal"],
    ["Línea base", "Lo que haría un aparato sin el método: una sola profundidad suavizada, o un retraso poblacional fijo"],
    ["RMSE", "Error típico de la glucosa reconstruida frente a la real, en mg/dL"],
    ["DE", "Desviación estándar entre las 40 réplicas de un escenario"],
    ["Semilla", "Número que fija el azar de una corrida para poder repetirla exacta"],
    ["Barrido de mala especificación", "Corrida que rompe a propósito un supuesto del modelo para ver dónde falla el método"],
    ["Circularidad", "Generar los datos con el mismo modelo que supone el estimador. Por eso esto verifica y no valida"],
    ["VPP (valor predictivo positivo)", "De cada 10 alarmas, cuántas son verdaderas"],
    ["Sensibilidad", "De cada 10 hipoglucemias, cuántas detecta la alarma"],
    ["Correlación de errores (ρ)", "Cuánto se equivocan dos sensores a la vez por la misma causa"],
    ["Fusión de decisiones", "Combinar las alarmas de varias vías con reglas como AND, OR o 2 de 3"],
    ["iCGM", "Categoría de la FDA para monitores que pueden conectarse a bombas de insulina, con exigencias de exactitud fijas"],
  ], [2700, 6938], { pad: 25 }).slice(0, -1),
];

// (n) Metodos con la metodologia dry lab al inicio, resultados con la parte B, referencias unidas
const metodos = [H1("2. Métodos"), ...dry.metodologia, ...metodosResto];
const resultadosTodo = [...resultados, ...resultadosB];
const anexoD = [H1("Anexo D. Cálculos paso a paso"), ...dry.anexo.slice(1)];

// Anexo E: el modulo compartido de propuestas. Se crea al final para que su figura sea la ultima de la guia completa.
const propuestasMod = require("./seccion-propuestas.js");
const propLarga = propuestasMod({ P, H2, B, nota, tabla, recuadro, figura, numeracion: { propuestas: (i) => `E.${i}`, opciones: (i) => `E.${3 + i}` } });
const anexoE = [H1("Anexo E. Propuestas en evaluación y opciones de cambio"), ...propLarga.propuestas, ...propLarga.opciones];

// ------------------------------------------------------------------ version resumen
// Se arma en el orden del documento para que las figuras queden numeradas sin saltos: f09, f14, f02, f07, f10, f12.
const registroFig = {};
if (RESUMEN) {
  // El modulo dry lab se corre con una "figura" que solo anota el pie, para reutilizar sus pies de f10 y f12 sin copiarlos.
  require("./seccion-dry-lab.js")({ P, H1, H2, H3, B, N, figura: (nombre, pie, ancho) => { registroFig[nombre] = [nombre, pie, ancho]; return []; }, tabla, recuadro, codigo, link, rich });
}
const base12R = baseFisiologica(figuraR);
const propR = propuestasMod({ P, H2, B, nota, tabla, recuadro, figura: figuraR, numeracion: { propuestas: (i) => `2.${i}`, opciones: (i) => `4.${i}` } });
const resumenMod = require("./seccion-resumen.js");
const resR = resumenMod({
  P, H2, B, nota, tabla, recuadro, rich, bloque, bloqueTitulo, T, figura: figuraR, recuadroReplicacion, ideasCortas: propR.ideasCortas,
  defFig: { f02: FIGDEF.f02, f07: FIGDEF.f07, f10: registroFig["f10-profundidades.png"] || [], f12: registroFig["f12-fusion.png"] || [] },
});
const portadaR = portadaDe({
  antetitulo: "PROPUESTAS EN EVALUACIÓN · DOCUMENTO DE TRABAJO",
  subtitulo: "Qué ideas estamos evaluando, qué hemos desarrollado y qué podríamos cambiar",
  antes: 900, tras: 450,
  avisos: [
    ...recuadro("Documento de trabajo", ["Documento de trabajo. Lo que sigue puede cambiar mucho con su retroalimentación: podríamos corregir, cambiar de rumbo o descartar parte o todo lo hecho."]),
    ...AVISO_NO_MEDICO,
  ],
  enlace: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun("La guía completa del equipo, con los cálculos paso a paso, está en el repositorio del proyecto: "), link(REPO_CORTO, REPO)] })],
});
const comoLeerR = [
  H1("Cómo leer este documento"),
  ...resR.comoLeer,
  new Paragraph({ spacing: { before: 60, after: 60 }, keepNext: true, children: [new TextRun({ text: "Índice", bold: true, size: 30, color: AZUL })] }),
  new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
  ...resR.siglas,
];

const normaRef = (r) => r.claveOrden.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "").slice(0, 90);
const vistas = new Map();
const duplicadas = [];
for (const r of [...refsPrincipales, ...dry.referencias]) {
  const k = normaRef(r);
  const u = r.urlOrden && r.urlOrden.includes("doi.org") ? r.urlOrden.toLowerCase() : null;
  if (vistas.has(k) || (u && vistas.has(u))) { duplicadas.push(r.claveOrden.slice(0, 60)); continue; }
  vistas.set(k, r);
  if (u) vistas.set(u, r);
}
const unicas = [...new Set(vistas.values())];
unicas.sort((a, b) => a.claveOrden.localeCompare(b.claveOrden, "es"));
console.log("referencias:", unicas.length, "duplicadas omitidas:", duplicadas.length, duplicadas);
const referencias = [H1("Referencias"), ...unicas];

// Referencias del resumen: solo las fuentes que cita, tomadas de la misma lista.
const refsUsadas = [];
for (const c of resR.claves) {
  const hallazgos = unicas.filter((r) => r.claveOrden.startsWith(c));
  if (!hallazgos.length) throw new Error("Referencia del resumen no encontrada: " + c);
  for (const r of hallazgos) if (!refsUsadas.includes(r)) refsUsadas.push(r);
}
refsUsadas.sort((a, b) => unicas.indexOf(a) - unicas.indexOf(b));
const referenciasR = [
  H1("Referencias principales", false),
  new Paragraph({ spacing: { after: 140 }, children: rich("La lista completa de fuentes está en la guía completa del repositorio.", { italics: true }) }),
  ...refsUsadas,
];
const retroR = [
  // La seccion 5 empieza en pagina nueva y sus siete preguntas, con su espacio, quedan en una sola pagina junto al recuadro general.
  H1("5. Preguntas para su retroalimentación"),
  resR.retroIntro,
  tablaRetro(resR.gruposRetro, true, 2),
  new Paragraph({ keepNext: true, spacing: { before: 0, after: 0, line: 120, lineRule: "exact" }, children: [new TextRun({ text: "", size: 4 })] }),
  ...comentariosGenerales(3),
];
const cuerpoResumen = [
  ...portadaR, ...comoLeerR,
  H1("En una página"), ...resR.unaPagina,
  H1("1. Contexto"), ...resR.contexto11, ...base12R,
  H1("2. Las propuestas que estamos barajando", false), ...propR.propuestas,
  H1("3. Lo que hemos desarrollado", false), ...resR.desarrollado,
  H1("4. Qué podría cambiar", false), ...propR.opciones,
  ...retroR, ...referenciasR, ...usoIA,
];

// ------------------------------------------------------------------ documento
const FIN = new Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: "exact" }, children: [new TextRun({ text: "", size: 2 })] });
const doc = new Document({
  creator: "Eddie Andrés Ríos Elgueta",
  title: RESUMEN ? "Medidor no invasivo de glucosa: propuestas en evaluación" : "Medidor no invasivo de glucosa: análisis de viabilidad y guía del proyecto",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: "1B1B1B" } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: AZUL, font: "Calibri" }, paragraph: { spacing: { before: 120, after: 240 }, outlineLevel: 0, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 29, bold: true, color: "1B1B1B", font: "Calibri" }, paragraph: { spacing: { before: 360, after: 140 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: AZUL, font: "Calibri" }, paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2, keepNext: true } },
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", run: { size: 21, bold: true }, paragraph: { spacing: { before: 0, after: 0 } } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", run: { size: 18 }, paragraph: { spacing: { after: 0, line: 204 }, indent: { left: 300 } } },
    ],
  },
  numbering: {
    config: [
      { reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 300 } } } }] },
      ...["numeros", "pasos", "ruta", "objetivos"].map((reference) => ({
        reference, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 360 } } } }],
      })),
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } }, titlePage: true },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: RESUMEN ? "Medidor no invasivo de glucosa · Propuestas en evaluación" : "Medidor no invasivo de glucosa · Análisis de viabilidad y guía del proyecto", size: 17, color: GRIS })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRIS })] })] }) },
    children: RESUMEN ? [...cuerpoResumen, FIN] : [...portada, ...comoLeer, ...unaPagina, ...introduccion, ...metodos, ...resultadosTodo, ...discusion, ...retro, ...referencias, ...usoIA, ...anexoA, ...anexoB, ...anexoC, ...anexoD, ...anexoE, FIN],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(SALIDA, buf);
  console.log("escrito:", SALIDA);
});
