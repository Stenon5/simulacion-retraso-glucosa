---
name: Barrido de mala especificación
about: Ejecutar un barrido de docs/barridos-de-mala-especificacion.md
title: "[barrido] "
labels: ["barrido", "validez"]
---

**Qué barrido**
Número y nombre según `docs/barridos-de-mala-especificacion.md`.

**Supuesto que se rompe**
Una frase.

**Criterios de aceptación**
- [ ] Se cambió un solo supuesto y todo lo demás quedó en la línea base.
- [ ] Los resultados informan el sesgo medio y la desviación estándar lado a
      lado, por celda.
- [ ] El punto donde el estimador deja de cumplir `umbrales.yaml` se indica en
      unidades que permitan actuar a quien lo lea.
- [ ] La semilla y la configuración quedan registradas en cada fila.
- [ ] Si el estimador falla en silencio, se dice de forma explícita, porque una
      falla silenciosa es el peor resultado.
