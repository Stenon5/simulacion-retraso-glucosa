---
name: Implementación
about: Implementar una parte de la especificación
title: "[impl] "
labels: ["implementación"]
---

**Qué parte de la especificación**
Sección de `docs/especificacion.md`.

**Qué tests omitidos activa**
Nómbralos tal como aparecen en `tests/`.

**Criterios de aceptación**
- [ ] Se quita la omisión correspondiente y el test pasa.
- [ ] La función es determinista para una semilla fija.
- [ ] Nada de la implementación modifica `umbrales.yaml`.
- [ ] Cualquier desviación de `docs/especificacion.md` se documenta en el mismo
      pull request, con su razón.
