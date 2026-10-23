"""The figure that goes at the top of the README.

Specified in docs/spec.md, section 9. Not implemented yet.

Writes figures/delay-recovery.png. The figure is not committed until the run
that produces it exists, so that no image in this repository shows a result
that cannot be reproduced from the code next to it.
"""

from __future__ import annotations

from . import NOT_IMPLEMENTED


def delay_recovery_figure(result_dir: str, out_path: str) -> None:
    """Draw the reconstruction against the true blood glucose for one seed.

    The single depth baseline is drawn underneath, and the caption states the
    seed, the scenario and the noise level.
    """
    raise NotImplementedError(NOT_IMPLEMENTED)
