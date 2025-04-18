import lightgbm

param_const = {
    "objective": "binary",
    "metric": "binary_logloss",
    "verbosity": -1,
    "force_col_wise": True,
    "boosting_type": "gbdt",
    "random_state": 42,
}

def create_LGBMClassifier(trial):
    param = {
        **param_const,
        "lambda_l1": trial.suggest_float("lambda_l1", 1e-9, 100.0, log=True),
        "lambda_l2": trial.suggest_float("lambda_l2", 1e-9, 100.0, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 2, 128),
        "feature_fraction": trial.suggest_float("feature_fraction", 0.4, 1.0),
        "bagging_fraction": trial.suggest_float("bagging_fraction", 0.4, 1.0),
        "bagging_freq": trial.suggest_int("bagging_freq", 1, 16),
        "min_child_samples": trial.suggest_int("min_child_samples", 2, 128),
    }
    model = lightgbm.LGBMClassifier(**param)
    return model
