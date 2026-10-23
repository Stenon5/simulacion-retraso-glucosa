---
name: Misspecification sweep
about: Run one sweep from docs/misspecification-sweeps.md
title: "[sweep] "
labels: ["sweep", "validity"]
---

**Which sweep**
Number and name from `docs/misspecification-sweeps.md`.

**Assumption being broken**
One sentence.

**Acceptance criteria**
- [ ] One assumption changed, everything else at the baseline.
- [ ] Results report mean bias and standard deviation side by side, per cell.
- [ ] The point where the estimator stops meeting `thresholds.yaml` is stated
      in units a reader can act on.
- [ ] Seeds and configuration recorded for every row.
- [ ] If the estimator fails quietly, that is said explicitly, because a quiet
      failure is the worst outcome.
