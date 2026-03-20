import logging

import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

logger = logging.getLogger(__name__)


def filling_nans(df: pd.DataFrame) -> pd.DataFrame:
    """
    Production-ready imputation for 2026 Sri Lanka Forecast.
    Handles 'date' column visibility issues across different Pandas versions.
    """
    print("--- 🚀 Starting Spectral-Only Imputation Process (Safe Version) ---")
    
    # 0. SAFETY CHECK: Ensure DataFrame is flat and date is a column
    df = df.reset_index(drop=True)
    if 'date' not in df.columns:
        raise KeyError("CRITICAL: 'date' column is missing before imputation!")

    # 1. INITIAL CLEANUP: SCL Formatting
    if 'SCL' in df.columns:
        print("  > Formatting SCL category values for masking...")
        df['SCL'] = pd.to_numeric(df['SCL'], errors='coerce').round()
    
    # 2. DEFINE TARGET BANDS VS WEATHER
    spectral_bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    target_cols = [c for c in spectral_bands if c in df.columns]
    
    weather_keywords = ['rain', 'tmean', 'tmax', 'tmin', 'rh_mean', 't_day', 't_night']
    all_numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    weather_found = [c for c in all_numeric if any(k in c.lower() for k in weather_keywords)]
    
    print(f"  > Target bands to be imputed: {target_cols}")
    print(f"  > Weather columns to be preserved: {weather_found}")

    # 3. MASKING: Identify clean pixels
    valid_classes = [4, 5, 6, 7] # Vegetation, Soil, Water, Unclassified
    df["is_clean"] = (df["cloud_pct"] <= 50) & (df["SCL"].isin(valid_classes))
    
    clean_count = df["is_clean"].sum()
    print(f"  > Cloud-free data found: {clean_count} rows ({clean_count/len(df)*100:.2f}%)")

    df_filled = df.copy()
    
    print(f"  > Masking {len(target_cols)} spectral bands in cloudy rows...")
    df_filled.loc[~df_filled["is_clean"], target_cols] = np.nan
    nan_before_spatial = df_filled[target_cols].isna().sum().sum()
    
    # --- STEP 1: SPATIAL INTERPOLATION (LOOP METHOD - 100% COLUMN SAFE) ---
    print(f"\n[Step 1/3] Spatial Interpolation (Nearest Neighbor)...")
    
    unique_dates = df_filled['date'].unique()
    for d in unique_dates:
        # Create masks for this specific date
        is_current_date = (df_filled['date'] == d)
        clean_mask = is_current_date & df_filled['is_clean']
        dirty_mask = is_current_date & ~df_filled['is_clean']
        
        # Only interpolate if we have both clean and dirty pixels on this day
        if clean_mask.any() and dirty_mask.any():
            coords_c = df_filled.loc[clean_mask, ['lat', 'lon']].values
            vals_c = df_filled.loc[clean_mask, target_cols].values
            coords_d = df_filled.loc[dirty_mask, ['lat', 'lon']].values
            
            tree = cKDTree(coords_c)
            _, idx = tree.query(coords_d, k=1)
            
            # Write directly to the dataframe without altering its structure
            df_filled.loc[dirty_mask, target_cols] = vals_c[idx]
            
    nan_after_spatial = df_filled[target_cols].isna().sum().sum()
    print(f"  > Spatial fill fixed {nan_before_spatial - nan_after_spatial} band values.")

    # --- STEP 2: TEMPORAL INTERPOLATION (TRANSFORM METHOD - 100% COLUMN SAFE) ---
    print("[Step 2/3] Temporal Interpolation (Linear) for remaining gaps...")
    
    # Sort strictly by pixel and date
    df_filled = df_filled.sort_values(['pixel_id', 'date'])
    
    # Apply interpolation to spectral columns ONLY, preserving all other columns perfectly
    def linear_interpolate(series):
        return series.interpolate(method='linear', limit_direction='both')
        
    for col in target_cols:
        df_filled[col] = df_filled.groupby('pixel_id', group_keys=False)[col].transform(linear_interpolate)

    final_nan_count = df_filled[target_cols].isna().sum().sum()
    print(f"  > Temporal fill complete. Remaining NaNs in bands: {final_nan_count}")

    # --- STEP 3: FALLBACK & FINAL ROUNDING ---
    print("\n[Step 3/3] Finalizing Data & SCL Cleanup...")
    
    # Fallback using mean (exact match to your original code)
    if final_nan_count > 0:
        print(f"  > Applying global mean fallback for {final_nan_count} persistent band gaps.")
        column_means = df.loc[df["is_clean"], target_cols].mean().fillna(0)
        df_filled[target_cols] = df_filled[target_cols].fillna(column_means)

    if 'SCL' in df_filled.columns:
        df_filled['SCL'] = df_filled['SCL'].round().clip(4, 7).astype(int)

    # Verification
    weather_nans = df_filled[weather_found].isna().sum().sum()
    print(f"  > Verification: Weather columns have {weather_nans} NaNs (should be 0 or unchanged).")
    
    if 'date' not in df_filled.columns:
        raise KeyError("FATAL: The date column was lost! (This should never happen with this code)")

    print("--- ✅ Process Complete: Spectral bands filled, Weather preserved ---")
    return df_filled