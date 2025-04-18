# https://xgboost.readthedocs.io/en/stable/parameter.html
# https://ithelp.ithome.com.tw/articles/10301273
from xgboost import XGBClassifier, XGBRFClassifier


def basic_model_setter_XGBClassifier(**args):
    return XGBClassifier(
        n_estimators=int(args["n_estimators"]),
        learning_rate=args["learning_rate"],
        max_depth=int(args["max_depth"]),
    )


basic_pbounds_XGBClassifier = {
    "n_estimators": (1, 1024),
    "learning_rate": (1e-5, 1),
    "max_depth": (3, 16),
}
