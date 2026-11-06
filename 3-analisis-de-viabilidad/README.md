# Análisis de viabilidad

Análisis hecho solo con papel, literatura y cálculo, sin laboratorio. Responde si mezclar biomarcadores distintos permite superar a GlucoWatch, el primer monitor no invasivo aprobado por la FDA, y si eso tiene sentido frente a los monitores continuos (CGM) actuales.

**Qué es un dry lab.** Es el nombre que las guías en PDF le dan a este tipo de trabajo: se estudia una idea sin construir aparatos ni medir personas, solo con papel, literatura y cálculo. Un dry lab verifica cálculos, no un cuerpo. Es distinto de la simulación de [`../2-simulacion/`](../2-simulacion/), que genera datos sintéticos con un modelo. En el resto de los .md del repositorio se dice "análisis de viabilidad" para lo primero y "simulación" para lo segundo. Esta es la única explicación del término.

Esta carpeta es la fuente única del veredicto en texto. Los demás archivos enlazan aquí.

## Veredicto

**29 de octubre de 2026.** El diseño propuesto, con infrarrojo medio, dos profundidades y EEG en el oído, no supera a GlucoWatch ni tiene sentido hoy frente a los CGM.

* **¿Supera a GlucoWatch?** No. Falla la regla 0 y fallan las reglas 1, 3, 4 y 5 que la apoyan. No es condicional, porque lo que falla es la física de las capas y el hardware portátil, y ningún experimento barato lo resuelve.
* **¿Tiene sentido frente al mercado actual?** No hoy. Como alarma nocturna complementaria (R-B) no, como bienestar o tendencia (R-A) no hoy y como reemplazo del CGM (R-C) no es viable. En los tres rubros falla la regla 5: nadie ha demostrado un equipo portátil para uso nocturno.

El detalle y los cálculos paso a paso están en la guía completa, [`docs/guia-del-proyecto.pdf`](../docs/guia-del-proyecto.pdf), secciones 3.5 a 3.9 y 4.3. Lo que podría cambiar este veredicto, como un modelo óptico de la piel o datos reales, está en la sección 13 de [`2-simulacion/informe/factibilidad.md`](../2-simulacion/informe/factibilidad.md).

### Estado de los criterios

Los criterios de [`criterios-de-decision.md`](criterios-de-decision.md) los propuso Claude, el asistente de IA del proyecto, y el equipo todavía no los revisa. La única regla que decidió el equipo es la meta de la regla 0, superar a GlucoWatch. Los umbrales numéricos son juicio de diseño y siguen en consulta con la profesora. Por eso el veredicto es "no con estos criterios" y no "no con criterios ya validados".

## Reglas de decisión y sus cifras

Cada regla se aplicó como se fijó el 29 de octubre de 2026. Las siglas: MARD es el error porcentual medio frente a la sangre, mientras más bajo mejor. VPP es el valor predictivo positivo, o sea de cada 100 alarmas cuántas son verdaderas. ρ es la correlación entre los errores de dos sensores.

| Regla | Umbral | Cifra obtenida | Pasa |
|---|---|---|---|
| 0. Mejor que GlucoWatch | VPP mayor que el de GlucoWatch y de 70 % o más, menos retraso, sin calibración diaria con pinchazo, sin peor sensibilidad ni MARD, sin corriente que irrite la piel | VPP de 57 % con el diseño propuesto y dependencia 0,3. El retraso sí es menor en papel. La calibración sin pinchazo solo la logran equipos de escritorio | No |
| 1. Evidencia por biomarcador | Un estudio en personas con 20 participantes o más (o 1.000 pares) y MARD de 15 % o menos, declarando cómo calibra | Infrarrojo medio con MARD de 19,6 y 20,7 %. EEG del oído con 5 personas. Raman con mμSORS (230 personas) y el reloj (36 personas) pasan, pero no son el diseño propuesto | No |
| 2. Fusión de valores | MARD fusionado de 12 % o menos para R-B y de 10 % o menos para R-C, con ρ = 0,3 | 13,0 % con ρ = 0,3 y 14,0 % con el ρ medido de 0,49 (dos electrodos de un mismo CGM) | No |
| 3. Alarma multibiomarcador | Cumple la regla 0 en falsas alarmas y en sensibilidad, con ρ = 0,3. Cada biomarcador aporta información propia. Uno que depende de la respuesta autonómica nunca es la única vía | VPP de 54 a 57 % con EEG del oído y dependencia 0,3. Supuesto: el error del sensor óptico es lento (una serie AR(1) de 60 min), forma que no está en ningún estudio. Con ruido blanco el VPP sería 100 %, y por eso esa versión no vale | No |
| 4. Premisa de dos profundidades | Separación de retraso de 9 min o más entre las dos capas alcanzables. De 5 a 9 es marginal y bajo 5 no es viable | De 0,25 a 7,2 min según el caso. Mejor caso de 7,2 min (marginal) y caso intermedio de 3,5 min (no viable) | No |
| 5. Práctica | Versión portátil demostrada para uso nocturno, dentro de los límites de exposición del láser y sin calibración diaria | Ninguna versión portátil para dormir sin calibración diaria. Los equipos que miden bien son de escritorio | No |
| 6. Sentido de mercado | Ofrece algo que un CGM de venta libre no ofrece, sin perder confiabilidad de alarma y a costo comparable | CGM de venta libre desde USD 54 por 2 semanas. Un no invasivo de 15 % o más no ofrece algo que ellos no ofrezcan, salvo no tener aguja | No |

