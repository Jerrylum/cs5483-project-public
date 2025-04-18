
import optuna
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 加載資料集
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.5, random_state=42)

# 定義目標函數
def objective(trial):
    # 定義隨機森林的超參數空間
    n_estimators = trial.suggest_int("n_estimators", 10, 200)
    max_depth = trial.suggest_int("max_depth", 2, 32, log=True)
    min_samples_split = trial.suggest_int("min_samples_split", 2, 20)
    min_samples_leaf = trial.suggest_int("min_samples_leaf", 1, 20)
    
    # 建立隨機森林模型
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        random_state=42
    )
    
    # 使用交叉驗證評估模型
    scores = cross_val_score(model, X_train, y_train, cv=10, scoring="accuracy")
    return scores.mean()

# 建立 Optuna 的研究對象
study = optuna.create_study(
    study_name="random_forest",
    direction="maximize",
    storage="sqlite:///db.sqlite3",
    load_if_exists=True,
)
study.optimize(objective, n_trials=50)

# 輸出最佳結果
print("最佳參數組合:", study.best_params)
print("最佳交叉驗證準確率:", study.best_value)

# 使用最佳參數訓練最終模型
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
best_model = RandomForestClassifier(**study.best_params, random_state=42)
best_model.fit(X_train, y_train)
y_pred = best_model.predict(X_test)

# 評估最終模型
print("測試集準確率:", accuracy_score(y_test, y_pred))