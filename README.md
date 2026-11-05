# Medidor no invasivo de glucosa

Proyecto del grupo 1 del ramo Fisiología y Anatomía Humana (UTEM, Ingeniería Civil Biomédica, 2026). La pregunta: ¿se puede superar a GlucoWatch, el primer monitor no invasivo aprobado por la FDA, mezclando biomarcadores distintos?

**Estado:** el análisis de viabilidad concluyó que el diseño propuesto, con infrarrojo medio, dos profundidades y EEG en el oído, no supera a GlucoWatch ni tiene sentido hoy frente a los monitores continuos (CGM). El equipo espera la retroalimentación de la profesora para elegir cómo seguir, y prepara el Challenge del ramo.

**No es un dispositivo médico.** Es un trabajo académico de simulación y análisis. No diagnostica, no trata ni monitorea nada, y no debe usarse para decidir sobre la salud de nadie.

## Las cuatro etapas

| Etapa | Qué tiene |
|---|---|
| [`1-contexto/`](1-contexto/) | El problema de salud, el seminario del que nació el proyecto y la fe de erratas del paper |
| [`2-simulacion/`](2-simulacion/) | La simulación del retraso entre sangre y tejido con dos profundidades: código, pruebas, resultados e informe |
| [`3-analisis-de-viabilidad/`](3-analisis-de-viabilidad/) | Criterios, fuentes y cálculos del veredicto, hechos sin laboratorio |
| [`4-challenge/`](4-challenge/) | Lo que se entrega en el ramo: el problema, el documento de una página y el pitch |

Las guías para leer están en [`docs/`](docs/).

## Por dónde empezar

| Si vienes por | Empieza en |
|---|---|
| **El Challenge del ramo**, lo que se entrega y cuándo | [`4-challenge/`](4-challenge/) |
| **La entrega del problema**, viernes 6 de noviembre | En [PDF](4-challenge/01-problema-entrega.pdf), en [Word](4-challenge/01-problema-entrega.docx) o [para leer en GitHub](4-challenge/01-problema.md): el problema, su mecanismo, lo hecho y un anexo con el modelo y los algoritmos |
| **La revisión de la profesora**, unos 20 minutos | El resumen en [PDF](docs/resumen-para-la-profesora.pdf) o [Word](docs/resumen-para-la-profesora.docx): propuestas en evaluación, lo desarrollado y las opciones si hay que cambiar de rumbo |
| **Sumarte al equipo** | La guía completa en [PDF](docs/guia-del-proyecto.pdf) o [Word](docs/guia-del-proyecto.docx), con el análisis de viabilidad y cómo colaborar |
| **El veredicto y sus cálculos** | [`3-analisis-de-viabilidad/`](3-analisis-de-viabilidad/) |
| **La simulación y sus resultados** | [`2-simulacion/`](2-simulacion/) y su [`resumen de resultados`](2-simulacion/results/resumen.md) |
| **Programar o correr un barrido** | [`2-simulacion/docs/especificacion.md`](2-simulacion/docs/especificacion.md) y los [issues abiertos](https://github.com/Stenon5/simulacion-retraso-glucosa/issues) |

## En la raíz

```
README.md                  esta vista general
docs/                      guía completa y resumen para la profesora, en PDF y Word
BITACORA_DE_AGENTES.md     en qué se equivocó el trabajo asistido por IA
CITATION.cff               cómo citar el repositorio
LICENSE                    licencia del código (MIT)
LICENCIA-DATOS.md          licencia de documentos y datos (CC BY 4.0)
```

## Licencia y cita

El código es MIT, ver [`LICENSE`](LICENSE). El informe, los documentos y cualquier dato generado están bajo CC BY 4.0, ver [`LICENCIA-DATOS.md`](LICENCIA-DATOS.md). Para citar, ver [`CITATION.cff`](CITATION.cff).
