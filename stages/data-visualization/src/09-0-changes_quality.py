import seaborn as sns
import matplotlib.pyplot as plt
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic
import pandas as pd

df = read_default_data()
df = preprocessing_basic(df)
df["final_state"] = df["final_state"].apply(
    lambda x: "closed" if x == "pending-merge" else x
)

# Show numbers of changes_quality group by final_state
print(df.groupby(["changes_quality", "final_state"], observed=False).size())

# Set the order for changes_quality
quality_order = ["excellent", "acceptable", "poor", "non-suitable"][
    ::-1
]  # Reverse order
df["changes_quality"] = pd.Categorical(
    df["changes_quality"], categories=quality_order, ordered=True
)

# Calculate percentages
df_grouped = (
    df.groupby(["changes_quality", "final_state"], observed=False)
    .size()
    .reset_index(name="count")
)
df_total = df_grouped.groupby("changes_quality", observed=False)["count"].transform(
    "sum"
)
df_grouped["percentage"] = (df_grouped["count"] / df_total) * 100

desired_order = [
    "merged",
    # "pending-merge",
    "closed",
]
# Reorder final_state for consistent plotting
df_grouped["final_state"] = pd.Categorical(
    df_grouped["final_state"], categories=desired_order, ordered=True
)

# Pivot the data for stacking
df_pivot = df_grouped.pivot(
    index="changes_quality", columns="final_state", values="percentage"
).fillna(0)

# Define custom colors for the bars
custom_colors = [
    "#8957e5",
    # "#a57eed",
    "#da3633",
]  # Purple for merged, lilac for pending-merge, red for closed

# Plot stacked horizontal bars
ax = df_pivot.loc[quality_order].plot(  # Ensure the order is applied
    kind="barh",
    stacked=True,
    figsize=(10, 6),
    color=custom_colors,
    width=0.85,  # Slightly increase bar width
)
ax.figure.set_size_inches(11, 3)

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


plt.title("Percentage of Changes Quality")
plt.xlabel("Percentage")
plt.ylabel("Changes Quality")
plt.legend(title="Final State", bbox_to_anchor=(1.02, 1), loc="upper left")
plt.tight_layout()

# Save the plot as an image
output_path = "images/09-0-changes_quality.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()
