from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_return_X_y
from util.evaluation.show_train_test_accuracy import show_train_test_accuracy
from util.evaluation.cross_val_10_fold import cross_val_10_fold
from util.evaluation.feature_importance import show_feature_importance_rank

# Read data
df = read_default_data()
df, X, y = preprocessing_return_X_y(df, disable_llm_features=True)

# Spilt the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_jobs=-1,
    random_state=42,
)
show_train_test_accuracy(model, X_train, y_train, X_test, y_test)

# 使用交叉驗證評估模型
model = RandomForestClassifier(
    n_jobs=-1,
    random_state=42,
)
cv_accuracy = cross_val_10_fold(model, X_train, y_train)
print("交叉驗證:", cv_accuracy)


show_feature_importance_rank(model, X_train, y_train)
