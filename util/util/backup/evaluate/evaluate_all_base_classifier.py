from sklearn.model_selection import cross_val_score
from sklearn.datasets import load_wine
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    make_scorer,
)
from sklearn.model_selection import StratifiedKFold

from util.classifier.base_classifier_list import base_classifier_list


def evaluate_all_base_classifier(X, y):

    for base_classifier in base_classifier_list:
        print(f'Classifier name: {base_classifier["name"]}')
        print(f'Classifier: {base_classifier["classifier"]}')

        model = base_classifier["classifier"]

        # Perform 10-fold cross-validation to calculate different scores
        scoring_metrics = [accuracy_score]
        # scoring_metrics = [accuracy_score, f1_score, precision_score, recall_score]

        for scoring in scoring_metrics:
            scorer = make_scorer(scoring)

            stratified10Fold = StratifiedKFold(n_splits=2)
            scores = cross_val_score(model, X, y, cv=stratified10Fold, scoring=scorer)
            # print(f'{scoring.capitalize()} for each fold: {scores}')
            print(f"Mean {scoring.__name__}: {scores.mean():.2f}")
        print()


# Load the wine dataset
dataset = load_wine()
X = pd.DataFrame(dataset.data, columns=dataset.feature_names)
y = pd.Series(dataset.target)

# Use 1/10th of the dataset
X_sampled = X.sample(frac=0.3, random_state=42)
y_sampled = y[X_sampled.index]

# Evaluate the dataset with all base classifiers
# evaluate_all_base_classifier(X, y)
evaluate_all_base_classifier(X_sampled, y_sampled)
