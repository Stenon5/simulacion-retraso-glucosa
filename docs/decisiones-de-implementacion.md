# Decisiones de implementación

Escritas el 2026-10-23, antes de ejecutar la grilla. Cubren lo que
`docs/especificacion.md` deja abierto o ambiguo. En cada caso se eligió la
lectura más simple y se deja la razón. Estas decisiones no se cambian después
de ver resultados. Si un error de código obliga a corregir algo, la corrección
va al final, en "Correcciones posteriores", con su razón, y también en
`BITACORA_DE_AGENTES.md`.

Ningún parámetro de este documento se eligió para acercarse a las cifras de la
corrida exploratoria del 2026-10-16.

## 1. Registro sintético

* **Duración y muestreo.** 480 minutos con un intervalo fijo de 1 minuto, o sea
  480 muestras (t = 0, 1, ..., 479 min). Las 8 horas vienen de la descripción
  original del prototipo ("un día sintético de 8 h con una hipoglucemia"). El
  minuto es un número redondo y es del mismo orden que el tiempo de
  integración de 50 s del montaje in vitro que cita el README.
* **Curva de glucosa en sangre.** Una curva fija, igual para todas las
  semillas:
  `G_s(t) = 120 + 60 exp(-((t - 90)/30)^2) - 70 exp(-((t - 300)/45)^2)` en mg/dL.
  Parte estable en 120, sube a unos 180 con una comida a los 90 min, baja a un
  mínimo de 50 a los 300 min (bajo 70 durante unos 52 min) y vuelve a 120. Hay
  una excursión hipoglucémica clara y dos subidas, como pide la sección 6. La
  bajada hacia la hipoglucemia llega a unos 1,3 mg/dL/min y la comida sube y
  baja a un máximo de unos 1,7 mg/dL/min. La varianza de la curva es de unos
  830 (mg/dL)².
* **La semilla no cambia la curva.** El README ya declara como limitación "un
  solo día sintético". Con la curva fija, la dispersión entre semillas mide solo
  el ruido del sensor, que es lo que varía la grilla. El argumento `seed` de
  `simulate_blood_glucose` se mantiene para respetar la firma del andamiaje y no
  tiene efecto en esta versión.

## 2. Difusión

* Cada profundidad se obtiene con la solución exacta de la ecuación de primer
  orden cuando la sangre se interpola en línea recta entre muestras
  (retención de primer orden). Para un tramo lineal la solución es cerrada:
  `G[k+1] = a G[k] + (1 - a) G_s[k] + (1 - (tau/dt)(1 - a)) (G_s[k+1] - G_s[k])`,
  con `a = exp(-dt/tau)`.
* Condición inicial en equilibrio, `G_i(0) = G_s(0)`. La curva parte estable,
  así que es la lectura más simple.
* Razón. Así el error de generación es despreciable y, sin ruido, el
  estimador puede recuperar las constantes reales, que es lo que exige el
  backlog.

## 3. Ruido y semillas

* Ruido gaussiano independiente, con la misma desviación estándar en las dos
  profundidades, igual al nivel del escenario.
* `run_all.py --seed S` es la semilla maestra. La réplica `r` usa, para la
  profundidad `i`, el generador `numpy.random.default_rng([S, r, i])`. Cada fila
  de los CSV guarda `S` y `r`, así que la corrida se puede rehacer exacta.
* Las dos profundidades nunca comparten semilla. Con la misma semilla su ruido
  sería idéntico, una correlación de 1, lo que rompería el supuesto del
  estimador sin que nadie lo hubiera pedido.
* Las mismas semillas se usan en todos los escenarios (números aleatorios
  comunes). Así las diferencias entre escenarios no vienen del azar del sorteo.
* **40 réplicas por escenario**, el mismo denominador que la corrida
  exploratoria. Se informa también el error estándar de la media, porque con
  40 réplicas la media tiene su propia incertidumbre.

## 4. Estimador de la varianza del ruido

* Para cada profundidad, `Var(Δ²y)/6`, con la varianza muestral insesgada
  (`ddof=1`).
* La especificación usa una sola `σ²` para las dos profundidades. Se usa el
  promedio de las dos estimaciones. La desviación estándar informada es su raíz.

## 5. Estimador del retraso

* **La integral.** Trapecio acumulado, con `Y(0) = 0`. Con una suma acumulada
  simple (Riemann por la derecha) aparece, incluso sin ruido, un corrimiento de
  `-Δt/2` en ambas constantes (0,5 min con Δt = 1), y no se cumpliría la
  recuperación exacta. El trapecio es la integral más simple que la cumple.
* **Versión primaria, la que decide los umbrales.** La fórmula de la sección 4
  de la especificación, al pie de la letra: se resta `N diag(0, σ², σ²)` a
  `XᵀX` y se suma `N σ² Δt (0, 1, 1)ᵀ` a `XᵀY`.
