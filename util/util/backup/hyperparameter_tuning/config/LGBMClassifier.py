# https://lightgbm.readthedocs.io/en/latest/pythonapi/lightgbm.LGBMClassifier.html
from lightgbm import LGBMClassifier


def basic_model_setter_LGBMClassifier(**args):
    return LGBMClassifier(
        n_estimators=int(args["n_estimators"]),
        learning_rate=args["learning_rate"],
        # max_depth = int(args['max_depth']),
    )


basic_pbounds_LGBMClassifier = {
    "n_estimators": (1, 1024),
    "learning_rate": (1e-5, 1),
}
