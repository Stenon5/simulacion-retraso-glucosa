# Generador de la entrega del problema

Genera `../01-problema-entrega.docx` y `../01-problema-entrega.pdf`: una hoja carta por ambos lados, con la entrega en la página 1 y el anexo con las dos figuras en la página 2. Es la fuente única de esos archivos. El mismo texto, para leerlo en GitHub, está en [`../01-problema.md`](../01-problema.md): si se cambia una frase, se cambia en los dos lugares.

La letra mínima es de 9 pt: el cuerpo va en 9,5 pt y el texto de las figuras en 9 pt. Para que quepa en dos páginas se ajusta el espacio entre párrafos o se acorta una frase, nunca la letra.

## Regenerar

Desde esta carpeta (`4-challenge/generador/`):

```bash
npm install                                  # instala docx (una sola vez)
py -3.11 figuras_entrega.py                  # dibuja ../figuras/fig1-modelo.png y fig2-algoritmo.png
node entrega_problema.js                     # escribe ../01-problema-entrega.docx
pwsh -File exportar_pdf.ps1 ../01-problema-entrega.docx   # exporta el PDF con Word
py -3.11 verificar_pdf.py ../01-problema-entrega.pdf <carpeta de salida>   # páginas, primera y última línea, PNG de cada página
```

Para escribir el docx en otra carpeta, pasa la ruta como séptimo argumento (`node entrega_problema.js 19 19 ninguno 240 0.1 1 <ruta.docx>`) o con la variable `ENTREGA_SALIDA`. Los valores por defecto son los de la versión entregada.

## Notas

- `exportar_pdf.ps1` abre una instancia propia de Word, exporta y cierra solo su documento. Si la instancia trae documentos abiertos, aborta sin cerrar nada. Necesita Word en Windows.
- Si el docx está abierto en Word, `node` no puede reemplazarlo: escribe en otra carpeta.
- `verificar_pdf.py` necesita PyMuPDF (`py -3.11 -m pip install pymupdf`) y `figuras_entrega.py` necesita matplotlib y numpy.
- `node_modules/` no se sube al repositorio.
