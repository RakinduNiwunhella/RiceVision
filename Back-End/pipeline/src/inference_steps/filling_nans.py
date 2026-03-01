import numpy as np
import pandas as pd
from scipy.spatial import cKDTree


def filling_nans(df: pd.DataFrame) -> pd.DataFrame:
    print('--- 🚀 Starting Spectral-Only Imputation Process ---')

    if 'SCL' in df.columns:
        print('  > Formatting SCL category values for masking...')
        df['SCL'] = pd.to_numeric(df['SCL'], errors='coerce').round()

    spectral_bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    target_cols = [c for c in spectral_bands if c in df.columns]

    weather_keywords = ['rain', 'tmean', 'tmax', 'tmin', 'rh_mean', 't_day', 't_night']
    all_numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    weather_found = [c for c in all_numeric if any(k in c.lower() for k in weather_keywords)]

    print(f'  > Target bands to be imputed: {target_cols}')
    print(f'  > Weather columns to be preserved (untouched): {weather_found}')

    valid_classes = [4, 5, 6, 7]
    df['is_clean'] = (df['cloud_pct'] <= 50) & (df['SCL'].isin(valid_classes))

    clean_count = df['is_clean'].sum()
    print(f'  > Cloud-free data found: {clean_count} rows ({clean_count / len(df) * 100:.2f}%)')

    df_filled = df.copy()

    print(f'  > Masking {len(target_cols)} spectral bands in cloudy rows...')
    df_filled.loc[~df_filled['is_clean'], target_cols] = np.nan

    print(f'\n[Step 1/3] Spatial Interpolation (Nearest Neighbor) for {len(target_cols)} bands...')

    def spatial_fill(group: pd.DataFrame) -> pd.DataFrame:
        clean = group['is_clean']
        if clean.any() and (~clean).any():
            coords_c = group.loc[clean, ['lat', 'lon']].values
            vals_c = group.loc[clean, target_cols].values
            coords_d = group.loc[~clean, ['lat', 'lon']].values

            tree = cKDTree(coords_c)
            _, idx = tree.query(coords_d, k=1)
            group.loc[~clean, target_cols] = vals_c[idx]
        return group

    nan_before_spatial = df_filled[target_cols].isna().sum().sum()
    df_filled = df_filled.groupby('timestep', group_keys=False).apply(spatial_fill)
    nan_after_spatial = df_filled[target_cols].isna().sum().sum()
    print(f'  > Spatial fill fixed {nan_before_spatial - nan_after_spatial} band values.')

    print('[Step 2/3] Temporal Interpolation (Linear) for remaining gaps...')

    def temporal_fill(group: pd.DataFrame) -> pd.DataFrame:
        group = group.sort_values('timestep')
        subset = group[target_cols].copy()
        if subset.isna().any().any():
            subset = subset.interpolate(method='linear', limit_direction='both')
            group[target_cols] = subset
        return group

    df_filled = df_filled.groupby('pixel_id', group_keys=False).apply(temporal_fill)
    final_nan_count = df_filled[target_cols].isna().sum().sum()
    print(f'  > Temporal fill complete. Remaining NaNs in bands: {final_nan_count}')

    print('\n[Step 3/3] Finalizing Data & SCL Cleanup...')
    if final_nan_count > 0:
        print(f'  > Applying global mean fallback for {final_nan_count} persistent band gaps.')
        column_means = df.loc[df['is_clean'], target_cols].mean().fillna(0)
        df_filled[target_cols] = df_filled[target_cols].fillna(column_means)

    if 'SCL' in df_filled.columns:
        df_filled['SCL'] = df_filled['SCL'].round().clip(4, 7).astype(int)

    weather_nans = df_filled[weather_found].isna().sum().sum() if weather_found else 0
    print(f'  > Verification: Weather columns have {weather_nans} NaNs (should be 0 or unchanged).')

    print('--- ✅ Process Complete: Spectral bands filled, Weather preserved ---')
    return df_filled
