"""Estimación del retraso de la glucosa con dos profundidades, solo en simulación.

La fase 0 está implementada (generador, estimadores, filtro y run_all.py). El
modelo y el estimador están especificados en docs/especificacion.md, las
lecturas de lo que la especificación deja abierto en
docs/decisiones-de-implementacion.md, y los criterios de aprobado y reprobado
en umbrales.yaml.

Esto no es un dispositivo médico y no produce nada que sirva para tomar
decisiones clínicas.
"""

__version__ = "0.0.0"

NOT_IMPLEMENTED = (
    "todavía no implementado: ver docs/especificacion.md para la especificación y "
    "docs/backlog-de-issues.md para el orden de trabajo"
)
