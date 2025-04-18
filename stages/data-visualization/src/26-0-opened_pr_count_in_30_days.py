import seaborn as sns
import matplotlib.pyplot as plt
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

df = df[["opened_pr_count_in_30_days", "final_state"]]
df = df[df["opened_pr_count_in_30_days"] > 5]
df = df[df["opened_pr_count_in_30_days"] < 200]

binwidth = 2

# Use histplot instead of kdeplot to avoid smoothing
sns.histplot(
    df[df["final_state"] == "merged"]["opened_pr_count_in_30_days"],
    label="Merged",
    kde=False,
    binwidth=binwidth,
    color="#8957e5",
)
ax = sns.histplot(
    df[df["final_state"] == "closed"]["opened_pr_count_in_30_days"],
    label="Closed",
    kde=False,
    binwidth=binwidth,
    color="#da3633",
)
ax.figure.set_size_inches(11, 4)  # Set figure size
plt.title("Opened PR count Distribution (30 days)")
plt.xlabel("Opened PR count in 30 days")
plt.ylabel("Count")
plt.legend()

# Save the plot as an image
output_path = "images/26-0-opened_pr_count_in_30_days.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()
