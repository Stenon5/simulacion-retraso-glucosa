"""Corre todos los escenarios y escribe los resultados, las figuras y el informe de umbrales.

Todavía no está implementado. La especificación que este script tiene que
seguir está en docs/especificacion.md, y los criterios con los que tiene que
compararse están en umbrales.yaml.

Hoy, al ejecutarlo, muestra lo que falta y termina con código 0, para que un
repositorio en etapa de andamiaje no finja estar roto ni finja funcionar.
"""

from __future__ import annotations

import argparse
import sys

MESSAGE = """\
todavía no implementado: la simulación descrita en docs/especificacion.md no
se ha escrito.

Lo que tiene que existir antes de que este script haga algo:
  1. src/glucose_delay/model.py        modelo directo y datos sintéticos
  2. src/glucose_delay/estimator.py    forma integral con la corrección del
                                       error en las variables
  3. src/glucose_delay/reconstruct.py  reconstrucción de Kalman con muestras
                                       pasadas
  4. src/glucose_delay/figures.py      la figura para el README

Los criterios están fijados de antemano en umbrales.yaml y no se editan
después de que exista un resultado. El orden de trabajo está en
docs/backlog-de-issues.md.
"""


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--seed",
        type=int,
        default=1,
        help="semilla aleatoria, se registra con cada resultado",
    )
    parser.add_argument(
        "--scenario",
        default="all",
        help="nombre de un escenario de la grilla de docs/especificacion.md, o all",
    )
    parser.add_argument(
        "--out",
        default="results",
        help="carpeta para las tablas de resultados",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    parse_args(argv)
    print(MESSAGE, file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