* **Hallazgo antes de ejecutar: el término de la derecha no se puede derivar.**
  El ruido de `G_1` entra en `Y` con signo positivo y el de `G_2` con signo
  negativo, así que cualquier corrección del lado derecho por ruido
  independiente tendría que ser proporcional a `(0, 1, -1)`, nunca a
  `(0, 1, 1)`. Además, con la integral por trapecio y la columna de unos en `X`,
  esa covarianza se cancela por completo en las ecuaciones de las pendientes.
  La muestra actual aporta `(N-1) σ² Δt/2` y el centrado que impone el
  intercepto resta exactamente `(N-1) σ² Δt/2`. La corrección derivada del lado
  derecho es entonces cero.
* **Variante secundaria.** Por eso se calcula también, en cada corrida, el
  estimador sin término del lado derecho (solo la corrección de `XᵀX`). Se
  decidió antes de ver resultados que la versión literal es la primaria, porque
  es la registrada en la especificación. La secundaria se informa aparte, con
  el rótulo "no registrada de antemano", solo para medir cuánto pesa el término
  dudoso. No decide ningún umbral.
* **Signos.** `tau_1 = -β_1` y `tau_2 = +β_2`.
* **Número de condición.** El que decide es el de la matriz corregida de las
  pendientes con los regresores centrados (2 x 2). Da exactamente las mismas
  pendientes que el sistema 3 x 3 con intercepto. El número de condición del
  3 x 3 literal lo domina la escala (la columna de unos contra glucosas del
  orden de 100 mg/dL) y no distingue un caso sano de uno casi singular. Se
  guarda igual en los CSV, en la columna `cond_full`.
* **No identificable.** Una corrida es no identificable si la matriz corregida
  de las pendientes no es definida positiva (la corrección por ruido se comió
  toda la información) o si su número de condición supera 10⁴. Con una
  varianza de la glucosa del orden de 10³ (mg/dL)², un número de condición de
  10⁴ significa que la señal que separa las dos profundidades tiene una
  desviación estándar de menos de medio mg/dL, muy por debajo del ruido más
  bajo de la grilla. En ese caso no se informa ningún número de la inversión.
* **Escenario no identificable.** Si más de la mitad de las corridas (más de 20
  de 40) son no identificables.
* **Constante de tiempo negativa o cero.** Es una falla. Se guarda el valor tal
  cual, sin recortar, y la corrida se cuenta aparte con su denominador.
* **Estadísticas por escenario.** Media, desviación estándar y sesgo se
  calculan sobre las corridas válidas (ni negativas ni no identificables), y
  siempre se informa cuántas son válidas de 40. La desviación estándar entre
  semillas es la muestral (`ddof=1`). El sesgo es la media menos el valor real.

## 6. Reconstrucción con filtro de Kalman

* Modelo continuo `dG_s/dt = s`, `ds/dt = w`, `dG_i/dt = (G_s - G_i)/tau_i`,
  discretizado de forma exacta con el método de Van Loan. No se agrega ruido de
  proceso propio a las profundidades.
* **Ruido de proceso.** Densidad espectral de la pendiente `q = 1/30`
  (mg/dL/min)² por minuto. Equivale a que la pendiente cambie 1 mg/dL/min en
  30 min con una desviación estándar, el orden de magnitud de las velocidades
  de cambio fisiológicas. No se ajustó mirando datos.
* **Ruido de medición.** `R = σ̂² I`, con un piso de 10⁻⁶ para que el caso sin
  ruido no divida por cero.
* **Inicialización.** `x0 = [y_1(0), 0, y_1(0), y_2(0)]` y
  `P0 = diag(20², 1², 20², 20²)` (20 mg/dL para las glucosas y 1 mg/dL/min para
  la pendiente). La muestra 0 también se usa en la actualización.
* **Salida.** La estimación filtrada, que usa la muestra actual y las pasadas.
* **Limitación que impone la especificación.** Las constantes de tiempo se
  estiman con el registro completo de 8 h y después se filtra. El filtro es
  causal dado τ, pero τ sí vio el registro completo, incluido el futuro de cada
  instante. Un dispositivo real tendría que estimar τ con datos anteriores.

## 7. Líneas base

* **Una profundidad suavizada.** Filtro de Kalman de tendencia lineal local
  `[nivel, pendiente]` sobre la profundidad 1, la de constante de tiempo más
  corta y por eso la más cercana a la sangre. Mismo `q`, mismo `σ̂` y la misma
  inicialización para nivel y pendiente. No corrige el retraso. Usar el mismo
  suavizador que el método hace que la diferencia venga solo de la segunda
  profundidad y del modelo de retraso, no de suavizar más o menos.
* **Retraso poblacional fijo.** El mismo filtro de dos profundidades con
  `tau_1 = 6` y `tau_2 = 15` min, los valores de la persona tipo de la grilla.
  Consecuencia previsible antes de correr: en los tres escenarios típicos esta
  línea base es idéntica al filtro con los τ reales, así que ahí el criterio
  `beats_fixed_population_delay` solo puede cumplirse por azar. La corrida
  exploratoria usó un único retraso poblacional de 10 min, que no es
  comparable con esta línea base.
* **τ reales.** El mismo filtro con las constantes reales del escenario, para
  medir el costo de no conocer el retraso (comparación 2 de la sección 8).

