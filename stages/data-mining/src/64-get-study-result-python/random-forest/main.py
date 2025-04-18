import optuna

study = optuna.load_study(
    study_name="random-forest",
    storage="sqlite:///result.sqlite3",
)

print("Best value:", study.best_value)
print("Best hyperparameters:", study.best_params)
print()

print("Hyperparameter importance:")
get_param_importances = optuna.importance.get_param_importances(study)
for param, importance in get_param_importances.items():
    print(f"{param}: {importance:.4f}")
