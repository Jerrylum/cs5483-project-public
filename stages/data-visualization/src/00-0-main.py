from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

print(df.describe().map(lambda x: f"{x:0.3f}").T)

print()
# print("Merged: ", len(df[df["final_state"] == "merged"]))
# print("Closed: ", len(df[df["final_state"] != "closed"]))

# print("commits == 0: ", len(df[df["commits"] == 0]))
# print("changed_files == 0: ", len(df[df["changed_files"] == 0]))

print(df.head(2).T)
print()

# Print column names with index
columns = df.columns.tolist()
for i, col in enumerate(columns):
    print(f"{i}: {col}")
print()



