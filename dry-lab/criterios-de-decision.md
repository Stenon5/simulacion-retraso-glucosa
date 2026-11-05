# Criterios de decisión del análisis dry lab

Escritos el 29 de octubre de 2026, antes de reunir los datos de mercado y de literatura del análisis. No se editan después de ver resultados. Una enmienda va en un archivo nuevo con su razón.

Estado: **Propuesta** de Claude, pendiente de revisión del equipo, salvo la meta de la regla 0, que la **decidió** el equipo. Los umbrales numéricos son juicio de diseño y se justifican en la columna de razón.

Historial, antes de ver cualquier dato:
- 29 de octubre de 2026. El equipo pidió que el éxito se mida contra lo que GlucoWatch logró por sí solo, mezclando mediciones de biomarcadores distintos. Se agregó la regla 0, se ajustaron las reglas 1 y 3, y el veredicto pasó a tener dos preguntas.

## Qué cuenta como éxito

El éxito del proyecto es superar a GlucoWatch G2, el primer monitor no invasivo aprobado por la FDA, justo en lo que lo hizo fracasar, combinando mediciones de biomarcadores distintos.

Superar a GlucoWatch es necesario, pero no basta para que el artefacto tenga sentido hoy. Los CGM actuales subieron mucho la vara. Por eso el veredicto responde dos preguntas por separado: si supera a GlucoWatch, y si tiene sentido frente al mercado actual.

## Rubros de uso, para el sentido de mercado

| Rubro | Para qué sirve | Exigencia mínima |
|---|---|---|
| R-A. Bienestar o tendencia | Ver si la glucosa sube o baja, sin decisiones médicas | MARD de 20 % o menos y dirección de la tendencia correcta |
| R-B. Alarma nocturna complementaria | Avisar una hipoglucemia de noche, junto a un glucómetro o un CGM | Sensibilidad de 85 % o más por evento bajo 70 mg/dL y valor predictivo positivo de 70 % o más |
| R-C. Monitor que reemplaza al CGM | Decidir dosis o conectarse a una bomba | Criterios iCGM de la FDA, en la práctica un MARD cercano a 10 % o menos |

## Reglas

| Regla | Pasa si | Razón |
|---|---|---|
| 0. Mejor que GlucoWatch (regla principal) | Con las cifras publicadas de cada biomarcador y la fusión calculada, el artefacto supera a GlucoWatch G2 en sus fallas: un valor predictivo positivo mayor que el suyo y de al menos 70 %, un retraso menor que el suyo y ninguna calibración diaria con pinchazo. Y no queda peor que GlucoWatch en sensibilidad para hipoglucemia ni en MARD. Además, no usa corriente de extracción que irrite la piel y sigue midiendo con sudor | Es la meta que fijó el equipo. La línea base son las cifras publicadas de GlucoWatch G2: exactitud, retraso, sensibilidad, falsas alarmas nocturnas, lecturas perdidas por sudor, irritación, calentamiento y calibración |
| 1. Evidencia por biomarcador | Para glucosa: un estudio revisado por pares en personas, con 20 participantes o más (o 1.000 pares o más), informa MARD de 15 % o menos, declarando cómo calibra. Para biomarcadores que no miden glucosa (EEG, ritmo cardíaco, sudor, temperatura): sensibilidad y especificidad, o AUROC, con 20 participantes o más | 15 % es el mejor no invasivo sin calibrar por persona del documento de trabajo, y 20 personas evita el optimismo de los estudios de 3 a 10 sujetos |
| 2. Fusión de valores | Con la correlación de errores de la literatura, o con ρ = 0,3 si no hay dato, el MARD fusionado llega a 12 % o menos para R-B y a 10 % o menos para R-C | La fusión solo aporta si los errores no comparten causa, y 0,3 es una correlación moderada por confusores comunes como temperatura e hidratación |
| 3. Alarma multibiomarcador | La combinación de biomarcadores (AND, OR, k de n o bayesiana), con las mejores cifras publicadas y ρ = 0,3, cumple la regla 0 en falsas alarmas y en sensibilidad. Cada biomarcador sumado aporta información propia: si su correlación con los demás pasa de 0,5, o si no mejora la mejor combinación sin él, se descarta. Un biomarcador que depende de la respuesta autonómica (sudor, pulso, temblor) nunca es la única vía | GlucoWatch fracasó por falsas alarmas, más de la mitad incorrectas de noche. La respuesta autonómica se apaga en la hipoglucemia inadvertida, justo en los pacientes de mayor riesgo |
| 4. Premisa de dos profundidades | La diferencia de retraso esperada entre las dos capas que la tecnología alcanza es de 9 minutos o más. Entre 5 y 9 es marginal. Bajo 5 no es viable | La simulación del repositorio funcionó con 9 minutos de separación, falló 7 de 40 veces con 5 y 16 de 40 con 3, todo con 5 mg/dL de ruido |
| 5. Práctica | Existe una versión portátil demostrada para uso nocturno, dentro de los límites de exposición del láser, sin calibración diaria con pinchazo | Un montaje de laboratorio no es un artefacto para dormir con él |
| 6. Sentido de mercado | Para su rubro, ofrece algo que un CGM de venta libre no ofrece, sin perder confiabilidad de alarma, a un costo comparable | Si hay CGM de unos 8 % de MARD a precio de consumo, un no invasivo de 15 % o más solo cabe en R-A o como alarma complementaria |

## Cómo se redacta el veredicto

Dos preguntas, cada una con su respuesta:

1. **¿Supera a GlucoWatch?** Se responde con la regla 0, apoyada en las reglas 1, 3, 4 y 5. Respuestas posibles: sí, condicional o no.
2. **¿Tiene sentido frente al mercado actual?** Se responde rubro por rubro con las reglas 1, 2, 3, 5 y 6.

En las dos preguntas:
- **Sí** o **viable** solo si pasan todas las reglas que aplican.
- **Condicional** si falla solo en reglas que un experimento concreto y barato podría resolver, y se nombra ese experimento.
- **No** o **no viable** en cualquier otro caso. Se dice con todas sus letras, sin suavizarlo.
