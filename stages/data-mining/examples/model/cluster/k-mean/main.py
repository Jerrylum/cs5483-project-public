

from sklearn.datasets import load_wine
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import numpy as np

# 載入資料集
data = load_wine()
X = data.data
y = data.target

# 資料標準化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 使用 KMeans 進行聚類
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X_scaled)

# 將聚類結果對應到真實標籤
# 因為 KMeans 的標籤是無序的，需要手動對應
def map_clusters_to_labels(y_true, y_pred):
    mapping = {}
    for cluster in np.unique(y_pred):
        true_labels = y_true[y_pred == cluster]
        most_common_label = np.bincount(true_labels).argmax()
        mapping[cluster] = most_common_label
    return np.array([mapping[cluster] for cluster in y_pred])

y_pred = map_clusters_to_labels(y, kmeans.labels_)

# 計算準確率
accuracy = accuracy_score(y, y_pred)
print(f"Clustering Accuracy: {accuracy:.2f}")