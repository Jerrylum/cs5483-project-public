import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

df = df[["before_merged_pr_count", "final_state"]]
df = df[df["before_merged_pr_count"] > 30]
df = df[df["before_merged_pr_count"] < 750]

binwidth = 10
bin_edges = np.arange(31, df["before_merged_pr_count"].max() + binwidth, binwidth)

# Use histplot with explicit bins to align them
sns.histplot(
    df[df["final_state"] == "merged"]["before_merged_pr_count"],
    label="Merged",
    kde=False,
    bins=bin_edges,  # Explicit bin edges
    color="#8957e5",
)
ax = sns.histplot(
    df[df["final_state"] == "closed"]["before_merged_pr_count"],
    label="Closed",
    kde=False,
    bins=bin_edges,  # Explicit bin edges
    color="#da3633",
)
ax.figure.set_size_inches(8, 6)  # Set figure size
plt.title("Before Merged PR count Distribution (> 30)")
plt.xlabel("Before Merged PR")
plt.ylabel("Count")
plt.legend()

# Save the plot as an image
output_path = "images/23-1-before_merged_pr_count-greater_30.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()
