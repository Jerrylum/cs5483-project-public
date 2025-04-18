from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import pandas as pd
import numpy as np

# 載入資料集
data = load_wine()
X = data.data
y = data.target

# 資料標準化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 使用 DBSCAN 進行分群
dbscan = DBSCAN(eps=1.5, min_samples=5)
clusters = dbscan.fit_predict(X_scaled)

# 將結果轉為 DataFrame 以便檢視
results = pd.DataFrame({
    'Cluster': clusters,
    'Target': y
})

# 顯示分群結果
print("Cluster assignments:")
print(results['Cluster'].value_counts())
print("\nSample of clustering results:")
print(results.head())



# 計算分群與真實標籤的對應關係
contingency_table = pd.crosstab(results['Cluster'], results['Target'])
print("\nContingency Table:")
print(contingency_table)


from sklearn.metrics import silhouette_score, adjusted_rand_score

# 計算輪廓係數 (僅適用於非噪聲點)
if len(set(clusters)) > 1:  # 確保有多於一個群集
    silhouette_avg = silhouette_score(X_scaled, clusters)
    print(f"\nSilhouette Score: {silhouette_avg:.2f}")

# 計算調整蘭德指數
ari = adjusted_rand_score(y, clusters)
print(f"Adjusted Rand Index (ARI): {ari:.2f}")

