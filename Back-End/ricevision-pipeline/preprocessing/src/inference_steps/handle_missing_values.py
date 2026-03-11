import logging

import numpy as np
import pandas as pd
from scipy.spatial import KDTree

logger = logging.getLogger(__name__)


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    logger.info('Starting refined production data cleaning pipeline...')

    df = df.replace(['nan', 'NaN', 'None', 'null'], np.nan)

    initial_count = len(df)
    df = df.dropna(subset=['district']).copy()
    df = df.reset_index(drop=True)
    dropped_districts = initial_count - len(df)
    logger.info('Step -1: dropped %d rows with missing districts. New count: %d', dropped_districts, len(df))

    bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    weather_cols = ['rain_1d', 'rain_3d', 'rain_7d', 'rain_14d', 'rain_30d', 'tmean', 'tmin', 'tmax', 't_day', 't_night', 'rh_mean']
    terrain_cols = ['elevation', 'slope']
    hazard_cols = [c for c in df.columns if c.lower().startswith('hazard')]

    if hazard_cols:
        df[hazard_cols] = df[hazard_cols].fillna(0).astype('int8')
        logger.info('Step 0: hazards filled with 0.')

    if 'SCL' in df.columns:
        df['SCL'] = pd.to_numeric(df['SCL'], errors='coerce').round().fillna(0).astype('int8')
        logger.info('Step 0: SCL rounded and cast to Int8.')

    for col in bands:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').astype('float32')

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        logger.info('Step 0: date converted to datetime objects.')

    df = df.sort_values(by=['pixel_id', 'timestep'], ascending=[True, False])

    existing_weather = [c for c in weather_cols if c in df.columns]
    if existing_weather:
        for ts in df['timestep'].dropna().unique():
            ts_mask = (df['timestep'] == ts)
            for col in existing_weather:
                if df.loc[ts_mask, col].isnull().any():
                    valid = df[ts_mask & df[col].notnull()]
                    missing = df[ts_mask & df[col].isnull()]
                    if not valid.empty and not missing.empty:
                        tree = KDTree(valid[['lat', 'lon']].values)
                        _, idx = tree.query(missing[['lat', 'lon']].values)
                        df.loc[missing.index, col] = valid.iloc[idx][col].values

    existing_bands = [c for c in bands if c in df.columns]
    if existing_bands:
        df[existing_bands] = df.groupby('pixel_id', group_keys=False)[existing_bands].apply(
            lambda group: group.interpolate(method='linear', limit_direction='both')
        )

    if existing_weather:
        df[existing_weather] = df.groupby('pixel_id')[existing_weather].ffill().bfill()

    existing_terrain = [c for c in terrain_cols if c in df.columns]
    if existing_terrain:
        df[existing_terrain] = df.groupby('pixel_id')[existing_terrain].ffill().bfill()

    logger.info('Step H: applying global median fallback...')
    final_nulls = df.isnull().sum().sum()
    if final_nulls > 0:
        num_cols = df.select_dtypes(include=[np.number]).columns
        df[num_cols] = df[num_cols].fillna(df[num_cols].median())

        obj_cols = df.select_dtypes(include=['object']).columns
        df[obj_cols] = df[obj_cols].fillna('Unknown')

        df = df.fillna(0)

    logger.info('Cleaning finished. Final NaN count: %d', int(df.isnull().sum().sum()))

    if 'date' in df.columns:
        yearly_counts = df.groupby(df['date'].dt.year).size()
        logger.info('Rows per year:\n%s', yearly_counts.to_string())

    return df
