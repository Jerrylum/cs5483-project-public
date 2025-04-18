py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1

python -m pip install --upgrade pip

pip install numpy
pip install pandas
pip install scikit-learn
pip install xgboost
pip install pyarrow

pip install -e ../../util
