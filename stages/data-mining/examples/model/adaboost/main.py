from sklearn.datasets import load_wine
from sklearn.ensemble import AdaBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# 載入 load_wine 資料集
data = load_wine()
X, y = data.data, data.target

# 分割資料集為訓練集與測試集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 初始化 AdaBoost 分類器
adaboost_clf = AdaBoostClassifier(n_estimators=50, random_state=42)

# 訓練模型
adaboost_clf.fit(X_train, y_train)

# 預測測試集
y_pred = adaboost_clf.predict(X_test)

# 評估模型
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))