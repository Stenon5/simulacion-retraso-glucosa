# Barridos de mala especificación

La simulación base genera los datos con el mismo modelo que supone el
estimador. En esas condiciones al estimador se le pide resolver sus propias
ecuaciones, así que recuperar el retraso es una verificación y no una
validación. Este documento es el plan para romper ese supuesto a propósito.

Escrito antes de ejecutar cualquier barrido. Nada de lo que aparece aquí tiene
resultados.

## Por qué esto va antes que todo lo demás

Pasar a curvas de glucosa más realistas sacadas de un simulador de código
abierto cambia el origen de la señal de glucosa en sangre. No cambia la parte
circular, que es el modelo del tejido. Un simulador puede entregar una curva
de glucosa en sangre realista y las señales del tejido seguirían generándose
con difusión de primer orden, retraso constante y ruido blanco. Los barridos
de abajo atacan el modelo del tejido en sí, que es el supuesto que realmente
se pone a prueba.

## Los barridos

Cada barrido cambia un supuesto a la vez y deja todo lo demás en la línea
base. El entregable de cada uno es el punto donde el estimador deja de cumplir
los criterios de `umbrales.yaml`.

### 1. Retraso variable

Las constantes de tiempo cambian a lo largo del registro en vez de quedarse
fijas, por ejemplo de forma lenta, o con un cambio en escalón que representa
un cambio en la perfusión.

Informar: el sesgo y la dispersión en función de qué tan rápido cambia el
retraso, y si una versión del estimador con ventana deslizante recupera algo
útil. Se espera que este sea el primero en romperse, porque el estimador
ajusta una sola constante por profundidad en toda la ventana.

### 2. Ruido correlacionado entre profundidades

Las dos lecturas de profundidad vienen de un mismo instrumento, así que parte
de su ruido es compartido. Barrer la correlación entre las dos series de ruido
desde cero hasta una correlación fuerte.

Informar: el sesgo en función de la correlación. Este barrido ataca
directamente la corrección del error en las variables, que supone ruido
independiente, así que la corrección podría empeorar las cosas en vez de
mejorarlas. Ese es el resultado que hay que buscar.

### 3. Deriva del sensor

Sumar una deriva lenta de la línea base a cada profundidad, independiente o
compartida, encima del ruido blanco. Los sensores ópticos derivan, y el
estimador de ruido de `docs/especificacion.md` lee la segunda diferencia, que
no ve la deriva lenta.

Informar: el sesgo en función de la velocidad de deriva, y si la estimación
de ruido se mantiene correcta mientras la estimación del retraso se equivoca,
que sería el modo de falla silencioso.

### 4. Cinéticas que no son de primer orden

Generar las señales del tejido con algo que el estimador no supone. Dos
opciones, y vale la pena correr ambas: un retraso de transporte más difusión
de primer orden, y una respuesta de segundo orden. Las dos siguen siendo
simples, y cada una se equivoca en una dirección distinta.

Informar: el sesgo, y si el número de condición o cualquier otra cantidad que
calcula el estimador da alguna señal de que el modelo está equivocado. Un
estimador que falla de forma evidente es mucho más útil que uno que falla en
silencio.

### 5. Intervalo de muestreo y largo del registro

Barrer cada cuánto lee el sensor y cuánto dura el registro.

Informar: el registro más corto que todavía identifica ambas constantes de
tiempo en la línea base. Esto define cuántos datos tendría que juntar un
dispositivo antes de decir cualquier cosa.

### 6. Separación entre las dos profundidades

Barrer qué tan distintas son las dos constantes de tiempo, desde casi iguales
hasta muy separadas.

Informar: la separación bajo la cual el problema deja de ser identificable.
Es un requisito de hardware disfrazado, porque la separación depende de dónde
están ubicadas las dos profundidades.

## Cómo se informa un barrido

* Una fila por celda de la grilla, con el sesgo medio y la desviación estándar
  lado a lado, nunca la media sola.
* El umbral de `umbrales.yaml` que la celda no cumple, nombrado de forma
  explícita.
* La semilla y la configuración de cada fila.
* Una frase simple que diga dónde dejó de funcionar el estimador, en unidades
  que permitan actuar a quien lo lea.

## Qué significa un barrido fallido

Significa que el método tiene un dominio de validez declarado en vez de uno
implícito. Un barrido que muestra al estimador rompiéndose con ruido
correlacionado es un aporte más útil que otra corrida donde funciona bajo sus
propios supuestos.
