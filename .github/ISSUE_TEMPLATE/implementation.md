---
name: Implementation
about: Implement one piece of the specification
title: "[impl] "
labels: ["implementation"]
---

**Which part of the specification**
Section of `docs/spec.md`.

**Which skipped tests this turns on**
List them by name from `tests/`.

**Acceptance criteria**
- [ ] The matching skip is removed and the test passes.
- [ ] The function is deterministic for a fixed seed.
- [ ] Nothing in the implementation changes `thresholds.yaml`.
- [ ] Any deviation from `docs/spec.md` is documented in the same pull
      request, with the reason.
