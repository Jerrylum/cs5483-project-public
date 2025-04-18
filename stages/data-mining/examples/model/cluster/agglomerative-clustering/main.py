from sklearn.datasets import load_wine
from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import numpy as np

# 載入資料集
data = load_wine()
X = data.data
y = data.target

# 資料標準化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 使用 AgglomerativeClustering 進行層次式聚類
agg_clustering = AgglomerativeClustering(n_clusters=3)
y_pred = agg_clustering.fit_predict(X_scaled)

# 將聚類結果對應到真實標籤
def map_clusters_to_labels(y_true, y_pred):
    mapping = {}
    for cluster in np.unique(y_pred):
        true_labels = y_true[y_pred == cluster]
        most_common_label = np.bincount(true_labels).argmax()
        mapping[cluster] = most_common_label
    return np.array([mapping[cluster] for cluster in y_pred])

y_pred_mapped = map_clusters_to_labels(y, y_pred)

# 計算準確率
accuracy = accuracy_score(y, y_pred_mapped)
print(f"Hierarchical Clustering Accuracy: {accuracy:.2f}")