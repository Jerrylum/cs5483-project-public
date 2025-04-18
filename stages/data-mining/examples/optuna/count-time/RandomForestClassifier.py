import optuna
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import time

# 加載資料集
data = load_wine()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

# 定義目標函數
def objective(trial):
    # 定義隨機森林的超參數範圍
    n_estimators = trial.suggest_int("n_estimators", 10, 200)
    max_depth = trial.suggest_int("max_depth", 2, 32)
    min_samples_split = trial.suggest_int("min_samples_split", 2, 20)
    min_samples_leaf = trial.suggest_int("min_samples_leaf", 1, 20)

    # 建立模型
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
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
# 最佳超參數: {'n_estimators': 136, 'max_depth': 14, 'min_samples_split': 2, 'min_samples_leaf': 1}
# 最佳準確率: 0.9775280898876404
# 總時間: 34.55 秒
# 每小時平均試驗數: 20836.58

# 試驗次數: 200
# 最佳超參數: {'n_estimators': 26, 'max_depth': 10, 'min_samples_split': 8, 'min_samples_leaf': 16}
# 最佳準確率: 0.9887640449438202
# 總時間: 18.31 秒
# 每小時平均試驗數: 39326.56

# 試驗次數: 200
# 最佳超參數: {'n_estimators': 35, 'max_depth': 18, 'min_samples_split': 7, 'min_samples_leaf': 1}
# 最佳準確率: 0.9775280898876404
# 總時間: 15.50 秒
# 每小時平均試驗數: 46443.63

# 試驗次數: 200
# 最佳超參數: {'n_estimators': 198, 'max_depth': 32, 'min_samples_split': 11, 'min_samples_leaf': 1}
# 最佳準確率: 0.9775280898876404
# 總時間: 35.86 秒
# 每小時平均試驗數: 20078.89

# So random 


