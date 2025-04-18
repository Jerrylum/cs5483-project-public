from typing import Any, Callable, Literal, Union

# https://github.com/bayesian-optimization/BayesianOptimization
from bayes_opt import BayesianOptimization

from util.hyperparameter_tuning.common_func import (
    common_model_fit_func,
    common_model_score_func,
)


def hyperparameters_tuning_by_bayesian(
    model_setter_func: Callable,
    pbounds: dict[str, tuple[float, float]],
    optimizer_init_points: int = 5,
    optimizer_n_iter: int = 25,
    verbose: Literal[0, 1, 2] = 2,
    fit_func: Callable = common_model_fit_func,
    score_func: Callable = common_model_score_func,
):
    def model_optimization_func(**args):
        model = model_setter_func(**args)
        fit_func(model)
        return score_func(model)

    optimizer = BayesianOptimization(
        f=model_optimization_func,
        pbounds=pbounds,
        verbose=verbose,
    )
    optimizer.maximize(
        init_points=optimizer_init_points,
        n_iter=optimizer_n_iter,
    )
    print(optimizer.max)
