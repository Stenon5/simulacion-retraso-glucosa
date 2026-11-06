# GlucoWatch: ficha con cifras y comparación con nuestra propuesta

El GlucoWatch Biographer (Cygnus, aprobado por la FDA en 2001) y su segunda versión, el GlucoWatch G2 (2002), son el único monitor de glucosa sin aguja que llegó al mercado. La regla 0 del proyecto pide superarlo. Este archivo junta sus cifras publicadas y compara contra ellas nuestra propuesta, parámetro por parámetro.

Cada cifra lleva entre paréntesis su id en [`glucowatch-cifras.json`](glucowatch-cifras.json), donde están la cita literal, la fuente y las condiciones. Los ids C vienen de la literatura clínica y los R de documentos regulatorios, del fabricante, financieros y de prensa. Barrido del 6 de noviembre de 2026.

Siglas: GW1 es el primer modelo y G2 el segundo. MARD es el error relativo medio frente a la sangre. VPP es el valor predictivo positivo, o sea de cada 100 alarmas cuántas son verdaderas.

## 1. Cómo funcionaba

Una corriente de unos 0,3 mA (0,35 mA/cm²) pasa por la piel y arrastra glucosa del líquido intersticial hacia dos discos de gel con glucosa oxidasa. La enzima produce peróxido de hidrógeno, que se mide en un electrodo de platino (R16, R18, R19). Lo extraído está en el rango micromolar, mil veces más diluido que la glucosa en sangre (Poddar et al., 2008, verificación id 11 de `verificacion-fuentes-2026-10-29.json`). Se usaba como reloj de muñeca con un sensor desechable, el AutoSensor, y la FDA lo aprobó solo como complemento del glucómetro (R51, R52).

| Parámetro | GW1 (2001) | G2 (2002) | Id |
|---|---|---|---|
| Rango de medición | 40 a 400 mg/dL | 40 a 400 mg/dL | R1, R2 |
| Calentamiento antes de medir | 3 h | 2 h | R10, R11 |
| Ciclo de medición | 3 min de extracción y 7 de medición. Cada lectura promedia dos ciclos | Cada lectura promedia los 20 min previos | R12, R13 |
| Intervalo entre lecturas | 20 min | 10 min | R5, R6 |
| Lecturas máximas por sensor | 36 | 78 | R7 |
| Duración de cada sensor | 12 h | 13 h | R8, R9 |
| Retraso frente a la sangre | Unos 15 min según la FDA. Medido: 18 min, y 17,2 ± 7,2 min, de los que unos 5 son fisiológicos | Igual | R14, C52, C53 |
| Calibración | Una punción después del calentamiento, con la glucosa entre 41 y 279 mg/dL | Igual | R3, C59 |
| Reglas para saltar lecturas | Sudor, piel bajo 22 °C, cambio rápido de temperatura o señal inconsistente. Con 6 saltos seguidos se apaga | Igual | R22, R23 |
| Alertas | Baja, alta y caída rápida (35 % bajo la lectura anterior) | Agrega la alerta de caída, que suena si la alerta baja puede alcanzarse en 20 min | R28, R31 |
| Margen recomendado para la alerta baja | 20 a 30 mg/dL sobre el nivel a detectar | 10 a 20 mg/dL | R30 |
| Memoria | Unas 4.000 lecturas | Más de 8.500 datos según la etiqueta | R32 |
| Energía y agua | Una pila AAA y respaldo de litio. Resiste salpicaduras, no es sumergible | Igual | R33, R34 |
| Sensor en banco | Linealidad r ≥ 0,999. CV menor a 4 % dentro de una corrida y de 4 a 8 % en total | Sin dato | R36, R37 |

No se encontraron el tamaño ni el peso del reloj, ni los umbrales numéricos del detector de sudor (R21).

## 2. Desempeño medido en personas

### Exactitud

