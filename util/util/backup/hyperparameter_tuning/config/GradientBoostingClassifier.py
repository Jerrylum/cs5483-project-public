from sklearn.ensemble import GradientBoostingClassifier


def basic_model_setter_GradientBoostingClassifier(**args):
    return GradientBoostingClassifier(
        n_estimators=int(args["n_estimators"]),
        learning_rate=args["learning_rate"],
        max_depth=int(args["max_depth"]),
        min_samples_split=int(args["min_samples_split"]),
        min_samples_leaf=int(args["min_samples_leaf"]),
    )


basic_pbounds_GradientBoostingClassifier = {
    "n_estimators": (1, 512),
    "learning_rate": (1e-5, 0.5),
    "max_depth": (3, 16),
    "min_samples_split": (2, 16),
    "min_samples_leaf": (1, 16),
}
