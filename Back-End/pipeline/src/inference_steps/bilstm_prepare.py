from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd


HAZARD_COLS: List[str] = [
    'hazard_drought',
    'hazard_flood',
    'hazard_heavy_rain',
    'hazard_landslide',
    'hazard_lightning',
    'hazard_wind',
]

TS_FEATURES_CORE: List[str] = [
    'ndvi_median_smooth', 'lswi_median_smooth', 'evi_median_smooth',
    'ndwi_median_smooth', 'bsi_median_smooth', 'ndvi_vel_z', 'lswi_vel_z',
    'bsi_z', 'ndvi_zscore', 'rain_7d_mean', 'rain_14d_mean', 'tmean_mean',
    'rh_mean_mean', 'delta_days', 'doy_sin', 'doy_cos', 'is_growing',
]

TS_FEATURES: List[str] = TS_FEATURES_CORE + HAZARD_COLS + ['flood_index', 'ndvi_delta']
STATIC_FEATURES: List[str] = ['lat', 'lon', 'elevation', 'slope', 'season_id', 'doy_sin', 'doy_cos']


@dataclass(frozen=True)
class LSTMFeatureGroups:
    custom_scaled: List[str]
    raw_temporal: List[str]
    raw_static: List[str]
    passthrough: List[str]


def get_lstm_feature_groups() -> LSTMFeatureGroups:
    return LSTMFeatureGroups(
        custom_scaled=['ndvi_vel_z', 'lswi_vel_z', 'bsi_z', 'ndvi_zscore', 'cpi'],
        raw_temporal=[
            'ndvi_median_smooth', 'lswi_median_smooth', 'evi_median_smooth',
            'ndwi_median_smooth', 'bsi_median_smooth',
            'rain_7d_mean', 'rain_14d_mean', 'tmean_mean', 'rh_mean_mean', 'delta_days',
        ],
        raw_static=['elevation', 'slope', 'lat', 'lon'],
        passthrough=['doy_sin', 'doy_cos'],
    )


def extract_lstm_frame(df: pd.DataFrame) -> pd.DataFrame:
    required_cols = [
        'pixel_id', 'date', 'year', 'stage_name', 'month', 'season', 'season_id', 'cycle_id',
        'ndvi_median_smooth', 'lswi_median_smooth', 'evi_median_smooth',
        'ndwi_median_smooth', 'bsi_median_smooth', 'ndvi_vel_z', 'lswi_vel_z',
        'rain_7d_mean', 'rain_14d_mean', 'tmean_mean', 'bsi_z', 'rh_mean_mean',
        'delta_days', 'doy_sin', 'doy_cos',
        'lat', 'lon', 'elevation', 'slope', 'district_id',
        'stage', 'ndvi_zscore', 'cpi',
    ] + HAZARD_COLS

    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns for BiLSTM preprocessing: {missing}")

    df_lstm = df[required_cols].copy()

    float_cols = df_lstm.select_dtypes(include=['float64']).columns
    if len(float_cols) > 0:
        df_lstm[float_cols] = df_lstm[float_cols].astype('float32')

    int_cols = ['stage', 'pixel_id', 'district_id'] + HAZARD_COLS
    for col in int_cols:
        df_lstm[col] = pd.to_numeric(df_lstm[col], errors='coerce').fillna(0).astype('int32')

    df_lstm['stage'] = df_lstm['stage'].astype('int32')
    df_lstm['ndvi_zscore'] = pd.to_numeric(df_lstm['ndvi_zscore'], errors='coerce').fillna(0).astype('float32')
    df_lstm['cpi'] = pd.to_numeric(df_lstm['cpi'], errors='coerce').fillna(0).astype('float32')

    return df_lstm


def scale_lstm_features(df_lstm: pd.DataFrame, scaler_path: str) -> pd.DataFrame:
    groups = get_lstm_feature_groups()
    features_to_scale = [col for col in (groups.raw_temporal + groups.raw_static) if col in df_lstm.columns]

    scaler = joblib.load(scaler_path)
    df_scaled = df_lstm.copy()
    if features_to_scale:
        df_scaled[features_to_scale] = scaler.transform(df_scaled[features_to_scale])
    return df_scaled


def prepare_inference_physics(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out['flood_index'] = out['lswi_median_smooth'] - out['ndvi_median_smooth']
    out['ndvi_delta'] = out.groupby('pixel_id')['ndvi_median_smooth'].diff().fillna(0)
    out['is_growing'] = out['stage'].isin([1, 2, 3]).astype('float32')
    out['ndvi_zscore'] = out['ndvi_zscore'].clip(-4.0, 4.0)
    if 'cpi' in out.columns:
        out['cpi'] = out['cpi'].clip(-4.0, 4.0)
    return out


def create_inference_sequences(df: pd.DataFrame, window_size: int = 10) -> Tuple[Dict[str, np.ndarray], pd.DataFrame]:
    required = TS_FEATURES + STATIC_FEATURES + ['pixel_id', 'date', 'district_id', 'is_growing']
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required sequence columns: {missing}")

    ordered = df.sort_values(['pixel_id', 'date']).reset_index(drop=True).copy()
    ordered['group_id'] = ordered.groupby('pixel_id').ngroup()

    ts_data = ordered[TS_FEATURES].values.astype('float32')
    static_data = ordered[STATIC_FEATURES].values.astype('float32')
    district_data = ordered['district_id'].values.astype('int32')
    group_ids = ordered['group_id'].values

    total_rows = len(ordered)
    if total_rows < window_size:
        empty_x = {
            'temporal_input': np.empty((0, window_size, len(TS_FEATURES)), dtype='float32'),
            'static_input': np.empty((0, len(STATIC_FEATURES)), dtype='float32'),
            'district_input': np.empty((0,), dtype='int32'),
        }
        empty_meta = ordered.iloc[0:0][['pixel_id', 'date']].copy()
        return empty_x, empty_meta

    starts = np.arange(total_rows - window_size + 1)
    ends = starts + window_size - 1
    valid_mask = group_ids[starts] == group_ids[ends]
    valid_starts = starts[valid_mask]

    if len(valid_starts) == 0:
        empty_x = {
            'temporal_input': np.empty((0, window_size, len(TS_FEATURES)), dtype='float32'),
            'static_input': np.empty((0, len(STATIC_FEATURES)), dtype='float32'),
            'district_input': np.empty((0,), dtype='int32'),
        }
        empty_meta = ordered.iloc[0:0][['pixel_id', 'date']].copy()
        return empty_x, empty_meta

    indices_2d = valid_starts[:, None] + np.arange(window_size)[None, :]
    valid_ends = valid_starts + window_size - 1

    x_inf = {
        'temporal_input': ts_data[indices_2d],
        'static_input': static_data[valid_ends],
        'district_input': district_data[valid_ends],
    }

    meta_cols = ['pixel_id', 'date', 'district_id', 'is_growing']
    optional_cols = [col for col in ['district', 'lat', 'lon'] if col in ordered.columns]
    meta = ordered.iloc[valid_ends][meta_cols + optional_cols].copy()
    return x_inf, meta