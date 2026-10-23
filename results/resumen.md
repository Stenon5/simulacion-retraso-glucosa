# Resumen de la corrida

Generado por `python run_all.py --seed 1`. No se edita a mano. Cada escenario tiene 40 réplicas con semillas `[1, réplica, profundidad]` (réplicas 0 a 39). Los datos por semilla están en `results/<escenario>.csv` y el registro de umbrales en `results/registro-de-umbrales.json`.

Datos sintéticos generados con el mismo modelo que supone el estimador. Esto verifica que el estimador resuelve sus propias ecuaciones. No es una validación contra un cuerpo real y no es un dispositivo médico.

Media y DE se calculan sobre las corridas válidas de cada escenario (ni constante negativa ni no identificable). DE es la desviación estándar entre semillas. El sesgo es la media menos el valor real. Las decisiones de implementación están en `docs/decisiones-de-implementacion.md`.

## Resultados, en el formato de la tabla del README

| Escenario | Retraso real 1 | Retraso estimado 1, media y DE | Retraso real 2 | Retraso estimado 2, media y DE | Nivel de ruido |
|---|---|---|---|---|---|
| `tipico_ruido_bajo` | 6 min | 6,21 ± 1,10 min | 15 min | 15,29 ± 1,32 min | 2 mg/dL |
| `tipico_ruido_medio` | 6 min | 6,73 ± 3,00 min | 15 min | 15,98 ± 3,48 min | 5 mg/dL |
| `tipico_ruido_alto` | 6 min | 9,24 ± 7,00 min | 15 min | 18,85 ± 7,67 min | 8 mg/dL |
| `persona_lenta` | 15 min | 16,16 ± 3,85 min | 30 min | 31,58 ± 4,79 min | 5 mg/dL |
| `persona_rapida` | 3 min | 7,51 ± 9,01 min | 6 min | 10,92 ± 9,33 min | 5 mg/dL |
| `replica_persona_lenta` | 12 min | 12,71 ± 2,69 min | 30 min | 31,09 ± 3,58 min | 5 mg/dL |
| `replica_persona_rapida` | 3 min | 5,33 ± 4,13 min | 8 min | 10,65 ± 4,35 min | 5 mg/dL |

Los escenarios `replica_*` no están en la grilla de la especificación. Se agregaron para replicar la corrida exploratoria (ver `docs/decisiones-de-implementacion.md`, sección 11).

## Sesgo junto a la dispersión, por escenario

| Escenario | Sesgo τ1 (min) | DE τ1 | Error estándar τ1 | Sesgo τ2 (min) | DE τ2 | Error estándar τ2 | Corridas válidas | Constante negativa | No identificable | Número de condición mediano |
|---|---|---|---|---|---|---|---|---|---|---|
| `tipico_ruido_bajo` | 0,21 | 1,10 | 0,17 | 0,29 | 1,32 | 0,21 | 40/40 | 0/40 | 0/40 | 103 |
| `tipico_ruido_medio` | 0,73 | 3,00 | 0,47 | 0,98 | 3,48 | 0,55 | 40/40 | 0/40 | 0/40 | 106 |
| `tipico_ruido_alto` | 3,24 | 7,00 | 1,15 | 3,85 | 7,67 | 1,26 | 37/40 | 3/40 | 0/40 | 115 |
| `persona_lenta` | 1,16 | 3,85 | 0,61 | 1,58 | 4,79 | 0,76 | 40/40 | 0/40 | 0/40 | 71 |
| `persona_rapida` | 4,51 | 9,01 | 1,84 | 4,92 | 9,33 | 1,90 | 24/40 | 11/40 | 5/40 | 762 |
| `replica_persona_lenta` | 0,71 | 2,69 | 0,43 | 1,09 | 3,58 | 0,57 | 40/40 | 0/40 | 0/40 | 46 |
| `replica_persona_rapida` | 2,33 | 4,13 | 0,72 | 2,65 | 4,35 | 0,76 | 33/40 | 7/40 | 0/40 | 276 |

