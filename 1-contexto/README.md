# Etapa 1. Contexto

De dónde nace el proyecto: el problema de salud, el paper del seminario y lo que aprendimos al leerlo con lupa.

## El problema de salud

Según el Atlas de Diabetes de la Federación Internacional de Diabetes (IDF), en 2017 había unos 451 millones de adultos con diabetes en el mundo, y podrían llegar a 693 millones en 2045 (Cho et al., 2018).

Los monitores continuos de glucosa (CGM) que se usan hoy tienen un filamento bajo la piel y miden el líquido intersticial, no la sangre. La glucosa pasa del capilar a ese líquido por difusión, así que el tejido sigue a la sangre con un retraso. En una hipoglucemia, sobre todo de noche, una alarma atrasada puede llegar cuando la persona ya está mal.

## El seminario

El proyecto partió del seminario 1 del ramo, sobre la revisión de Tang et al. (2020), que ordena las tecnologías para medir glucosa sin pinchar la piel en tres familias: ópticas, de microondas y electroquímicas. El seminario se presentó el 16 de octubre de 2026.

De ahí salió la pregunta del equipo: superar a GlucoWatch, el primer monitor no invasivo aprobado por la FDA, mezclando biomarcadores distintos. Las fallas de GlucoWatch, las ideas evaluadas y el veredicto están en la [guía completa](../docs/guia-del-proyecto.pdf) y en [`../3-analisis-de-viabilidad/`](../3-analisis-de-viabilidad/).

## Archivos

| Archivo | Qué es |
|---|---|
| [`fe-de-erratas-tang-2020.md`](fe-de-erratas-tang-2020.md) | Los errores que encontramos en el paper al verificar cada cifra contra su fuente original |

## Referencias

- Cho, N. H., Shaw, J. E., Karuranga, S., Huang, Y., da Rocha Fernandes, J. D., Ohlrogge, A. W., & Malanda, B. (2018). IDF Diabetes Atlas: Global estimates of diabetes prevalence for 2017 and projections for 2045. *Diabetes Research and Clinical Practice, 138*, 271-281. https://doi.org/10.1016/j.diabres.2018.02.023
- Tang, L., Chang, S. J., Chen, C. J., & Liu, J. T. (2020). Non-invasive blood glucose monitoring technology: A review. *Sensors, 20*(23), 6925. https://doi.org/10.3390/s20236925
