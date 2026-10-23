# Issue backlog

Every task below is ready to open as a GitHub issue. Title, label and
acceptance criteria are written out.

Phase 3 is conditional and is not promised anywhere.

## Phase 0, before any result

**[impl] Implement the synthetic data generator**
Label: `implementation`, `phase-0`
Accepted when: `model.simulate_blood_glucose`, `model.diffuse` and
`model.add_noise` exist, a fixed seed reproduces a record exactly, and
`test_the_same_seed_reproduces_the_same_record` stops being skipped.

**[impl] Implement the noise variance estimator**
Label: `implementation`, `phase-0`
Accepted when: the estimate from the second difference matches the injected
noise on synthetic data, and the matching test stops being skipped.

**[impl] Implement the delay estimator with the error in variables correction**
Label: `implementation`, `phase-0`
Accepted when: with no noise the estimator returns both true time constants,
a negative time constant is reported as a failure instead of being clipped,
the condition number is returned, and the three matching tests stop being
skipped.

**[impl] Implement the causal reconstruction**
Label: `implementation`, `phase-0`
Accepted when: truncating the record does not change earlier reconstructed
values, which is what proves the filter never used future samples, and the
matching test stops being skipped.

**[impl] Write the scenario configuration file**
Label: `implementation`, `phase-0`
Accepted when: the grid in `docs/spec.md` section 7 exists as a committed
configuration file, so the grid can be read without reading the source.

**[impl] Make run_all.py produce results, figures and the threshold report**
Label: `implementation`, `phase-0`
Accepted when: one CSV per scenario and one summary table land in `results/`,
the figure lands in `figures/`, and a machine readable record says which
criteria in `thresholds.yaml` were met.

## Phase 1, the baseline run and its honest write up

**[result] Fill the README results table from the run**
Label: `results`, `verification`
Accepted when: every `(fill from run)` marker in the README is replaced by a
number traceable to a seed and a scenario, with the standard deviation shown
next to every bias.

**[docs] Add the figure to the top of the README**
Label: `docs`
Accepted when: `figures/delay-recovery.png` exists, is produced by
`src/glucose_delay/figures.py`, and its caption names the scenario, the seed
and the noise level.

**[docs] Reconcile the agent log with the reproduced numbers**
Label: `agents`
Accepted when: the pending entry in `AGENT_LOG.md` is closed with the numbers
the code actually reproduces. If they disagree with the original exploratory
run, the reproduction wins and the disagreement gets its own entry.

**[docs] Write the feasibility report**
Label: `docs`
Accepted when: every section of `report/feasibility.md` is filled from files
in `results/`, including the negative results section, and the thresholds are
quoted as committed before the results are shown.

## Phase 2, where it breaks

One issue per sweep in `docs/misspecification-sweeps.md`, all with label
`sweep`.

**[sweep] 1. Variable delay**
Accepted when: the rate of change at which the estimator stops meeting the
criteria is stated, and a sliding window variant is either shown to help or
shown not to.

**[sweep] 2. Noise correlated between depths**
Accepted when: the bias is reported as a function of correlation, and it is
stated plainly whether the error in variables correction makes things worse
once its independence assumption fails.

**[sweep] 3. Sensor drift**
Accepted when: it is stated whether the noise estimate stays right while the
delay estimate goes wrong, since that would be a quiet failure.

**[sweep] 4. Kinetics that are not first order**
Accepted when: at least two wrong generators are run, and it is stated
whether any quantity the estimator already computes warns that the model is
wrong.

**[sweep] 5. Sampling interval and record length**
Accepted when: the shortest record that still identifies both time constants
is reported.

**[sweep] 6. Separation between the two depths**
Accepted when: the separation below which the problem is not identifiable is
reported, stated as a requirement on where the depths sit.

**[docs] Write the domain of validity section**
Label: `docs`
Accepted when: the report says where the method works and where it does not,
in one short section a reader can act on.

## Phase 3, conditional

Only if phases 0 to 2 finished. Nothing here is promised.

**[impl] Drive the simulation with glucose curves from an open source simulator**
Label: `phase-3`
Accepted when: the blood glucose trace comes from an openly licensed type 1
diabetes simulator, the package and its license are named, and the write up
says plainly that this changes the blood glucose trace and not the tissue
model, so the circularity in the tissue model remains.

**[docs] Decide whether an archived release with a DOI is worth it**
Label: `phase-3`
Accepted when: the decision and its reason are recorded. Archiving is a
possibility, not a commitment.
