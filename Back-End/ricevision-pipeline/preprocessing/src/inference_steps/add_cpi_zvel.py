import numpy as np
import pandas as pd


def add_cpi_zvel(df: pd.DataFrame) -> pd.DataFrame:
    if df['pixel_id'].nunique() > 10:
        def safe_robust_z(series: pd.Series):
            if len(series) < 5:
                return np.zeros(len(series))
            q1, q3 = series.quantile(0.25), series.quantile(0.75)
            iqr = q3 - q1
            denom = max(iqr, 0.05)
            return (series - series.median()) / denom

        groups = df.groupby(['ten_day_start', 'stage_name'])
        df['ndvi_vel_z'] = groups['ndvi_vel'].transform(safe_robust_z)
        df['bsi_z'] = groups['BSI_median_smooth'].transform(safe_robust_z)
        df['lswi_vel_z'] = groups['lswi_vel'].transform(safe_robust_z)
        df['cpi'] = (df['ndvi_vel_z'] * -1.0) + (df['bsi_z'] * 0.8) + (df['lswi_vel_z'] * -0.6)
    else:
        df['ndvi_vel_z'] = 0.0
        df['bsi_z'] = 0.0
        df['lswi_vel_z'] = 0.0
        df['cpi'] = 0.0
    return df
