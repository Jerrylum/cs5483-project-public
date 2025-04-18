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

# Perform 10-fold cross-validation to calculate different scores
scoring_metrics = ["accuracy", "precision_macro", "recall_macro", "roc_auc_ovr"]

for scoring in scoring_metrics:
    scores = cross_val_score(model, X, y, cv=10, scoring=scoring)
    print(f"{scoring.capitalize()} for each fold: {scores}")
    print(f"Mean {scoring}: {scores.mean():.2f}\n")
