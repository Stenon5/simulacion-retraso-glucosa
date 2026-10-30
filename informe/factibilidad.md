# Informe de factibilidad

**Estructura vacía. No se ha ejecutado nada.** Cada sección de abajo es un
espacio por llenar. Una sección se rellena solo a partir de archivos de
`results/`, y cada cifra que contenga tiene que poder rastrearse hasta una
semilla y una configuración.

---

## 1. Pregunta

Una frase, planteada de modo que pueda fallar. Copiada del README para que las
dos no se separen con el tiempo.

`(rellenar desde la ejecución)`

## 2. Qué se simuló

El modelo, el estimador, la grilla de escenarios, el número de semillas por
celda y las versiones del software. Remite a `docs/especificacion.md` en vez
de repetirlo.

`(rellenar desde la ejecución)`

## 3. Umbrales, tal como quedaron registrados de antemano

Los criterios de `umbrales.yaml`, citados textualmente, con la fecha de commit
de ese archivo, antes de mostrar cualquier resultado. Si existe un archivo de
enmienda, se nombra aquí con su razón.

`(rellenar desde la ejecución)`

## 4. Resultados

Una tabla por escenario. Sesgo medio y desviación estándar lado a lado, nunca
la media sola. El ruido inyectado y la estimación de ruido recuperada, uno
junto al otro.

`(rellenar desde la ejecución)`

## 5. Umbral por umbral

| Criterio | Se cumple | Evidencia | Escenarios donde falló |
|---|---|---|---|
| delay_bias | `(rellenar desde la ejecución)` | | |
| noise_requirement | `(rellenar desde la ejecución)` | | |
| earlier_alarm | `(rellenar desde la ejecución)` | | |
| beats_fixed_population_delay | `(rellenar desde la ejecución)` | | |
| noise_estimate_recovers | `(rellenar desde la ejecución)` | | |

## 6. Barridos de mala especificación

Para cada barrido de `docs/barridos-de-mala-especificacion.md`, dónde dejó el
estimador de cumplir los criterios, en unidades que permitan actuar a quien lo
lea.

`(rellenar desde la ejecución)`

## 7. Resultados negativos

Una sección que se mantiene aunque termine siendo la mayor parte del informe.
Todo lo que la corrida mostró que no funciona, incluidos los casos en que
estimar el retraso dio un resultado peor que ignorarlo.

`(rellenar desde la ejecución)`

## 8. Lo que esto no muestra

* Nada sobre la exactitud en una persona.
* Nada sobre ningún dispositivo.
* Nada sobre si alguna tecnología de medición puede alcanzar el nivel de ruido
  necesario.

Esta sección no se rellena con resultados. Se queda tal como está escrita a
menos que el alcance del trabajo cambie de verdad.

## 9. Implicancia para el hardware

Si el método exige un nivel de ruido por lectura, expresarlo como un requisito
para un sensor hipotético y compararlo con cifras publicadas, con sus citas y
sus condiciones, in vitro o in vivo. No comparar con una cifra cuyas
condiciones de medición no estén declaradas.

`(rellenar desde la ejecución)`

## 10. Limitaciones

Las del README, más todo lo que la propia corrida haya dejado en evidencia.

`(rellenar desde la ejecución)`

## 11. Lo que falló

Tomado de `BITACORA_DE_AGENTES.md`, resumido.

`(rellenar desde la ejecución)`

## 12. Cómo reproducir este informe

Los comandos exactos, las semillas y el hash del commit que produjeron cada
tabla y cada figura.

`(rellenar desde la ejecución)`

## 13. Extensiones propuestas que el modelo actual no puede integrar

Esta sección no se rellena con resultados. Reúne lo que más podría mejorar el
estudio pero que hoy no cabe en la simulación por una limitación técnica
concreta. El modelo actual recibe la glucosa ya expresada en mg/dL a dos
profundidades, no modela la luz ni el tejido, y no tiene datos de personas.

Los barridos de `docs/barridos-de-mala-especificacion.md` no aparecen aquí,
porque sí caben en el modelo actual y van primero. Las extensiones están
ordenadas por la mejora que prometen.

| # | Extensión | Limitación que impide integrarla hoy | Qué mejoraría |
|---|---|---|---|
| 1 | Modelo óptico directo de la piel | No hay óptica en el modelo | Convierte el requisito de ruido en mg/dL en un requisito de detector, y prueba si la luz llega a la segunda profundidad |
| 2 | Filtro de latido | Necesita la extensión 1 y una señal de pulso | Mediría sangre arterial sin retraso de difusión |
| 3 | Datos reales con selección de profundidad | No hay datos públicos de este tipo | Rompe la circularidad, la limitación principal |
| 4 | Modelo fisiológico dentro del filtro | Los escenarios no tienen insulina ni comidas como entradas | Limitaría la deriva lenta |
| 5 | Segunda vía de alarma por EEG | No hay datos útiles de EEG en el oído durante hipoglucemia | Bajaría las falsas alarmas |

