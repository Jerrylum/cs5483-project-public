import pandas as pd


def preprocessing_remove_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop(columns=["id"])

    df = df.drop(columns=["user_public_repos"])
    df = df.drop(columns=["user_followers"])
    df = df.drop(columns=["user_following"])
    df = df.drop(columns=["user_public_gists"])
    df = df.drop(columns=["user_type"])
    df = df.drop(columns=["user_account_age"])
    df = df.drop(columns=["author_association"])
    df = df.drop(columns=["is_first_pr"])

    # This two too strong, maybe leak ground truth
    df = df.drop(columns=["before_merged_pr_count"])
    df = df.drop(columns=["before_closed_pr_count"])

    df = df.drop(columns=["opening_pr_count"])
    df = df.drop(columns=["before_pr_count"])
    df = df.drop(columns=["opened_pr_count_in_30_days"])
    return df


def preprocessing_basic(df: pd.DataFrame):
    """
    This script is used to preprocess the data.
    """

    # Lower case nature labels
    if "nature" in df:
        df["nature"] = df["nature"].str.lower()

    # Transform some nature value to correct one
    # bugfix
    if "nature" in df:
        df["nature"] = df["nature"].replace(
            [
                "bug",
                "bug-fix",
                "bug_fix",
                "bug fix" "bugfix",
                "Bug Fix",
                "bug fix",
                "bug fixes",
            ],
            "bugfix",
        )
        # feature
        df["nature"] = df["nature"].replace(
            [
                "feature",
                "feat",
                "Feature",
                "new feature",
                "optimization",
                "performance",
                "code_improvement",
                "logging",
                "feature (new)",
                "performance improvement",
                "localization",
                "ux",
                "security",
                "performance_improvement",
            ],
            "feature",
        )
        # document
        df["nature"] = df["nature"].replace(
            ["document", "doc", "docs", "Document", "Doc", "documentation"], "document"
        )
        # refactor
        df["nature"] = df["nature"].replace(
            [
                "refactor",
                "Refactor",
                "Refactor.",
                "cleanup",
                "improvement",
                "enhancement",
                "build",
                "chore",
                "error_handling_improvements",
                "api-breaking-changes",
                "style",
                "ci",
                "perf",
            ],
            "refactor",
        )
        # package
        df["nature"] = df["nature"].replace(
            [
                "package",
                "Package",
                "package.",
                "version update",
                "dependency",
                "dependency update",
                "deprecation",
                "version_update",
                "dependencies",
                "update",
                "code-quality",
                "release",
                "dependency-update",
                "package-version-update",
            ],
            "package",
        )
        # test
        df["nature"] = df["nature"].replace(["test", "Test", "Test.", "test."], "test")

    # Convert all value not in excluded_natures to "other"
    excluded_natures = [
        "bugfix",
        "feature",
        "document",
        "refactor",
        "package",
        "unknown",
        "test",
        "other",
        "revert",
        "example",
    ]
    if "nature" in df:
        df.loc[~df["nature"].isin(excluded_natures), "nature"] = "other"

    if "changes_quality" in df:
        # Lower case nature labels
        df["changes_quality"] = df["changes_quality"].str.lower()

        # Transform some changes_quality value to correct one
        # excellent
        df["changes_quality"] = df["changes_quality"].replace(
            [
                "mixed - excellent",
                "mixed-excellent",
            ],
            "excellent",
        )
        # acceptable
        df["changes_quality"] = df["changes_quality"].replace(
            [
                "good",
            ],
            "acceptable",
        )
        # non-suitable
        df["changes_quality"] = df["changes_quality"].replace(
            [
                "non_suitable",
            ],
            "non-suitable",
        )

        # Convert all value not in excluded_changes_quality to "non-suitable"
        excluded_changes_quality = [
            "excellent",
            "acceptable",
            "poor",
            "non-suitable",
        ]
        df["changes_quality"] = df["changes_quality"].apply(
            lambda x: x if x in excluded_changes_quality else "non-suitable"
        )

    if "alignment" in df:
        # Map alignment to x // 10 if x > 10 else x
        df["alignment"] = df["alignment"].map(lambda x: x // 10 if x > 10 else x)

    if "description_quality_score_confidence" in df:
        # Map description_quality to x // 10 if x > 10 else x
        df["description_quality_score_confidence"] = df[
            "description_quality_score_confidence"
        ].map(lambda x: x // 10 if x > 10 else x)

    if "changes_quality_score_confidence" in df:
        # Map changes_quality_score_confidence to x // 10 if x > 10 else x
        df["changes_quality_score_confidence"] = df[
            "changes_quality_score_confidence"
        ].map(lambda x: x // 10 if x > 10 else x)

    if "description_quality" in df:
        # Filter out not possible value in description_quality
        description_quality_possiable_value = ["acceptable", "poor", "excellent"]
        df = df[df["description_quality"].isin(description_quality_possiable_value)]

    return df


def preprocessing_return_X_y(
    df: pd.DataFrame,
    disable_llm_features: bool = False,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
    """
    This function is used to preprocess the data and return the X and y.
    """
    df = preprocessing_remove_columns(df)
    df = preprocessing_basic(df)

    # Disable LLM features
    if disable_llm_features:
        df = df.drop(columns=["nature"])
        df = df.drop(columns=["changes_quality"])
        df = df.drop(columns=["description_quality"])
        df = df.drop(columns=["changes_necessity"])
        df = df.drop(columns=["changes_necessity_score_confidence"])
        df = df.drop(columns=["changes_necessity_justification"])
        df = df.drop(columns=["changes_quality_score_confidence"])
        df = df.drop(columns=["description_quality_score_confidence"])
        df = df.drop(columns=["alignment"])

    # Shuffle the DataFrame
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Filter out final_state value == "pending-merge"
    df = df[df["final_state"] != "pending-merge"]
    
    # df["final_state"] = df["final_state"].apply(
    #     lambda x: "merged" if x == "pending-merge" else x
    # )
    # df["final_state"] = df["final_state"].apply(
    #     lambda x: "closed" if x == "pending-merge" else x
    # )

    # Encode categorical features
    if "nature" in df:
        df["nature"] = df["nature"].astype("category").cat.codes
    if "changes_quality" in df:
        df["changes_quality"] = df["changes_quality"].astype("category").cat.codes
    if "description_quality" in df:
        df["description_quality"] = (
            df["description_quality"].astype("category").cat.codes
        )
    if "user_type" in df:
        df["user_type"] = df["user_type"].astype("category").cat.codes
    if "author_association" in df:
        df["author_association"] = df["author_association"].astype("category").cat.codes
    if "changes_necessity" in df:
        df["changes_necessity"] = df["changes_necessity"].astype("category").cat.codes

    # Uncomment this line to see the distribution of final_state before encoding
    # print(df["final_state"].value_counts())
    df["final_state"] = df["final_state"].astype("category").cat.codes
    # print(df["final_state"].value_counts())

    # Split the data into X and y
    X = df.drop(columns=["final_state"])
    y = df["final_state"]

    return df, X, y
