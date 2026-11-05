// Propuestas en evaluacion y opciones si hay que cambiar de rumbo.
// Lo usan la guia completa (Anexo E) y el resumen para la profesora, para que el texto viva en un solo lugar.
// Uso: const seccion = require("./seccion-propuestas.js")(helpers) donde
// helpers = { P, H2, B, nota, tabla, recuadro, figura, numeracion }.
// numeracion.propuestas(i) e numeracion.opciones(i) devuelven el rotulo de cada H2, por ejemplo "2.1" o "E.1".
// Devuelve { propuestas, opciones, ideasCortas }. Los H1 los pone construir-docx.js.
// Las cifras de las ideas 1, 5, 6 y 7 vienen del documento de trabajo del 16 de octubre de 2026 (Rios Elgueta, 2026a).
// Las demas cifras ya estan en la guia completa o en 3-analisis-de-viabilidad/resultados-calculos.json.
const ROJO = "C0392B";
const ROJO_CLARO = "FBE7E4";

module.exports = (h) => {
  const { P, H2, B, nota, tabla, recuadro, figura, numeracion } = h;
  const num = numeracion;

  // N, Idea, Base fisiologica o fisica, Que existe, Riesgo principal, Ranking del 16 de octubre, Estado hoy
  const IDEAS = [
    ["1", "Infrarrojo medio con doble filtro: profundidad y latido, con razón entre longitudes de onda como un oxímetro",
      "Absorción de la glucosa en la sangre que llega con cada latido",
      "Sincronía cardíaca en infrarrojo medio (patente US 5313941). Selección de profundidad DIROS, solo en ratones (Uluç et al., 2024)",
      "La parte pulsátil es cerca del 1 % de la señal (patente US 5515847) y el infrarrojo medio penetra unos 45 µm",
      "1°, mayor techo",
      "Solo idea. [[La física de penetración es desfavorable]]"],
    ["2", "Tomografía del retraso: dos profundidades ópticas para estimar el retraso sin sangre",
      "Difusión de la glucosa del capilar al intersticio (ley de Fick), una constante de tiempo por capa",
      "Dos sensores de aguja a distinta profundidad (patente US 12102429), invasivo",
      "Exige un sensor con menos de unos 5,9 mg/dL de ruido por lectura (simulación)",
      "2°, prototipada",
      "Desarrollada en el repositorio. [[No viable como está: la separación de retraso entre capas alcanzables es de 0,25 a 7,2 min, bajo los 9 min que necesita, y el líquido dérmico ya tiene 0 a 2 min de retraso (dato de empresa, Ahmad et al., 2025)]]"],
    ["3", "Asimilación de datos: modelo fisiológico más sensor no invasivo con filtro de Kalman",
      "La glicemia cambia de forma continua y regulada, así que un modelo ayuda a filtrar ruido",
      "Kalman en CGM comerciales con mejora de MARD de 9,72 a 9,66 % (patente US 10349872). Detección de fallas por innovaciones en simulación (Facchinetti et al., 2013)",
      "Si el sensor no informa, el modelo solo dibuja una curva plausible, y no corrige sesgos comunes del sensor (Cameron et al., 2012)",
      "3°, multiplicador",
      "En parte desarrollada: el filtro de Kalman del repositorio. Sirve como herramienta, no como solución"],
    ["4", "Audífono nocturno: medir cómo reacciona el cerebro a la hipoglucemia (EEG en el oído, pulso, temperatura del tímpano e infrarrojo medio)",
      "La falta de glucosa altera la actividad eléctrica del cerebro y no depende del sudor",
      "EEG en el oído: 5 sujetos, los canales con ambos electrodos en el mismo oído no superaron el azar y los de referencia en el otro lado lograron sensibilidad de 90 % o más (preprint). EEG subcutáneo detrás de la oreja: 9 de 10 hipoglucemias detectadas durmiendo y 0,2 falsas detecciones por semana de noche",
      "Señal débil sin electrodos en el cuero cabelludo",
      "4°, nicho valioso",
      "Analizada en el análisis de viabilidad. [[Con EEG del oído la alarma combinada acierta 54 a 57 de cada 100 veces, bajo el 70 % pedido]], con un error lento supuesto (con ruido blanco serían 100). Solo pasa en papel con EEG subcutáneo, que no es no invasivo"],
    ["5", "Peine de frecuencias dual en infrarrojo medio",
      "La misma absorción de la glucosa, leída con un peine de frecuencias",
      "Láser de cascada cuántica en la palma, 84 % clínicamente exacto en 3 sujetos (Liakat et al.). Lectura de infrarrojo medio con detectores de infrarrojo cercano (Liu et al.)",
      "Costo y tamaño",
      "5°, habilitador de hardware",
      "Solo idea. No analizada en este análisis de viabilidad"],
    ["6", "Quiralidad: la glucosa absorbe distinto la luz circular izquierda y la derecha, el agua no",
      "Actividad óptica de la molécula de glucosa",
      "Detectado in vitro con sobretonos (arXiv 1601.06143). Se propuso leerlo por ultrasonido (Yakovlev et al.)",
      "Diferencia del orden de 10⁻⁶, y el colágeno también es quiral",
      "6°",
      "Solo idea. No analizada en este análisis de viabilidad"],
    ["7", "Aquafotómica: la red de agua como amplificador de la glucosa",
      "La glucosa cambia cómo se ordena el agua a su alrededor",
      "Clasifica diabetes en suero con 97,22 % (Li et al.), pero es diagnóstico, no glucosa continua",
      "La temperatura y cualquier soluto cambian la red de agua",
      "7°",
      "Solo idea. No analizada en este análisis de viabilidad"],
    ["8", "Anclar la alarma en un CGM y sumarle biomarcadores no invasivos (**Propuesta** surgida del análisis de viabilidad)",
      "El CGM mide la glucosa del intersticio con un filamento. El EEG, el pulso y el sudor miden la reacción del cuerpo, que sirve para confirmar alarmas y detectar fallas del sensor",
      "Dos electrodos redundantes bajaron el MARD de 11,4 y 12,0 % a 10,1 %. En UCI una segunda señal suprimió 59,7 % de las falsas alarmas. Un reloj tiene VPP de 17 a 25 %",
      "Poco margen, porque un Dexcom G7 acierta 85 de cada 100 alarmas en el caso optimista (estudio patrocinado por Dexcom, Garg et al., 2022), y deja de ser no invasivo",
      "No estaba",
      "Propuesta sin desarrollar. Primer paso barato: medir con datos pareados que ya existen cuánto coinciden las falsas alarmas de un CGM y de un reloj"],
  ];

  // Una linea por idea para la pagina de resumen: [n, nombre corto, estado]
  const ideasCortas = [
    ["1", "Infrarrojo medio con doble filtro", "Solo idea. [[La física de penetración es desfavorable]]"],
    ["2", "Tomografía del retraso", "Desarrollada en el repositorio. [[No viable como está]]"],
    ["3", "Asimilación de datos con filtro de Kalman", "En parte desarrollada. Sirve como herramienta, no como solución"],
    ["4", "Audífono nocturno con EEG en el oído", "Analizada en el análisis de viabilidad. [[Con EEG del oído no llega al 70 % pedido]]"],
    ["5", "Peine de frecuencias dual en infrarrojo medio", "Solo idea. No analizada en este análisis de viabilidad"],
    ["6", "Quiralidad", "Solo idea. No analizada en este análisis de viabilidad"],
    ["7", "Aquafotómica", "Solo idea. No analizada en este análisis de viabilidad"],
    ["8", "Anclar la alarma en un CGM", "**Propuesta** sin desarrollar"],
  ];

  const piePropuestas = "Mapa de las ocho ideas. Más a la derecha hay más evidencia en personas. Más arriba hemos desarrollado más. Rojo: el análisis de viabilidad las dejó no viables como están. Gris: no analizadas a fondo. Azul: herramienta útil. Azul con borde punteado: Propuesta. La ubicación es aproximada según el análisis de viabilidad.";

  const propuestas = [
    H2(`${num.propuestas(1)} Las ocho ideas`),
    P("La idea central del equipo, **decidida**, es mezclar biomarcadores distintos para superar a GlucoWatch. Estas son las ideas que se barajan para lograrlo: siete del documento de trabajo del 16 de octubre de 2026 y una que surgió del análisis de viabilidad. **Ninguna está decidida.** Todo lo que se propone y no se ha decidido lleva el rótulo Propuesta."),
    ...tabla(["N", "Idea", "Base fisiológica o física", "Qué existe", "Riesgo principal", "Ranking del 16 de octubre", "Estado hoy"],
      IDEAS, [380, 1750, 1450, 1900, 1450, 850, 1858], { size: 16, pad: 45, padX: 70, juntas: false }),
    nota("Las cifras de las ideas 1, 5, 6 y 7 vienen del documento de trabajo del 16 de octubre de 2026 (Ríos Elgueta, 2026a), que también aporta las patentes US 5313941, US 12102429 y US 10349872, el preprint arXiv 1601.06143 y los artículos de Liu et al., Yakovlev et al. y Li et al. Esas fuentes se tomaron de ese documento y no tienen entrada propia en Referencias principales. La cifra de ruido de la idea 2 es de la simulación del repositorio (Ríos Elgueta, 2026b). Otras fuentes: idea 1, Braig et al. (1996) y Kottmann et al. (2016). Idea 4, Snogdal et al. (2012), Blaabjerg et al. (2019) y el análisis de viabilidad. Idea 5, Liakat et al. (2014). Idea 8, Sharifi et al. (2016), Aboukhalil et al. (2008), Mendez et al. (2026) y Garg et al. (2022). VPP es el valor predictivo positivo, o sea de cada 100 alarmas cuántas son verdaderas."),
    H2(`${num.propuestas(2)} Mapa de lo que sabemos y de lo que hemos desarrollado`),
    ...figura("f14-mapa-propuestas.png", piePropuestas, 640),
    H2(`${num.propuestas(3)} Cinco de las ideas en palabras simples`),
    P("**Idea 1. Infrarrojo medio con doble filtro.** La glucosa absorbe luz infrarroja media de una forma que la distingue de otras moléculas. La idea es usar dos filtros. Uno elige a qué profundidad se mira y el otro se sincroniza con el latido, para quedarse con la sangre que llega en cada latido. Como en un oxímetro, se compararían dos longitudes de onda. Es la idea de mayor techo del ranking del 16 de octubre. Pero esa parte pulsátil es cerca del 1 % de la señal y la luz llega a unos 45 µm. [[Hoy la física de penetración es desfavorable.]]"),
    P("**Idea 2. Tomografía del retraso.** El líquido entre las células sigue a la sangre con atraso. Si dos lecturas a distinta profundidad tienen atrasos distintos, la diferencia permite estimar cada atraso sin sacar sangre y reconstruir la glucosa en sangre. Es la que desarrollamos en el repositorio, en simulación. En la persona típica solo supera a una sola profundidad si el sensor tiene menos de unos 5,9 mg/dL de ruido por lectura. [[Como está planteada no es viable: las capas alcanzables se separan entre 0,25 y 7,2 min y se necesitan 9 min.]]"),
    P("**Idea 3. Asimilación de datos.** Un modelo de cómo cambia la glucosa en el cuerpo se junta con la señal ruidosa del sensor mediante un filtro de Kalman. Ayuda a limpiar el ruido y a avisar cuando el sensor y el modelo no concuerdan. Pero si el sensor no informa nada útil, el modelo solo dibuja una curva plausible, y no corrige un error que comparten todas las lecturas. Ya tenemos el filtro de Kalman en el repositorio. Lo vemos como una herramienta y no como la solución."),
    P("**Idea 4. Audífono nocturno.** Cuando la glucosa baja, el cerebro funciona distinto y eso se ve en su actividad eléctrica, el EEG. Un audífono mediría esa señal en el oído, junto con el pulso, la temperatura del tímpano y la luz infrarroja. Tiene la ventaja de no depender del sudor. La analizamos en el análisis de viabilidad. [[Con EEG del oído la alarma combinada acierta 54 a 57 de cada 100 veces, bajo el 70 % que pedimos.]] Esa cifra supone un error lento del sensor (σ de 18 y de 13 mg/dL, AR(1) de 60 min, sin estudio que lo mida). Con ruido blanco serían 100 de cada 100. Solo pasa en papel con EEG subcutáneo, que ya no es no invasivo."),
    P("**Idea 8. Anclar la alarma en un CGM.** Es una **Propuesta** que surgió del análisis de viabilidad y no está desarrollada. En vez de que el método no invasivo sea el principal, la alarma se apoya en un monitor continuo con filamento. El EEG, el pulso y el sudor sirven para confirmar la alarma y para detectar cuándo falla el sensor. Hay poco margen, porque un Dexcom G7 ya acierta 85 de cada 100 alarmas en el caso optimista (según un estudio patrocinado por Dexcom), y el conjunto deja de ser no invasivo. El primer paso es barato: medir con datos pareados que ya existen cuánto coinciden las falsas alarmas de un CGM y de un reloj."),
  ];

  // Opciones si hay que cambiar de rumbo. Todas son Propuesta.
  const OPCIONES = [
    ["A. Corregir el artefacto no invasivo (**Propuesta**)",
      "Base fisiológica, criterios, método del análisis de viabilidad, filtro de Kalman",
      "La tomografía de dos profundidades y el diseño con infrarrojo medio",
      "Raman penetra 250 a 300 µm y tiene la mejor evidencia no invasiva, 14,5 %",
      "Raman sigue siendo de escritorio y tarda unos 8 min por medición (dato de una nota de prensa), así que no pasa la regla de práctica",
      "Repetir el análisis de viabilidad solo para Raman"],
    ["B. Anclar la alarma en un CGM, idea 8 (**Propuesta**)",
      "Criterios, cálculos de fusión de alarmas, Kalman y detección de fallas",
      "La meta de medir glucosa sin aguja",
      "Redundancia medida en CGM y supresión de falsas alarmas en UCI",
      "Poco margen frente a un CGM solo y deja de ser no invasivo",
      "Datos pareados existentes de CGM y reloj"],
    ["C. Convertir el trabajo en un estudio de viabilidad de por qué fallan los no invasivos (**Propuesta**)",
      "Casi todo lo hecho, como evidencia",
      "La pretensión de diseñar un artefacto",
      "Responde al criterio de pertinencia fisiológica y anatómica",
      "Tiene menos solución de ingeniería",
      "Acordar con la profesora si un resultado negativo bien fundamentado cumple el objetivo del ramo"],
    ["D. Descartar y elegir otro problema de salud (**Propuesta**)",
      "El método: criterios fijados antes, análisis de viabilidad y repositorio reproducible",
      "Todo el contenido de glucosa",
      "Partir de un mecanismo fisiológico más medible",
      "Tiempo",
      "Listar problemas con mecanismo claro vistos en el curso"],
  ];

  const opciones = [
    H2(`${num.opciones(1)} Cuatro opciones`),
    P("Si la retroalimentación pide cambiar de rumbo, estas son las opciones que vemos. **Todas son Propuesta.** El equipo no ha decidido ninguna y espera la opinión de la profesora para elegir.", { keepNext: true }),
    ...tabla(["Opción", "Qué se conserva", "Qué se descarta", "A favor", "Riesgo", "Primer paso"],
      OPCIONES, [1500, 1600, 1500, 1700, 1600, 1738], { size: 17, pad: 55, padX: 80, juntas: true }),
    nota("Las cifras de Raman vienen de Rothenbühler et al. (2026) y Zhang et al. (2025) para el 14,5 %, y de Lundsgaard-Nielsen et al. (2018) para la profundidad de 250 a 300 µm."),
    ...recuadro("Lo que se conserva en cualquier caso", [
      B("**La base fisiológica:** la ley de Fick y el bucle de control de la glicemia."),
      B("**El método:** criterios fijados antes de ver los datos."),
      B("**El repositorio reproducible:** cualquiera puede rehacer las cifras."),
      B("**El análisis de viabilidad:** sirve como evidencia, sea cual sea la opción."),
    ]),
  ];

  return { propuestas, opciones, ideasCortas };
};
