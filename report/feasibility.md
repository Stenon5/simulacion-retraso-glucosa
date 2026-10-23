# Feasibility report

**Empty structure. Nothing has been run.** Every section below is a slot. A
section is filled only from files in `results/`, and every number in it has to
be traceable to a seed and a configuration.

---

## 1. Question

One sentence, stated so it can fail. Copied from the README so that the two
cannot drift apart.

`(fill from run)`

## 2. What was simulated

The model, the estimator, the scenario grid, the number of seeds per cell, and
the software versions. Points at `docs/spec.md` instead of restating it.

`(fill from run)`

## 3. Thresholds, as committed beforehand

The criteria from `thresholds.yaml`, quoted verbatim, with the commit date of
that file, before any result is shown. If an amendment file exists, it is
named here with its reason.

`(fill from run)`

## 4. Results

One table per scenario. Mean bias and standard deviation side by side, never
the mean alone. The injected noise and the recovered noise estimate next to
each other.

`(fill from run)`

## 5. Threshold by threshold

| Criterion | Met | Evidence | Scenarios where it failed |
|---|---|---|---|
| delay_bias | `(fill from run)` | | |
| noise_requirement | `(fill from run)` | | |
| earlier_alarm | `(fill from run)` | | |
| beats_fixed_population_delay | `(fill from run)` | | |
| noise_estimate_recovers | `(fill from run)` | | |

## 6. Misspecification sweeps

For each sweep in `docs/misspecification-sweeps.md`, where the estimator stopped
meeting the criteria, in units a reader can act on.

`(fill from run)`

## 7. Negative results

A section that stays even if it ends up being most of the report. Anything the
run showed not to work, including cases where estimating the delay made the
result worse than ignoring it.

`(fill from run)`

## 8. What this does not show

* Nothing about accuracy in a person.
* Nothing about any device.
* Nothing about any sensing technology being able to reach the required noise
  level.

This section does not get filled in from results. It stays as written unless
the scope of the work actually changes.

## 9. Hardware implication

If the method requires a noise level per reading, state it as a requirement on
a hypothetical sensor and compare it against published figures with their
citations and their conditions, in vitro or in vivo. Do not compare against a
figure whose measurement conditions are not stated.

`(fill from run)`

## 10. Limitations

Carried from the README, plus anything the run itself exposed.

`(fill from run)`

## 11. What failed

Carried from `AGENT_LOG.md`, summarised.

`(fill from run)`

## 12. Reproducing this report

The exact commands, the seeds and the commit hash that produced every table
and figure.

`(fill from run)`
