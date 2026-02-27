import numpy as np
import pandas as pd


def add_season(df: pd.DataFrame) -> pd.DataFrame:
    df['month'] = pd.to_datetime(df['ten_day_start']).dt.month
    df['season'] = np.where(df['month'].isin([4, 5, 6, 7, 8]), 'Yala', 'Maha')
    return df
