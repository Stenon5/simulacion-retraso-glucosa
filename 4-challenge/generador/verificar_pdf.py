"""Revisa el PDF de la entrega: paginas, primera y ultima linea de cada pagina,
lineas con referencias cruzadas y renders PNG. Uso: py -3.11 verificar_pdf.py <pdf> <carpeta>"""
import sys
import fitz

pdf, carpeta = sys.argv[1], sys.argv[2]
d = fitz.open(pdf)
print("paginas", d.page_count)
for i, p in enumerate(d):
    lineas = []
    for bloque in p.get_text("dict")["blocks"]:
        for linea in bloque.get("lines", []):
            texto = "".join(s["text"] for s in linea["spans"]).strip()
            if texto:
                lineas.append((round(linea["bbox"][3]), texto))
    print(f"--- pagina {i + 1}, ultima linea a {lineas[-1][0]} de {round(p.rect.height)} pt")
    print("    primera:", lineas[0][1][:90])
    print("    ultima: ", lineas[-1][1][:90])
    for _, texto in lineas:
        if any(w in texto for w in ("página", "figura 2", "V/(P", "sección", "dG/dt")):
            print("   ", texto[:120])
    p.get_pixmap(dpi=110).save(f"{carpeta}/pagina-{i + 1}.png")
