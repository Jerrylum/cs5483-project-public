import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

# Filter out rows where comments > 25
df = df[df["changed_files"] > 0]
df = df[df["changed_files"] <= 15]

# Define bin edges for consistent bin width
min_comments = df["changed_files"].min()
max_comments = df["changed_files"].max()
bin_width = 1  # Define the bin width
bins = np.arange(min_comments, max_comments + bin_width, bin_width)

# Use histplot instead of kdeplot to avoid smoothing
sns.histplot(
    df[df["final_state"] == "merged"]["changed_files"],
    label="Merged",
    kde=False,
    bins=bins,
    color="#8957e5",
)
sns.histplot(
    df[df["final_state"] == "closed"]["changed_files"],
    label="Closed",
    kde=False,
    bins=bins,
    color="#da3633",
)
plt.title("Changed Files Distribution by Final State (<= 15)")
plt.legend()
plt.show()