### 13.1 Modelo óptico directo de la piel

**Qué agrega.** Hoy el estimador parte de $G_1$ y $G_2$ en mg/dL y supone que
algún sensor ya los entrega. Un modelo directo generaría la señal que vería
el sensor: absorción por longitud de onda en el infrarrojo medio, capa por
capa (estrato córneo, epidermis, dermis con capilares), con el ruido del
detector. De esa señal se extraerían $G_1$ y $G_2$, que entrarían al
estimador que ya existe.

**Por qué no entra hoy.** El modelo no tiene óptica. Harían falta las
constantes ópticas de agua, glucosa y piel en el infrarrojo medio, y un modelo
de transporte de luz en capas.

**Qué mejora promete.** Dos cosas.

1. Traduce el requisito de ruido por lectura (~5,9 mg/dL en la replicación) a
   un requisito de detector, en potencia, tiempo de integración y relación
   señal a ruido. Eso permite compararlo de verdad con la cifra in vitro de
   4 mg/dL de Vrančić et al. (2011).
2. Pone a prueba el supuesto central del método, que dos profundidades
   ópticas ven compartimentos con retrasos distintos. In vivo, la
   espectroscopía fotoacústica en infrarrojo medio integra la absorción hasta
   unos 40 a 50 µm (Pleitez et al., 2013). La unión dermo-epidérmica, donde
   llegan los capilares, está a unos 50 a 100 µm en la mejilla (arXiv
   1802.01455). Si el modelo confirma que la luz no alcanza una segunda
   profundidad distinta, el método de dos profundidades no sirve en esa
   banda, y conviene saberlo antes de pensar en hardware.

**Insumos disponibles.** Coeficientes de absorción del estrato córneo de 150 a
250 cm⁻¹ entre 1020 y 1100 cm⁻¹, que es la ventana de la glucosa (bioRxiv,
2026). Espectros de glucosa en agua y su dependencia con la temperatura, en
artículos que habría que digitalizar.

### 13.2 Filtro de latido

**Qué agrega.** Separar la parte de la señal óptica que late con el corazón,
que viene de la sangre arterial, del resto del tejido. Es la segunda mitad de
la idea del doble filtro.

**Por qué no entra hoy.** Necesita el modelo óptico de 13.1, con la sangre
como un compartimento que cambia de volumen con cada latido. El modelo actual
no tiene sangre como compartimento óptico.

**Qué mejora promete.** Si funciona, mediría glucosa en sangre sin retraso de
difusión, y la alarma ya no dependería de estimar $\tau$. El costo está
cuantificado: la componente pulsátil fue cerca del 1% de la señal total
(patente US 5515847). Como la glucosa útil queda en ese 1%, el ruido exigido a
la lectura total sería del orden de 100 veces menor que sin este filtro. El
modelo de 13.1 diría si eso es alcanzable.

**Datos para probar la extracción del pulso.** Un registro abierto de PPG de
reloj con CGM, bajo licencia CC BY 4.0 (Zenodo, registro 20577959). Es luz
infrarroja cercana, así que sirve para probar el algoritmo que separa el
pulso, no para medir glucosa.

### 13.3 Datos reales con selección de profundidad

**Qué agrega.** Probar el estimador con señales de personas en vez de señales
generadas por su propio modelo. Es la única forma de atacar la circularidad
que el README nombra como limitación principal.

**Por qué no entra hoy.** No hay datos públicos de infrarrojo medio en piel
humana con selección de profundidad.

**Candidato más cercano.** mμSORS, espectroscopía Raman a 785 nm con cinco
desplazamientos laterales que muestrean desde 0 a 270 µm hasta más de 620 µm.
Tiene 230 participantes, 5.308 pares y un MARD de 14,6% en un conjunto de
prueba independiente de 30 personas (Zhang et al., 2025). Los espectros se
entregan a pedido a los autores, y el código está en Zenodo.

**Qué mejora promete.** Ver si dos desplazamientos muestran retrasos distintos
en personas reales. Como es Raman y no infrarrojo medio, validaría el
principio de las dos profundidades, no la banda óptica.

**Advertencia antes de pedirlos.** 5.308 pares en 230 personas son unos 23 por
persona. El estimador usa 480 lecturas por registro, una por minuto. Antes de
pedir los datos hay que confirmar que existen series continuas por persona y
no solo puntos sueltos.

### 13.4 Modelo fisiológico dentro del filtro

**Qué agrega.** Hoy el filtro de Kalman supone que la glucosa en sangre sigue
una tendencia lineal local. Un modelo de glucosa e insulina, con comidas y
dosis como entradas, limitaría lo que la sangre puede hacer entre lecturas.

