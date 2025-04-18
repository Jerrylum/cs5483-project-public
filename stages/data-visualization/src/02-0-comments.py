import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)
df["final_state"] = df["final_state"].apply(
    lambda x: "closed" if x == "pending-merge" else x
)

# Filter out rows where comments > 20
df = df[df["comments"] <= 20]

# Define bin edges for consistent bin width
min_comments = df["comments"].min()
max_comments = df["comments"].max()
bin_width = 1  # Define the bin width
bins = np.arange(min_comments, max_comments + bin_width, bin_width)

# Use histplot instead of kdeplot to avoid smoothing
plt.figure(figsize=(9, 7))
sns.histplot(
    df[df["final_state"] == "merged"]["comments"],
    label="Merged",
    kde=False,
    # bins=bins,
    binwidth=bin_width,
    color="#8957e5",
)
sns.histplot(
    df[df["final_state"] == "closed"]["comments"],
    label="Closed",
    kde=False,
    binwidth=bin_width,
    # bins=bins,
    color="#da3633",
)
plt.title("Comments Distribution")
# plt.legend()

from matplotlib.lines import Line2D

legend_elements = [
    Line2D(
        [0],
        [0],
        marker="o",
        color="w",
        markerfacecolor="#8957e5",
        markersize=10,
        label="Merged",
    ),
    Line2D(
        [0],
        [0],
        marker="o",
        color="w",
        markerfacecolor="#da3633",
        markersize=10,
        label="Closed",
    ),
]
plt.legend(
    handles=legend_elements,
    title="Final State",
    loc="upper right",
    bbox_to_anchor=(0.95, 0.95),  # Adjust these values to move the legend
    borderaxespad=0,
)


# Set x-axis ticks to integers
plt.xticks(
    ticks=np.arange(min_comments, max_comments + 1, bin_width),
    labels=np.arange(min_comments, max_comments + 1, bin_width),
)

# Save the plot as an image
output_path = "images/02-0-comments.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

# Show the plot
plt.show()
