import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.datasets import load_wine
import xgboost as xgb

# Load the wine dataset
wine = load_wine()
X = pd.DataFrame(wine.data, columns=wine.feature_names)
y = pd.Series(wine.target)

# Create an XGBoost classifier
model = xgb.XGBClassifier(eval_metric="mlogloss", verbosity=0)

# Perform 10-fold cross-validation
scores = cross_val_score(model, X, y, cv=10, scoring="accuracy")

# Print the accuracy for each fold and the mean accuracy
print(f"Accuracy for each fold: {scores}")
print(f"Mean accuracy: {scores.mean():.2f}")
