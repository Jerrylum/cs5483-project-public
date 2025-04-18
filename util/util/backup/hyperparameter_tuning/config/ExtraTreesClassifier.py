# https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.ExtraTreesClassifier.html
from sklearn.ensemble import ExtraTreesClassifier


def basic_model_setter_ExtraTreesClassifier(**args):
    return ExtraTreesClassifier(
        n_estimators=int(args["n_estimators"]),
        min_samples_split=int(args["min_samples_split"]),
        # max_depth = int(args['max_depth']),
    )


basic_pbounds_ExtraTreesClassifier = {
    "n_estimators": (1, 1024),
    # 'learning_rate': (1e-5, 1),
    # 'max_depth': (3, 16),
    "min_samples_split": (2, 16),
}