Descriptivo, no registrado de antemano: la diferencia entre las dos constantes y las medianas. Sirve para ver en qué dirección se dispersan las estimaciones.

| Escenario | τ2 − τ1 real | τ2 − τ1 estimada, media y DE | Mediana τ1 | Mediana τ2 |
|---|---|---|---|---|
| `tipico_ruido_bajo` | 9 | 9,08 ± 0,40 | 6,19 | 15,35 |
| `tipico_ruido_medio` | 9 | 9,25 ± 1,00 | 6,33 | 15,98 |
| `tipico_ruido_alto` | 9 | 9,62 ± 1,61 | 7,20 | 17,33 |
| `persona_lenta` | 15 | 15,43 ± 1,39 | 16,15 | 31,75 |
| `persona_rapida` | 3 | 3,42 ± 0,89 | 5,75 | 8,68 |
| `replica_persona_lenta` | 18 | 18,38 ± 1,33 | 12,92 | 31,45 |
| `replica_persona_rapida` | 5 | 5,32 ± 0,90 | 4,08 | 9,38 |

## Ruido estimado junto al inyectado

| Escenario | Ruido inyectado (mg/dL) | Ruido estimado, media y DE (mg/dL) | Corridas dentro del 10 % |
|---|---|---|---|
| `tipico_ruido_bajo` | 2 | 1,997 ± 0,071 | 40/40 |
| `tipico_ruido_medio` | 5 | 4,992 ± 0,178 | 40/40 |
| `tipico_ruido_alto` | 8 | 7,987 ± 0,285 | 40/40 |
| `persona_lenta` | 5 | 4,992 ± 0,178 | 40/40 |
| `persona_rapida` | 5 | 4,992 ± 0,178 | 40/40 |
| `replica_persona_lenta` | 5 | 4,992 ± 0,178 | 40/40 |
| `replica_persona_rapida` | 5 | 4,992 ± 0,178 | 40/40 |

## Error de reconstrucción de la glucosa en sangre

RMSE en mg/dL sobre las 480 muestras, media y DE entre semillas, en las corridas válidas. El retraso poblacional fijo usa τ1 = 6 y τ2 = 15 min, los valores de la persona tipo, así que en los escenarios típicos coincide con el filtro con τ reales.

| Escenario | Dos profundidades, τ estimado | Dos profundidades, τ reales | Dos profundidades, τ poblacional fijo | Una profundidad suavizada | Corridas | Corridas donde τ estimado gana a una profundidad | Corridas donde τ estimado gana al poblacional |
|---|---|---|---|---|---|---|---|
| `tipico_ruido_bajo` | 2,40 ± 0,33 | 2,22 ± 0,16 | 2,22 ± 0,16 | 4,68 ± 0,10 | 40/40 | 40/40 | 14/40 |
| `tipico_ruido_medio` | 4,60 ± 1,16 | 3,88 ± 0,29 | 3,88 ± 0,29 | 5,31 ± 0,24 | 40/40 | 32/40 | 13/40 |
| `tipico_ruido_alto` | 7,70 ± 4,72 | 5,20 ± 0,42 | 5,20 ± 0,42 | 6,08 ± 0,38 | 37/40 | 21/37 | 9/37 |
| `persona_lenta` | 6,76 ± 1,51 | 5,91 ± 0,44 | 7,28 ± 0,23 | 10,23 ± 0,24 | 40/40 | 38/40 | 31/40 |
| `persona_rapida` | 6,35 ± 7,62 | 2,86 ± 0,25 | 5,10 ± 0,31 | 3,48 ± 0,20 | 24/40 | 9/24 | 16/24 |
| `replica_persona_lenta` | 5,89 ± 0,95 | 5,39 ± 0,39 | 6,11 ± 0,24 | 8,76 ± 0,24 | 40/40 | 40/40 | 30/40 |
| `replica_persona_rapida` | 4,54 ± 2,66 | 2,99 ± 0,23 | 4,83 ± 0,28 | 3,51 ± 0,22 | 33/40 | 17/33 | 25/33 |

Mismo RMSE, solo donde la sangre real está bajo 70 mg/dL:

