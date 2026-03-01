import numpy as np
import pandas as pd


def add_season(df: pd.DataFrame) -> pd.DataFrame:
    ts = pd.to_datetime(df['ten_day_start'])
    df['month'] = ts.dt.month
    if 'year' not in df.columns:
        df['year'] = ts.dt.year
    df['season'] = np.where(df['month'].isin([4, 5, 6, 7, 8]), 'Yala', 'Maha')
    df['season_id'] = np.where(df['season'].eq('Yala'), 1, 0).astype('int32')

    cycle_keys = df[['pixel_id', 'year', 'season']].astype(str).agg('|'.join, axis=1)
    df['cycle_id'] = pd.factorize(cycle_keys)[0].astype('int32')
    return df
