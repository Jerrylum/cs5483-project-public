from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier


def basic_model_setter_AdaBoostClassifier_DecisionTreeClassifier(**args):
    if args["criterion"] < 1:
        criterion = "gini"
    elif args["criterion"] < 2:
        criterion = "entropy"
    else:
        criterion = "log_loss"

    return AdaBoostClassifier(
        estimator=DecisionTreeClassifier(
            criterion=criterion,
            max_depth=int(args["max_depth"]),
            min_samples_split=int(args["min_samples_split"]),
            min_samples_leaf=int(args["min_samples_leaf"]),
        ),
        n_estimators=int(args["n_estimators"]),
        learning_rate=args["learning_rate"],
    )


basic_pbounds_AdaBoostClassifier_DecisionTreeClassifier = {
    "n_estimators": (1, 2048),
    "learning_rate": (1e-5, 1),
    "max_depth": (3, 16),
    "criterion": (0, 3),
    "min_samples_split": (2, 16),
    "min_samples_leaf": (2, 16),
}