| Medida | Valor | Población | Id |
|---|---|---|---|
| MARD, GW1 en adultos | 15,6 %, con r = 0,88 y 96,8 % en las zonas A y B de Clarke | 92 adultos, 2.167 pares, estudio de Cygnus | C1, C3, C4 |
| Diferencia absoluta media, G2 en adultos | 24,5 %, con 95 % en las zonas A y B | 85 adultos, 2.665 pares, etiqueta del G2 | R43 |
| MARD, GW1 en niños | 21 % | 66 niños y adolescentes | C18 |
| Diferencia relativa, G2 en niños | Mediana de 16 % y media de 22 %. Diferencia absoluta mediana de 23 mg/dL | 89 niños, 3.672 pares, DirecNet | C21, C22, C24 |
| Criterio ISO propuesto | Lo cumplió 60 % de las lecturas | Igual | C25 |
| Cuadrícula de consenso | 67 % en la zona A y 97 % en A y B | Igual | C27 |
| Exactitud con la glucosa bajo 70 mg/dL | Diferencia relativa mediana de 38 %. Cumple ISO 32 % | 334 pares | C28 |
| Exactitud con la glucosa en 60 mg/dL o menos | Diferencia absoluta mediana de 26 mg/dL. Solo 31 % de lecturas dentro de 15 mg/dL | 192 pares | C38, C39 |
| Lecturas falsas bajo 60 mg/dL en niños sanos | 73 % de los niños tuvo al menos una | 15 niños sin diabetes | C45 |
| Variación entre sensores | 13 % de los sensores tuvo una diferencia relativa mediana de 30 % o más | 171 sensores | C35 |

### Lecturas perdidas y fallas

| Medida | Valor | Id |
|---|---|---|
| Lecturas saltadas, G2 | 17 % en estudio clínico. La etiqueta dice 21 %, con 16 % de usos que se apagan antes de tiempo y 55 lecturas de las 78 posibles en promedio | C64, R26 |
| Lecturas saltadas, GW1 | Cerca de 20 %. Se apaga antes de tiempo en 25 % de los usos y entrega unas 26 lecturas de 36 | R24 |
| En un campamento de verano | 34 % de lecturas saltadas. 20 % de los saltos por sudor y 16 % por temperatura | C66 |
| Con ejercicio | Solo 11 % de las lecturas con ejercicio moderado y ninguna con ejercicio intenso | C67 |
| Calibración | 94 % al primer intento en el G2. En el GW1, cerca de 20 % necesitó más de un intento | C60, R27 |
| Sensores que duran toda la noche | 81 % de los sensores calibrados duró 14,5 h o más en clínica. En el campamento, solo 28 % de los calibrados duró toda la noche | C62, C63 |

### Piel

| Medida | Valor | Id |
|---|---|---|
| Estudios del fabricante, GW1 | Entre 87 y 90 % de los usos sin irritación o con irritación leve | C69, C70, R48 |
| Etiqueta del G2 | Eritema fuerte en menos de 2 % de los sitios | R49 |
| Niños con el G2 durante 6 meses | 55 % con cambios agudos (36 % leves, 19 % moderados, ninguno grave). Todos tuvieron irritación alguna vez, y 51 % quedó con cambios crónicos como costras o manchas | C76, C77 |
| Razón para usarlo menos | La irritación, en 76 % de los niños | C75 |

### Alarmas de hipoglucemia

