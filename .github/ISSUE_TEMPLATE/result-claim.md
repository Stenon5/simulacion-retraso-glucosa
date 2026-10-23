---
name: Afirmación de resultado
about: Agregar o cambiar una cifra en el README o en el informe
title: "[resultado] "
labels: ["resultados", "verificación"]
---

**La afirmación**
La frase o la celda de la tabla tal como quedaría escrita.

**De dónde sale la cifra**
Archivo de `results/`, escenario, semilla y hash del commit.

**Criterios de aceptación**
- [ ] La cifra se puede reproducir desde un clon limpio con la semilla indicada.
- [ ] El sesgo aparece junto a su desviación estándar, nunca solo.
- [ ] El escenario está nombrado. Una cifra sin su escenario no se publica.
- [ ] `umbrales.yaml` no se editó. Si hay una enmienda, está en un archivo nuevo
      y se cita aquí.
- [ ] Ninguna afirmación sobre la exactitud en una persona, y ninguna afirmación
      sobre un dispositivo.
