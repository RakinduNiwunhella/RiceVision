import numpy as np
import pandas as pd
from scipy.spatial import cKDTree


def mask_and_fill_spectral(df: pd.DataFrame, bands) -> pd.DataFrame:
    existing_bands = [col for col in bands if col in df.columns]
    if not existing_bands:
        return df

    df[existing_bands] = df[existing_bands].astype('float32') / 10000.0
    valid_classes = [4, 5, 6, 7]
    df['SCL'] = pd.to_numeric(df.get('SCL', np.nan), errors='coerce').round()
    df['cloud_pct'] = pd.to_numeric(df.get('cloud_pct', 0), errors='coerce').fillna(0)
    df['is_clean'] = (df['cloud_pct'] <= 50) & (df['SCL'].isin(valid_classes))
    df.loc[~df['is_clean'], existing_bands] = np.nan

    def spatial_fill(group: pd.DataFrame) -> pd.DataFrame:
        clean = group['is_clean']
        if clean.any() and (~clean).any():
            coords_clean = group.loc[clean, ['lat', 'lon']].values
            vals_clean = group.loc[clean, existing_bands].values
            coords_dirty = group.loc[~clean, ['lat', 'lon']].values
            tree = cKDTree(coords_clean)
            _, idx = tree.query(coords_dirty, k=1)
            group.loc[~clean, existing_bands] = vals_clean[idx]
        return group

    df = df.groupby('timestep', group_keys=False).apply(spatial_fill)

    def temporal_fill(group: pd.DataFrame) -> pd.DataFrame:
        group = group.sort_values('timestep')
        subset = group[existing_bands].copy()
        if subset.isna().any().any():
            group[existing_bands] = subset.interpolate(method='linear', limit_direction='both')
        return group

    df = df.groupby('pixel_id', group_keys=False).apply(temporal_fill)

    remaining_nans = df[existing_bands].isna().sum().sum()
    if remaining_nans > 0:
        means = df.loc[df['is_clean'], existing_bands].mean().fillna(0)
        df[existing_bands] = df[existing_bands].fillna(means)

    if 'SCL' in df.columns:
        df['SCL'] = pd.to_numeric(df['SCL'], errors='coerce').fillna(4).round().clip(4, 7).astype(int)

    return df
