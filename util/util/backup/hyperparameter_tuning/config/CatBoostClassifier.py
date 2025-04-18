from catboost import CatBoostClassifier

# For loss function options
# https://catboost.ai/docs/en/concepts/loss-functions-multiclassification
# MultiClass, MultiClassOneVsAll


def basic_model_setter_CatBoostClassifier(**args):
    # print(args)
    return CatBoostClassifier(
        iterations=int(args["iterations"]),
        learning_rate=args["learning_rate"],
        depth=int(args["depth"]),
        l2_leaf_reg=args["l2_leaf_reg"],
        # loss_function = 'MultiClassOneVsAll',
        verbose=False,
    )


basic_pbounds_CatBoostClassifier: dict[str, tuple[float, float]] = {
    "iterations": (1, 1024),
    "learning_rate": (1e-5, 0.2),
    "depth": (3, 9),
    "l2_leaf_reg": (1, 30),
}
