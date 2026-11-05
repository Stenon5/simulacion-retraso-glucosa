# Análisis de viabilidad

Análisis hecho solo con papel, literatura y cálculo, sin laboratorio. Las guías del proyecto lo llaman "análisis dry lab". Responde si mezclar biomarcadores distintos permite superar a GlucoWatch, el primer monitor no invasivo aprobado por la FDA, y si eso tiene sentido frente a los monitores continuos (CGM) actuales.

**Veredicto (29 de octubre de 2026):** el diseño propuesto, con infrarrojo medio, dos profundidades y EEG en el oído, no supera a GlucoWatch ni tiene sentido hoy frente a los CGM. El detalle y los cálculos paso a paso están en la guía completa, [`docs/guia-del-proyecto.pdf`](../docs/guia-del-proyecto.pdf), secciones 3.5 a 3.9 y anexo D.

## Archivos

| Archivo | Qué es |
|---|---|
| [`criterios-de-decision.md`](criterios-de-decision.md) | Las reglas para declarar éxito o fracaso, escritas antes de ver los datos. Se leen primero |
| `investigacion-2026-10-29.json` | 196 hallazgos de literatura y mercado, cada uno con su fuente. Los códigos O, E, H y M que usan los cálculos apuntan aquí |
| `verificacion-fuentes-2026-10-29.json` | 22 afirmaciones contrastadas contra su fuente original |
| `calculos_dry_lab.py` | Todos los cálculos: difusión, fusión de sensores, alarmas combinadas y comparación con GlucoWatch |
| `resultados-calculos.json` | La salida del script. Cada cifra trae su fórmula, sus entradas y su fuente |

## Cómo rehacer las cifras

```bash
# Instala el paquete del repositorio, porque el script usa su simulador
python -m pip install -e .
# Entra a esta carpeta
cd analisis-de-viabilidad
# Corre los cálculos y reescribe resultados-calculos.json
python calculos_dry_lab.py
```

Con la misma versión del repositorio, el resultado sale idéntico.
