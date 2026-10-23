# Agent log

What the agent assisted workflow got wrong, with dates, how it was caught, and
what changed because of it. Time savings go here too, but failures come first,
because a log that only records savings is marketing.

This log covers this repository only. The harmonization project does not have
one yet, on purpose. An empty log is worse than no log.

## Format

Every entry uses the same five fields.

```
### YYYY-MM-DD, short title
**What happened.** One or two sentences.
**How it was caught.** The check that caught it, or the accident that did.
**Cost.** Time lost, or what would have shipped wrong.
**What changed.** The rule, test or habit added so it does not repeat.
**Status.** Open, or closed with what closed it.
```

Entries are append only. A correction goes in a new entry that points at the
old one.

---

## Entries

### 2026-10-16, delay estimated from derivatives returned a negative time constant

**What happened.** The first version estimated the two time constants by
regressing on the derivatives of the two depth signals. With noise added, the
estimate came back negative. A negative diffusion time constant is physically
impossible, so the output was obviously broken rather than subtly wrong.

**How it was caught.** The sign. The same run without added noise recovered
the true time constants, which pointed straight at the noise rather than at
the algebra, and the condition number of the problem was small, so the problem
was identifiable and the method was the issue.

**Cost.** One rewrite of the estimator.

**What changed.** Derivatives of a noisy signal are not used as regressors.
The sign check became a stopping rule in `thresholds.yaml`, so a negative time
constant is reported as a failure and never clipped to zero.

**Status.** Closed by the integral form below.

### 2026-10-16, integral form recovered the difference but biased both values low

**What happened.** Integrating instead of differentiating fixed the sign. The
difference between the two time constants came out close to the truth, but
both values individually sat below their true values.

**How it was caught.** Comparing each estimate against its true value instead
of only comparing their difference. Checking only the difference would have
looked like a success.

**Cost.** Would have shipped a biased estimator that passes a weak check.

**What changed.** The information that separates one time constant from the
other lives in the small difference between the two readings, and noise
dilutes exactly that. Both regressors carry noise, so ordinary least squares
is biased towards zero here by construction. Every reported quantity is now
checked against its own true value, not only against a derived combination.

**Status.** Closed by the error in variables correction.

### 2026-10-16, error in variables correction

**What happened.** Correcting the design matrix for the noise in the
regressors, with the noise variance estimated from the second difference of
the signal, addressed the bias from the previous entry.

**How it was caught.** Not a failure. Recorded because the two failures above
are what led to it, and because the correction itself rests on an assumption
that the sweeps are meant to break: it assumes the noise is white and
independent between the two depths.

**Cost.** None.

**What changed.** `docs/spec.md` describes this version. The assumption it
depends on became sweep 2 in `docs/misspecification-sweeps.md`, correlated
noise between depths, because if that assumption fails the correction may
make the estimate worse rather than better.

**Status.** Open. The assumption has not been tested.

---

## Pending entries

These happened and belong in this log, but the evidence that makes them
checkable is not in this repository yet. Each one gets a full entry when it
can be backed up here.

* **The numbers behind the three entries above.** The estimates and spreads
  from those attempts came from exploratory scripts that are not in this
  repository. They go into the entries once `run_all.py` reproduces them from
  the specification in `docs/spec.md`. If the reproduction disagrees with the
  original numbers, the reproduction wins and the disagreement becomes its own
  entry.

## Time tracking

Time saved and time lost, once there is something to measure.

| Date | Task | By hand | Agent assisted | Net | Notes |
|---|---|---|---|---|---|
| | | | | | |
