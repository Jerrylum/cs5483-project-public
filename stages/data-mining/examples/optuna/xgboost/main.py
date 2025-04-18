import optuna
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier

# Load the wine dataset
data = load_wine()
X = data.data
y = data.target

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.5, random_state=42
)

# Define the objective function
def objective(trial):
    params = {
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3),
        "n_estimators": trial.suggest_int("n_estimators", 50, 200),
        "gamma": trial.suggest_float("gamma", 0, 0.5),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 6),
        "subsample": trial.suggest_float("subsample", 0.5, 1),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1),
    }

    clf = XGBClassifier(**params, eval_metric="mlogloss")
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    return accuracy

# Create a study and optimize the objective function
study = optuna.create_study(
    study_name="xgboost", 
    direction="maximize",
    storage="sqlite:///db.sqlite3",
    load_if_exists=True,
)
study.optimize(objective, n_trials=300)

print("Best value:", study.best_value)
print("Best hyperparameters:", study.best_params)

# Best value: 0.898876404494382
# Best trial: FrozenTrial(number=45, state=1, values=[0.898876404494382], datetime_start=datetime.datetime(2025, 3, 27, 12, 8, 10, 550885), datetime_complete=datetime.datetime(2025, 3, 27, 12, 8, 10, 673369), params={'max_depth': 3, 'learning_rate': 0.22744293099412335, 'n_estimators': 164, 'gamma': 0.19263307345832545, 'min_child_weight': 2, 'subsample': 0.9603981618654407, 'colsample_bytree': 0.98436209671303}, user_attrs={}, system_attrs={}, intermediate_values={}, distributions={'max_depth': IntDistribution(high=10, log=False, low=3, step=1), 'learning_rate': FloatDistribution(high=0.3, log=False, low=0.01, step=None), 'n_estimators': IntDistribution(high=200, log=False, low=50, step=1), 'gamma': FloatDistribution(high=0.5, log=False, low=0.0, step=None), 'min_child_weight': IntDistribution(high=6, log=False, low=1, step=1), 'subsample': FloatDistribution(high=1.0, log=False, low=0.5, step=None), 'colsample_bytree': FloatDistribution(high=1.0, log=False, low=0.5, step=None)}, trial_id=246, value=None)
# Best hyperparameters: {'max_depth': 3, 'learning_rate': 0.22744293099412335, 'n_estimators': 164, 'gamma': 0.19263307345832545, 'min_child_weight': 2, 'subsample': 0.9603981618654407, 'colsample_bytree': 0.98436209671303}
