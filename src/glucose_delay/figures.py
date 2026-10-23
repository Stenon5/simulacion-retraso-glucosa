"""La figura que va al inicio del README.

Especificado en docs/especificacion.md, sección 9. Todavía no está
implementado.

Escribe figures/delay-recovery.png. La figura no se sube al repositorio hasta
que exista la corrida que la produce, para que ninguna imagen de este
repositorio muestre un resultado que no se pueda reproducir con el código que
la acompaña.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def delay_recovery_figure(result_dir: str, out_path: str) -> None:
    """Dibuja la reconstrucción frente a la glucosa en sangre real para una semilla.

    La línea base de una sola profundidad se dibuja debajo, y la leyenda indica
    la semilla, el escenario y el nivel de ruido.
    """
    raise NotImplementedError(NOT_IMPLEMENTED)
