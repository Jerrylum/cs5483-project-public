import catboost

params_const = {
    "random_seed": 42,
    "verbose": False,
    # "verbose": 100,
    # "used_ram_limit": "3gb",
}


def create_CatBoostClassifier(trial):
    param = {
        **params_const,
        "iterations": trial.suggest_int("iterations", 64, 256),
        # "iterations": trial.suggest_int("iterations", 16, 16),
        "learning_rate": trial.suggest_float("learning_rate", 1e-3, 1e0, log=True),
        "objective": trial.suggest_categorical(
            "objective", ["Logloss", "CrossEntropy"]
        ),
        "colsample_bylevel": trial.suggest_float("colsample_bylevel", 0.1, 1),
        # Depth  affect a lot time, don't > 10
        "depth": trial.suggest_int(
            "depth", 4, 9
        ),
        "boosting_type": trial.suggest_categorical(
            "boosting_type", ["Ordered", "Plain"]
        ),
        "bootstrap_type": trial.suggest_categorical(
            "bootstrap_type", ["Bayesian", "Bernoulli", "MVS"]
        ),
    }

    if param["bootstrap_type"] == "Bayesian":
        param["bagging_temperature"] = trial.suggest_float("bagging_temperature", 0, 10)
    elif param["bootstrap_type"] == "Bernoulli" or param["bootstrap_type"] == "MVS":
        param["subsample"] = trial.suggest_float("subsample", 0.1, 1)

    model = catboost.CatBoostClassifier(**param)
    return model