## 8. Métricas de error

* Primaria: raíz del error cuadrático medio (RMSE) de la reconstrucción contra
  la sangre real, sobre las 480 muestras.
* Secundaria: el mismo RMSE solo donde la sangre real está bajo 70 mg/dL.
* Las comparaciones entre métodos se hacen en las mismas corridas (las
  válidas del escenario).

## 9. Alarma de hipoglucemia

* Umbral de 70 mg/dL, el de hipoglucemia de nivel 1.
* Una alarma es cada cruce hacia abajo (muestra anterior en 70 o más y muestra
  actual bajo 70), y la muestra 0 si la serie parte bajo 70. Sin histéresis.
* El episodio real es el intervalo en que la sangre está bajo 70. Hay uno solo
  por construcción.
* El momento de detección es el primer cruce dentro de `[inicio - 30, fin]`.
  Si no hay ninguno, el episodio se cuenta como perdido.
* Una falsa alarma es un cruce fuera de `[inicio - 30, fin + 30]`. La ventana
  de 30 min es más ancha que cualquier adelanto plausible y, a 30 min del
  inicio, la sangre real todavía está sobre 100 mg/dL.
* El adelanto es el momento de la línea base de una profundidad menos el
  momento del método, en las corridas donde ambos detectan. Positivo es antes.

## 10. Cómo se evalúa cada criterio de `umbrales.yaml`

* `delay_bias`. Por escenario, se cumple si el sesgo medio absoluto es menor a
  1 min para las dos constantes, en las corridas válidas. Un escenario no
  identificable no lo cumple. La nota de "dispersión varias veces mayor" se
  lee contra el umbral de 1 min: si la desviación estándar es de 3 min o más se
  marca como incumplimiento del espíritu. La razón es que en un estimador sin
  sesgo la media tiende a cero, y comparar contra ella marcaría cualquier caso.
  El registro guarda también la razón entre desviación y sesgo, para quien
  prefiera la otra lectura.
* `noise_requirement`. Solo la familia típica tiene varios niveles de ruido
  (2, 5 y 8). Para cada uno se calcula la diferencia entre el RMSE medio del
  método y el de la línea base de una profundidad. El cruce es el primer cambio
  de signo, subiendo desde el ruido más bajo, interpolado en línea recta. Si el
  método gana en los tres niveles, el cruce se informa como "8 o más". Se
  cumple si el cruce es de 3 mg/dL o más.
* `earlier_alarm`. Por escenario, se cumple si el adelanto medio es positivo, y
  el método no tiene más falsas alarmas que la línea base, y no pierde más
  episodios que ella. Activarse antes no sirve si se deja de activar.
* `beats_fixed_population_delay`. Por escenario, se cumple si el RMSE medio con
  τ estimado es menor que con τ poblacional fijo.
* `noise_estimate_recovers`. Por escenario, se cumple si la media de `σ̂` está
  dentro del 10 por ciento del ruido inyectado. Se informa también cuántas
  corridas individuales lo cumplen.
* **Veredicto global.** Según la regla `per_scenario`, sobre los cinco
  escenarios de la grilla de la especificación. Aparte se informa sobre los
  siete escenarios ejecutados, incluidos los de replicación.

## 11. Grilla

* **Un valor por etiqueta**, que es la lectura literal de la sección 7 ("los
  valores concretos de corta, larga, bajo, medio y alto"): la más corta 3 min,
  corta 6 min, larga 15 min, más larga 30 min, ruido bajo 2, medio 5 y alto 8
  mg/dL.
* Grilla de la especificación: típico (6 y 15 min) con ruido 2, 5 y 8, persona
  lenta (15 y 30 min) con ruido 5 y persona rápida (3 y 6 min) con ruido 5.
* **Escenarios de replicación agregados.** Las tres situaciones típicas de la
  corrida exploratoria coinciden con la grilla. Las otras dos no, porque con un
  valor por etiqueta la persona lenta exploratoria (12 y 30 min) y la persona
  rápida exploratoria (3 y 8 min) quedan fuera. Se agregan como
  `replica_persona_lenta` y `replica_persona_rapida`.
* **El barrido explícito de la separación entre profundidades** que menciona la
  sección 7 no se implementa en esta corrida. Es el barrido 6 de la fase 2 del
  backlog.

## 12. Figura

* Escenario típico con ruido medio, réplica 0. Se eligió antes de ver
  resultados, para no escoger la corrida más bonita.

## Correcciones posteriores

Ninguna decisión de arriba cambió después de ver resultados. Después de la
primera corrida completa solo se agregó información descriptiva a
`results/resumen.md`, rotulada como no registrada de antemano: la diferencia
τ2 − τ1, las medianas y los conteos de corridas donde un método gana a otro.
También se cambió el separador decimal del título de la figura a coma. Nada de
eso cambia una cifra ni un veredicto.

La única corrección de código fue de sintaxis: el archivo
`docs/cifras-corrida-exploratoria.yaml` tenía dos puntos sin comillas y la
primera ejecución se cayó antes de producir resultados.