| Escenario | τ estimado | τ reales | τ poblacional fijo | Una profundidad suavizada |
|---|---|---|---|---|
| `tipico_ruido_bajo` | 2,53 ± 0,52 | 2,31 ± 0,32 | 2,31 ± 0,32 | 5,19 ± 0,30 |
| `tipico_ruido_medio` | 5,06 ± 1,77 | 4,12 ± 0,69 | 4,12 ± 0,69 | 5,66 ± 0,75 |
| `tipico_ruido_alto` | 8,78 ± 6,31 | 5,58 ± 0,99 | 5,58 ± 0,99 | 6,21 ± 1,06 |
| `persona_lenta` | 7,70 ± 2,66 | 6,35 ± 1,02 | 8,12 ± 0,80 | 12,05 ± 0,73 |
| `persona_rapida` | 7,00 ± 8,46 | 3,02 ± 0,53 | 5,80 ± 0,64 | 3,63 ± 0,66 |
| `replica_persona_lenta` | 6,58 ± 1,84 | 5,77 ± 0,95 | 6,52 ± 0,82 | 9,96 ± 0,73 |
| `replica_persona_rapida` | 4,99 ± 3,32 | 3,16 ± 0,54 | 5,60 ± 0,59 | 3,60 ± 0,66 |

## Alarma de hipoglucemia

Adelanto = momento de la alarma con una profundidad suavizada menos momento con dos profundidades y τ estimado. Positivo es antes. Se calcula en las corridas válidas donde ambos detectan el episodio. Umbral 70 mg/dL.

| Escenario | Adelanto, media y DE (min) | Antes / igual / después | Falsas alarmas, método y línea base | Episodios perdidos, método y línea base | Adelanto con τ reales | Adelanto con τ poblacional |
|---|---|---|---|---|---|---|
| `tipico_ruido_bajo` | 6,47 ± 1,88 | 40/40, 0/40, 0/40 | 0 y 0 en 40 corridas | 0/40 y 0/40 | 6,03 ± 1,42 | 6,03 ± 1,42 |
| `tipico_ruido_medio` | 6,10 ± 3,10 | 39/40, 1/40, 0/40 | 0 y 0 en 40 corridas | 0/40 y 0/40 | 5,60 ± 1,85 | 5,60 ± 1,85 |
| `tipico_ruido_alto` | 7,76 ± 5,08 | 37/37, 0/37, 0/37 | 2 y 0 en 37 corridas | 0/37 y 0/37 | 5,70 ± 2,98 | 5,70 ± 2,98 |
| `persona_lenta` | 14,80 ± 3,38 | 40/40, 0/40, 0/40 | 0 y 0 en 40 corridas | 0/40 y 0/40 | 14,38 ± 2,76 | 5,08 ± 2,35 |
| `persona_rapida` | 6,75 ± 6,44 | 22/24, 2/24, 0/24 | 1 y 0 en 24 corridas | 0/24 y 0/24 | 3,54 ± 1,82 | 7,75 ± 2,91 |
| `replica_persona_lenta` | 11,97 ± 3,53 | 40/40, 0/40, 0/40 | 0 y 0 en 40 corridas | 0/40 y 0/40 | 11,70 ± 3,16 | 4,50 ± 2,70 |
| `replica_persona_rapida` | 5,18 ± 3,62 | 31/33, 1/33, 1/33 | 0 y 0 en 33 corridas | 0/33 y 0/33 | 3,21 ± 1,73 | 7,00 ± 2,80 |

## Umbrales de `umbrales.yaml`, escenario por escenario

| Escenario | delay_bias | earlier_alarm | beats_fixed_population_delay | noise_estimate_recovers |
|---|---|---|---|---|
| `tipico_ruido_bajo` | cumple | cumple | no cumple | cumple |
| `tipico_ruido_medio` | cumple (espíritu incumplido, DE de 3 min o más) | cumple | no cumple | cumple |
| `tipico_ruido_alto` | no cumple (espíritu incumplido, DE de 3 min o más) | no cumple | no cumple | cumple |
| `persona_lenta` | no cumple (espíritu incumplido, DE de 3 min o más) | cumple | cumple | cumple |
| `persona_rapida` | no cumple (espíritu incumplido, DE de 3 min o más) | no cumple | no cumple | cumple |
| `replica_persona_lenta` | no cumple (espíritu incumplido, DE de 3 min o más) | cumple | cumple | cumple |
| `replica_persona_rapida` | no cumple (espíritu incumplido, DE de 3 min o más) | cumple | cumple | cumple |

