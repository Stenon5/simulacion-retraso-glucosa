# Backlog de issues

Cada tarea de abajo está lista para abrirse como issue en GitHub. El título,
las etiquetas y los criterios de aceptación ya están escritos.

La fase 3 es condicional y no se promete en ninguna parte.

## Fase 0, antes de cualquier resultado

**[impl] Implementar el generador de datos sintéticos**
Etiquetas: `implementación`, `fase-0`
Se acepta cuando: `model.simulate_blood_glucose`, `model.diffuse` y `model.add_noise` existen, una semilla fija reproduce un registro exactamente, y `test_the_same_seed_reproduces_the_same_record` deja de estar omitido.

**[impl] Implementar el estimador de la varianza del ruido**
Etiquetas: `implementación`, `fase-0`
Se acepta cuando: la estimación obtenida con la segunda diferencia coincide con el ruido inyectado en datos sintéticos, y el test correspondiente deja de estar omitido.

**[impl] Implementar el estimador del retraso con la corrección del error en las variables**
Etiquetas: `implementación`, `fase-0`
Se acepta cuando: sin ruido, el estimador devuelve ambas constantes de tiempo reales, una constante de tiempo negativa se informa como falla en vez de recortarse, se devuelve el número de condición, y los tres tests correspondientes dejan de estar omitidos.

**[impl] Implementar la reconstrucción causal**
Etiquetas: `implementación`, `fase-0`
Se acepta cuando: truncar el registro no cambia los valores reconstruidos anteriores, que es lo que demuestra que el filtro nunca usó muestras futuras, y el test correspondiente deja de estar omitido.

**[impl] Escribir el archivo de configuración de escenarios**
Etiquetas: `implementación`, `fase-0`
Se acepta cuando: la grilla de la sección 7 de `docs/especificacion.md` existe como archivo de configuración en el repositorio, de modo que la grilla se pueda leer sin leer el código fuente.

**[impl] Hacer que run_all.py produzca resultados, figuras y el informe de umbrales**
Etiquetas: `implementación`, `fase-0`
Se acepta cuando: un CSV por escenario y una tabla resumen quedan en `results/`, la figura queda en `figures/`, y un registro legible por máquina indica qué criterios de `umbrales.yaml` se cumplieron.

## Fase 1, la corrida base y su informe honesto

**[resultado] Rellenar la tabla de resultados del README con la corrida**
Etiquetas: `fase-1`, `resultados`, `verificación`
Se acepta cuando: cada marca `(rellenar desde la ejecución)` del README se reemplaza por una cifra trazable a una semilla y un escenario, con la desviación estándar junto a cada sesgo.

**[doc] Agregar la figura al inicio del README**
Etiquetas: `documentación`, `fase-1`
Se acepta cuando: `figures/delay-recovery.png` existe, la genera `src/glucose_delay/figures.py`, y su leyenda nombra el escenario, la semilla y el nivel de ruido.

**[doc] Conciliar la bitácora de agentes con las cifras reproducidas**
Etiquetas: `agentes`, `fase-1`
Se acepta cuando: la entrada pendiente de `BITACORA_DE_AGENTES.md` se cierra con las cifras que el código realmente reproduce. Si no coinciden con la corrida exploratoria original, gana la reproducción y la discrepancia recibe su propia entrada.

**[doc] Escribir el informe de factibilidad**
Etiquetas: `documentación`, `fase-1`
Se acepta cuando: cada sección de `informe/factibilidad.md` se rellena a partir de archivos de `results/`, incluida la sección de resultados negativos, y los umbrales se citan tal como quedaron registrados antes de mostrar los resultados.

## Fase 2, dónde se rompe

Un issue por cada barrido de `docs/barridos-de-mala-especificacion.md`, todos
con la etiqueta `barrido`.

**[barrido] 1. Retraso variable**
Etiquetas: `fase-2`, `barrido`
Se acepta cuando: se indica la velocidad de cambio a la que el estimador deja de cumplir los criterios, y se muestra si una variante con ventana deslizante ayuda o no.

**[barrido] 2. Ruido correlacionado entre profundidades**
Etiquetas: `fase-2`, `barrido`
Se acepta cuando: el sesgo se informa en función de la correlación, y se dice con claridad si la corrección del error en las variables empeora las cosas cuando falla su supuesto de independencia.

**[barrido] 3. Deriva del sensor**
Etiquetas: `fase-2`, `barrido`
Se acepta cuando: se indica si la estimación de ruido se mantiene correcta mientras la estimación del retraso se equivoca, porque eso sería una falla silenciosa.

**[barrido] 4. Cinéticas que no son de primer orden**
Etiquetas: `fase-2`, `barrido`
Se acepta cuando: se corren al menos dos generadores equivocados, y se indica si alguna cantidad que el estimador ya calcula advierte que el modelo está equivocado.

**[barrido] 5. Intervalo de muestreo y largo del registro**
Etiquetas: `fase-2`, `barrido`
Se acepta cuando: se informa el registro más corto que todavía identifica ambas constantes de tiempo.

**[barrido] 6. Separación entre las dos profundidades**
Etiquetas: `fase-2`, `barrido`
Se acepta cuando: se informa la separación bajo la cual el problema no es identificable, expresada como un requisito sobre dónde se ubican las profundidades.

**[doc] Escribir la sección de dominio de validez**
Etiquetas: `documentación`, `fase-2`
Se acepta cuando: el informe dice dónde funciona el método y dónde no, en una sección corta que permita actuar a quien la lea.

**[doc] Revisar qué modelos matemáticos sirven para combinar mediciones de distintos aparatos**
Etiquetas: `documentación`, `fase-2`
Se acepta cuando: hay una tabla corta de familias de modelos candidatas para combinar mediciones de distintos aparatos, con los supuestos de cada una, las fuentes que las describen y dónde se espera que fallen. No dice cuál es la mejor antes de probarlas.

## Fase 3, condicional

Solo si las fases 0 a 2 terminaron. Nada de esto está prometido.

**[impl] Alimentar la simulación con curvas de glucosa de un simulador de código abierto**
Etiquetas: `fase-3`
Se acepta cuando: la curva de glucosa en sangre viene de un simulador de diabetes tipo 1 con licencia abierta, se nombran el paquete y su licencia, y el informe dice con claridad que esto cambia la curva de glucosa en sangre y no el modelo del tejido, así que la circularidad del modelo del tejido se mantiene.

**[doc] Decidir si vale la pena una versión archivada con DOI**
Etiquetas: `fase-3`
Se acepta cuando: la decisión y su razón quedan registradas. Archivar es una posibilidad, no un compromiso.
