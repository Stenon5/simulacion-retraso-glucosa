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

### 2026-10-23, implementación de la fase 0: un término que no se deriva, una derivación propia equivocada y una replicación que no reprodujo la dispersión

**Qué pasó.** Al implementar la fase 0 aparecieron seis fallas o ambigüedades.
(1) El término `N σ² Δt (0, 1, 1)` que la especificación suma a `XᵀY` no se
puede derivar. El ruido de las dos profundidades entra en la integral con
signos opuestos, y con la integral por trapecio y el intercepto esa covarianza
se cancela, así que la corrección derivada es cero. (2) Mi primera derivación,
antes de escribir código, también estaba mal: proponía `-N σ² Δt/2 (0, 1, -1)`
y olvidaba el centrado que impone el intercepto. (3) Con una suma acumulada
simple como integral, el estimador corre ambas constantes en -Δt/2 incluso sin
ruido. (4) La especificación no fija los valores de la grilla, y con un valor
por etiqueta la persona lenta (12 y 30 min) y la persona rápida (3 y 8 min) de
la corrida exploratoria quedaban fuera. (5) Errores menores míos: el archivo de
cifras exploratorias tenía dos puntos sin comillas y la primera ejecución se
cayó, y los comentarios `noqa: E402` de `run_all.py` los marcó como sobrantes
ruff 0.17. (6) La replicación no reprodujo la corrida exploratoria. Las DE
salieron unas 2 veces mayores, 4 de 10 medias de constantes quedaron a más de
una DE exploratoria, en los escenarios equivalentes el sesgo medio llegó a 3,85
min y no a 0,8 o menos, y el
cruce de ruido salió en 5,92 mg/dL y no en 2 a 3.

**Cómo se detectó.** (1) y (2) rederivando la covarianza entre el ruido de los
regresores y el de la integral antes de escribir el estimador, y confirmándolo
con un test de Monte Carlo (`test_integral_noise_cross_term_cancels_with_an_intercept`).
En la corrida, la versión literal y la variante sin el término difieren en
0,18 min o menos en las medias, porque el término cae en la dirección bien
condicionada. (3) por álgebra, al elegir la integral. (4) leyendo la sección 7
contra la lista de situaciones exploratorias. (5) por la traza del error y por
`ruff check`. (6) por la tabla que genera `run_all.py` en
`results/comparacion-con-corrida-exploratoria.md`. Una corrida de sensibilidad
con las semillas maestras 2 y 3, en `results/scratch/` y fuera del control de
versiones, mostró además que el veredicto de `delay_bias` en las dos personas
lentas cambia con la semilla maestra. Con 40 réplicas el error estándar de la
media es de 0,4 a 0,9 min, demasiado cerca del umbral de 1 min.

**Costo.** Sin la segunda derivación se habría implementado como "corrección
correcta" un término que empuja la estimación en la dirección mal
condicionada, justo donde sí mueve los resultados. Los errores menores costaron
una ejecución fallida. Ninguna cifra se publicó mal.

**Qué cambió.** Las decisiones se escribieron en
`docs/decisiones-de-implementacion.md` antes de correr y no se cambiaron
después. La fórmula literal quedó como versión primaria porque es la
registrada, y la variante sin término se informa aparte, rotulada como no
registrada. Se agregaron dos escenarios de replicación. El test
`test_results_directory_is_still_empty` ahora falla a propósito, porque el
README todavía dice que no hay resultados y esta tarea no podía tocarlo. Se
resuelve con el issue de fase 1 que rellena el README.

**Estado.** Abierta. Falta decidir si la especificación se enmienda por el
término del lado derecho, y conciliar la entrada pendiente de las cifras. Según
la regla de esta bitácora, la discrepancia con la corrida exploratoria merece
su propia entrada cuando se concilie.

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
