import numpy as np
import pandas as pd


def add_ndvi_zscore(df: pd.DataFrame, baseline_df: pd.DataFrame | None) -> pd.DataFrame:
    if baseline_df is None:
        df['ndvi_zscore'] = 0.0
        return df

    df = df.merge(
        baseline_df[['district', 'stage_name', 'ndvi_mean', 'ndvi_std']],
        on=['district', 'stage_name'],
        how='left',
    )
    denom = df['ndvi_std'].replace(0, np.nan)
    df['ndvi_zscore'] = ((df['NDVI_median_smooth'] - df['ndvi_mean']) / denom).fillna(0).clip(-3, 3)
    return df
