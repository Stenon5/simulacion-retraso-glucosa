# Generador de la entrega del problema

Genera `../01-problema-entrega.docx` y `../01-problema-entrega.pdf`: la entrega del problema en una plana carta, con las secciones 1 a 5, la tabla de la cadena y las referencias. Con `ENTREGA_ANEXO=1` suma una segunda página de anexo con las dos figuras de `../figuras/`. Es la fuente única de esos archivos. El mismo texto, para leerlo en GitHub, está en [`../01-problema.md`](../01-problema.md): si se cambia una frase, se cambia en los dos lugares.

La letra mínima es de 9 pt: el cuerpo va en 10 pt y el texto de las figuras en 9 pt. Para que quepa en una plana se ajusta el espacio entre párrafos o se acorta una frase, nunca la letra.

## Regenerar

Desde esta carpeta (`4-challenge/generador/`):

```bash
npm install                                  # instala docx (una sola vez)
py -3.11 figuras_entrega.py                  # dibuja ../figuras/fig1-modelo.png y fig2-algoritmo.png
ENTREGA_SALIDA=../01-problema-entrega.docx node entrega_problema.js 20 20 ninguno 252 1 1   # escribe la versión entregada (una plana)
pwsh -File exportar_pdf.ps1 ../01-problema-entrega.docx   # exporta el PDF con Word
py -3.11 verificar_pdf.py ../01-problema-entrega.pdf <carpeta de salida>   # páginas, primera y última línea, PNG de cada página
```

La ruta del docx es obligatoria: va en la variable `ENTREGA_SALIDA` o como octavo argumento. Para armar también la página del anexo con las figuras, agrega `ENTREGA_ANEXO=1`. Los valores por defecto (`20 20 ninguno 252 1 1`) son los de la versión entregada.

## Notas

- `exportar_pdf.ps1` abre una instancia propia de Word, exporta y cierra solo su documento. Si la instancia trae documentos abiertos, aborta sin cerrar nada. Necesita Word en Windows.
- Si el docx está abierto en Word, `node` no puede reemplazarlo: escribe en otra carpeta.
- `verificar_pdf.py` necesita PyMuPDF (`py -3.11 -m pip install pymupdf`) y `figuras_entrega.py` necesita matplotlib y numpy.
- `node_modules/` no se sube al repositorio.
