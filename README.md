# simulacion-retraso-glucosa

¿Se puede estimar el retraso entre la glucosa en sangre y la glucosa en el
tejido usando solo dos profundidades ópticas, sin ninguna muestra de sangre?
¿Y conocer ese retraso hace que una alarma de hipoglucemia se active antes?

**Estado: andamiaje, todavía sin resultados.** La especificación del modelo,
los umbrales y los esqueletos de los tests ya están en el repositorio. La
simulación en sí no está escrita. `results/` está vacío y no se ha generado
ninguna figura. En este README las cifras aparecen solo como
`(rellenar desde la ejecución)`.

<!-- figura: figures/delay-recovery.png, la genera src/glucose_delay/figures.py, se agrega aquí cuando run_all.py la produzca -->

_Espacio para la figura. `figures/delay-recovery.png` va aquí cuando se haya
ejecutado `run_all.py`. El script que la dibuja es
`src/glucose_delay/figures.py` y hoy es solo un esqueleto._

## No es un dispositivo médico

Este repositorio es un estudio de simulación. **No es un dispositivo médico**,
**no diagnostica, no trata ni monitorea ninguna condición**, y **no debe usarse
para decidir nada sobre la salud de nadie**. No hay hardware, ni sensor, ni
mediciones en personas, ni validación clínica. Toda cifra que este código
llegue a producir saldrá de datos sintéticos generados con el modelo descrito
en `docs/especificacion.md`.

## La pregunta, planteada de modo que pueda fallar

Dos profundidades de medición ven la misma señal de glucosa en sangre a través
de dos retrasos de difusión de primer orden distintos. Lo que se pone a prueba
es si esas dos señales retrasadas bastan para identificar ambos retrasos, sin
medir nunca la glucosa en sangre.

Los umbrales de aprobado y reprobado están fijados en
[`umbrales.yaml`](umbrales.yaml) y quedaron en el repositorio antes de que
existiera el código que los revisa. No se editan después de ver un resultado.
Una enmienda va en un archivo nuevo.

Una aclaración. Los umbrales se eligieron después de una corrida exploratoria
anterior (2026-10-16) cuyos scripts no están en este repositorio. Este
repositorio es la replicación, así que los umbrales se fijaron antes de la
replicación y no antes de que la idea se probara por primera vez.

## Lo que esto NO es

* No es un dispositivo, ni un prototipo, ni hardware.
* No es una validación de ninguna tecnología de medición. Supone que existe un
  sensor y pregunta qué nivel de ruido tendría que alcanzar ese sensor para
  que el método sirva de algo.
* No es evidencia de exactitud en una persona. Con datos sintéticos generados
  por el mismo modelo que supone el estimador, lo único que se verifica es que
  el estimador resuelve sus propias ecuaciones. Eso no es una validación.

Este último punto es la principal limitación de todo el diseño, y es la razón
de que exista `docs/barridos-de-mala-especificacion.md`.

## Por qué un resultado negativo es el resultado útil

El método solo ayuda si el sensor es lo bastante silencioso. Si el ruido
necesario por lectura está por debajo de lo que la medición óptica ha
demostrado alcanzar, la conclusión honesta es un límite: el cuello de botella
no es el algoritmo, es el hardware. Ese límite es el entregable, sea o no
alentador.

