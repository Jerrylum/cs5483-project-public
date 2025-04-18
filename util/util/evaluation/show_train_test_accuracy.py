"""
Show the training and test accuracy of a model
"""
from sklearn.metrics import accuracy_score

def show_train_test_accuracy(model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    training_set_accuracy = accuracy_score(y_train, y_train_pred)
    test_set_accuracy = accuracy_score(y_test, y_test_pred)

    print("訓練集準確率:", training_set_accuracy)
    print("測試集準確率:", test_set_accuracy)

    return training_set_accuracy, test_set_accuracy
