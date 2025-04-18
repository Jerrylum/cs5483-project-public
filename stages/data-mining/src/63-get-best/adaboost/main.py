import pathlib
import optuna
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report

from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_return_X_y
from util.evaluation.show_train_test_accuracy import show_train_test_accuracy
from util.tune.model.create_AdaBoostClassifier_from_params import (
    create_AdaBoostClassifier_from_params,
)
from util.evaluation.feature_importance import show_feature_importance_rank, get_feature_importance_table

model_name = "adaboost-with-llm"

# Read data
df = read_default_data()
df, X, y = preprocessing_return_X_y(df, disable_llm_features=False)


# Spilt the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

study = optuna.load_study(
    study_name=model_name,
    storage="sqlite:///result.sqlite3",
)

# 使用最佳參數訓練最終模型
best_params = study.best_params
model = create_AdaBoostClassifier_from_params(best_params)
show_train_test_accuracy(model, X_train, y_train, X_test, y_test)

print("10-fold CV 準確率: ", study.best_value)
print()

show_feature_importance_rank(model, X_train, y_train)


# Confusion matrix
y_pred = model.predict(X_test)
cm = confusion_matrix(y_test, y_pred)
print("Confusion matrix:")
print(cm)
print()

# Classification report
print("Classification report:")
print(classification_report(y_test, y_pred, digits=5))
print()

# Save to output.txt to currect directory
with open(pathlib.Path(__file__).parent.parent / "_output" / f"{model_name}.txt", "w", encoding="utf-8") as f:
    f.write("Best params:\n")
    f.write(str(best_params) + "\n")
    f.write("10-fold CV 準確率: " + str(study.best_value) + "\n")
    f.write("\n")

    model.fit(X_train, y_train)
    table = get_feature_importance_table(X_train.columns, model.feature_importances_)

    # Show feature importances rank
    f.write("Feature importances rank:\n")
    for i, (feature, importance) in enumerate(table, start=1):
        f.write(f"{i}. {feature}: {importance}\n")
    f.write("\n")

    f.write("Confusion matrix:\n")
    f.write(str(cm) + "\n")
    f.write("\nClassification report:\n")
    f.write(classification_report(y_test, y_pred, digits=5))

