"""
This script is used to configure the data folder.
"""

import pathlib

# Path to the data folder
current_directory = pathlib.Path(__file__).parent.resolve()
data_folder = current_directory.parent.parent / "data"