| Medida | Valor | Id |
|---|---|---|
| Alarma en 60 mg/dL | Detectó 23 % de las hipoglucemias, con 51 % de falsas alarmas contadas por lectura | C82 |
| Subir el umbral | En 90 mg/dL detecta 72 % con 58 % de falsas. En 120 mg/dL pasa de 90 % con 85 % de falsas | C85 |
| Alarma más alerta de caída | Sensibilidad de 88 % en la prueba de insulina y de 77 % de noche, con 62 % de primeras alarmas falsas (16 % con la alarma sola) | C86, C89, C91 |
| Noches sin hipoglucemia | 47 % de los relojes dio al menos una alarma | C90 |
| Episodios nocturnos avisados | Solo 10 de 18 se confirmaron con la referencia | C84 |
| Si la alarma despierta | 29 % de las alarmas despertó al niño. Las 11 hipoglucemias confirmadas sí lo despertaron, y 55 % de los eventos de alarma no tenía hipoglucemia ni hiperglucemia | C93, C95, C96 |
| Uso en casa durante 3 meses | Sensibilidad de 79 % y especificidad de 83 % | C99 |
| Umbral necesario para 70 % de especificidad | 125 mg/dL | C101 |
| Etiqueta del G2, adultos | Detectó 77 % de las hipoglucemias con la alerta baja en 80 mg/dL | R44 |

Las cifras de falsas alarmas no son comparables entre sí porque usan definiciones distintas. El 51 % cuenta lecturas del reloj bajo 60 mg/dL con la referencia sobre 60 (DirecNet, 2004). El 62 % cuenta la primera alarma de cada reloj con la referencia sobre 70 mg/dL durante los 30 min antes y después (Tsalikian et al., 2004).

### Resultados clínicos y uso real

| Medida | Valor | Id |
|---|---|---|
| HbA1c a los 6 meses, ensayo aleatorizado en 200 niños | 8,1 % con el G2 frente a 7,9 % sin él, sin diferencia significativa | C104 |
| Hipoglucemia grave en ese ensayo | 7 % con el G2 frente a 2 % sin él (P = 0,10) | C106 |
| Razones para usarlo menos | Irritación 76 %, saltos 56 %, exceso de alarmas 47 % e inexactitud 33 % | C75, C68, C100 |
| Uso en el tiempo | De 2,1 sensores por semana el primer mes a 1,5 el sexto | C110 |
| Abandono | 27 % de los niños a los 6 meses. En adultos, solo 20 % lo seguía usando a los 18 meses, frente a 57 % con el CGMS de Medtronic | C111, C114 |
| Percepción | 76 % de los jóvenes estuvo de acuerdo con que es incómodo o doloroso | C117 |

## 3. Historia regulatoria y de mercado

| Fecha | Hito | Id |
|---|---|---|
| Octubre de 2000 | Empieza a venderse en el Reino Unido | R58 |
| 22 de marzo de 2001 | La FDA aprueba el GlucoWatch para adultos, como complemento del glucómetro (PMA P990026) | R50, R51 |
| 21 de marzo de 2002 | La FDA aprueba el G2 para adultos | R55 |
| 15 de abril de 2002 | Llega a Estados Unidos: USD 595 el reloj y USD 69,75 la caja de 16 sensores (USD 4,36 cada uno) | R58, R62, R63 |
| 26 de agosto de 2002 | La FDA aprueba el G2 y su uso en niños de 7 a 17 años | R52 |
| 2002 | Unos 36.000 relojes despachados, la mayoría a Sankyo, que los distribuía | R71 |
| Diciembre de 2002 | Kit del G2 a USD 698 y sensor a USD 7,50. En 2001 ningún seguro lo reembolsaba, y desde 2002 el copago iba de 0 a 100 % según el plan | R65, R67 |
| Noviembre de 2003 | La FDA aprueba una tercera generación con menos lecturas saltadas. Nunca se vendió | R56 |
| 23 de diciembre de 2003 | Fin del acuerdo con Sankyo, que devuelve unos 20.000 relojes y un millón de sensores | R73 |
| Febrero de 2004 | La etiqueta agrega un corticoide antes de ponerlo, para reducir la irritación | R57 |
| 14 de julio de 2004 | Precio estándar de USD 872,50 el reloj y USD 9,38 el sensor, con una promoción a USD 300 y 4 | R66 |
| Diciembre de 2004 a marzo de 2005 | Cygnus vende los activos a Animas por USD 10 millones y se disuelve | R77, R78 |
| 31 de julio de 2007 | Animas deja de vender el G2. Sensores y soporte hasta el 31 de julio de 2008 (fuente secundaria) | R80 |

