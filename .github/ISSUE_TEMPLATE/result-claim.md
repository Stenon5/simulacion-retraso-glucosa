---
name: Result claim
about: Add or change a number in the README or the report
title: "[result] "
labels: ["results", "verification"]
---

**The claim**
The sentence or table cell as it would read.

**Where the number comes from**
File in `results/`, scenario, seed, commit hash.

**Acceptance criteria**
- [ ] The number is reproducible from a clean clone with the stated seed.
- [ ] Bias appears next to its standard deviation, never alone.
- [ ] The scenario is named. A number without its scenario is not published.
- [ ] `thresholds.yaml` was not edited. An amendment, if any, is in a new file
      and is cited here.
- [ ] No claim about accuracy in a person, and no claim about a device.
