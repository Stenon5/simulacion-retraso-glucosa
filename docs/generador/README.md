# Generador de las guías

Scripts que arman `guia-del-proyecto.docx` y `resumen-para-la-profesora.docx` en la carpeta `docs/`. Leen `3-analisis-de-viabilidad/resultados-calculos.json`, así que las cifras de las guías salen de ese archivo. Requieren Node.js y Python 3.11 con matplotlib y numpy.

```
cd docs/generador
npm install
py -3.11 figuras.py
node construir-docx.js && node construir-docx.js --resumen
```

El `.docx` se abre en Word y se guarda como PDF para obtener el PDF. Las figuras se escriben en `figuras/` y esa carpeta no se versiona, igual que `node_modules/`. La `f05-registro-representativo.png` es una copia de `2-simulacion/figures/delay-recovery.png`, que `figuras.py` copia sin tocarla.

| Archivo | Qué genera o contiene |
|---|---|
| `construir-docx.js` | Arma el documento. Sin argumentos hace la guía completa, con `--resumen` el resumen para la profesora |
| `seccion-dry-lab.js` | Capítulos del análisis de viabilidad (metodología, resultados, veredicto, anexo D y referencias) |
| `seccion-propuestas.js` | Las ocho ideas, los cuadros de propuestas y las opciones A a D |
| `seccion-resumen.js` | El texto propio del resumen para la profesora |
| `figuras.py` | Dibuja las figuras f01 a f14 y copia la f05 desde la simulación |
| `package.json` y `package-lock.json` | Dependencias de Node (la librería `docx`) |
