from xgboost import XGBClassifier

params_const = {
    "eval_metric": "mlogloss",
    "seed": 42,
}


def create_XGBClassifier(trial):
    params = {
        **params_const,
        "max_depth": trial.suggest_int("max_depth", 3, 32),
        "learning_rate": trial.suggest_float("learning_rate", 1e-5, 1, log=True),
        "n_estimators": trial.suggest_int("n_estimators", 50, 300),
        "gamma": trial.suggest_float("gamma", 0, 0.6),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 7),
        "subsample": trial.suggest_float("subsample", 0.5, 1),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1),
    }
    model = XGBClassifier(**params)
    return model
