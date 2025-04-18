import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic
from matplotlib.colors import ListedColormap

df = read_default_data()
df = preprocessing_basic(df)

custom_colors = [
    "#8957e5",  # Purple for merged
    "#da3633", # Red for closed
]

custom_cmap = ListedColormap(custom_colors)

plt.figure(figsize=(8, 7)) 
ax = plt.scatter(
    df["additions"],
    df["deletions"],
    s=25,
    c=(df["final_state"] == "merged"),
    cmap=custom_cmap,  # Use the custom colormap
    edgecolors="black",
    linewidth=0.1,
    alpha=0.7,
)
plt.title("Additions and Deletions Distribution")
plt.xlabel("Additions")
plt.ylabel("Deletions")

# Create a custom legend
from matplotlib.lines import Line2D

legend_elements = [
    Line2D([0], [0], marker='o', color='w', markerfacecolor="#8957e5", markersize=10, label='Merged'),
    Line2D([0], [0], marker='o', color='w', markerfacecolor="#da3633", markersize=10, label='Closed'),
]

ax = plt.gca()  # Get the current axis
ax.legend(
    handles=legend_elements, 
    title="Final State", 
    loc="upper right", 
    bbox_to_anchor=(0.95, 0.95),  # Adjust these values to move the legend
    borderaxespad=0
)

plt.tight_layout()  # Adjust layout to prevent clipping

# Save the plot as an image
output_path = "images/05-0-additions-deletions.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()

