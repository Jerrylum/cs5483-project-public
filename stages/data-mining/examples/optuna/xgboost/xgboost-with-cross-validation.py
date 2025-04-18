import optuna
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, make_scorer
from xgboost import XGBClassifier

# Load the wine dataset
data = load_wine()
X = data.data
y = data.target

# Split the data into training and testing sets
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, test_size=0.5, random_state=42
# )

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
    # Use cross-validation to evaluate the model
    scores = cross_val_score(clf, X, y, cv=10, scoring=make_scorer(accuracy_score))
    return scores.mean()

# Create a study and optimize the objective function
study = optuna.create_study(
    study_name="xgboost with 10 fold cross validation", 
    direction="maximize",
    storage="sqlite:///db.sqlite3",
    load_if_exists=True,
) 
study.optimize(objective, n_trials=200)

print("Best value:", study.best_value)
# print("Best trial:", study.best_trial)
print("Best hyperparameters:", study.best_params)

