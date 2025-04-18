from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score

# 載入 Wine 資料集
wine = datasets.load_wine()
X = wine.data
y = wine.target

# 將資料分為訓練集和測試集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 建立 SVM 模型
svm_model = SVC(kernel='linear', random_state=42)

# 訓練模型
svm_model.fit(X_train, y_train)

# 預測測試集
y_pred = svm_model.predict(X_test)

# 評估模型
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))