import optuna
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split

from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_return_X_y
from util.tune.objective.create_CatBoostClassifier import (
    create_CatBoostClassifier,
    params_const,
)
from util.evaluation.cross_val_10_fold import cross_val_10_fold
from util.evaluation.show_train_test_accuracy import show_train_test_accuracy


# Read data
df = read_default_data()
df, X, y = preprocessing_return_X_y(df, disable_llm_features=True)

# Spilt the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)


def objective(trial):
    model = create_CatBoostClassifier(trial)
    return cross_val_10_fold(model, X_train, y_train)


study = optuna.create_study(
    study_name="catboost-without-llm",
    storage="sqlite:///result.sqlite3",
    direction="maximize",
    load_if_exists=True,
)
study.optimize(
    objective,
    timeout=3600,
)

# 使用最佳參數訓練最終模型
best_params = study.best_params
model = CatBoostClassifier(
    **params_const,
    **best_params,
)
show_train_test_accuracy(model, X_train, y_train, X_test, y_test)

print("10-fold CV 準確率: ", study.best_value)
print()
