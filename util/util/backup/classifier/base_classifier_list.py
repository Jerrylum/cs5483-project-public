import warnings
from sklearn.exceptions import ConvergenceWarning

# Suppress ConvergenceWarning
warnings.filterwarnings("ignore", category=ConvergenceWarning)

from xgboost import XGBClassifier, XGBRFClassifier
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from ngboost import NGBClassifier
from ngboost.distns import k_categorical
from sklearn.ensemble import (
    GradientBoostingClassifier,
    RandomForestClassifier,
    BaggingClassifier,
    AdaBoostClassifier,
    HistGradientBoostingClassifier,
    ExtraTreesClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neural_network import MLPClassifier

# Classifier with default parameters
base_classifier_list = [
    {
        "name": "DecisionTreeClassifier",
        "classifier": DecisionTreeClassifier(),
        "constructor": DecisionTreeClassifier,
    },
    {
        "name": "RandomForestClassifier",
        "classifier": RandomForestClassifier(),
        "constructor": RandomForestClassifier,
    },
    {
        "name": "XGBoost",
        "classifier": XGBClassifier(),
        "constructor": XGBClassifier,
    },
    {
        "name": "CatBoostClassifier",
        "classifier": CatBoostClassifier(iterations=50, verbose=False),
        "constructor": CatBoostClassifier,
    },
    {
        "name": "LGBMClassifier",
        "classifier": LGBMClassifier(force_row_wise=True, verbosity=-1),
        "constructor": LGBMClassifier,
    },
    # {
    #     'name': 'NGBClassifier',
    #     'classifier': NGBClassifier(Dist=k_categorical(3)),
    #     'constructor': NGBClassifier,
    # },
    {
        "name": "GradientBoostingClassifier",
        "classifier": GradientBoostingClassifier(),
        "constructor": GradientBoostingClassifier,
    },
    {
        "name": "BaggingClassifier",
        "classifier": BaggingClassifier(),
        "constructor": BaggingClassifier,
    },
    {
        "name": "AdaBoostClassifier",
        "classifier": AdaBoostClassifier(),
        "constructor": AdaBoostClassifier,
    },
    {
        "name": "HistGradientBoostingClassifier",
        "classifier": HistGradientBoostingClassifier(),
        "constructor": HistGradientBoostingClassifier,
    },
    {
        "name": "ExtraTreesClassifier",
        "classifier": ExtraTreesClassifier(),
        "constructor": ExtraTreesClassifier,
    },
    # {
    #     'name': 'LogisticRegression',
    #     'classifier': LogisticRegression(),
    #     'constructor': LogisticRegression
    # },
    {
        "name": "GaussianNB",
        "classifier": GaussianNB(),
        "constructor": GaussianNB,
    },
    {
        "name": "KNeighborsClassifier",
        "classifier": KNeighborsClassifier(),
        "constructor": KNeighborsClassifier,
    },
    # {
    #     'name': 'SVC',
    #     'classifier': SVC(),
    #     'constructor': SVC,
    # },
    {
        "name": "MLPClassifier",
        "classifier": MLPClassifier(),
        "constructor": MLPClassifier,
    },
]
