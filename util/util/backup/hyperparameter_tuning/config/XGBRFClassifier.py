from xgboost import XGBRFClassifier


def basic_model_setter_XGBRFClassifier(**args):
    return XGBRFClassifier(
        n_estimators=int(args["n_estimators"]),
        learning_rate=args["learning_rate"],
        max_depth=int(args["max_depth"]),
    )