Las ventas de producto de Cygnus fueron de USD 0,49 millones en 2001, 3,45 en 2002, 2,68 en 2003 y 0,56 en 2004 (R69). Cygnus atribuyó la baja adopción a las barreras de una tecnología nueva, al cambio de hábitos que exigía, a la falta de reembolso y al desempeño del aparato (R79). La base de eventos adversos de la FDA tiene 8 informes con la marca: 5 lesiones y 2 fallas (R61).

## 4. Comparación con nuestra propuesta

La propuesta original mide con luz infrarroja media en dos capas de la piel, estima la sangre con un filtro de Kalman y confirma la alarma con un EEG del oído. Las cifras del GlucoWatch se midieron en personas. Las nuestras salen de la simulación (`2-simulacion/results/resumen.md`) y de los cálculos de este análisis (`resultados-calculos.json`). Por eso la tabla separa lo que pasa en papel de lo que permiten la física y la evidencia de hoy.

| Parámetro | GlucoWatch G2, medido | Nuestra propuesta, en papel | ¿Lo supera en papel? | Con la física y la evidencia de hoy |
|---|---|---|---|---|
| Piel | Corriente por la piel. 55 % de los niños con cambios agudos a los 6 meses, y 76 % lo usó menos por irritación | Luz, sin corriente | 🟢 Sí | Sin dato: falta revisar la exposición al láser durante toda la noche |
| Calentamiento | 2 h | Sin definir | Sin dato | Sin dato |
| Frecuencia de lectura | Cada 10 min, y cada lectura promedia los 20 min previos | Una por minuto en la simulación | 🟢 Sí | Sin dato: no hay aparato |
| Retraso frente a la sangre | Unos 15 min según la FDA, 17 a 18 min medidos | Estima la sangre: la alarma llega 5,2 a 14,8 min antes que midiendo una sola capa | 🟡 Solo en simulación | 🔴 No: la luz llega a unos 45 µm, y ahí las capas separan sus retrasos 0,25 a 7,2 min, cuando el método necesita 9 |
| Exactitud | MARD de 15,6 % (GW1, adultos) a 24,5 % (G2, adultos), y 22 % en niños | Infrarrojo medio publicado: 19,6 a 20,7 % | 🟡 Queda dentro del rango del GlucoWatch, sin mejorarlo | 🔴 No lo mejora. Fusionado con Raman bajaría a 13 o 14 %, pero Raman es de escritorio |
| Exactitud en hipoglucemia | Diferencia relativa mediana de 38 % bajo 70 mg/dL | Sin dato | Sin dato | Sin dato |
| Calibración | Una punción cada 13 h | El retraso no la necesita, pero el valor de glucosa sí | 🔴 No | 🔴 No: ningún equipo portátil de infrarrojo medio funciona sin calibración diaria |
| Lecturas perdidas | 17 a 21 % saltadas, y casi ninguna con ejercicio | Sin dato | Sin dato | Sin dato. Riesgo: el agua absorbe fuerte en el infrarrojo medio, y el sudor es casi todo agua |
| Sensibilidad nocturna de la alarma | 77 % con la alerta de caída | 85 % con la vía óptica y el EEG del oído, con dependencia 0,3 entre ambas | 🟡 Sí, con un EEG del oído sin validar | 🔴 El EEG del oído tiene un estudio preliminar de 5 personas |
| Falsas alarmas por semana | 3,35 | 0,35 a 0,40 | 🟡 Sí, de 8 a 10 veces menos | 🔴 Casi toda la mejora la pone el EEG del oído. La vía óptica sola daría 2,98, casi como el GlucoWatch |
| VPP | 38 % en su estudio y 11 % con la frecuencia real de hipoglucemia | 54 a 57 % | 🟡 Sí, pero 🔴 bajo el 70 % fijado | 🔴 La vía óptica sola daría 14 % |
| Aparato portátil y aprobado | Reloj de muñeca aprobado por la FDA en 2001 | No existe una versión portátil | 🔴 No | 🔴 No |
| Beneficio clínico | No mejoró la HbA1c en 6 meses | Sin dato | Sin dato | Sin dato |
| Uso sostenido | 27 % de los niños lo dejó a los 6 meses | Sin dato | Sin dato | Sin dato |
| Costo | Reloj de USD 595 a 872,50 y sensor de USD 4,36 a 9,38 por uso de 13 h, sin reembolso amplio de los seguros | Sin dato | Sin dato | Sin dato |