El rango de 54 a 57 % tiene una sola definición. El 57 % sale con un ruido del sensor óptico de σ = 13 mg/dL y el 54 % con σ = 18 mg/dL. En los dos casos el error es lento (supuesto) y la dependencia con el EEG es 0,3.

La regla 0 comparada parámetro por parámetro, con todas las cifras publicadas del GlucoWatch, está en [`glucowatch.md`](glucowatch.md).

## Opciones si hay que cambiar de rumbo

Si la retroalimentación de la profesora pide cambiar de rumbo, estas son las cuatro opciones que ve el equipo. Todas son propuesta y ninguna está decidida.

| Opción | Qué se conserva | Riesgo | Primer paso |
|---|---|---|---|
| A. Corregir el artefacto no invasivo | Base fisiológica, criterios, método de análisis de viabilidad y filtro de Kalman. Se descarta la tomografía de dos profundidades y el diseño con infrarrojo medio | Raman, que penetra 250 a 300 µm y tiene la mejor evidencia no invasiva (14,5 %), sigue siendo de escritorio y tarda unos 8 min por medición (dato de una nota de prensa). No pasa la regla de práctica | Repetir el análisis de viabilidad solo para Raman |
| B. Anclar la alarma en un CGM | Criterios, cálculos de fusión de alarmas, Kalman y detección de fallas. Se pierde la meta de medir glucosa sin aguja | Poco margen frente a un CGM solo, y el conjunto deja de ser no invasivo | Medir con datos pareados que ya existen cuánto coinciden las falsas alarmas de un CGM y de un reloj |
| C. Convertir el trabajo en un estudio de por qué fallan los no invasivos | Casi todo lo hecho, como evidencia. Se descarta la pretensión de diseñar un artefacto | Hay menos solución de ingeniería | Acordar con la profesora si un resultado negativo bien fundamentado cumple el objetivo del ramo |
| D. Descartar y elegir otro problema de salud | El método: criterios fijados antes, análisis de viabilidad y repositorio reproducible. Se descarta todo el contenido de glucosa | Tiempo | Listar problemas con mecanismo claro vistos en el curso |

En cualquier caso se conservan la base fisiológica (la ley de Fick y el bucle de control de la glicemia), el método y el repositorio reproducible. Fuente de la tabla: sección 4.1 del [resumen para la profesora](../docs/resumen-para-la-profesora.pdf).

## Archivos

| Archivo | Qué es |
|---|---|
| [`criterios-de-decision.md`](criterios-de-decision.md) | Las reglas para declarar éxito o fracaso, escritas antes de ver los datos. Se leen primero |
| `investigacion-2026-10-29.json` | 196 hallazgos de literatura y mercado, cada uno con su fuente. Los códigos O, E, H y M que usan los cálculos apuntan aquí, ver la regla de abajo |
| `verificacion-fuentes-2026-10-29.json` | 22 afirmaciones, 19 contrastadas contra su fuente original (14 respaldan y 5 con matiz) y 3 que no se pudieron abrir |
| `calculos_dry_lab.py` | Todos los cálculos: difusión, fusión de sensores, alarmas combinadas y comparación con GlucoWatch |
| `resultados-calculos.json` | La salida del script. Cada cifra trae su fórmula, sus entradas y su fuente |
| [`glucowatch.md`](glucowatch.md) | Ficha del GlucoWatch con sus cifras publicadas y la comparación con nuestra propuesta |
| `glucowatch-cifras.json` | 202 cifras del GlucoWatch, cada una con su cita literal y su fuente. Los ids C y R que usa la ficha apuntan aquí |

### Cómo leer los códigos O, E, H y M

El JSON de hallazgos no trae un campo de código. El código es la posición, contando desde 1, dentro de la lista `hallazgos` de cada sección del archivo.

| Letra | Sección del JSON | Hallazgos |
|---|---|---|
| O | `opticas` | 44 |
| E | `electromagneticas-multisensor` | 58 |
| H | `hipoglucemia-alarmas-fisiologia` | 41 |
| M | `mercado-normas-fracasos-fusion` | 53 |

Por ejemplo, O14 es el hallazgo 14 de `opticas`, el de Kottmann et al. (2016) sobre la penetración del infrarrojo medio.

## Falsas alarmas de GlucoWatch

Esta es la frase única que usan los demás archivos: 51 % de falsas alarmas con la alarma en 60 mg/dL (DirecNet, 2004) y 62 % con la alarma y la alerta de caída juntas (Tsalikian et al., 2004). Las dos cifras cuentan las falsas alarmas de forma distinta. El detalle y el resto de las cifras del GlucoWatch están en [`glucowatch.md`](glucowatch.md).

## Nota sobre una razón de las reglas

La razón de la regla 3 de [`criterios-de-decision.md`](criterios-de-decision.md) dice que la respuesta autonómica se apaga en la hipoglucemia inadvertida "justo en los pacientes de mayor riesgo". Esa razón se respalda con Yu et al. (2023) solo en la prevalencia: entre 23,2 y 26,2 % de las personas con diabetes tienen percepción alterada de la hipoglucemia. La parte "justo en los de mayor riesgo" no se pudo verificar en su fuente. El archivo de criterios no se edita después de ver los datos, así que la enmienda queda aquí.

## Cómo rehacer las cifras

```bash
# Instala las dependencias y el simulador de 2-simulacion/. El script ya agrega
# su carpeta src al camino de Python, así que lo que importa son las dependencias
python -m pip install -e 2-simulacion
# Entra a esta carpeta
cd 3-analisis-de-viabilidad
# Corre los cálculos y reescribe resultados-calculos.json
python calculos_dry_lab.py
```

Con la misma versión del repositorio, el resultado sale idéntico.
