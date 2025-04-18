import optuna
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
import time

# 加載資料集
data = load_wine()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

# 定義目標函數
def objective(trial):
    # 定義 XGBClassifier 的超參數範圍
    n_estimators = trial.suggest_int("n_estimators", 50, 500)
    max_depth = trial.suggest_int("max_depth", 3, 15)
    learning_rate = trial.suggest_float("learning_rate", 0.01, 0.3)
    colsample_bytree = trial.suggest_float("colsample_bytree", 0.5, 1.0)
    subsample = trial.suggest_float("subsample", 0.5, 1.0)

    # 建立模型
    model = XGBClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        colsample_bytree=colsample_bytree,
        subsample=subsample,
        eval_metric="mlogloss",
        random_state=42,
    )

    # 訓練模型
    model.fit(X_train, y_train)

    # 預測並計算準確率
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    return accuracy

# 設定試驗次數，預設為 200
n = 200  # 您可以更改此值

# 計時並執行 n 次試驗
start_time = time.time()
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=n)
end_time = time.time()

# 計算總時間和每小時平均試驗數
total_time_seconds = end_time - start_time
total_time_hours = total_time_seconds / 3600
average_trials_per_hour = n / total_time_hours

# 輸出結果
print(f"試驗次數: {n}")
print(f"最佳超參數: {study.best_params}")
print(f"最佳準確率: {study.best_value}")
print(f"總時間: {total_time_seconds:.2f} 秒")
print(f"每小時平均試驗數: {average_trials_per_hour:.2f}")

# 試驗次數: 200
# 最佳超參數: {'n_estimators': 150, 'max_depth': 6, 'learning_rate': 0.20662054988607254, 'colsample_bytree': 0.5007222079099554, 'subsample': 0.8534486813466483}
# 最佳準確率: 1.0
# 總時間: 20.53 秒
# 每小時平均試驗數: 35076.09


# 試驗次數: 200
# 最佳超參數: {'n_estimators': 265, 'max_depth': 5, 'learning_rate': 0.29942576596499054, 'colsample_bytree': 0.5009901537811593, 'subsample': 0.9697622767028171}
# 最佳準確率: 1.0
# 總時間: 16.14 秒
# 每小時平均試驗數: 44599.84

