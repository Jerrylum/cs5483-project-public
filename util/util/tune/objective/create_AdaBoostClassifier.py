from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier

def create_AdaBoostClassifier(trial):
    # Hyperparameters for AdaBoostClassifier
    n_estimators = trial.suggest_int("n_estimators", 8, 64)
    learning_rate = trial.suggest_float("learning_rate", 1e-4, 1e1, log=True)
    
    # Hyperparameters for DecisionTreeClassifier
    criterion = trial.suggest_categorical("criterion", ["gini", "entropy", "log_loss"])
    max_depth = trial.suggest_int("max_depth", 2, 32)
    min_samples_split = trial.suggest_int("min_samples_split", 2, 64)
    min_samples_leaf = trial.suggest_int("min_samples_leaf", 1, 32)

    model = AdaBoostClassifier(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        random_state=42,
        estimator=DecisionTreeClassifier(
            criterion=criterion,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            random_state=42,
        ),
    )
    return model