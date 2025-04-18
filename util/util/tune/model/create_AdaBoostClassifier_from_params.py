from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier


def create_AdaBoostClassifier_from_params(params):
    model = AdaBoostClassifier(
        n_estimators=params["n_estimators"],
        learning_rate=params["learning_rate"],
        random_state=42,
        estimator=DecisionTreeClassifier(
            criterion=params["criterion"],
            max_depth=params["max_depth"],
            min_samples_split=params["min_samples_split"],
            min_samples_leaf=params["min_samples_leaf"],
            random_state=42,
        ),
    )
    return model