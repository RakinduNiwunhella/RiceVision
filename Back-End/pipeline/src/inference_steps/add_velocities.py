import pandas as pd


def add_velocities(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(['pixel_id', 'ten_day_start'])
    df['ndvi_vel'] = df.groupby('pixel_id')['NDVI_median_smooth'].diff().fillna(0)
    df['lswi_vel'] = df.groupby('pixel_id')['LSWI_median_smooth'].diff().fillna(0)
    df['bsi_vel'] = df.groupby('pixel_id')['BSI_median_smooth'].diff().fillna(0)
    return df
