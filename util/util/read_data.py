"""
This script is used to read the data from the data folder.
"""

import pandas as pd

from util.config import data_folder


def read_data(filename: str) -> pd.DataFrame:
    """
    This function is used to read the data from the data folder.
    """

    return pd.read_parquet(data_folder / filename)


def read_default_data() -> pd.DataFrame:
    """
    This function is used to read the default data from the data folder.
    """
    return read_data("30000-with-p5.parquet")
