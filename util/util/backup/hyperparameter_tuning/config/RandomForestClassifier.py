from sklearn.ensemble import RandomForestClassifier


def basic_model_setter_RandomForestClassifier(**args):
    if args["criterion"] < 1:
        criterion = "gini"
    elif args["criterion"] < 2:
        criterion = "entropy"
    else:
        criterion = "log_loss"

    return RandomForestClassifier(
        n_estimators=int(args["n_estimators"]),
        criterion=criterion,
        max_depth=int(args["max_depth"]),
    )


basic_pbounds_RandomForestClassifier = {
    "n_estimators": (1, 1024),
    "criterion": (0, 3),
    "max_depth": (3, 16),
}
