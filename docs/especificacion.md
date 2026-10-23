# Especificación del modelo y del estimador

Con detalle suficiente para implementar la simulación desde cero. Nada de lo
que aparece aquí se ha ejecutado todavía dentro de este repositorio.

## 1. Planteamiento

Un sensor lee la glucosa a dos profundidades distintas del tejido. Cada
profundidad ve la misma señal de glucosa en sangre, retrasada y suavizada por
la difusión, con su propia constante de tiempo. La glucosa en sangre nunca se
mide.

El objetivo es recuperar ambas constantes de tiempo solo a partir de las dos
señales del tejido, y luego reconstruir con ellas la glucosa en sangre usando
únicamente muestras pasadas, como tendría que hacerlo un dispositivo real.

## 2. Modelo directo

Cada profundidad `i` sigue una difusión de primer orden hacia el valor de la
sangre, con su propia constante de tiempo `tau_i`:

```latex
\frac{dG_i}{dt} = \frac{G_s - G_i}{\tau_i}
\quad\Longrightarrow\quad
G_s = G_i + \tau_i\,\frac{dG_i}{dt}
```

`G_s` es la glucosa en sangre y `G_i` es la glucosa a la profundidad `i`.

## 3. Eliminación de la señal que no se mide

Escribir la misma `G_s` a partir de ambas profundidades e igualar las dos
expresiones elimina `G_s`. Integrar en vez de derivar mantiene el ruido fuera
de la derivada y deja una ecuación lineal en `tau_1` y `tau_2`:

```latex
\int_0^t (G_1 - G_2)\,dt' = c - \tau_1\,G_1(t) + \tau_2\,G_2(t)
```

`c` es una constante de integración y se estima junto con las dos constantes
de tiempo. La integral del lado izquierdo se calcula a partir de las señales
medidas, así que todos los términos son observables.

## 4. Por qué aquí los mínimos cuadrados ordinarios están sesgados

Tanto `G_1(t)` como `G_2(t)` aparecen en el lado derecho como regresores, y
ambos se miden con ruido. Los regresores medidos con ruido sesgan la
estimación hacia cero, que es el problema del error en las variables. Con las
señales que se usan aquí el sesgo es lo bastante grande como para importar,
así que se corrige de forma explícita.

Sea `X` la matriz de diseño con columnas `[1, G_1(t), G_2(t)]`, `Y` el término
integral, `N` el número de muestras y `dt` el intervalo de muestreo. El
estimador corregido es

```latex
\hat{\beta} = \left(X^\top X - N\,\mathrm{diag}(0,\hat\sigma^2,\hat\sigma^2)\right)^{-1}
\left(X^\top Y + N\,\hat\sigma^2\,\Delta t\,(0,1,1)^\top\right)
```

La varianza del ruido se estima a partir de la propia señal, con la segunda
diferencia de la serie:

```latex
\hat\sigma^2 = \tfrac{1}{6}\,\mathrm{Var}(\Delta^2 y)
```

`Delta^2 y` es la segunda diferencia de la serie medida. El factor un sexto
sale de la varianza de una segunda diferencia de ruido independiente. Este
estimador supone que el ruido es blanco e independiente entre muestras, que es
uno de los supuestos que los barridos de
`barridos-de-mala-especificacion.md` buscan romper a propósito.

Los coeficientes de `beta` corresponden a `-tau_1` y `+tau_2`, con la
convención de signos de la ecuación anterior. Una implementación debe
comprobar que las constantes de tiempo recuperadas sean positivas y debe
informar el número de condición de la matriz corregida, porque estar cerca de
la singularidad es el modo de falla que hay que vigilar.

## 5. Reconstrucción de la glucosa en sangre

Con las constantes de tiempo ya estimadas, un filtro de Kalman con estado
`[glucosa en sangre, pendiente de la glucosa en sangre, G_1, G_2]` reconstruye
la glucosa en sangre usando solo muestras pasadas. No se suaviza con muestras
futuras, porque un dispositivo no puede hacerlo.

* Modelo de proceso: la glucosa en sangre sigue una tendencia lineal local, y
  cada profundidad sigue la difusión de primer orden descrita arriba con su
  constante de tiempo estimada.
* Modelo de medición: las dos lecturas de profundidad, cada una con la
  varianza de ruido estimada.
* La inicialización y el ajuste del ruido de proceso son decisiones de
  implementación y deben quedar registrados en la salida de la corrida, porque
  los resultados dependen de ellos.

## 6. Generador de datos sintéticos

* Un registro de varias horas con un intervalo de muestreo fijo, lo bastante
  largo para contener una excursión hipoglucémica clara y al menos una subida.
* Primero se genera la glucosa en sangre, y luego cada profundidad se obtiene
  integrando la ecuación de difusión de primer orden con su propia constante
  de tiempo.
* A cada lectura de profundidad se le suma ruido gaussiano independiente, con
  el nivel de ruido del escenario, sin deriva y sin correlación entre
  profundidades. El generador base coincide a propósito con los supuestos del
  estimador. Esa es la circularidad que los barridos existen para atacar.
* Cada corrida registra su semilla. Una semilla fija debe reproducir una
  corrida exactamente.

## 7. Grilla de escenarios a ejecutar

Una grilla, no un resultado. Estas son las entradas que se van a barrer.

| Escenario | Constante de tiempo, profundidad 1 | Constante de tiempo, profundidad 2 | Ruido por lectura |
|---|---|---|---|
| típico, ruido bajo | corta | larga | bajo |
| típico, ruido medio | corta | larga | medio |
| típico, ruido alto | corta | larga | alto |
| persona lenta | larga | más larga | medio |
| persona rápida | la más corta | corta | medio |

Los valores concretos de corta, larga, bajo, medio y alto van en un archivo de
configuración que se sube al repositorio junto con el código, para que quien
lea pueda ver la grilla sin leer el código fuente. La separación entre las dos
constantes de tiempo es el parámetro que decide si el problema es
identificable o no, así que se barre de forma explícita.

Cada celda se repite con muchas semillas. Por celda, la corrida informa el
sesgo medio y la desviación estándar entre semillas, nunca la media sola, e
informa la estimación de ruido recuperada junto al ruido que realmente se
inyectó.

## 8. Comparaciones que la corrida debe incluir

1. El estimador de dos profundidades frente a una sola profundidad suavizada,
   que hace las veces de un monitor continuo simple.
2. El estimador de dos profundidades con las constantes de tiempo estimadas
   frente al mismo estimador con las constantes de tiempo reales. La
   diferencia entre ambos es el costo de no conocer el retraso.
3. Ambos frente a usar un retraso poblacional fijo en vez de estimarlo.

La comparación tres importa porque un valor poblacional fijo es lo que haría
un dispositivo si se descartara el estimador, así que es la línea base real.

## 9. Salidas

* Un CSV por escenario en `results/`, con una fila por semilla, con las
  constantes de tiempo recuperadas, la estimación de ruido recuperada, las
  métricas de error y el momento de la alarma.
* Una tabla resumen en `results/`, con una fila por escenario, con la media y
  la desviación estándar lado a lado.
* Una figura en `figures/` que muestre la reconstrucción frente a la glucosa
  en sangre real para una semilla representativa, con la línea base de una
  sola profundidad dibujada debajo.
* Un registro legible por máquina que indique qué umbrales de `umbrales.yaml`
  se cumplieron.