**Por qué no entra hoy.** Los escenarios no tienen insulina ni comidas como
entradas, y la curva de sangre es fija. La fase 3 del backlog cambia solo la
curva de sangre, no el modelo dentro del filtro.

**Qué mejora promete.** No hay una cifra en dispositivos no invasivos. En CGM
comerciales, la fusión con Kalman bajó el MARD de 9,72% a 9,66% (patente
US 10349872), una mejora de 0,06 puntos. El valor esperado está en frenar la
deriva lenta del barrido 3, no en bajar el error promedio.

**Cuidado.** Si el mismo simulador genera la curva y también es el modelo del
filtro, la circularidad vuelve a aparecer en otra capa.

### 13.5 Segunda vía de alarma por EEG

**Qué agrega.** Una alarma que solo se activa si el sensor óptico y una
segunda vía independiente coinciden. El EEG refleja la falta de glucosa en el
cerebro y no depende del sudor.

**Por qué no entra hoy.** El único estudio de EEG solo en el oído encontrado
tuvo 5 sujetos y sus canales no superaron el azar. Con electrodos en el cuero
cabelludo se logró 96% de exactitud, pero dentro de cada sujeto. No hay datos
para simular una segunda vía creíble.

**Qué mejora promete.** Atacar las falsas alarmas, que hundieron al
GlucoWatch G2 (51% de falsas alarmas a 60 mg/dL en niños). Con dos vías
independientes y una regla que exige que ambas coincidan, la probabilidad de
falsa alarma se multiplica entre ambas, pero la sensibilidad también. Con una
sensibilidad de 80% en cada vía, la conjunta bajaría a 64%. El modelo tendría
que mostrar dónde conviene ese cambio.

### 13.6 Evaluadas y no incluidas

| Idea | Por qué queda fuera |
|---|---|
| Quiralidad (dicroísmo circular) | La diferencia es del orden de 10⁻⁶ y el colágeno de la dermis también es quiral |
| Aquafotómica | La temperatura y cualquier soluto cambian la red de agua. Lo publicado es diagnóstico, no glucosa continua |
| Peine de frecuencias en infrarrojo medio | Mejora el hardware, no cambia el algoritmo. Su efecto ya queda cubierto si 13.1 trata el ruido del detector como una entrada |

### 13.7 Fuentes de esta sección

* Vrančić C et al. *Analyst* 2011, 136:1192. [DOI 10.1039/C0AN00537A](https://doi.org/10.1039/C0AN00537A)
* Pleitez MA et al. In vivo noninvasive monitoring of glucose concentration in human epidermis by mid-infrared pulsed photoacoustic spectroscopy. *Anal Chem* 2013. [PubMed 23214424](https://pubmed.ncbi.nlm.nih.gov/23214424/)
* Ultrahigh resolution OCT en dermatología, unión dermo-epidérmica y capilares. [arXiv 1802.01455](https://arxiv.org/pdf/1802.01455)
* Mid-infrared absorption coefficients of human skin stratum corneum. [bioRxiv 2026](https://www.biorxiv.org/content/10.64898/2026.01.17.699860v1.full)
* Influence of temperature on water and aqueous glucose absorption spectra in the near- and mid-infrared regions. [ResearchGate](https://www.researchgate.net/publication/9014585_Influence_of_Temperature_on_Water_and_Aqueous_Glucose_Absorption_Spectra_in_the_Near-_and_Mid-Infrared_Regions_at_Physiologically_Relevant_Temperatures)
* Patente US 5515847, amplitud de la componente pulsátil. [USPTO](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5515847)
* Registro de PPG de reloj con CGM, CC BY 4.0. [Zenodo 20577959](https://zenodo.org/records/20577959)
* Zhang et al. 2025, mμSORS. [Nature Metabolism](https://www.nature.com/articles/s42255-025-01217-w), código en [Zenodo 10.5281/zenodo.14605629](https://doi.org/10.5281/zenodo.14605629)
* Patente US 10349872, fusión con Kalman en CGM. [USPTO](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10349872)
* EEG en el oído, 5 sujetos. [Research Square](https://researchsquare.com/article/rs-122971/v1)
* EEG de cuero cabelludo en hipoglucemia. [PMC13518557](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13518557/)
* DirecNet, exactitud del GlucoWatch G2 en hipoglucemia. [Univ. of Iowa](https://iro.uiowa.edu/esploro/outputs/journalArticle/Accuracy-of-the-GlucoWatch-G2-Biographer/9984093462002771)
* Dicroísmo circular de la glucosa por sobretonos. [arXiv 1601.06143](https://ar5iv.arxiv.org/html/1601.06143)
* Aquafotómica en diabetes. [Li et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC7794015)
