# Comparación con la corrida exploratoria del 2026-10-16

Generado por `run_all.py`. Las cifras exploratorias están transcritas en `docs/cifras-corrida-exploratoria.yaml` desde el documento original del medidor. Sus scripts se perdieron, así que no se sabe con qué curva, intervalo de muestreo ni semillas se obtuvieron. Si la reproducción discrepa, manda la reproducción.

Criterio de esta comparación: la media reproducida cae dentro de una desviación estándar de la cifra exploratoria, es decir, |media reproducida − media exploratoria| ≤ DE exploratoria. Las cifras reproducidas son de la versión primaria del estimador (la fórmula literal de la especificación).

| Situación exploratoria | Escenario reproducido | Cantidad | Exploratoria, media y DE | Reproducida, media y DE | Diferencia de medias | ¿Dentro de 1 DE exploratoria? | DE reproducida / DE exploratoria |
|---|---|---|---|---|---|---|---|
| Persona tipo, ruido 2 | `tipico_ruido_bajo` | τ1 (real 6 min) | 5,62 ± 0,56 | 6,21 ± 1,10 | 0,59 | no | 1,97 |
| Persona tipo, ruido 2 | `tipico_ruido_bajo` | τ2 (real 15 min) | 14,62 ± 0,60 | 15,29 ± 1,32 | 0,67 | no | 2,20 |
| Persona tipo, ruido 2 | `tipico_ruido_bajo` | ruido estimado (real 2 mg/dL) | 1,98 (sin DE informada) | 1,997 ± 0,071 | 0,017 | no aplica | no aplica |
| Persona tipo, ruido 5 | `tipico_ruido_medio` | τ1 (real 6 min) | 6,01 ± 1,48 | 6,73 ± 3,00 | 0,72 | sí | 2,03 |
| Persona tipo, ruido 5 | `tipico_ruido_medio` | τ2 (real 15 min) | 15,03 ± 1,59 | 15,98 ± 3,48 | 0,95 | sí | 2,19 |
| Persona tipo, ruido 5 | `tipico_ruido_medio` | ruido estimado (real 5 mg/dL) | 4,95 (sin DE informada) | 4,992 ± 0,178 | 0,042 | no aplica | no aplica |
| Persona tipo, ruido 8 | `tipico_ruido_alto` | τ1 (real 6 min) | 6,74 ± 2,69 | 9,24 ± 7,00 | 2,50 | sí | 2,60 |
| Persona tipo, ruido 8 | `tipico_ruido_alto` | τ2 (real 15 min) | 15,83 ± 2,90 | 18,85 ± 7,67 | 3,02 | no | 2,64 |
| Persona tipo, ruido 8 | `tipico_ruido_alto` | ruido estimado (real 8 mg/dL) | 7,92 (sin DE informada) | 7,987 ± 0,285 | 0,067 | no aplica | no aplica |
| Persona lenta, ruido 5 | `replica_persona_lenta` | τ1 (real 12 min) | 11,69 ± 1,30 | 12,71 ± 2,69 | 1,02 | sí | 2,07 |
| Persona lenta, ruido 5 | `replica_persona_lenta` | τ2 (real 30 min) | 29,73 ± 1,56 | 31,09 ± 3,58 | 1,36 | sí | 2,29 |
| Persona lenta, ruido 5 | `replica_persona_lenta` | ruido estimado (real 5 mg/dL) | 4,95 (sin DE informada) | 4,992 ± 0,178 | 0,042 | no aplica | no aplica |
| Persona rápida, ruido 5 | `replica_persona_rapida` | τ1 (real 3 min) | 3,60 ± 1,95 | 5,33 ± 4,13 | 1,73 | sí | 2,12 |
| Persona rápida, ruido 5 | `replica_persona_rapida` | τ2 (real 8 min) | 8,61 ± 2,00 | 10,65 ± 4,35 | 2,04 | no | 2,18 |
| Persona rápida, ruido 5 | `replica_persona_rapida` | ruido estimado (real 5 mg/dL) | 4,95 (sin DE informada) | 4,992 ± 0,178 | 0,042 | no aplica | no aplica |

