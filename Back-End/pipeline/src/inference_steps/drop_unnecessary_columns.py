import pandas as pd


def drop_unnecessary_columns(df: pd.DataFrame) -> pd.DataFrame:
    drop_cols = ['.geo', 'rand', 'constant', 'system:index']
    existing = [col for col in drop_cols if col in df.columns]
    return df.drop(columns=existing) if existing else df
