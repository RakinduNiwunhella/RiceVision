import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def aggregate_10day(df: pd.DataFrame) -> pd.DataFrame:
    logger.info('Starting 10-day aggregation (preserving hazards as int64)...')

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['ten_day'] = df['date'].dt.to_period('10D')

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
    ]

    static_meta = ['lat', 'lon', 'elevation', 'slope', 'pixel_id', 'district']
    meta_mean = ['cloud_pct']
    meta_first = ['SCL', 'date', 'year', 'month', 'month_day', 'timestep']

    agg_dict = {}
    for col in spectral_indices + raw_bands:
        if col in df.columns:
            agg_dict[col] = 'median'
    for col in env_cols + meta_mean:
        if col in df.columns:
            agg_dict[col] = 'mean'
    for col in hazard_cols:
        if col in df.columns:
            agg_dict[col] = 'max'
    for col in static_meta + meta_first:
        if col in df.columns:
            agg_dict[col] = 'first'

    df_agg = df.groupby(['pixel_id', 'ten_day'], as_index=False).agg(agg_dict)
    df_agg['ten_day_start'] = df_agg['ten_day'].dt.start_time
    df_agg = df_agg.sort_values(['pixel_id', 'ten_day_start'])
    df_agg['delta_days'] = df_agg.groupby('pixel_id')['ten_day_start'].diff().dt.days.fillna(10)
    df_agg['doy'] = df_agg['ten_day_start'].dt.dayofyear
    df_agg['doy_sin'] = np.sin(2 * np.pi * df_agg['doy'] / 365.25)
    df_agg['doy_cos'] = np.cos(2 * np.pi * df_agg['doy'] / 365.25)

    rename_map = {col: f"{col}_median" for col in spectral_indices if col in df_agg.columns}
    rename_map.update({col: f"{col}_mean" for col in env_cols if col in df_agg.columns})
    df_agg = df_agg.rename(columns=rename_map)
    df_agg = df_agg.drop(columns=['ten_day'])

    for col in hazard_cols:
        if col in df_agg.columns:
            df_agg[col] = df_agg[col].fillna(0).astype('int64')

    logger.info('Aggregation complete. Hazards preserved as int64.')
    return df_agg