Cómo se calculan las filas de alarmas: todas usan la mediana real de 0,54 hipoglucemias nocturnas por semana. Las 3,35 falsas alarmas semanales del GlucoWatch salen de su 62 % de falsas, suponiendo un episodio inducido por persona y día en el estudio. Lo nuestro usa un error lento del sensor óptico (σ de 13 a 18 mg/dL, supuesto) y una dependencia de 0,3 con el EEG. Fórmulas y entradas en `resultados-calculos.json`, sección `d_alarmas`.

### Si la alarma se ancla en un CGM (opción B)

| Combinación | Sensibilidad | VPP | Falsas alarmas por semana | Frente al GlucoWatch | Regla R-B: 85 % y 70 % |
|---|---|---|---|---|---|
| GlucoWatch G2 | 77 % | 11 % | 3,35 | No aplica | 🔴 No |
| Dexcom G7 solo | 88 % | 65 a 85 % | 0,09 a 0,26 | 🟢 Mejor | 🟡 Solo en el caso optimista |
| G7 y EEG del oído, las dos juntas | 82 % | 94 % | 0,03 | 🟢 Mejor | 🔴 No: la sensibilidad baja de 85 % |
| 2 de 3: G7, EEG del oído y reloj | 93 % | 60 % | 0,34 | 🟢 Mejor | 🔴 No: el VPP queda bajo el del G7 solo |
| 2 de 3: G7, EEG bajo la piel y reloj | 93 % | 88 % | 0,07 | 🟢 Mejor | 🟢 Sí, pero el EEG bajo la piel es un implante |

Todas con dependencia 0,3 entre señales. Cifras de `resultados-calculos.json`, sección `d_alarmas`.

## 5. Qué dice la comparación

1. **En papel, la propuesta le gana al GlucoWatch justo donde fracasó.** Tiene de 8 a 10 veces menos falsas alarmas por semana, más sensibilidad de noche, menos retraso y no pasa corriente por la piel.
2. **Esas ventajas no resisten la física ni la evidencia de hoy.**
   - 🔴 El retraso no se puede estimar, porque las capas que alcanza el infrarrojo medio casi no se diferencian.
   - 🔴 La exactitud publicada del infrarrojo medio, de 19,6 a 20,7 %, no mejora la del GlucoWatch.
   - 🔴 Sigue necesitando punciones para calibrar.
   - 🔴 Casi toda la mejora en falsas alarmas depende de un EEG del oído probado en 5 personas. Sola, la vía óptica tendría un VPP de 14 %, casi el 11 % del GlucoWatch.
3. 🔴 **Aun en papel, el VPP de 54 a 57 % queda bajo el 70 % que fijamos.**
4. **El GlucoWatch no cayó solo por exactitud.** Los niños del ensayo lo usaron cada vez menos por irritación (76 %), lecturas saltadas (56 %), exceso de alarmas (47 %) e inexactitud (33 %). En papel, nuestra propuesta ataca dos de esas causas. Deja sin evaluar las lecturas perdidas y sin resolver la calibración y el costo.
5. **Un CGM solo ya supera al GlucoWatch en alarmas.** Sumarle señales débiles con la regla 2 de 3 empeora el VPP. Solo ayuda exigir que coincida con una señal validada, y aun así baja la sensibilidad.

