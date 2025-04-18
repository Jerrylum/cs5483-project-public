from sklearn.ensemble import RandomForestClassifier

params_const = {
    "random_state": 42,
    "n_jobs": -1,
}

# 建立隨機森林模型
def create_RandomForestClassifier(trial):
    params = {
        **params_const,
        "n_estimators": trial.suggest_int("n_estimators", 10, 200),
        "criterion": trial.suggest_categorical("criterion", ["gini", "entropy"]),
        "max_depth": trial.suggest_int("max_depth", 2, 64),
        "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
        "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 20),
    }

    model = RandomForestClassifier(**params)
    return model