import numpy as np
import pandas as pd
from scipy.spatial import KDTree


def handle_missing_values(df: pd.DataFrame, bands, weather_cols, terrain_cols) -> pd.DataFrame:
    for col in bands:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').astype('float32')

    if 'SCL' in df.columns:
        df['SCL'] = pd.to_numeric(df['SCL'], errors='coerce')

    df = df.sort_values(by=['pixel_id', 'timestep'], ascending=[True, False]).copy()

    existing_weather = [col for col in weather_cols if col in df.columns]
    if existing_weather:
        for ts in df['timestep'].dropna().unique():
            ts_mask = df['timestep'] == ts
            for col in existing_weather:
                if not df.loc[ts_mask, col].isnull().any():
                    continue
                valid = df[ts_mask & df[col].notnull()]
                missing = df[ts_mask & df[col].isnull()]
                if valid.empty or missing.empty:
                    continue
                tree = KDTree(valid[['lat', 'lon']].values)
                _, idx = tree.query(missing[['lat', 'lon']].values)
                df.loc[missing.index, col] = valid.iloc[idx][col].values

    existing_terrain = [col for col in terrain_cols if col in df.columns]
    if existing_terrain:
        df[existing_terrain] = df.groupby('pixel_id')[existing_terrain].ffill().bfill()

    if 'SCL' in df.columns:
        def get_mode(series):
            modes = series.mode(dropna=True)
            return modes.iloc[0] if not modes.empty else np.nan
        df['SCL'] = df.groupby('pixel_id')['SCL'].transform(lambda x: x.fillna(get_mode(x)))

    if 'cloud_pct' in df.columns:
        df['cloud_pct'] = df.groupby('pixel_id')['cloud_pct'].transform(lambda x: x.fillna(x.mean()))

    existing_bands = [col for col in bands if col in df.columns]
    if existing_bands:
        df[existing_bands] = df.groupby('pixel_id', group_keys=False)[existing_bands].apply(
            lambda g: g.interpolate(method='linear', limit_direction='both')
        )

    if existing_weather:
        df[existing_weather] = df.groupby('pixel_id')[existing_weather].ffill()

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')

        def fix_dates(group):
            if group['date'].isnull().any() and group['date'].notnull().any():
                anchor = group[group['date'].notnull()].iloc[0]
                group['date'] = group.apply(
                    lambda row: anchor['date'] + pd.Timedelta(days=(anchor['timestep'] - row['timestep']) * 15)
                    if pd.isna(row['date']) else row['date'],
                    axis=1,
                )
            return group

        df = df.groupby('pixel_id', group_keys=False).apply(fix_dates)

    if df.isnull().sum().sum() > 0:
        df = df.fillna(df.median(numeric_only=True)).fillna(0)

    return df
