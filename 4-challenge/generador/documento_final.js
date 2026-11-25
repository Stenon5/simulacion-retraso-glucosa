// Documento final del Challenge (una pagina). El texto se lee de ../02-documento-final.md, seccion "Borrador 1".
// Uso: DOCFINAL_SALIDA=<ruta del docx> node documento_final.js
// Ajustes por variable de entorno (todos opcionales): DOCFINAL_CUERPO (medios puntos, 20 = 10 pt), DOCFINAL_TABLA (19 = 9,5 pt),
// DOCFINAL_REF (18 = 9 pt), DOCFINAL_ESP (factor de espaciado, 1), DOCFINAL_LINEA (240 = 1,0), DOCFINAL_MARGEN (twips; 850 = 1,5 cm).
const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType,
} = require("docx");

const SALIDA_ARG = process.argv[2] || process.env.DOCFINAL_SALIDA;
if (!SALIDA_ARG) { console.error("Falta DOCFINAL_SALIDA con la ruta del docx."); process.exit(1); }
const SALIDA = path.resolve(SALIDA_ARG);
const num = (k, d) => Number(process.env[k] || d);
const C = num("DOCFINAL_CUERPO", 20);
const CT = num("DOCFINAL_TABLA", 19);
const REF = num("DOCFINAL_REF", 18);
const ESP = num("DOCFINAL_ESP", 1);
const LINEA = num("DOCFINAL_LINEA", 252);
const MARGEN = num("DOCFINAL_MARGEN", 1150);
const MARGEN_V = num("DOCFINAL_MARGEN_V", MARGEN);
const F = "Arial", AZUL = "1F4E79", GRIS = "404040";

const t = (text, o = {}) => new TextRun({ text, font: F, size: C, ...o });
// Mini marcado del .md: **negrita** y *cursiva*
function rich(str, base = {}) {
  const runs = []; let bold = false, ital = false, buf = "";
  const flush = () => { if (buf) { runs.push(t(buf, { ...base, ...(bold ? { bold: true } : {}), ...(ital ? { italics: true } : {}) })); buf = ""; } };
  for (let i = 0; i < str.length; i++) {
    if (str.startsWith("**", i)) { flush(); bold = !bold; i++; }
    else if (str[i] === "*") { flush(); ital = !ital; }
    else buf += str[i];
  }
  flush();
  return runs;
}

// ---- Lectura del .md
const md = fs.readFileSync(path.join(__dirname, "..", "02-documento-final.md"), "utf8").replace(/\r\n/g, "\n");
const ini = md.indexOf("## Borrador 1");
const lineas = md.slice(ini).split("\n").slice(1);
const bloques = []; // {tipo, texto}
let tabla = null;
for (const l of lineas) {
  if (l.startsWith("|")) {
    const celdas = l.split("|").slice(1, -1).map((x) => x.trim());
    if (celdas.every((c) => /^-+$/.test(c))) continue;
    (tabla = tabla || { tipo: "tabla", filas: [] }).filas.push(celdas);
    continue;
  }
  if (tabla) { bloques.push(tabla); tabla = null; }
  if (!l.trim()) continue;
  if (l.startsWith("### ")) bloques.push({ tipo: "titulo", texto: l.slice(4) });
  else if (l.startsWith("- ")) bloques.push({ tipo: "vineta", texto: l.slice(2) });
  else bloques.push({ tipo: "parrafo", texto: l });
}
if (tabla) bloques.push(tabla);

const par = (children, o = {}) => new Paragraph({ children, spacing: { after: Math.round(70 * ESP), line: LINEA }, alignment: AlignmentType.JUSTIFIED, ...o });
const titulo = (text) => new Paragraph({ keepNext: true, spacing: { before: Math.round(90 * ESP), after: Math.round(50 * ESP) }, children: [t(text, { bold: true, color: AZUL, size: C + 2 })] });
const vineta = (children) => new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: Math.round(50 * ESP), line: LINEA }, alignment: AlignmentType.JUSTIFIED, children });
const ref = (children) => new Paragraph({ spacing: { after: 20, line: LINEA }, indent: { left: 300, hanging: 300 }, alignment: AlignmentType.LEFT, children });

const ANCHO = 12240 - 2 * MARGEN;
const COLS = [600, 1700, ANCHO - 2300];
const celda = (texto, ancho, o = {}, fondo) => new TableCell({
  width: { size: ancho, type: WidthType.DXA },
  shading: fondo ? { type: ShadingType.CLEAR, color: "auto", fill: fondo } : undefined,
  margins: { top: Math.round(30 * ESP), bottom: Math.round(30 * ESP), left: 80, right: 80 },
  children: [new Paragraph({ spacing: { after: 0, line: LINEA }, children: [t(texto, { size: CT, ...o })] })],
});
const construirTabla = (filas) => new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: COLS,
  rows: filas.map((f, i) => new TableRow({ tableHeader: i === 0, children: f.map((x, j) =>
    i === 0 ? celda(x, COLS[j], { bold: true, color: AZUL }, "E7F1FB")
      : celda(x, COLS[j], j === 1 ? { bold: true, color: AZUL } : {}, j === 1 ? "E7F1FB" : undefined)) })) });

// ---- Construccion
const hijos = [];
let enRefs = false;
for (const b of bloques) {
  if (b.tipo === "parrafo" && b.texto.startsWith("**Encabezado.**") && hijos.length === 0) {
    const cuerpo = b.texto.replace("**Encabezado.** ", "");
    const iFis = cuerpo.indexOf(". Fisiología");
    const iInt = cuerpo.indexOf(" Integrantes: ");
    const tit = cuerpo.slice(0, iFis);
    const l2 = cuerpo.slice(iFis + 2, iInt).replace(/\.$/, "");
    const l3 = cuerpo.slice(iInt + 1).replace(/\.$/, "");
    hijos.push(
      new Paragraph({ spacing: { after: 20 }, children: [t(tit, { bold: true, size: C + 7, color: AZUL })] }),
      new Paragraph({ spacing: { after: 0 }, children: [t(l2, { size: C - 3, color: GRIS })] }),
      new Paragraph({ spacing: { after: Math.round(110 * ESP) }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AZUL, space: 4 } },
        children: [t(l3, { size: C - 3, color: GRIS })] }),
    );
  } else if (b.tipo === "parrafo" && hijos.length === 0) continue; // texto previo al encabezado (nota de fuente)
  else if (b.tipo === "titulo") { enRefs = b.texto === "Referencias"; hijos.push(titulo(b.texto)); }
  else if (b.tipo === "vineta") hijos.push(vineta(rich(b.texto)));
  else if (b.tipo === "tabla") hijos.push(construirTabla(b.filas), new Paragraph({ spacing: { after: 0, line: 60 }, children: [] }));
  else if (b.tipo === "parrafo") hijos.push(enRefs ? ref(rich(b.texto, { size: REF })) : par(rich(b.texto)));
}

const doc = new Document({
  creator: "Eddie Andrés Ríos Elgueta",
  title: "Challenge de Ingeniería Biomédica · Documento final (borrador 1)",
  styles: { default: { document: { run: { font: F, size: C } } } },
  numbering: { config: [{ reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 280, hanging: 200 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: MARGEN_V, bottom: MARGEN_V, left: MARGEN, right: MARGEN } } }, children: hijos }],
});
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(SALIDA, buf); console.log("escrito", SALIDA); });
