import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from util.read_data import read_default_data
from util.data_processing.preprocesing import preprocessing_basic

df = read_default_data()
df = preprocessing_basic(df)

# Filter out rows where comments > 10
df = df[df["review_comments"] <= 10]

# Define bin edges for consistent bin width
min_comments = df["review_comments"].min()
max_comments = df["review_comments"].max()
binwidth = 1  # Define the bin width
# bins = np.arange(min_comments, max_comments + binwidth, binwidth)

# Use histplot instead of kdeplot to avoid smoothing
sns.histplot(
    df[df["final_state"] == "merged"]["review_comments"],
    label="Merged",
    kde=False,
    binwidth=binwidth,
    color="#8957e5",
)
ax = sns.histplot(
    df[df["final_state"] == "closed"]["review_comments"],
    label="Closed",
    kde=False,
    binwidth=binwidth,
    color="#da3633",
)
ax.figure.set_size_inches(10, 6)
plt.title("Review Comments Distribution (<= 10)")
plt.legend()
plt.show()
