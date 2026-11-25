# Documento de una página

**Cuándo:** se sube al aula virtual antes del inicio de la Feria del Challenge. **Peso:** 5 %. Fechas y requisitos en el [README de esta carpeta](README.md).

## Qué pide la pauta

Una página con:

1. El problema.
2. La base fisiológica.
3. La solución propuesta.
4. Al menos dos referencias.

Antes de escribirlo, completar las seis casillas de la cadena de trazabilidad. Están en la tabla de abajo.

## Borrador 1 (25 de noviembre de 2026)

Responde a los comentarios de la profesora a la entrega del problema (tabla en [`01-problema.md`](01-problema.md)). Las cifras y sus fuentes están en [`fuentes-investigacion-2026-11-24.md`](fuentes-investigacion-2026-11-24.md). Este texto es la fuente del Word y del PDF.

**Encabezado.** Challenge de Ingeniería Biomédica · Documento final (borrador 1). Fisiología y Anatomía Humana · Ingeniería Civil Biomédica · UTEM · Sección 572 · Grupo 1 · Docente: María de Jesús Triolo. Integrantes: Eddie Andrés Ríos Elgueta, Lucas Valdebenito Maldonado y Nicolás Frieri · 25 de noviembre de 2026.

### 1. El problema

La hipoglucemia nocturna en personas con diabetes tipo 1, que dependen de la insulina y en 2025 eran 9,5 millones en el mundo (Ogle et al., 2025). Dormidas no la perciben: despertó 1 de 16 personas con diabetes tipo 1, frente a 10 de 16 sanas (Schultes et al., 2007). Además puede alterar el ritmo cardíaco, como ocurrió en 8 de 13 episodios nocturnos (Gill et al., 2009).

### 2. Base fisiológica

**Origen: el control falla (núcleo 2, homeostasis).** En una persona sana, cuando la glucosa baja, la primera defensa es reducir la insulina (80 a 85 mg/dL). Luego suben el glucagón y la adrenalina (65 a 70 mg/dL), y los síntomas aparecen bajo 50 a 55 mg/dL (Cryer, 2008). La insulina inyectada no se puede reducir: ya está en el tejido y sigue actuando. En la diabetes tipo 1 además se pierde el glucagón, y la defensa queda en manos de la adrenalina.

**Origen: el aviso no llega (núcleo 6, sistema nervioso autónomo).** La adrenalina causa taquicardia (receptores β1 del corazón) y temblor (β2 del músculo), y las fibras simpáticas colinérgicas activan el sudor (Cryer, 2008). Las hipoglucemias repetidas bajan el umbral de esta respuesta y el sueño la atenúa aún más, por eso la persona no despierta.

**Limitación que debe superar la solución: el retraso (núcleo 3, membrana y transporte).** Los monitores continuos (CGM) miden el líquido intersticial, al que la glucosa llega desde el capilar por difusión. Un modelo de primer orden lo describe: dG/dt = (Gs − G)/τ, donde G es la glucosa intersticial, Gs la de la sangre y τ = V/(P·A) la constante de tiempo (V, volumen intersticial, P, permeabilidad capilar y A, área de intercambio). En diabetes tipo 1 se midió un retraso de 4,8 a 9,8 min (Basu et al., 2015). No es solo difusión: también influyen el consumo celular de glucosa y el filtrado del sensor. Si la glucosa cae rápido, el sensor marca más alto que la sangre: con τ de 10 min y una caída de 2 mg/dL por minuto marca 20 mg/dL de más, y la alarma llega tarde.

### 3. Solución propuesta

**Objetivo: complementar el CGM y la bomba que la persona ya usa, para actuar antes de la hipoglucemia.**

- **Mide y corrige:** la glucosa intersticial se mide cada 5 min con un sensor enzimático amperométrico (la glucosa oxidasa produce peróxido de hidrógeno, que al oxidarse en un electrodo genera una corriente proporcional). Invirtiendo el modelo, Gs ≈ G + τ·dG/dt, se proyecta la glucosa en sangre a 30 min.
- **Modula la insulina:** si la proyección baja de 80 mg/dL, suspende la insulina basal de la bomba y repone la primera defensa perdida.
- **Despierta a la persona:** si la caída sigue, la alarma escala de vibración a sonido y a aviso al cuidador, hasta que la persona confirme que despertó (botón mantenido y movimiento en un acelerómetro). Suple el aviso que el cuerpo no da dormido.

La suspensión predictiva bajó las noches con glucosa de 60 mg/dL o menos de 33 % a 21 % (Maahs et al., 2014). Algunas bombas ya la usan, y nosotros sumamos la confirmación del despertar.


### 4. Viabilidad y limitaciones

- **Cómo probarlo:** en noches con CGM, comparar la glucosa estimada con mediciones capilares y contar hipoglucemias detectadas, falsas alarmas y minutos ganados.
- **Fuentes de error:** τ cambia entre personas, derivar la señal amplifica el ruido y dormir sobre el sensor da lecturas falsamente bajas.
- **Límites:** exige usar bomba, la suspensión no retira la insulina ya inyectada y puede subir la glucosa de la mañana.

### Referencias

Basu, A., Dube, S., Veettil, S., Slama, M., Kudva, Y. C., Peyser, T., Carter, R. E., Cobelli, C., & Basu, R. (2015). Time lag of glucose from intravascular to interstitial compartment in type 1 diabetes. *Journal of Diabetes Science and Technology, 9*(1), 63–68. https://doi.org/10.1177/1932296814554797

Cryer, P. E. (2008). The barrier of hypoglycemia in diabetes. *Diabetes, 57*(12), 3169–3176. https://doi.org/10.2337/db08-1084

Gill, G. V., Woodward, A., Casson, I. F., & Weston, P. J. (2009). Cardiac arrhythmia and nocturnal hypoglycaemia in type 1 diabetes—the "dead in bed" syndrome revisited. *Diabetologia, 52*(1), 42–45. https://doi.org/10.1007/s00125-008-1177-7

Maahs, D. M., Calhoun, P., Buckingham, B. A., Chase, H. P., Hramiak, I., Lum, J., Cameron, F., Bequette, B. W., Aye, T., Paul, T., Slover, R., Wadwa, R. P., Wilson, D. M., Kollman, C., Beck, R. W., & In Home Closed Loop Study Group. (2014). A randomized trial of a home system to reduce nocturnal hypoglycemia in type 1 diabetes. *Diabetes Care, 37*(7), 1885–1891. https://doi.org/10.2337/dc13-2159

Ogle, G. D., Wang, F., Haynes, A., Gregory, G. A., King, T. W., Deng, K., Dabelea, D., James, S., Jenkins, A. J., Li, X., Ma, R. C. W., Maahs, D. M., Oram, R. A., Pihoker, C., Svensson, J., Zhou, Z., Magliano, D. J., & Maniam, J. (2025). Global type 1 diabetes prevalence, incidence, and mortality estimates 2025: Results from the International Diabetes Federation Atlas, 11th edition, and the T1D Index version 3.0. *Diabetes Research and Clinical Practice, 225*, Article 112277. https://doi.org/10.1016/j.diabres.2025.112277

Schultes, B., Jauch-Chara, K., Gais, S., Hallschmid, M., Reiprich, E., Kern, W., Oltmanns, K. M., Peters, A., Fehm, H. L., & Born, J. (2007). Defective awakening response to nocturnal hypoglycemia in patients with type 1 diabetes mellitus. *PLoS Medicine, 4*(2), Article e69. https://doi.org/10.1371/journal.pmed.0040069
