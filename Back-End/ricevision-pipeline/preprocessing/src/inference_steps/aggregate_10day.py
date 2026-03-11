import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def aggregate_10day(df: pd.DataFrame) -> pd.DataFrame:
    logger.info('Starting 10-day aggregation (preserving ALL columns & hazards as int64)...')
        
    df['ten_day'] = df['date'].dt.to_period('10D')

    # 2. Define your known column groupings
    spectral_indices = [
        'NDVI', 'EVI', 'EVI2', 'LSWI', 'NDWI', 'GLI', 'GCI', 'CVI',
        'SIPI', 'RENDVI', 'RECI', 'CCCI', 'S2REP', 'BSI', 'NPCRI', 'NDSMI',
    ]
    raw_bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    env_cols = [
        'rain_1d', 'rain_3d', 'rain_7d', 'rain_14d', 'rain_30d',
        'tmean', 'tmax', 'tmin', 't_day', 't_night', 'rh_mean',
    ]
    hazard_cols = [
        'hazard_DROUGHT', 'hazard_FLOOD', 'hazard_HEAVY_RAIN',
        'hazard_LANDSLIDE', 'hazard_LIGHTNING', 'hazard_WIND',
        # Adding your lowercase ones just in case they slipped through
        'hazard_drought', 'hazard_flood', 'hazard_heavy_rain',
        'hazard_landslide', 'hazard_lightning', 'hazard_wind'
    ]

    # Note: 'pixel_id' removed from here because it's our grouping key
    static_meta = ['lat', 'lon', 'elevation', 'slope', 'district']
    meta_mean = ['cloud_pct']
    meta_first = ['SCL', 'date', 'year', 'month', 'month_day', 'timestep', 'is_clean']

    # 3. Build the Aggregation Dictionary
    agg_dict = {}
    for col in spectral_indices + raw_bands:
        if col in df.columns: agg_dict[col] = 'median'
    for col in env_cols + meta_mean:
        if col in df.columns: agg_dict[col] = 'mean'
    for col in hazard_cols:
        if col in df.columns: agg_dict[col] = 'max'
    for col in static_meta + meta_first:
        if col in df.columns: agg_dict[col] = 'first'

    # 4. THE CATCH-ALL: Ensure NOTHING gets dropped
    # If there is ANY column in the dataframe not in agg_dict or groupby keys, keep it.
    groupby_keys = ['pixel_id', 'ten_day']
    for col in df.columns:
        if col not in agg_dict and col not in groupby_keys:
            agg_dict[col] = 'first'
            logger.debug(f"Catch-all triggered for unlisted column: {col}")

    # 5. Perform the Aggregation
    df_agg = df.groupby(groupby_keys, as_index=False).agg(agg_dict)
    
    # 6. Feature Engineering (Dates & Sine/Cosine)
    df_agg['ten_day_start'] = df_agg['ten_day'].dt.start_time
    df_agg = df_agg.sort_values(['pixel_id', 'ten_day_start'])
    
    # Calculate delta days
    df_agg['delta_days'] = df_agg.groupby('pixel_id')['ten_day_start'].diff().dt.days.fillna(10)
    
    # Calculate Day of Year signals
    df_agg['doy'] = df_agg['ten_day_start'].dt.dayofyear
    df_agg['doy_sin'] = np.sin(2 * np.pi * df_agg['doy'] / 365.25)
    df_agg['doy_cos'] = np.cos(2 * np.pi * df_agg['doy'] / 365.25)

    # 7. Rename the aggregated columns
    rename_map = {col: f"{col}_median" for col in spectral_indices if col in df_agg.columns}
    rename_map.update({col: f"{col}_mean" for col in env_cols if col in df_agg.columns})
    df_agg = df_agg.rename(columns=rename_map)
    
    # --- 7. CLEANUP & FINAL TYPE CASTING ---
    df_agg = df_agg.drop(columns=['ten_day'])
    # 8. Clean up Hazards
    for col in hazard_cols:
        if col in df_agg.columns:
            df_agg[col] = df_agg[col].fillna(0).astype('int64')

    logger.info(f'Aggregation complete. Total columns preserved: {len(df_agg.columns)}')
    return df_agg