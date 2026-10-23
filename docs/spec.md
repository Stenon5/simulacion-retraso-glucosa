# Model and estimator specification

Enough detail to implement the simulation from scratch. Nothing here has been
run inside this repository yet.

## 1. Setting

A sensor reads glucose at two different tissue depths. Each depth sees the
same blood glucose signal, delayed and smoothed by diffusion, with its own
time constant. Blood glucose is never measured.

The goal is to recover both time constants from the two tissue signals alone,
and then to reconstruct blood glucose from them using only past samples, the
way a real device would have to.

## 2. Forward model

Each depth `i` follows first order diffusion towards the blood value, with its
own time constant `tau_i`:

```latex
\frac{dG_i}{dt} = \frac{G_s - G_i}{\tau_i}
\quad\Longrightarrow\quad
G_s = G_i + \tau_i\,\frac{dG_i}{dt}
```

`G_s` is blood glucose, `G_i` is glucose at depth `i`.

## 3. Eliminating the unmeasured signal

Writing the same `G_s` from both depths and equating them removes `G_s`.
Integrating instead of differentiating keeps the noise out of the derivative
and leaves an equation that is linear in `tau_1` and `tau_2`:

```latex
\int_0^t (G_1 - G_2)\,dt' = c - \tau_1\,G_1(t) + \tau_2\,G_2(t)
```

`c` is a constant of integration and is estimated along with the two time
constants. The integral on the left is computed from the measured signals, so
every term is observable.

## 4. Why ordinary least squares is biased here

Both `G_1(t)` and `G_2(t)` appear on the right hand side as regressors, and
both are measured with noise. Regressors measured with noise bias the
estimate towards zero, which is the error in variables problem. With the
signals used here the bias is large enough to matter, so it is corrected
explicitly.

Let `X` be the design matrix with columns `[1, G_1(t), G_2(t)]`, `Y` the
integral term, `N` the number of samples and `dt` the sampling interval. The
corrected estimator is

```latex
\hat{\beta} = \left(X^\top X - N\,\mathrm{diag}(0,\hat\sigma^2,\hat\sigma^2)\right)^{-1}
\left(X^\top Y + N\,\hat\sigma^2\,\Delta t\,(0,1,1)^\top\right)
```

The noise variance is estimated from the signal itself, from the second
difference of the series:

```latex
\hat\sigma^2 = \tfrac{1}{6}\,\mathrm{Var}(\Delta^2 y)
```

`Delta^2 y` is the second difference of the measured series. The factor one
sixth follows from the variance of a second difference of independent noise.
This estimator assumes the noise is white and independent between samples,
which is one of the assumptions the sweeps in
`misspecification-sweeps.md` are meant to break on purpose.

The coefficients of `beta` map to `-tau_1` and `+tau_2`, with the sign
convention of the equation above. An implementation must assert that the
recovered time constants are positive and must report the condition number of
the corrected matrix, because near singularity is the failure mode to watch.

## 5. Reconstructing blood glucose

With the time constants estimated, a Kalman filter with state
`[blood glucose, slope of blood glucose, G_1, G_2]` reconstructs blood glucose
using past samples only. No smoothing over future samples, because a device
cannot do that.

* Process model: blood glucose follows a local linear trend, each depth
  follows the first order diffusion above with its estimated time constant.
* Measurement model: the two depth readings, each with the estimated noise
  variance.
* Initialisation and tuning of the process noise are implementation choices
  and must be recorded in the run output, since results depend on them.

## 6. Synthetic data generator

* A record of several hours at a fixed sampling interval, long enough to
  contain one clear hypoglycemic excursion and at least one rise.
* Blood glucose is generated first, then each depth is produced by integrating
  the first order diffusion equation with its own time constant.
* Independent Gaussian noise is added to each depth reading, at the scenario's
  noise level, with no drift and no correlation between depths. The baseline
  generator deliberately matches the estimator's assumptions. That is the
  circularity the sweeps exist to attack.
* Every run records its seed. A fixed seed must reproduce a run exactly.

## 7. Scenario grid to run

A grid, not a result. These are the inputs to sweep.

| Scenario | Time constant, depth 1 | Time constant, depth 2 | Noise per reading |
|---|---|---|---|
| typical, low noise | short | long | low |
| typical, medium noise | short | long | medium |
| typical, high noise | short | long | high |
| slow person | long | longer | medium |
| fast person | shortest | short | medium |

The concrete values for short, long, low, medium and high belong in a
configuration file committed alongside the code, so that a reader can see the
grid without reading the source. Separation between the two time constants is
the parameter that decides whether the problem is identifiable at all, so it
is swept explicitly.

Each cell is repeated over many seeds. Per cell the run reports the mean bias
and the standard deviation across seeds, never the mean alone, and reports the
recovered noise estimate next to the noise that was actually injected.

## 8. Comparisons the run must include

1. The two depth estimator against a single smoothed depth, which stands in
   for a simple continuous monitor.
2. The two depth estimator with the estimated time constants against the same
   estimator given the true time constants. The gap between those two is the
   cost of not knowing the delay.
3. Both against using a fixed population delay instead of estimating one.

Comparison three matters because a fixed population value is what a device
would do if the estimator were dropped, so it is the real baseline.

## 9. Outputs

* One CSV per scenario in `results/`, one row per seed, with the recovered
  time constants, the recovered noise estimate, the error metrics and the
  alarm timing.
* One summary table in `results/`, one row per scenario, with mean and
  standard deviation side by side.
* One figure in `figures/`, showing the reconstruction against the true blood
  glucose for one representative seed, with the single depth baseline drawn
  underneath.
* A machine readable record of which thresholds in `thresholds.yaml` were met.
