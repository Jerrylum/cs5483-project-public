import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

# Convert user_account_age from days to years
df["user_account_age_years"] = df["user_account_age"] / 365

# Define bin edges explicitly to ensure consistent binning
binwidth = 0.5  # Bin width in years
min_age = df["user_account_age_years"].min()
max_age = df["user_account_age_years"].max()
bins = np.arange(min_age, max_age + binwidth, binwidth)

# Use histplot with the same bins for both distributions
sns.histplot(
    df[df["final_state"] == "merged"]["user_account_age_years"],
    label="Merged",
    kde=False,
    bins=bins,
    color="#8957e5",
)
ax = sns.histplot(
    df[df["final_state"] == "closed"]["user_account_age_years"],
    label="Closed",
    kde=False,
    bins=bins,
    color="#da3633",
)
ax.figure.set_size_inches(11, 4)  # Set figure size
plt.title("User Account Age Distribution")
plt.xlabel("User Account Age (years)")
plt.ylabel("Count")
plt.legend()

# Set x-axis ticks to integers
plt.xticks(np.arange(0, max_age + 1, 1))

# Save the plot as an image
output_path = "images/14-0-user_account_age.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight")

plt.show()
