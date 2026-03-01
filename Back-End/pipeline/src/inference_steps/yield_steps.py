from __future__ import annotations

from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import tensorflow as tf


BASE_TS: List[str] = [
    'ndvi_median_smooth', 'lswi_median_smooth', 'evi_median_smooth', 'ndwi_median_smooth',
    'bsi_median_smooth', 'ndvi_vel_z', 'lswi_vel_z', 'bsi_z', 'ndvi_zscore',
    'rain_7d_mean', 'rain_14d_mean', 'tmean_mean', 'rh_mean_mean', 'delta_days',
    'doy_sin', 'doy_cos', 'is_growing',
]

HAZARD_COLS: List[str] = [
    'hazard_drought', 'hazard_flood', 'hazard_heavy_rain',
    'hazard_landslide', 'hazard_lightning', 'hazard_wind',
]

TS_FEATURES: List[str] = BASE_TS + HAZARD_COLS + ['flood_index', 'ndvi_delta']
STATIC_FEATURES: List[str] = ['lat', 'lon', 'elevation', 'slope', 'season_id', 'doy_sin', 'doy_cos']


def standardize_live(df: pd.DataFrame, feature_names: List[str]) -> pd.DataFrame:
    scaled = df.copy()
    for col in feature_names:
        if col in scaled.columns:
            col_mean = scaled[col].mean()
            col_std = scaled[col].std() + 1e-6
            scaled[col] = (scaled[col] - col_mean) / col_std
    return scaled


def create_lstm_inputs(df: pd.DataFrame, window_size: int = 10) -> Tuple[Dict[str, np.ndarray], np.ndarray]:
    ordered = df.sort_values(['pixel_id', 'date']).reset_index(drop=True).copy()
    ordered['group_id'] = ordered.groupby(['pixel_id', 'cycle_id']).ngroup()

    ts_data = ordered[TS_FEATURES].values.astype('float32')
    st_data = ordered[STATIC_FEATURES].values.astype('float32')
    di_data = ordered['district_id'].values.astype('int32')
    group_ids = ordered['group_id'].values

    starts = np.arange(len(ordered) - window_size + 1)
    ends = starts + window_size - 1
    valid_mask = group_ids[starts] == group_ids[ends]
    valid_starts = starts[valid_mask]
    valid_ends = ends[valid_mask]
    indices = valid_starts[:, None] + np.arange(window_size)[None, :]

    inputs = {
        'temporal_input': ts_data[indices],
        'static_input': st_data[valid_ends],
        'district_input': di_data[valid_ends],
    }
    return inputs, valid_ends


def extract_latents(feature_extractor: tf.keras.Model, x_input: Dict[str, np.ndarray], batch_size: int = 1024) -> np.ndarray:
    return feature_extractor.predict(x_input, batch_size=batch_size, verbose=0)


def build_master_z(
    df_scaled: pd.DataFrame,
    valid_indices: np.ndarray,
    latents: np.ndarray,
    pca,
    lstm_results: pd.DataFrame,
) -> pd.DataFrame:
    pc_features = pca.transform(latents)
    pc_features = np.clip(pc_features, -5, 5)

    master = df_scaled.iloc[valid_indices].copy()
    for idx in range(5):
        master[f'PC{idx + 1}'] = pc_features[:, idx]

    merge_cols = ['pixel_id', 'date', 'pred_stage_id', 'pred_health_z']
    available_merge = [col for col in merge_cols if col in lstm_results.columns]
    if set(['pixel_id', 'date']).issubset(set(available_merge)):
        master = master.merge(lstm_results[available_merge], on=['pixel_id', 'date'], how='left')
    return master


