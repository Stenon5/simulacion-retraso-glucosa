// Textos propios del resumen para la profesora (node construir-docx.js --resumen).
// Lo que se repite con la guia completa no se escribe aqui: llega por los ayudantes (figuras, recuadro de la replicacion,
// ideas del modulo compartido) o por el codigo de construir-docx.js. Las cifras salen de la guia completa
// o de 3-analisis-de-viabilidad/resultados-calculos.json del repo.
// Uso: const seccion = require("./seccion-resumen.js")(helpers). Los H1 los pone construir-docx.js.
const fs = require("fs");
const path = require("path");
const { Paragraph } = require("docx");

const CALC = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "3-analisis-de-viabilidad", "resultados-calculos.json"), "utf8"));
const f = (x, d = 1) => Number(x).toFixed(d).replace(".", ",");
const pc = (x, d = 0) => `${f(100 * x, d)} %`;

module.exports = (h) => {
  const { P, H2, B, nota, tabla, recuadro, rich, bloque, bloqueTitulo, T, figura, defFig, recuadroReplicacion, ideasCortas } = h;
  const A = CALC.a_difusion;
  const Bf = CALC.b_fusion;
  const F = CALC.f_rango;
  const G = Bf.gls["Raman 14,5 / IR medio 20 / tercera 25"];
  const oido = CALC.d_alarmas.versiones["con EEG en el oido"];
  const O13 = "Via optica sigma 13 (error lento)";
  const vppDiseno = oido.find((x) => x.nombre === `${O13} Y EEG en el oido (hipotetico) (dependencia 0,3)`).vpp; // 57 %
  const vppEsperado = F.alarma_nocturna.esperado.vpp; // 54 %
  const sep = f(A.mejor_separacion_min, 1); // 7,2
  const mard03 = f(G["0.3"].mard_fusionado, 1); // 13,0
  const mard05 = f(G["0.5"].mard_fusionado, 1); // 14,0

  const fig = (def, ancho) => (def.length ? figura(def[0], def[1], ancho) : []);

  // Vineta compacta para la pagina "En una pagina"
  const vineta = (s) => new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 30, line: 264 }, children: rich(s, { size: T }) });
  const linea = (s) => new Paragraph({ spacing: { after: 20, line: 264 }, indent: { left: 340, hanging: 340 }, children: rich(s, { size: T }) });

  // ------------------------------------------------------------------ pagina 2
  const comoLeer = [
    ...recuadro(null, [
      new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 90, line: 290 }, children: rich("**En una página** está todo lo esencial, para una lectura de cinco minutos.") }),
      new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 90, line: 290 }, children: rich("**La sección 2** muestra las propuestas que estamos barajando y **la 3** lo que ya hemos hecho. Hay que leerlas como un borrador.") }),
      new Paragraph({ numbering: { reference: "vinetas", level: 0 }, spacing: { after: 40, line: 290 }, children: rich("**La sección 4** plantea las opciones si hay que cambiar de rumbo y **la 5** trae las preguntas para su retroalimentación.") }),
    ]),
  ];
  const siglas = [
    nota("Siglas. **CGM**: monitor continuo de glucosa con un filamento bajo la piel. **MARD**: error porcentual medio frente a la sangre, mientras más bajo mejor. **VPP**: valor predictivo positivo, o sea de cada 100 alarmas cuántas son verdaderas. **EEG**: actividad eléctrica del cerebro. **Análisis de viabilidad**: trabajo solo con papel, literatura y cálculo, también llamado «dry lab»."),
  ];

  // ------------------------------------------------------------------ en una pagina
  const unaPagina = [
    bloqueTitulo("El problema"),
    bloque("Según el Atlas de Diabetes de la Federación Internacional de Diabetes (IDF), en 2017 había unos 451 millones de adultos con diabetes en el mundo, y podrían llegar a 693 millones en 2045 (Cho et al., 2018). Los monitores continuos miden el líquido intersticial con un filamento bajo la piel, y ese líquido va atrasado respecto de la sangre, así que la alarma de una hipoglucemia puede llegar tarde."),
    bloqueTitulo("La meta"),
    bloque("La idea central del equipo, **decidida**, es superar a GlucoWatch, el primer monitor no invasivo aprobado por la FDA, mezclando biomarcadores distintos."),
    bloqueTitulo("Las ideas en evaluación"),
    ...ideasCortas.map(([n, nombre, estado]) => linea(`**${n}.** ${nombre}. ${estado}`)),
    bloqueTitulo("Lo que hemos hecho"),
    vineta("Un seminario del ramo y un documento de trabajo del 16 de octubre, con estado del arte, ranking y siete ideas."),
    vineta("Un repositorio con la simulación de la tomografía del retraso y criterios registrados antes del código."),
    vineta("Criterios de decisión y un análisis de viabilidad con 196 hallazgos con fuente y un veredicto."),
    vineta("Una guía completa del equipo, con los cálculos paso a paso."),
    bloqueTitulo("Lo que encontramos"),
    vineta(`[[La separación de retraso entre capas de piel va de 0,25 a ${sep} min, y se necesitan 9 min.]]`),
    vineta(`[[Mezclar valores de varios sensores da un MARD de 13 a 14 % y se pedía 12 % o menos. La alarma combinada con EEG del oído tiene un VPP de ${pc(vppEsperado)} a ${pc(vppDiseno)}, bajo el 70 % pedido.]] Esa cifra supone un error lento del sensor (σ de 18 y de 13 mg/dL, AR(1) de 60 min, sin estudio que lo mida). Con ruido blanco el VPP sería 100 %.`),
    vineta("[[GlucoTrack y Biovotion, que sí combinaron técnicas, no superaron a su mejor componente.]]"),
    bloqueTitulo("Qué necesitamos de usted"),
    bloque("Su opinión para elegir entre las opciones de la sección 4."),
  ];

  // ------------------------------------------------------------------ 1.1
  const contexto11 = [
    H2("1.1 El problema y la meta"),
    P("Según el Atlas de Diabetes de la Federación Internacional de Diabetes (IDF), en 2017 había unos 451 millones de adultos con diabetes en el mundo, y podrían llegar a 693 millones en 2045 (Cho et al., 2018). Los monitores continuos de glucosa (CGM) que se usan hoy funcionan con un filamento bajo la piel. Funcionan bien, pero implican una aguja. Medir lo mismo solo con luz, ondas o corriente sobre la piel intacta es físicamente posible, pero la señal es diminuta."),
    P("La exactitud se resume con el **MARD**, el error porcentual medio frente a la sangre. Mientras más bajo, mejor. Los dispositivos con aguja o mínimamente invasivos están entre 4 % y 9 %, y los prototipos no invasivos entre 15 % y 25 % (Lux Research, 2026)."),
    P("Casi todos los métodos miden el **líquido intersticial** y no la sangre, y la glucosa tarda en llegar hasta ahí. Una revisión no encontró evidencia de un retraso fisiológico mayor a 5 a 10 minutos (Rebrin et al., 2010), pero una patente sobre sensores recoge retrasos de 0 a 30 minutos (Mastrototaro et al., 2014). En una hipoglucemia, una alarma atrasada llega cuando la persona ya está mal."),
    P("**La meta.** GlucoWatch fue el primer monitor no invasivo aprobado por la FDA. La meta del equipo, **decidida**, es superarlo justo en lo que lo hizo fracasar, mezclando biomarcadores distintos. Estas fueron sus fallas:", { keepNext: true }),
    ...tabla(["Falla de GlucoWatch", "Cifra"], [
      ["Falsas alarmas", "62 % de falsos positivos y VPP de 38 % en el estudio (Tsalikian et al., 2004b)"],
      ["Retraso", "Unos 20 min (Poddar et al., 2008)"],
      ["Calibración con pinchazo", "Una calibración capilar (Tsalikian et al., 2004a)"],
      ["Irritación de la piel", "76 % abandonó por irritación en el ensayo en niños (Chase et al., 2005)"],
    ], [2900, 6738]),
  ];

  // ------------------------------------------------------------------ 3. Lo que hemos desarrollado
  const lineaTiempo = [
    H2("3.1 Línea de tiempo"),
    ...tabla(["Fecha", "Qué hicimos", "Resultado"], [
      ["Sin fecha", "Seminario 1 del ramo sobre Tang et al. (2020)", "Quedó planteada la pregunta que guía el proyecto: reducir el retardo del sensor o corregirlo con un modelo"],
      ["16 de octubre de 2026", "Documento de trabajo con estado del arte, ranking, siete ideas y un prototipo exploratorio de la idea 2", "El prototipo informó un requisito de ruido de 2 a 3 mg/dL. Sus scripts se perdieron"],
      ["22 de octubre de 2026", "Repositorio con la especificación y los criterios registrados antes del código", "Cinco criterios para aceptar o rechazar el método, fijados de antemano"],
      ["23 de octubre de 2026", "Replicación en simulación, con 7 escenarios y 40 réplicas", "[[No reprodujo las cifras exploratorias]]. El requisito de ruido salió en 5,9 mg/dL"],
      ["29 de octubre de 2026", "Criterios de decisión, investigación con 196 datos con fuente, análisis de viabilidad con veredicto, guía completa y este resumen", "[[Veredicto negativo para el diseño propuesto]]. Surgió una Propuesta, anclar la alarma en un CGM"],
    ], [1900, 4200, 3538], { size: 18, pad: 50 }),
  ];

  const simulacion = [
    H2("3.2 La simulación de la tomografía del retraso"),
    P("La tomografía del retraso estima cuánto se atrasa cada lectura respecto de la sangre sin sacar una gota. Dos lecturas de glucosa a distinta profundidad siguen a la sangre con retrasos distintos, y como se conoce el modelo de difusión, esa diferencia permite estimar cada retraso. Con los retrasos estimados, un filtro de Kalman reconstruye la glucosa en sangre usando solo datos pasados."),
    ...fig(defFig.f02, 560),
    P("Se simularon siete escenarios, con 40 réplicas de un registro de 8 horas y una lectura por minuto. Las cifras clave:", { keepNext: true }),
    B("La diferencia entre los dos retrasos se recupera bien: 9,08 ± 0,40 min frente a 9 reales, con ruido de 2 mg/dL."),
    B("[[El nivel de cada retraso por separado se recupera mal cuando sube el ruido, y en la persona rápida fallaron 16 de 40 corridas.]]"),
    B("La alarma suena entre 5,2 y 14,8 minutos antes que con una sola profundidad, según el escenario, pero [[con ruido de 8 mg/dL aparecieron 2 falsas alarmas en 37 corridas]]."),
    B("[[En la persona típica, el método supera a una sola profundidad solo con menos de unos 5,9 mg/dL de ruido por lectura.]] Un montaje de infrarrojo medio logró 4 mg/dL, pero in vitro (Vrančić et al., 2011)."),
    ...fig(defFig.f07, 560),
    ...recuadroReplicacion(),
  ];

  const dryLab = [
    H2("3.3 El análisis de viabilidad"),
    P("El método, en cuatro frases:", { keepNext: true }),
    B("Es un trabajo solo con papel, literatura y cálculo. No construimos aparatos ni medimos personas."),
    B("Reunimos 196 hallazgos con fuente y los ordenamos por peso, desde normas y estudios en personas hasta datos de empresas y de prensa."),
    B("Los criterios de decisión se escribieron el 29 de octubre de 2026, antes de reunir los datos, y no se editan después de ver resultados."),
    B("Con ellos calculamos límites físicos, fusión de valores y de alarmas, y comparamos con los CGM actuales."),
    P("[[Un análisis en papel verifica cálculos, no un cuerpo. No demuestra que un aparato funcione sobre la piel.]]"),
    P("**Hallazgos clave.**", { keepNext: true }),
    B(`**Profundidad.** La luz infrarroja media llega a unos 45 µm (Kottmann et al., 2016). La separación de retraso entre capas llega a ${sep} min en el mejor caso, y [[se pedían 9 min o más]].`),
    ...fig(defFig.f10, 640),
    B(`**Fusión de valores.** Los errores de sensores parecidos se repiten, y eso deja un piso. [[Con ρ = 0,3 la mejor combinación da ${mard03} % de MARD y con la correlación medida de ${f(Bf.rho_estimado.todos_los_dias, 2)} da ${mard05} %, y se pedía 12 % o menos.]] El dato medido viene de dos electrodos de un mismo CGM (Sharifi et al., 2016).`),
    ...fig(defFig.f12, 600),
    B(`**Alarma nocturna.** [[Con EEG del oído y dependencia de 0,3 entre las vías, el VPP queda en ${pc(vppEsperado)} a ${pc(vppDiseno)}, bajo el 70 % pedido.]] Esa cifra supone un error lento del sensor (σ de 18 y de 13 mg/dL, AR(1) de 60 min, sin estudio que lo mida). Con ruido blanco el VPP sería 100 %.`),
    B("**Intentos reales.** [[GlucoTrack, con una diferencia relativa absoluta media de 22,3 %, y Biovotion, con un MARD de 21,1 % en el modelo global y 35,4 % en casa, no superaron a su mejor componente]] (Bahartan et al., 2017, Caduff et al., 2015, Zanon et al., 2018)."),
    B("**Raman.** Tiene la mejor cifra sin calibrar por persona, 14,5 % y 14,6 %, pero es de escritorio (Rothenbühler et al., 2026, Zhang et al., 2025)."),
    B("**Mercado.** Hay CGM de venta libre desde USD 54 por 2 semanas (Abbott, s. f.). Un no invasivo con MARD de 15 % o más no ofrece algo que ellos no ofrezcan, salvo no tener aguja."),
    P("**El veredicto, regla por regla.** Los criterios se fijaron antes de ver los datos.", { keepNext: true }),
    ...tabla(["Regla", "Resultado", "Por qué"], [
      ["0. Mejor que GlucoWatch", "[[No pasa]]", `VPP de ${pc(vppDiseno)} con el diseño propuesto y dependencia 0,3, bajo 70 %`],
      ["1. Evidencia por biomarcador", "[[No pasa]]", "Infrarrojo medio con MARD de 19,6 y 20,7 %, y EEG del oído con 5 personas"],
      ["2. Fusión de valores", "[[No pasa]]", `MARD de ${mard03} % con ρ = 0,3, sobre 12 %`],
      ["3. Alarma multibiomarcador", "[[No pasa]]", `VPP de ${pc(vppDiseno)} con EEG del oído y dependencia 0,3`],
      ["4. Premisa de dos profundidades", "[[No pasa]]", `Mejor caso de ${sep} min, y se pedían 9 min`],
      ["5. Práctica", "[[No pasa]]", "Ninguna versión portátil para dormir sin calibración diaria"],
      ["6. Sentido de mercado", "[[No pasa]]", "CGM de venta libre desde USD 54 por 2 semanas"],
    ], [3000, 1300, 5338], { size: 18, pad: 45, juntas: true }),
    ...recuadro("Las dos respuestas", [
      "**¿Supera a GlucoWatch?** [[No.]] Tal como se propuso, con infrarrojo medio y un audífono con EEG, no lo supera en lo que decidió el equipo. No es condicional, porque lo que falla es la física de las capas y el hardware portátil.",
      "**¿Tiene sentido frente al mercado actual?** [[No hoy.]] Nadie ha demostrado todavía un equipo portátil para uso nocturno, y un CGM de venta libre ya existe.",
    ], "FBE7E4", "C0392B"),
  ];

  const desarrollado = [...lineaTiempo, ...simulacion, ...dryLab];

  // ------------------------------------------------------------------ 5. Preguntas
  const retroIntro = P("Para que su revisión sea cómoda, estas son las preguntas en que más nos ayudaría su opinión. Están ordenadas según los criterios del curso. Puede responder en la columna de la derecha.", { keepNext: true });
  const gruposRetro = [
    ["Criterio: elección de línea", [
      "De las opciones A, B, C y D de la sección 4, ¿cuál le parece con más sentido para el ramo, o propondría otra?",
      "¿Cumpliría el objetivo del ramo un resultado negativo bien fundamentado, como el veredicto del análisis?",
    ]],
    ["Criterio: pertinencia fisiológica y anatómica", [
      "¿Está bien planteado el paso de la glucosa del capilar al líquido intersticial con la ley de Fick y un compartimento de primer orden?",
      "¿Tiene sustento fisiológico suficiente buscar la reacción del cerebro a la hipoglucemia con EEG, o deberíamos dejar esa vía?",
    ]],
    ["Criterio: solución de ingeniería y evidencia", [
      "¿Le parecen razonables los criterios con que juzgamos las ideas, como los 9 minutos de separación y el 70 % de alarmas verdaderas, o los cambiaría?",
      "¿Hay alguna idea de la tabla que descartaría de inmediato o que deberíamos mirar con más atención?",
    ]],
    ["Criterio: claridad", [
      "¿Qué parte de este documento quedó confusa o sobra?",
    ]],
  ];

  // Fuentes citadas en el resumen. Cada prefijo se busca en la lista de referencias de la guia completa.
  const claves = [
    "Abbott. (s. f.)", "Aboukhalil", "Ahmad, K.", "Bahartan", "Betts", "Blaabjerg", "Braig", "Cabrera", "Caduff, A., Zanon",
    "Cameron", "Chase", "Cho, N. H.", "Facchinetti, A., Del Favero", "Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026b", "Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026c", "Fisiología y Anatomía Humana, Universidad Tecnológica Metropolitana. (2026d", "Garg", "Kottmann, J., Rey, J. M., & Sigrist",
    "Kubaščík", "Liakat", "Lundsgaard", "Lux Research", "Mastrototaro", "Mendez", "Poddar", "Prlić", "Rebrin", "Ríos Elgueta, E. A. (2026a",
    "Ríos Elgueta, E. A. (2026b", "Rothenbühler", "Sandby", "Sharifi", "Snogdal", "Tang, L.", "Tsalikian, E., Beck", "Tsalikian, E., Kollman",
    "Uluç", "Vrančić", "Zanon", "Zhang, Y., Zhang, L., Wang, L., Shao",
  ];

  return { comoLeer, siglas, unaPagina, contexto11, desarrollado, retroIntro, gruposRetro, claves };
};
