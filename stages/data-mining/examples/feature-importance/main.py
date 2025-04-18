from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import numpy as np

# Load the wine dataset
wine = load_wine()
X = wine.data
y = wine.target

# Create a RandomForestClassifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)

# Fit the model
clf.fit(X, y)

# Get feature importances
importances = clf.feature_importances_

# Create a DataFrame for better visualization
feature_names = wine.feature_names
feature_importances = pd.DataFrame(
    {"feature": feature_names, "importance": importances}
)

# Sort the DataFrame by importance
feature_importances = feature_importances.sort_values(by="importance", ascending=False)

# Print the feature importances
print(feature_importances)