Veredicto: 🔴 tal como está, la propuesta no funcionaría. Supera al GlucoWatch solo en papel, y en lo que hoy se puede comprobar no lo supera. Se mantiene el veredicto del 29 de octubre del [README](README.md), ahora con la comparación detallada.

## Fuentes principales

Clínicas, con sus cifras en `glucowatch-cifras.json`:

- Buckingham, B., Block, J., Burdick, J., Kalajian, A., Kollman, C., Choy, M., Wilson, D. M., Chase, P., & Diabetes Research in Children Network. (2005). Response to nocturnal alarms using a real-time glucose sensor. *Diabetes Technology & Therapeutics, 7*(3), 440-447. https://doi.org/10.1089/dia.2005.7.440
- Chase, H. P., Beck, R., Tamborlane, W., Buckingham, B., Mauras, N., Tsalikian, E., et al. (2005). A randomized multicenter trial comparing the GlucoWatch Biographer with standard glucose monitoring in children with type 1 diabetes. *Diabetes Care, 28*(5), 1101-1106. https://doi.org/10.2337/diacare.28.5.1101
- Diabetes Research in Children Network (DirecNet) Study Group. (2003). The accuracy of the GlucoWatch G2 biographer in children with type 1 diabetes: Results of the diabetes research in children network (DirecNet) accuracy study. *Diabetes Technology & Therapeutics, 5*(5), 791-800. https://doi.org/10.1089/152091503322526996
- Diabetes Research in Children Network (DirecNet) Study Group. (2004). Accuracy of the GlucoWatch G2 Biographer and the continuous glucose monitoring system during hypoglycemia: Experience of the Diabetes Research in Children Network. *Diabetes Care, 27*(3), 722-726. https://doi.org/10.2337/diacare.27.3.722
- Diabetes Research in Children Network (DirecNet) Study Group. (2005). Youth and parent satisfaction with clinical use of the GlucoWatch G2 Biographer in the management of pediatric type 1 diabetes. *Diabetes Care, 28*(8), 1929-1935. https://doi.org/10.2337/diacare.28.8.1929
- Eastman, R. C., Chase, H. P., Buckingham, B., Hathout, E. H., Fuller-Byk, L., Leptien, A., et al. (2002). Use of the GlucoWatch biographer in children and adolescents with diabetes. *Pediatric Diabetes, 3*(3), 127-134. https://doi.org/10.1034/j.1399-5448.2002.30302.x
- Gandrud, L. M., Paguntalan, H. U., Van Wyhe, M. M., Kunselman, B. L., Leptien, A. D., Wilson, D. M., Eastman, R. C., & Buckingham, B. A. (2004). Use of the Cygnus GlucoWatch biographer at a diabetes camp. *Pediatrics, 113*(1 Pt 1), 108-111. https://doi.org/10.1542/peds.113.1.108
- Hathout, E., Patel, N., Southern, C., Hill, J., Anderson, R., Sharkey, J., et al. (2005). Home use of the GlucoWatch G2 biographer in children with diabetes. *Pediatrics, 115*(3), 662-666. https://doi.org/10.1542/peds.2004-0820
- Kollman, C., Wilson, D. M., Wysocki, T., Tamborlane, W. V., Beck, R. W., & Diabetes Research in Children Network Study Group. (2005). Limitations of statistical measures of error in assessing the accuracy of continuous glucose sensors. *Diabetes Technology & Therapeutics, 7*(5), 665-672. https://doi.org/10.1089/dia.2005.7.665
- Kulcu, E., Tamada, J. A., Reach, G., Potts, R. O., & Lesho, M. J. (2003). Physiological differences between interstitial glucose and blood glucose measured in human subjects. *Diabetes Care, 26*(8), 2405-2409. https://doi.org/10.2337/diacare.26.8.2405
- Mauras, N., Beck, R. W., Ruedy, K. J., Kollman, C., Tamborlane, W. V., Chase, H. P., et al. (2004). Lack of accuracy of continuous glucose sensors in healthy, nondiabetic children: Results of the Diabetes Research in Children Network (DirecNet) accuracy study. *The Journal of Pediatrics, 144*(6), 770-775. https://doi.org/10.1016/j.jpeds.2004.03.042
- Newman, S. P., Cooke, D., Casbard, A., Walker, S., Meredith, S., Nunn, A., et al. (2009). A randomised controlled trial to compare minimally invasive glucose monitoring devices with conventional monitoring in the management of insulin-treated diabetes mellitus (MITRE). *Health Technology Assessment, 13*(28), 1-194. https://doi.org/10.3310/hta13280
- Nunnold, T., Colberg, S. R., Herriott, M. T., & Somma, C. T. (2004). Use of the noninvasive GlucoWatch Biographer during exercise of varying intensity. *Diabetes Technology & Therapeutics, 6*(4), 454-462. https://doi.org/10.1089/1520915041705848
- Tamada, J. A., Garg, S., Jovanovic, L., Pitzer, K. R., Fermi, S., & Potts, R. O. (1999). Noninvasive glucose monitoring: Comprehensive clinical results. *JAMA, 282*(19), 1839-1844. https://doi.org/10.1001/jama.282.19.1839
- Tierney, M. J., Tamada, J. A., Potts, R. O., Eastman, R. C., Pitzer, K., Ackerman, N. R., & Fermi, S. J. (2000). The GlucoWatch biographer: A frequent automatic and noninvasive glucose monitor. *Annals of Medicine, 32*(9), 632-641. https://doi.org/10.3109/07853890009002034
- Tierney, M. J., Tamada, J. A., Potts, R. O., Jovanovic, L., Garg, S., & Cygnus Research Team. (2001). Clinical evaluation of the GlucoWatch biographer: A continual, non-invasive glucose monitor for patients with diabetes. *Biosensors & Bioelectronics, 16*(9-12), 621-629. https://doi.org/10.1016/s0956-5663(01)00189-0
- Tsalikian, E., Kollman, C., Mauras, N., Weinzimer, S., Buckingham, B., Xing, D., et al. (2004). GlucoWatch G2 Biographer alarm reliability during hypoglycemia in children. *Diabetes Technology & Therapeutics, 6*(5), 559-566. https://doi.org/10.1089/dia.2004.6.559

