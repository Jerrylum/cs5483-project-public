# https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html
from sklearn.ensemble import HistGradientBoostingClassifier


def basic_model_setter_HistGradientBoostingClassifier(**args):
    return HistGradientBoostingClassifier(
        learning_rate=args["learning_rate"],
        max_iter=int(args["max_iter"]),
        max_depth=int(args["max_depth"]),
    )


basic_pbounds_HistGradientBoostingClassifier = {
    "learning_rate": (1e-5, 1),
    "max_iter": (1, 1024),
    "max_depth": (3, 16),
}
