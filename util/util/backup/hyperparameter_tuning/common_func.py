from util.global_variable import (
    X_train,
    Y_train,
    X_test,
    Y_test,
    Y_train_codes,
    Y_test_codes,
)


def common_model_fit_func(model):
    model.fit(X_train, Y_train)


def fit_func_codes(model):
    model.fit(X_train, Y_train_codes)


def common_model_score_func(model):
    return model.score(X_test, Y_test)


def score_func_codes(model):
    return model.score(X_test, Y_test_codes)