`noise_requirement` (familia τ1 = 6, τ2 = 15): cruce en 5,92 mg/dL (interpolado entre 5 y 8), cumple el mínimo de 3 mg/dL. Diferencias de RMSE (método menos una profundidad) en ruido 2: -2,28, 5: -0,72, 8: 1,62 mg/dL.

Veredicto global, regla `per_scenario` sobre los cinco escenarios de la grilla:

* `delay_bias`: no cumple en la grilla. No cumplen: `tipico_ruido_alto`, `persona_lenta`, `persona_rapida`. Contando los de replicación, no cumplen: `tipico_ruido_alto`, `persona_lenta`, `persona_rapida`, `replica_persona_lenta`, `replica_persona_rapida`.
* `earlier_alarm`: no cumple en la grilla. No cumplen: `tipico_ruido_alto`, `persona_rapida`. Contando los de replicación, no cumplen: `tipico_ruido_alto`, `persona_rapida`.
* `beats_fixed_population_delay`: no cumple en la grilla. No cumplen: `tipico_ruido_bajo`, `tipico_ruido_medio`, `tipico_ruido_alto`, `persona_rapida`. Contando los de replicación, no cumplen: `tipico_ruido_bajo`, `tipico_ruido_medio`, `tipico_ruido_alto`, `persona_rapida`.
* `noise_estimate_recovers`: cumple en la grilla. No cumplen: ninguno. Contando los de replicación, no cumplen: ninguno.
* `noise_requirement`: cumple.

## Variante secundaria, no registrada de antemano

El mismo estimador sin el término `N σ² Δt (0, 1, 1)` del lado derecho, que la derivación no respalda (`docs/decisiones-de-implementacion.md`, sección 5). Se informa solo para medir cuánto pesa ese término. No decide ningún umbral.

| Escenario | τ1, media y DE | Sesgo τ1 | τ2, media y DE | Sesgo τ2 | Corridas válidas |
|---|---|---|---|---|---|
| `tipico_ruido_bajo` | 6,21 ± 1,10 | 0,21 | 15,28 ± 1,32 | 0,28 | 40/40 |
| `tipico_ruido_medio` | 6,70 ± 2,99 | 0,70 | 15,92 ± 3,47 | 0,92 | 40/40 |
| `tipico_ruido_alto` | 9,14 ± 6,93 | 3,14 | 18,67 ± 7,60 | 3,67 | 37/40 |
| `persona_lenta` | 16,11 ± 3,84 | 1,11 | 31,49 ± 4,78 | 1,49 | 40/40 |
| `persona_rapida` | 7,43 ± 8,91 | 4,43 | 10,82 ± 9,23 | 4,82 | 24/40 |
| `replica_persona_lenta` | 12,68 ± 2,69 | 0,68 | 31,02 ± 3,57 | 1,02 | 40/40 |
| `replica_persona_rapida` | 5,30 ± 4,11 | 2,30 | 10,58 ± 4,33 | 2,58 | 33/40 |

## Configuración del filtro y de la corrida

Ruido de proceso de la pendiente q = 0,03333 (mg/dL/min)² por minuto. Inicialización x0 = [y1(0), 0, y1(0), y2(0)], P0 = diag(20², 1², 20², 20²). Ruido de medición R = σ̂² I. Las constantes de tiempo se estiman con el registro completo antes de filtrar.

Software: Python 3.11.9, numpy 2.4.6, scipy 1.17.1, matplotlib 3.11.2, pyyaml 6.0.3. Commit 14367a9e7cf6d086da002f4f5af02c1eb24cea84 con cambios sin commit en el árbol de trabajo.
