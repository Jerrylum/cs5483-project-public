#!/bin/bash

# sudo add-apt-repository ppa:deadsnakes/ppa
# sudo apt update
# sudo apt install -y python3.11
# sudo apt install -y python3.11-venv

python3.11 -m venv venv
source venv/bin/activate

python -m pip install --upgrade pip

pip install pandas
pip install scikit-learn
pip install xgboost
pip install pyarrow
pip install optuna
pip install optuna-dashboard
pip install catboost
pip install lightgbm
pip install -e ../../util

# https://catboost.ai/docs/en/concepts/python-installation
# pip install graphviz
# pip install matplotlib
# pip install numpy
# pip install pandas
# pip install plotly
# pip install scipy
# pip install six

# pip install bayesian-optimization
# pip install hyperopt
# pip install optuna-dashboard
# pip install optuna-integration[xgboost]

