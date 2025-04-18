import pandas as pd
from sklearn.datasets import load_wine

# Load the wine dataset
wine = load_wine()
data = pd.DataFrame(wine.data, columns=wine.feature_names)
data["target"] = wine.target

# Display the label, column, and some attributes
summary = data.describe().T

print("Labels:", wine.target_names)
print("Columns:", data.columns.tolist())
print("Attributes summary:\n", summary)

# Display sample data
print("\nSample data:")
print(data.head())

# Possible value of target
print("\nPossible values of target:", data["target"].unique())


