import seaborn as sns
import matplotlib.pyplot as plt
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

df = df[["opening_pr_count", "final_state"]]
df = df[df["opening_pr_count"] > 5]
df = df[df["opening_pr_count"] < 400]

# bins = 30  # Number of bins for histogram

binwidth = 5

# Use histplot instead of kdeplot to avoid smoothing
sns.histplot(
    df[df["final_state"] == "merged"]["opening_pr_count"],
    label="Merged",
    kde=False,
    # bins=bins,
    binwidth=binwidth,
    color="#8957e5",
)
ax = sns.histplot(
    df[df["final_state"] == "closed"]["opening_pr_count"],
    label="Closed",
    kde=False,
    binwidth=binwidth,
    color="#da3633",
)
ax.figure.set_size_inches(11, 4)  # Set figure size
plt.title("Open PR count Distribution")
plt.xlabel("Open PR count")
plt.ylabel("Count")
plt.legend()

# Save the plot as an image
output_path = "images/25-0-opening_pr_count.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()
