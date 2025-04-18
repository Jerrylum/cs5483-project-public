import pathlib
import json
import optuna
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier

from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_return_X_y
from util.evaluation.feature_importance import (
    get_feature_importance_table,
    remove_least_important_feature,
)
from util.evaluation.show_train_test_accuracy import show_train_test_accuracy
from util.evaluation.cross_val_10_fold import cross_val_10_fold
from util.tune.objective.create_CatBoostClassifier import (
    params_const,
    create_CatBoostClassifier,
)

model_name = "catboost"

# Timeout
timeout = 600  # 10 minutes

# Accuracy dict
training_set_accuracy_dict = {}
test_set_accuracy_dict = {}
cv_accuracy_dict = {}

# Feature importance table dict
feature_importance_table_dict = {}

# Read data
df = read_default_data()
df, X, y = preprocessing_return_X_y(df)

# Spilt the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Number of features
num_features_original = X_train.shape[1]
print(f"=== Number of features: {num_features_original} ===")
print()

# Load init tuned model from optuna study
study = optuna.load_study(
    study_name=model_name,
    storage="sqlite:///result.sqlite3",
)
best_params = study.best_params

# Get feature importances from the best trial
model = CatBoostClassifier(**params_const, **best_params)
training_set_accuracy, test_set_accuracy = show_train_test_accuracy(
    model, X_train, y_train, X_test, y_test
)
print("10-fold CV 準確率: ", study.best_value)
print()

# Save to accuracy dict
training_set_accuracy_dict["init"] = training_set_accuracy
test_set_accuracy_dict["init"] = test_set_accuracy
cv_accuracy_dict["init"] = study.best_value

# Get feature importances
feature_importance_table = get_feature_importance_table(
    X_train.columns, model.feature_importances_
)
feature_importance_table_dict["init"] = feature_importance_table

# Show feature importances rank
for i, (feature, importance) in enumerate(feature_importance_table, start=1):
    print(f"{i:<2} {feature:<34}: {importance}")
print()

# Remove the least important feature
X_train, removed_column_name = remove_least_important_feature(
    X_train, feature_importance_table
)
X_test = X_test.drop(columns=[removed_column_name])
print(f"Removed feature: {removed_column_name}")
print()


def objective(trial):
    model = create_CatBoostClassifier(trial)
    return cross_val_10_fold(model, X_train, y_train)


# Loop number of features - 2 times (remain 2 features in the end)
# for i in range(1):
for i in range(num_features_original - 2):
    num_features = X_train.shape[1]
    print(f"=== Number of features: {num_features} ===")

    study_name = f"{model_name}-num_features-{num_features}"
    study = optuna.create_study(
        study_name=study_name,
        storage="sqlite:///result.sqlite3",
        direction="maximize",
        load_if_exists=True,
    )
    study.enqueue_trial(best_params)
    study.optimize(
        objective,
        timeout=timeout,
    )
    print()

    # Get best parameters, fit to model
    best_params = study.best_params
    model = CatBoostClassifier(**params_const, **best_params)
    training_set_accuracy, test_set_accuracy = show_train_test_accuracy(
        model, X_train, y_train, X_test, y_test
    )
    print("10-fold CV 準確率: ", study.best_value)
    print()

    # Save to accuracy dict
    training_set_accuracy_dict[num_features] = training_set_accuracy
    test_set_accuracy_dict[num_features] = test_set_accuracy
    cv_accuracy_dict[num_features] = study.best_value

    # Get feature importances
    feature_importance_table = get_feature_importance_table(
        X_train.columns, model.feature_importances_
    )
    feature_importance_table_dict[num_features] = feature_importance_table

    # Show feature importances rank
    for i, (feature, importance) in enumerate(feature_importance_table, start=1):
        print(f"{i}. {feature}: {importance}")
    print()

    # Remove the least important feature
    X_train, removed_column_name = remove_least_important_feature(
        X_train, feature_importance_table
    )
    X_test = X_test.drop(columns=[removed_column_name])
    print(f"Removed feature: {removed_column_name}")
    print()

print("=== Final Result ===")

print("訓練集準確率: ", training_set_accuracy_dict)
print("測試集準確率: ", test_set_accuracy_dict)
print("10-fold CV 準確率: ", cv_accuracy_dict)
print()

print("特徵重要性表: ", feature_importance_table_dict)

# Save the results to a file
current_directory = pathlib.Path(__file__).parent.resolve()
with open(current_directory / "result.txt", "w", encoding="utf8") as f:
    f.write("訓練集準確率: \n")
    f.write(json.dumps(training_set_accuracy_dict, indent=4) + "\n")
    f.write("測試集準確率: \n")
    f.write(json.dumps(test_set_accuracy_dict, indent=4) + "\n")
    f.write("10-fold CV 準確率: \n")
    f.write(json.dumps(cv_accuracy_dict, indent=4) + "\n")
    f.write("\n")
    f.write("特徵重要性表: \n")
    for num_features, table in feature_importance_table_dict.items():
        f.write(f"=== Number of features: {num_features} ===\n")
        f.write(json.dumps(table, indent=4) + "\n")
    f.write("\n")
