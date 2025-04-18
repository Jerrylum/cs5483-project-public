from sklearn.datasets import load_wine
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# 載入 load_wine 資料集
data = load_wine()
X, y = data.data, data.target

# 分割資料集為訓練集與測試集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 初始化 KNN 分類器
knn_clf = KNeighborsClassifier(n_neighbors=5)

# 訓練模型
knn_clf.fit(X_train, y_train)

# 預測測試集
y_pred = knn_clf.predict(X_test)

# 評估模型
accuracy = accuracy_score(y_test, y_pred)
print(f"KNN Accuracy: {accuracy:.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))