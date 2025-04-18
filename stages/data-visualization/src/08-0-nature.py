import matplotlib.pyplot as plt
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)
df["final_state"] = df["final_state"].apply(
    lambda x: "closed" if x == "pending-merge" else x
)
# df = df[df["final_state"] != "pending-merge"]

# Show numbers of changes_quality group by final_state
print(df.groupby(["nature", "final_state"]).size())

# Group by 'nature' and 'final_state', then normalize to percentages
nature_counts = df.groupby(["nature", "final_state"]).size().unstack()
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
if "merged" in nature_percentages.columns:
    # First sort by the 'merged' column
    nature_percentages = nature_percentages.sort_values(by="merged", ascending=True)

    # Then move 'other' to the bottom if it exists in the index
    if 'other' in nature_percentages.index:
        # Get current index without 'other'
        other_indices = [idx for idx in nature_percentages.index if idx != 'other']
        # print(other_indices)
        # Create new index with 'other' at the end
        new_index = ['other'] + other_indices
        # Reindex the DataFrame
        nature_percentages = nature_percentages.reindex(new_index)
    
    # Then move 'unknown' to the bottom if it exists in the index
    if 'unknown' in nature_percentages.index:
        # Get current index without 'unknown'
        other_indices = [idx for idx in nature_percentages.index if idx != 'unknown']
        # print(other_indices)
        # Create new index with 'unknown' at the end
        new_index = ['unknown'] + other_indices
        # Reindex the DataFrame
        nature_percentages = nature_percentages.reindex(new_index)




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
    title="Percentage of Nature",
    color=custom_colors,
    width=0.85,  # Slightly increase bar width
)
ax.figure.set_size_inches(11, 7)  # Set figure size
plt.ylabel("Nature")
plt.xlabel("Percentage")

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

# Move the legend outside the plot
ax.legend(
    title="Final State", bbox_to_anchor=(1.02, 0.5), loc="center left", borderaxespad=0
)

# Save the plot as an image
output_path = "images/08-0-nature.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.tight_layout()  # Adjust layout to prevent clipping
plt.show()
