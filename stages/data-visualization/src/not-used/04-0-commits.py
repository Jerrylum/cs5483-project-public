import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

# Filter out rows where comments > 10
df = df[df["commits"] > 0]
df = df[df["commits"] <= 10]

# Define bin edges for consistent bin width
min_comments = df["commits"].min()
max_comments = df["commits"].max()
bin_width = 1  # Define the bin width
bins = np.arange(min_comments, max_comments + bin_width, bin_width)

# Use histplot instead of kdeplot to avoid smoothing
sns.histplot(
    df[df["final_state"] == "merged"]["commits"],
    label="Merged",
    kde=False,
    bins=bins,
    color="#8957e5",
)
sns.histplot(
    df[df["final_state"] == "closed"]["commits"],
    label="Closed",
    kde=False,
    bins=bins,
    color="#da3633",
)
plt.title("Commits Distribution (<= 10)")
plt.legend()
plt.show()