Regulatorias, del fabricante y financieras. Cada una lleva su enlace exacto en `glucowatch-cifras.json`:

- FDA. Resúmenes de seguridad y eficacia de la PMA P990026 (22 de marzo de 2001) y del suplemento P990026/S008 (26 de agosto de 2002), con su orden de aprobación. https://www.accessdata.fda.gov/cdrh_docs/pdf/P990026b.pdf y https://www.accessdata.fda.gov/cdrh_docs/pdf/P990026S008b.pdf
- Cygnus Inc. *Understanding the GlucoWatch Biographer: A Self-Study Manual for Health Care Professionals* (2002), la etiqueta del G2 (octubre de 2002), el folleto *Skin effects of the GlucoWatch Biographer* y las páginas de precios de glucowatch.com, todos en el Wayback Machine.
- Cygnus Inc. Informes 10-K de 2001 a 2004, informe 10-Q de septiembre de 2005 y comunicados en SEC EDGAR. https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000870755
- Patente US 6,233,471 B1, *Signal processing for measurement of physiological analytes*, Cygnus Inc. https://patents.google.com/patent/US6233471B1/en
- DiabetesNet.com. *Animas Glucowatch* y *GlucoWatch: The First Non-Invasive Glucose Monitor and Its Legacy in Diabetes Tech*. Fuente secundaria, solo para la fecha del retiro.
