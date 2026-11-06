# Entrega del problema

**Cuándo:** viernes 6 de noviembre, bloque 4, en clase. **Peso:** formativa, sin nota. Se devuelve con comentarios.

**Versión para entregar:** [PDF](01-problema-entrega.pdf) y [Word](01-problema-entrega.docx). Es una sola plana, con las secciones 1 a 5, la tabla de la cadena de trazabilidad y las referencias. Abajo está el mismo texto, para leerlo en GitHub. El documento se regenera con [`generador/`](generador/), que también puede sumar una segunda página de anexo con el modelo y los algoritmos (figuras en [`figuras/`](figuras/)).

## Qué pide la pauta

Media página que responda dos preguntas:

1. Qué problema de salud se aborda.
2. Qué mecanismo del cuerpo humano lo explica.

La entrega ocupa una plana porque suma lo hecho hasta ahora, la tabla de la cadena y las referencias. Las secciones 1 y 2 responden las dos preguntas por sí solas.

_Texto redactado con apoyo de IA (Claude) a partir del análisis del repositorio. Las cifras salen de [`../2-simulacion/`](../2-simulacion/) y [`../3-analisis-de-viabilidad/`](../3-analisis-de-viabilidad/)._

## La entrega

### 1. El problema

La hipoglucemia nocturna en personas con diabetes que usan insulina. En 2017 había unos 451 millones de adultos con diabetes en el mundo (Cho et al., 2018). Mientras duerme, la persona no percibe los síntomas y depende de una alarma, pero los monitores continuos (CGM) miden el líquido intersticial, que va atrasado respecto de la sangre. El único monitor no invasivo aprobado por la FDA, GlucoWatch, fracasó en sus alarmas: 62 de cada 100 fueron falsas en niños y adolescentes (Tsalikian et al., 2004).

### 2. El mecanismo fisiológico

- **Falla del control (núcleo 2, homeostasis).** La glicemia se regula por retroalimentación negativa: el páncreas la detecta y ajusta la insulina y el glucagón. La insulina inyectada queda fuera de ese bucle y sigue actuando aunque la glucosa baje.
- **Aviso que no llega (núcleo 6, sistema nervioso autónomo).** La respuesta simpática a la glucosa baja, con sudor, temblor y taquicardia, alerta de día, pero durante el sueño puede pasar inadvertida.
- **Retraso por difusión (núcleo 3, membrana y transporte).** La glucosa difunde del capilar al líquido intersticial y entra a las células por transportadores GLUT. Por la ley de Fick, la glucosa del tejido G sigue a la de la sangre Gs como un sistema de primer orden, dG/dt = (Gs − G)/τ, con τ = V/(P·A) (volumen de tejido sobre permeabilidad por área de intercambio), y llega con 5 a 10 min de atraso (Rebrin et al., 2010).

### 3. Lo que planteamos y dónde estamos

Medir la glucosa con luz infrarroja media en dos capas de la piel que siguen a la sangre con retrasos distintos, estimar con un algoritmo (filtro de Kalman) la glucosa en sangre y adelantar la alarma, confirmándola con EEG del oído. En simulación, la alarma llegó 5,2 a 14,8 min antes. Pero esa luz penetra solo unos 45 µm (Kottmann et al., 2016), y las capas a su alcance difieren en apenas 0,25 a 7,2 min de retraso, cuando se necesitan 9. Tal como está, el diseño no supera a GlucoWatch ni a los CGM actuales. El modelo, los algoritmos y los cálculos están en el repositorio.

### 4. Cadena de trazabilidad

| # | Casilla | Contenido |
|---|---|---|
| 01 | Problema de salud | Hipoglucemia nocturna en personas con diabetes que usan insulina |
| 02 | Mecanismo | Bucle de la glicemia sin freno, aviso simpático perdido al dormir y retraso por difusión |
| 03 | Contenido | Núcleos 2 (homeostasis), 3 (membrana y transporte) y 6 (sistema nervioso autónomo) |
| 04 | Variable medible | Glucosa intersticial y su retraso respecto de la sangre, continua durante la noche |
| 05 | Transducción | En evaluación. Infrarrojo medio descartado. Propuesta: CGM electroquímico más señales no invasivas, como el pulso, que confirmen la alarma |
| 06 | Salida esperada | Alarma nocturna para la persona o su cuidador, más temprana y con menos falsas alarmas |

### 5. Pregunta para su retroalimentación

¿Seguimos con un CGM más biomarcadores no invasivos (opción B), corregimos el diseño no invasivo con espectroscopía Raman (opción A), o un resultado negativo bien fundamentado cumple el objetivo del ramo (opción C)?

### Referencias

- Cho, N. H., Shaw, J. E., Karuranga, S., Huang, Y., da Rocha Fernandes, J. D., Ohlrogge, A. W., & Malanda, B. (2018). IDF Diabetes Atlas: Global estimates of diabetes prevalence for 2017 and projections for 2045. *Diabetes Research and Clinical Practice, 138*, 271-281. https://doi.org/10.1016/j.diabres.2018.02.023
- Kottmann, J., Rey, J. M., & Sigrist, M. W. (2016). Mid-infrared photoacoustic detection of glucose in human skin: Towards non-invasive diagnostics. *Sensors, 16*(10), 1663. https://doi.org/10.3390/s16101663
- Rebrin, K., Sheppard, N. F., Jr., & Steil, G. M. (2010). Use of subcutaneous interstitial fluid glucose to estimate blood glucose: Revisiting delay and sensor offset. *Journal of Diabetes Science and Technology, 4*(5), 1087-1098. https://doi.org/10.1177/193229681000400507
- Tsalikian, E., Kollman, C., Mauras, N., Weinzimer, S., Buckingham, B., Xing, D., Beck, R., Ruedy, K., Tamborlane, W., Fiallo-Scharer, R., & DirecNet Study Group. (2004). GlucoWatch G2 Biographer alarm reliability during hypoglycemia in children. *Diabetes Technology & Therapeutics, 6*(5), 559-566. https://doi.org/10.1089/dia.2004.6.559
- Ríos Elgueta, E. A. (2026). *simulacion-retraso-glucosa* [Repositorio con la simulación y el análisis de viabilidad]. GitHub. https://github.com/Stenon5/simulacion-retraso-glucosa

## Comentarios recibidos

_Aquí se anotan los comentarios de la profesora cuando se devuelva._
