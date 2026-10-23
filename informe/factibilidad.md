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
