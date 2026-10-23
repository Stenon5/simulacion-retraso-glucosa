# Bitácora de agentes

En qué se equivocó el flujo de trabajo asistido por agentes, con fechas, cómo
se detectó y qué cambió a raíz de eso. Aquí también va el tiempo ahorrado,
pero las fallas van primero, porque una bitácora que solo registra ahorros es
marketing.

Esta bitácora cubre solo este repositorio. El proyecto de armonización todavía
no tiene una, a propósito. Una bitácora vacía es peor que no tener bitácora.

## Formato

Cada entrada usa los mismos cinco campos.

```
### AAAA-MM-DD, título corto
**Qué pasó.** Una o dos frases.
**Cómo se detectó.** La verificación que lo detectó, o el accidente que lo hizo.
**Costo.** Tiempo perdido, o lo que se habría publicado mal.
**Qué cambió.** La regla, el test o el hábito agregado para que no se repita.
**Estado.** Abierta, o cerrada con lo que la cerró.
```

Las entradas solo se agregan, nunca se editan. Una corrección va en una
entrada nueva que apunta a la anterior.

---

## Entradas

### 2026-10-16, el retraso estimado a partir de derivadas entregó una constante de tiempo negativa

**Qué pasó.** La primera versión estimaba las dos constantes de tiempo con una
regresión sobre las derivadas de las dos señales de profundidad. Al agregar
ruido, la estimación salió negativa. Una constante de tiempo de difusión
negativa es físicamente imposible, así que el resultado estaba claramente
roto, no sutilmente equivocado.

**Cómo se detectó.** Por el signo. La misma corrida sin ruido agregado
recuperó las constantes de tiempo reales, lo que apuntaba directo al ruido y
no al álgebra, y el número de condición del problema era pequeño, así que el
problema era identificable y lo que fallaba era el método.

**Costo.** Reescribir una vez el estimador.

**Qué cambió.** Las derivadas de una señal ruidosa no se usan como
regresores. La revisión del signo pasó a ser una regla de detención en
`umbrales.yaml`, de modo que una constante de tiempo negativa se informa como
falla y nunca se recorta a cero.

**Estado.** Cerrada por la forma integral de la entrada siguiente.

### 2026-10-16, la forma integral recuperó la diferencia pero subestimó ambos valores

**Qué pasó.** Integrar en vez de derivar corrigió el signo. La diferencia
entre las dos constantes de tiempo salió cerca del valor real, pero cada valor
por separado quedó por debajo de su valor real.

**Cómo se detectó.** Comparando cada estimación con su valor real en vez de
comparar solo la diferencia entre ellas. Revisar solo la diferencia habría
parecido un éxito.

**Costo.** Se habría publicado un estimador sesgado que pasa una verificación
débil.

**Qué cambió.** La información que distingue una constante de tiempo de la
otra está en la pequeña diferencia entre las dos lecturas, y el ruido diluye
justamente eso. Ambos regresores tienen ruido, así que aquí los mínimos
cuadrados ordinarios están sesgados hacia cero por construcción. Ahora cada
cantidad informada se compara con su propio valor real, no solo con una
combinación derivada.

**Estado.** Cerrada por la corrección del error en las variables.

### 2026-10-16, corrección del error en las variables

**Qué pasó.** Corregir la matriz de diseño por el ruido de los regresores,
con la varianza del ruido estimada a partir de la segunda diferencia de la
señal, abordó el sesgo de la entrada anterior.

**Cómo se detectó.** No fue una falla. Se registra porque las dos fallas de
arriba son las que llevaron a ella, y porque la corrección misma descansa en
un supuesto que los barridos buscan romper: supone que el ruido es blanco e
independiente entre las dos profundidades.

**Costo.** Ninguno.

**Qué cambió.** `docs/especificacion.md` describe esta versión. El supuesto
del que depende pasó a ser el barrido 2 de
`docs/barridos-de-mala-especificacion.md`, ruido correlacionado entre
profundidades, porque si ese supuesto falla la corrección podría empeorar la
estimación en vez de mejorarla.

**Estado.** Abierta. El supuesto no se ha puesto a prueba.

---

## Entradas pendientes

Esto pasó y corresponde a esta bitácora, pero la evidencia que permite
verificarlo todavía no está en este repositorio. Cada una tendrá su entrada
completa cuando pueda respaldarse aquí.

* **Las cifras detrás de las tres entradas de arriba.** Las estimaciones y
  dispersiones de esos intentos salieron de scripts exploratorios que no están
  en este repositorio. Se agregan a las entradas cuando `run_all.py` las
  reproduzca a partir de la especificación de `docs/especificacion.md`. Si la
  reproducción no coincide con las cifras originales, gana la reproducción y
  la discrepancia pasa a ser su propia entrada.

## Registro de tiempo

Tiempo ahorrado y tiempo perdido, cuando haya algo que medir.

| Fecha | Tarea | A mano | Asistido por agentes | Neto | Notas |
|---|---|---|---|---|---|
| | | | | | |
