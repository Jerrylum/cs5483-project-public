import matplotlib.pyplot as plt
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

df = df[df['alignment'] <= 10]

# Show numbers of changes_quality group by final_state
print(df.groupby(["alignment", "final_state"]).size())

# Group by 'nature' and 'final_state', then normalize to percentages
nature_counts = df.groupby(["alignment", "final_state"]).size().unstack()
nature_percentages = nature_counts.div(nature_counts.sum(axis=1), axis=0) * 100

# Reorder columns to show 'merged', 'pending-merge', then 'closed'
desired_order = ["merged", "pending-merge", "closed"]
nature_percentages = nature_percentages[desired_order]
# print(nature_percentages)

# Sort by 'merged' final_state in descending order
if "merged" in nature_percentages.columns:
    nature_percentages = nature_percentages.sort_values(by="merged", ascending=True)

# Define custom colors for the bars
custom_colors = [
    "#8957e5",
    "#a57eed",
    "#da3633",
]  # Purple for merged, lilac for pending-merge, red for closed

# Plot the normalized percentages as a horizontal bar chart
ax = nature_percentages.plot(
    kind="barh",
    stacked=True,
    title="Nature of Pull Requests by Final State (Percentage)",
    color=custom_colors,
)
plt.ylabel("alignment")
plt.xlabel("Percentage")

# Move the legend outside the plot
ax.legend(
    title="Final State", bbox_to_anchor=(1.05, 0.5), loc="center left", borderaxespad=0
)

plt.tight_layout()  # Adjust layout to prevent clipping
plt.show()
