"""
This script is used to process the data from the Parquet file.
"""

import pandas as pd
from util.data_processing.preprocesing import preprocessing_return_X_y
from util.read_data import read_data

# Get the current file directory
# current_directory = pathlib.Path(__file__).parent.resolve()

# # Path to the Parquet file
# file_path = current_directory / ".." / ".." / "data" / "10000.parquet"

# Read the Parquet file into a DataFrame
df = read_data("30000-with-p5.parquet")


# drop confidence column
# df = df.drop(columns=["changes_quality_score_confidence"])
# df = df.drop(columns=["alignment"])
# df = df.drop(columns=["user_followers"])
# df = df.drop(columns=["user_public_gists"])
# df = df.drop(columns=["user_public_repos"])
# df = df.drop(columns=["user_following"])
# df = df.drop(columns=["author_association"])
# df = df.drop(columns=["review_comments"])

# drop pending-merge
df = df[df["final_state"] != "pending-merge"]

# cast to category
# df["changes_necessity"] = df["changes_necessity"].astype("category").cat.codes
# df = df.drop(columns=["changes_necessity"])
# df = df.drop(columns=["before_merged_pr_count"])
# df = df.drop(columns=["before_closed_pr_count"])
df = df.drop(columns=["user_type"])
# df = df.drop(columns=["before_pr_count"])
# df = df.drop(columns=["opening_pr_count"])
# df = df.drop(columns=["opened_pr_count_in_30_days"])

# df = df.drop(columns=["changed_files"])
df = df.drop(columns=["user_account_age"])
# df = df.drop(columns=["commits"])
# df = df.drop(columns=["additions"])
# df = df.drop(columns=["deletions"])

df = df.drop(columns=["nature"])
df = df.drop(columns=["description_quality"])
df = df.drop(columns=["description_quality_score_confidence"])
df = df.drop(columns=["changes_quality"])
df = df.drop(columns=["changes_quality_score_confidence"])
df = df.drop(columns=["changes_necessity"])
df = df.drop(columns=["changes_necessity_justification"])
df = df.drop(columns=["changes_necessity_score_confidence"])
df = df.drop(columns=["alignment"])

#  filter only before_merged_pr_count < 30
# df = df[df["before_merged_pr_count"] < 3]
# df = df.drop(columns=["before_merged_pr_count"])

# # limit only 5000 merged pull requests and 5000 closed pull requests
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
# df_merged = df[df["final_state"] == "merged"].head(7246)
# df_pending = df[df["final_state"] == "pending-merge"].head(0)
# df_closed = df[df["final_state"] == "closed"].head(1000)
# df = pd.concat([df_merged, df_pending, df_closed])

print(df.head(100).T)

# print(df["description_quality"].value_counts())

# Print the length of the DataFrame
print(f"Number of rows in the data: {len(df)}")

# Print the column names and their data types
print("\nColumn names and data types:")
print(df.dtypes)
print()

print("Merged: ", len(df[df["final_state"] == "merged"]))
print("Pending: ", len(df[df["final_state"] == "pending-merge"]))
print("Closed: ", len(df[df["final_state"] == "closed"]))
print("Rate: ", len(df[df["final_state"] == "merged"]) / len(df))

df, X, y = preprocessing_return_X_y(df)


# X = X.drop(columns=["description_quality"])
# X = X.drop(columns=["changes_quality"])
# exit()



# print(df['changes_quality'].value_counts())


# # Shuffle the DataFrame
# df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# # as category
# df["final_state"] = df["final_state"].astype("category").cat.codes

# print(df["final_state"].value_counts())

# df["nature"] = df["nature"].astype("category").cat.codes
# df["changes_quality"] = df["changes_quality"].astype("category").cat.codes

# print(df.head(10).T)
# print()

# print(df['nature'].value_counts())
# print()

# print(df['changes_quality'].value_counts())
# print()

# print(df['alignment'].value_counts())
# print()

# exit()

print("=================================")

from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2,
    random_state=42
)

# Initialize the XGBClassifier
model = XGBClassifier(
    enable_categorical=True,
    eval_metric="logloss",
    n_estimators=100,
    random_state=42
)

# Train the model
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

scores = cross_val_score(model, X, y, cv=10, scoring="accuracy")

# Print the accuracy for each fold and the mean accuracy
print(f"Accuracy for each fold: {scores}")
print(f"Mean accuracy: {scores.mean():.2f}")

# Evaluate the model
# accuracy = accuracy_score(y_test, y_pred)
# print(f"Accuracy: {accuracy:.2f}")

# Print confusion matrix
from sklearn.metrics import confusion_matrix

cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

# Print classification report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))


print("=================================")


# from sklearn.ensemble import RandomForestClassifier

# clf = RandomForestClassifier(
#     n_estimators=100, 
#     random_state=42
# )

# # 訓練模型
# clf.fit(X_train, y_train)

# scores = cross_val_score(clf, X, y, cv=10, scoring="accuracy")

# # Print the accuracy for each fold and the mean accuracy
# print(f"Accuracy for each fold: {scores}")
# print(f"Mean accuracy: {scores.mean():.2f}")

# # 預測測試集
# y_pred = clf.predict(X_test)

# # 評估模型
# # accuracy = accuracy_score(y_test, y_pred)
# # print(f"Accuracy: {accuracy:.2f}")

# # Print confusion matrix

# cm = confusion_matrix(y_test, y_pred)
# print("\nConfusion Matrix:")
# print(cm)

# print("\nClassification Report:")
# print(classification_report(y_test, y_pred))


print("=================================")


# Show feature importance with label in console print, sort by descending order
importances = model.feature_importances_
indices = importances.argsort()[::-1]
print("\nXGBoost Feature ranking:")
for i in range(X.shape[1]):
    print(f"{i + 1}. {X.columns[indices[i]]}: {importances[indices[i]]:.5f}")

# # Show feature importance with label in console print, sort by descending order
# importances = clf.feature_importances_
# indices = importances.argsort()[::-1]
# print("\nClf Feature ranking:")
# for i in range(X.shape[1]):
#     print(f"{i + 1}. {X.columns[indices[i]]}: {importances[indices[i]]:.5f}")

