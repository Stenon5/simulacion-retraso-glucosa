"""Run every scenario and write results, figures and the threshold report.

Not implemented yet. The specification this script has to follow is in
docs/spec.md, and the criteria it has to check against are in thresholds.yaml.

Running it today prints what is missing and exits with code 0, so that a
scaffold repository does not pretend to be broken and does not pretend to
work either.
"""

from __future__ import annotations

import argparse
import sys

MESSAGE = """\
not implemented yet: the simulation described in docs/spec.md has not been
written.

What has to exist before this script does anything:
  1. src/glucose_delay/model.py      forward model and synthetic data
  2. src/glucose_delay/estimator.py  integral form with the error in variables
                                     correction
  3. src/glucose_delay/reconstruct.py  Kalman reconstruction from past samples
  4. src/glucose_delay/figures.py    the figure for the README

Criteria are pre-specified in thresholds.yaml and are not edited after a
result exists. See docs/issues-backlog.md for the order of work.
"""


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--seed",
        type=int,
        default=1,
        help="random seed, recorded with every result",
    )
    parser.add_argument(
        "--scenario",
        default="all",
        help="scenario name from the grid in docs/spec.md, or all",
    )
    parser.add_argument(
        "--out",
        default="results",
        help="directory for result tables",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    parse_args(argv)
    print(MESSAGE, file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