En 6 de 10 comparaciones de constantes de tiempo la media reproducida cae dentro de una DE exploratoria.

## Dónde no se reproduce

* `tipico_ruido_bajo`, τ1: exploratoria 5,62 ± 0,56 min, reproducida 6,21 ± 1,10 min, diferencia 0,59 min, más que la DE exploratoria de 0,56 min.
* `tipico_ruido_bajo`, τ2: exploratoria 14,62 ± 0,60 min, reproducida 15,29 ± 1,32 min, diferencia 0,67 min, más que la DE exploratoria de 0,60 min.
* `tipico_ruido_alto`, τ2: exploratoria 15,83 ± 2,90 min, reproducida 18,85 ± 7,67 min, diferencia 3,02 min, más que la DE exploratoria de 2,90 min.
* `replica_persona_rapida`, τ2: exploratoria 8,61 ± 2,00 min, reproducida 10,65 ± 4,35 min, diferencia 2,04 min, más que la DE exploratoria de 2,00 min.

Además, cada fila de la tabla trae la razón entre la DE reproducida y la exploratoria. Que la media caiga dentro de una DE no implica que la dispersión se haya reproducido.

## Afirmaciones de la corrida exploratoria

* **Sesgo medio de 0,8 min o menos.** En los escenarios equivalentes el mayor sesgo medio absoluto reproducido es de 3,85 min (`tipico_ruido_alto`). No se reproduce. Las DE están en la tabla de arriba y en `results/resumen.md`.
* **La alarma llega entre 1,5 y 9 min antes en todos los escenarios.** Adelanto medio reproducido entre 5,18 y 11,97 min en los escenarios equivalentes, fuera del rango exploratorio. El adelanto medio es positivo en todos. Con la regla de `earlier_alarm`, que además exige no tener más falsas alarmas ni más episodios perdidos que la línea base, no cumplen: `tipico_ruido_alto`.
* **Con τ estimado rinde prácticamente igual que con τ real.** RMSE medio en mg/dL, τ estimado contra τ real: `tipico_ruido_bajo` 2,40 contra 2,22, `tipico_ruido_medio` 4,60 contra 3,88, `tipico_ruido_alto` 7,70 contra 5,20, `replica_persona_lenta` 5,89 contra 5,39, `replica_persona_rapida` 4,54 contra 2,99.
* **El error general solo baja con ruido de unos 2 mg/dL o en personas lentas.** Escenarios equivalentes donde el RMSE medio con dos profundidades y τ estimado es menor que con una profundidad suavizada: `tipico_ruido_bajo`, `tipico_ruido_medio`, `replica_persona_lenta`. Donde no es menor: `tipico_ruido_alto`, `replica_persona_rapida`. El conteo de corridas está en `results/resumen.csv`, columna `n_est_beats_single`.
* **Requisito de hardware de 2 a 3 mg/dL por lectura.** Cruce reproducido en la familia típica: 5,92 mg/dL (interpolado entre 5 y 8).
* **Un retraso poblacional de 10 min da un error de 19 a 31 % en hipoglucemia.** No es comparable. Esta corrida usa como línea base poblacional τ1 = 6 y τ2 = 15 min en el filtro de dos profundidades, no un único retraso de 10 min, y no informa porcentajes.

## Variante secundaria en los escenarios equivalentes

Sin el término del lado derecho que la derivación no respalda. No registrada de antemano.

| Escenario | τ1, media y DE | τ2, media y DE | Corridas válidas |
|---|---|---|---|
| `tipico_ruido_bajo` | 6,21 ± 1,10 | 15,28 ± 1,32 | 40/40 |
| `tipico_ruido_medio` | 6,70 ± 2,99 | 15,92 ± 3,47 | 40/40 |
| `tipico_ruido_alto` | 9,14 ± 6,93 | 18,67 ± 7,60 | 37/40 |
| `replica_persona_lenta` | 12,68 ± 2,69 | 31,02 ± 3,57 | 40/40 |
| `replica_persona_rapida` | 5,30 ± 4,11 | 10,58 ± 4,33 | 33/40 |