Como referencia del lado del hardware, un estudio in vitro con un láser de
cascada cuántica informó una concentración de glucosa equivalente al ruido de
4 mg/dL, con una potencia media de 1,8 mW y un tiempo de integración de 50 s
(Vrančić C et al., *Analyst* 2011, 136:1192,
DOI [10.1039/C0AN00537A](https://doi.org/10.1039/C0AN00537A)). Es una cifra in
vitro para un montaje específico. No se ha demostrado nada equivalente en una
persona.

## Regla para informar

El sesgo nunca se informa solo. Cada sesgo se informa junto a la desviación
estándar entre corridas, para cada escenario. Un sesgo medio que parece
pequeño puede esconder una dispersión varias veces mayor, y un solo número
promediado lo oculta. Esta regla está en `umbrales.yaml` y aplica al README,
al informe y a cualquier figura.

## Resultados

| Escenario | Retraso real 1 | Retraso estimado 1, media y DE | Retraso real 2 | Retraso estimado 2, media y DE | Nivel de ruido |
|---|---|---|---|---|---|
| `(rellenar desde la ejecución)` | | | | | |

Umbrales cumplidos o no cumplidos: `(rellenar desde la ejecución)`

DE es la desviación estándar.

## Cómo ejecutarlo

```
python -m pip install -e ".[dev]"
python run_all.py --seed 1
```

Por ahora `run_all.py` termina con un mensaje que dice que la simulación
todavía no está implementada. Los tests que la describen se omiten con esa
misma razón, así que una corrida de tests informa lo que falta construir en
vez de fallar.

## Limitaciones

Escritas antes de que este repositorio produzca cualquier resultado, porque se
desprenden del diseño.

* **Circularidad.** Los datos sintéticos se generan con el mismo modelo de
  difusión de primer orden que supone el estimador. Recuperar el retraso en
  esas condiciones verifica el estimador. No valida el modelo frente a un
  cuerpo real.
* **Retraso constante.** El retraso se mantiene fijo. La perfusión cambia con
  el ejercicio, la temperatura y la postura.
* **Ruido blanco.** Sin deriva y sin correlación entre las dos profundidades.
  En sensores ópticos reales la deriva lenta suele dominar el error, y dos
  profundidades del mismo instrumento compartirían parte de su ruido.
* **Un solo día sintético.** Un registro sintético corto con una sola
  excursión hipoglucémica no es un día de vida con diabetes.
* **El retraso informado en personas varía.** Las estimaciones publicadas del
  retraso entre sangre e intersticio no son un número único, así que usar un
  único valor real en una simulación es una comodidad, no un dato sobre nadie.
* **No hay sensor.** El nivel de ruido es una entrada, no algo medido.

## Lo que falló

Intentos reales, con lo que enseñó cada uno. Las entradas completas, incluidas
las cifras una vez que el código de este repositorio pueda reproducirlas,
están en [`BITACORA_DE_AGENTES.md`](BITACORA_DE_AGENTES.md).

* La regresión sobre las derivadas de las dos señales entregó una constante de
  tiempo negativa, lo que es físicamente imposible. Derivar una señal ruidosa
  pasó el ruido a la matriz de diseño.
* La forma integral corrigió el signo y recuperó la diferencia entre los dos
  retrasos, pero subestimó ambos. La información que distingue un retraso del
  otro está en la pequeña diferencia entre las dos lecturas, y el ruido diluye
  justamente eso.
* Corregir el error en las variables abordó ese sesgo. Esta es la versión que
  describe `docs/especificacion.md`.

## Siguiente paso, sin necesidad de hardware

Antes que cualquier otra cosa, los barridos de mala especificación de
[`docs/barridos-de-mala-especificacion.md`](docs/barridos-de-mala-especificacion.md):
retraso variable, ruido correlacionado entre profundidades, deriva del sensor
y cinéticas que no son de primer orden. La idea es encontrar dónde se rompe el
estimador y publicarlo.

Solo después de eso tiene algún valor usar curvas de glucosa más realistas
sacadas de un simulador de diabetes tipo 1 de código abierto. Un candidato es
simglucose (<https://github.com/jxx123/simglucose>, licencia MIT), cuyo README
lo describe como una implementación en Python del simulador UVa/Padova,
versión 2008, para uso en investigación. Eso es una descripción del paquete,
no una afirmación sobre su situación regulatoria, y que el paquete sea de
código abierto no elimina por sí solo el problema de circularidad.

## Estructura del repositorio

```
docs/especificacion.md                    el modelo y el estimador, con detalle suficiente para implementarlos
docs/barridos-de-mala-especificacion.md   dónde se espera que se rompa el estimador
docs/backlog-de-issues.md                 la lista de tareas, lista para abrir como issues
umbrales.yaml                             criterios de aprobado y reprobado, registrados primero
run_all.py                                punto de entrada (esqueleto)
src/glucose_delay/                        paquete (esqueleto)
tests/                                    tests, omitidos hasta que exista el código
results/                                  vacío
figures/                                  vacío
informe/factibilidad.md                   la estructura del informe, sin rellenar
BITACORA_DE_AGENTES.md                    en qué se equivocó el flujo de trabajo asistido por agentes
```

## Licencia

El código es MIT, ver [`LICENSE`](LICENSE). El informe, los documentos y
cualquier dato generado están bajo CC BY 4.0, ver
[`LICENCIA-DATOS.md`](LICENCIA-DATOS.md).

## Cómo citar

Ver [`CITATION.cff`](CITATION.cff).
