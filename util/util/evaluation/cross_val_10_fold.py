from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, make_scorer


def cross_val_10_fold(model, X_train, y_train):
    scores = cross_val_score(
        model, X_train, y_train, cv=10, scoring=make_scorer(accuracy_score)
    )
    return scores.mean()
