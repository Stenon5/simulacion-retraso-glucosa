# Fe de erratas de Tang et al. (2020)

Paper: Tang, L., Chang, S. J., Chen, C.-J., & Liu, J.-T. (2020). Non-Invasive Blood Glucose Monitoring Technology: A Review. Sensors, 20(23), 6925. https://doi.org/10.3390/s20236925

Reunida al preparar el seminario 1, entre el 9 y el 16 de octubre de 2026, con apoyo de IA (ver `BITACORA_DE_AGENTES.md` en la raíz). Cada punto se verificó contra el texto y las figuras del paper y, cuando el dato venía de otro estudio, contra el artículo original.

## Errores del paper

1. **Naseri et al.:** dice que la correlación de los pacientes (r = 0,765) es "menor" que la de los sanos (r = 0,646). Es al revés.
2. **"Difíciles de adherir a la pupila":** el lente de contacto va sobre la córnea, no sobre la pupila.
3. **"Histone fluid":** quiso decir tissue fluid, es decir, líquido intersticial.
4. **Ref. [10]:** sostiene el 40 a 50 % de incumplimiento del automonitoreo, pero es un paper de microagujas colorimétricas.
5. **Ref. [79]:** el texto la atribuye a Esenaliev, pero es de Chen T.L. et al.
6. **Chen et al.:** escribe 130,4 mA·mM⁻¹ cuando corresponde µA.
7. **"Ultrathin (~3 mm)":** un sensor de 3 mm no es ultradelgado. Lo probable es ~3 µm.
8. **Chu et al.:** rango "0,03 a 5,0 mm", cuando debería ser mM.
9. **Nombres de pila como apellidos:** la ref. [46] aparece como "Jintao, X.", aunque el autor es Xue J.
10. **Beer-Lambert:** el texto la llama "Equation (1)", pero es la (6).
11. **Falta de comparación:** no compara con los CGM comerciales (Dexcom, Libre), que son la referencia real para cualquier método nuevo.

## Datos que el paper cita mal o que conviene precisar

- **Magnitud de la diabetes:** la frase "según la OMS" está copiada literal de Villena Gonzales et al. (2019). Ese artículo cita el IDF Diabetes Atlas 2017: 451 millones de personas hoy y 693 millones en 2045. No es de la OMS.
- **Figura 1 (glucosa en biofluidos):** los rangos vienen de la tabla de Bruen et al. (2017), que es la que grafica el paper.
- **Primera generación de biosensores:** los datos (LOD 0,11 mM, hasta 21 mM, 2,55 µA) son de Li et al. (2016), una aguja implantada en conejos que mide a 0,60 V, no de Clark y Lyons (1962). El LOD mejora unas 27 veces, no "tres órdenes".
- **Xue:** la ref. [46] midió en ratas (in vivo) y la [47] en un fantoma, así que la "mejora" compara cosas distintas.
- **OCT en piel:** llega a unos 1,5 a 2 mm de profundidad.
- **Iontoforesis:** el confort y el buen ajuste a la piel se atribuyen al nano-oro, no al Ag/AgCl.
- **Kottmann:** la ventaja "por partida doble" solo vale bajo 100 mg/dL.

## Fuentes contrastadas

Bruen 2017 (doi 10.3390/s17081866), Villena Gonzales 2019 (doi 10.3390/s19040800), Cho 2018 (doi 10.1016/j.diabres.2018.02.023), Li 2016 (doi 10.1016/j.bios.2016.06.037), Xue 2017 (doi 10.1016/j.saa.2017.02.032), Kottmann 2016 (doi 10.3390/s16101663), Kumar 2020 (doi 10.3390/s20144024), Chen 2017 (doi 10.1126/sciadv.1701629), Naseri 2018 (doi 10.4103/jrms.JRMS_135_18), Chu 2011 (doi 10.1016/j.talanta.2010.10.055), Park 2018 (doi 10.1126/sciadv.aap9841), criterios OMS 2006 (who.int), Gambichler 2015 sobre OCT en piel (PMC4501682), Mamalis 2015 (PMC4990458) y Tang Z. 2018 (mural.maynoothuniversity.ie/id/eprint/13131).