def summarize_z_blended(group: pd.DataFrame, padding_lookup_z: Dict[int, Dict[str, float]]) -> pd.Series:
    district_id = int(group['district_id'].iloc[0])
    ref = padding_lookup_z.get(district_id, next(iter(padding_lookup_z.values())))

    real_weight = len(group) / 12.0
    hist_weight = 1.0 - real_weight

    avg_health = (group['ndvi_median_smooth'].mean() * real_weight) + (ref['avg_health'] * hist_weight)
    temp_f = (group['tmean_mean'].mean() * real_weight) + (ref['temp_flowering'] * hist_weight)
    rain_f = (group['rain_7d_mean'].mean() * real_weight) + (ref['rain_flowering'] * hist_weight)

    has_repro = (group.get('pred_stage_id', pd.Series(dtype='float64')) == 2).any()
    stress_flowering = (group['pred_health_z'] < -1.0).mean() if has_repro else ref['stress_flowering']

    season_value = group['season'].iloc[0] if 'season' in group.columns else 'Maha'

    return pd.Series({
        'veg_days': ref['veg_days'],
        'repro_days': ref['repro_days'],
        'peak_health': max(group['ndvi_median_smooth'].max(), ref['peak_health']),
        'avg_health': avg_health,
        'auc_health': avg_health * 12,
        'temp_flowering': temp_f,
        'rain_flowering': rain_f,
        'stress_flowering': stress_flowering,
        'PC1': group['PC1'].iloc[-1],
        'PC2': group['PC2'].iloc[-1],
        'PC3': group['PC3'].iloc[-1],
        'PC4': group['PC4'].iloc[-1],
        'PC5': group['PC5'].iloc[-1],
        'Season_ID': 1 if str(season_value).lower() == 'yala' else 0,
        'District_ID': district_id,
        'district_historical_avg': ref['Average_yield_kg_per_ha'],
    })


def build_district_summary(df_master_z: pd.DataFrame, yield_baselines: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    padding_lookup_z = yield_baselines.groupby('District_ID').mean(numeric_only=True).to_dict('index')
    pixel_stats = df_master_z.groupby('pixel_id').apply(summarize_z_blended, padding_lookup_z=padding_lookup_z).reset_index()
    district_summary = pixel_stats.groupby(['District_ID', 'Season_ID']).mean(numeric_only=True).reset_index()
    return pixel_stats, district_summary


def engineer_yield_features(district_summary: pd.DataFrame, yield_baselines: pd.DataFrame) -> pd.DataFrame:
    out = district_summary.copy()
    district_lookup = yield_baselines.groupby('District_ID')['Average_yield_kg_per_ha'].mean().to_dict()
    global_avg = yield_baselines['Average_yield_kg_per_ha'].mean()

    out['District_ID'] = out['District_ID'].astype(int)
    out['district_historical_avg'] = out['District_ID'].map(district_lookup).fillna(global_avg)

    out['heat_stress_combo'] = out['temp_flowering'] * out['stress_flowering']
    out['health_per_day'] = out['auc_health'] / (out['veg_days'] + out['repro_days'] + 1)
    out['heat_rain_ratio'] = out['temp_flowering'] / (out['rain_flowering'] + 2)
    out['repro_efficiency'] = out['avg_health'] * out['repro_days']
    out['crisis_year'] = 0
    return out


def predict_yield(district_summary: pd.DataFrame, yield_scaler, lasso_model) -> Tuple[pd.DataFrame, np.ndarray]:
    out = district_summary.copy()
    lasso_features = lasso_model.feature_names_in_.tolist()

    x_final_raw = out[lasso_features].fillna(0)
    x_final_scaled = yield_scaler.transform(x_final_raw)
    x_final_scaled = np.clip(x_final_scaled, -2.0, 2.0)

    raw_preds = lasso_model.predict(x_final_scaled)
    health_boost = out['avg_health'] * 200
    calibrated_yield = (0.4 * raw_preds) + (0.6 * out['district_historical_avg']) + health_boost

    out['predicted_yield_kg_ha'] = np.clip(calibrated_yield, 1500, 6500)
    return out, x_final_scaled


def build_final_report(district_summary: pd.DataFrame, lstm_results: pd.DataFrame) -> pd.DataFrame:
    mapping = lstm_results[['district_id', 'district']].drop_duplicates() if {'district_id', 'district'}.issubset(lstm_results.columns) else pd.DataFrame(columns=['district_id', 'district'])

    report_df = district_summary.copy()
    if not mapping.empty:
        report_df = report_df.merge(mapping, left_on='District_ID', right_on='district_id', how='left')

    report_df['yield_gap_kg_ha'] = report_df['predicted_yield_kg_ha'] - report_df['district_historical_avg']
    report_df['pct_change'] = (report_df['yield_gap_kg_ha'] / report_df['district_historical_avg']) * 100

    report_columns = {
        'district': 'District Name',
        'predicted_yield_kg_ha': 'Predicted Yield (kg/ha)',
        'district_historical_avg': 'Historical Avg (kg/ha)',
        'yield_gap_kg_ha': 'Yield Gap (kg/ha)',
        'pct_change': '% Change',
        'avg_health': 'Health Index (Z)',
        'heat_rain_ratio': 'Climate Stress Index',
    }

    final_report = report_df[list(report_columns.keys())].rename(columns=report_columns)
    final_report = final_report.round(2)
    final_report = final_report.sort_values(by='Predicted Yield (kg/ha)', ascending=True)
    return final_report