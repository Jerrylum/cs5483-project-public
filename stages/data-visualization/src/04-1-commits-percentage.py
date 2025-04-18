import matplotlib.pyplot as plt
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)
df["final_state"] = df["final_state"].apply(
    lambda x: "closed" if x == "pending-merge" else x
)

# Filter out rows where commits > 20
df = df[df["commits"] > 0]
df = df[df["commits"] <= 20]

# Show numbers of changes_quality group by final_state
print(df.groupby(["commits", "final_state"]).size())

# Group by 'nature' and 'final_state', then normalize to percentages
nature_counts = df.groupby(["commits", "final_state"]).size().unstack()
nature_percentages = nature_counts.div(nature_counts.sum(axis=1), axis=0) * 100

# Reorder columns to show 'merged', 'pending-merge', then 'closed'
desired_order = [
    "merged",
    # "pending-merge",
    "closed",
]
nature_percentages = nature_percentages[desired_order]
# print(nature_percentages)

# Sort by 'merged' final_state in descending order
# if "merged" in nature_percentages.columns:
#     nature_percentages = nature_percentages.sort_values(by="merged", ascending=True)

# Sort the DataFrame index (commits) in descending order
nature_percentages = nature_percentages.sort_index(ascending=False)

# Define custom colors for the bars
custom_colors = [
    "#8957e5",
    # "#a57eed",
    "#da3633",
]  # Purple for merged, lilac for pending-merge, red for closed

# Plot the normalized percentages as a horizontal bar chart
ax = nature_percentages.plot(
    kind="barh",
    stacked=True,
    title="Commits Distribution (Percentage)",
    color=custom_colors,
    width=0.85,  # Slightly increase bar width
)
plt.ylabel("commits")
plt.xlabel("Percentage")

ax.figure.set_size_inches(10, 7)  # Set figure size
# Move the legend closer to the plot and align it better
ax.legend(
    title="Final State",
    bbox_to_anchor=(1.01, 0.5),
    loc="center left",
    borderaxespad=0.5,
)

# Add percentage values to the bars for "merged" and "closed"
for container, label in zip(
    ax.containers,
    [
        "merged",
        # "pending-merge",
        "closed",
    ],
):
    if label in ["merged", "closed"]:  # Only annotate "merged" and "closed"
        ax.bar_label(
            container, fmt="%.1f%%", label_type="center", color="white"
        )  # Use white font

# Adjust the layout to remove extra space
plt.subplots_adjust(left=0.15, right=0.85, top=0.9, bottom=0.1)  # Fine-tune margins

plt.tight_layout()  # Adjust layout to prevent clipping

# Save the plot as an image
output_path = "images/04-1-commits-percentage.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()
