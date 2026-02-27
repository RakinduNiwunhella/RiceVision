import pandas as pd
from scipy.signal import savgol_filter


def smooth_features(df: pd.DataFrame, window_length: int = 5, poly_order: int = 2) -> pd.DataFrame:
    target_cols = [col for col in df.columns if col.endswith('_median')]
    df = df.sort_values(by=['pixel_id', 'ten_day_start'])

    def smooth_pixel(group: pd.DataFrame) -> pd.DataFrame:
        if len(group) >= window_length:
            for col in target_cols:
                group[f"{col}_smooth"] = savgol_filter(group[col], window_length, poly_order)
        else:
            for col in target_cols:
                group[f"{col}_smooth"] = group[col]
        return group

    return df.groupby('pixel_id', group_keys=False).apply(smooth_pixel)
