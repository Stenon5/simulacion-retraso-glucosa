# Guías para leer

Los dos documentos largos del proyecto, en PDF para leer y en Word para comentar.

| Documento | Para quién | Qué trae |
|---|---|---|
| [`resumen-para-la-profesora.pdf`](resumen-para-la-profesora.pdf) ([Word](resumen-para-la-profesora.docx)) | La profesora, unos 20 minutos | Las propuestas en evaluación, lo desarrollado, las opciones si hay que cambiar de rumbo y las preguntas para ella |
| [`guia-del-proyecto.pdf`](guia-del-proyecto.pdf) ([Word](guia-del-proyecto.docx)) | Quien se suma al equipo | Todo el proyecto: base fisiológica, simulación, análisis de viabilidad paso a paso, propuestas y cómo colaborar |

Versión revisada del 5 de noviembre de 2026 (el trabajo original es del 29 de octubre). Las rutas que nombran ya apuntan a la estructura por etapas, y el análisis sin laboratorio se llama "análisis de viabilidad", que está en `3-analisis-de-viabilidad/`.

## Cómo se regeneran

Las dos guías salen de los scripts de `generador/`, que leen `../3-analisis-de-viabilidad/resultados-calculos.json`. Desde la raíz del repositorio:

```
cd docs/generador
npm install
py -3.11 figuras.py
node construir-docx.js && node construir-docx.js --resumen
```

Eso escribe los dos `.docx` en esta carpeta. Los PDF se exportan después desde Word (Guardar como PDF). Más detalle en [`generador/README.md`](generador/README.md).
