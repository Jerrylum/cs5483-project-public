
https://github.com/optuna/optuna-examples

## Stop

https://optuna.readthedocs.io/en/stable/reference/generated/optuna.study.Study.html#optuna.study.Study.stop

```python
import optuna

def objective(trial):
    if trial.number == 4:
        trial.study.stop()
    x = trial.suggest_float("x", 0, 10)
    return x**2

study = optuna.create_study()
study.optimize(objective, n_trials=10)
assert len(study.trials) == 5
```

