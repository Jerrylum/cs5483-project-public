

def get_feature_importance_table(feature_names, importances):
    feature_importance = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True,
    )
    return feature_importance


# Remove the least important feature
def remove_least_important_feature(X, feature_importance_table):
    least_important_feature = feature_importance_table[-1][0]
    X = X.drop(columns=[least_important_feature])
    return X, least_important_feature


def show_feature_importance_rank(model, X_train, y_train):
    model.fit(X_train, y_train)
    table = get_feature_importance_table(X_train.columns, model.feature_importances_)

    # Show feature importances rank
    for i, (feature, importance) in enumerate(table, start=1):
        print(f"{i}. {feature}: {importance}")
    print()
