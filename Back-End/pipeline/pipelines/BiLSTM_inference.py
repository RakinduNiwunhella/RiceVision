from __future__ import annotations

import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from src.inference_steps.bilstm_predict import (
    categorize_inference_results,
    generate_ricevision_report,
    regression_accuracy,
    robust_huber_loss,
    weighted_stage_ce_v2,
)
from src.inference_steps.merge_coordinates import merge_coordinates
from src.inference_steps.visualize_health_pest_map import visualize_health_pest_map
from src.inference_steps.visualize_stage_map import visualize_stage_map
from utils.config import get_bilstm_config, get_models_config, get_paths_config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _log_step(step_no: int, total_steps: int, title: str) -> None:
    logger.info('▶️  [%d/%d] %s', step_no, total_steps, title)


def create_inference_sequences(df: pd.DataFrame, window_size: int = 10):
    base_ts_features = [
        'ndvi_median_smooth', 'lswi_median_smooth', 'evi_median_smooth',
        'ndwi_median_smooth', 'bsi_median_smooth', 'ndvi_vel_z', 'lswi_vel_z',
        'bsi_z', 'ndvi_zscore', 'rain_7d_mean', 'rain_14d_mean', 'tmean_mean',
        'rh_mean_mean', 'delta_days', 'doy_sin', 'doy_cos', 'is_growing',
    ]
    hazard_cols = [
        'hazard_drought', 'hazard_flood', 'hazard_heavy_rain',
        'hazard_landslide', 'hazard_lightning', 'hazard_wind',
    ]
    ts_features = base_ts_features + hazard_cols + ['flood_index', 'ndvi_delta']
    static_features = ['lat', 'lon', 'elevation', 'slope', 'season_id', 'doy_sin', 'doy_cos']

    df = df.sort_values(['pixel_id', 'date']).reset_index(drop=True)
    df['group_id'] = df.groupby('pixel_id').ngroup()

    ts_data = df[ts_features].values.astype('float32')
    static_data = df[static_features].values.astype('float32')
    dist_data = df['district_id'].values.astype('int32')
    group_ids = df['group_id'].values

    total_rows = len(df)
    starts = np.arange(total_rows - window_size + 1)
    ends = starts + window_size - 1

    valid_mask = (group_ids[starts] == group_ids[ends])
    valid_starts = starts[valid_mask]
    indices_2d = valid_starts[:, None] + np.arange(window_size)[None, :]
    valid_ends = valid_starts + window_size - 1

    x = {
        'temporal_input': ts_data[indices_2d],
        'static_input': static_data[valid_ends],
        'district_input': dist_data[valid_ends],
    }

    meta = df.iloc[valid_ends][['pixel_id', 'date', 'district_id', 'is_growing']].copy()
    return x, meta


def run_bilstm_inference_pipeline(
    input_csv: Path,
    model_path: Path,
    district_encoder_path: Path,
    coords_csv: Path,
    artifacts_dir: Path,
    window_size: int = 10,
) -> pd.DataFrame:
    total_steps = 9

    if not input_csv.exists():
        raise FileNotFoundError(f"Preprocessed input not found: {input_csv}")
    if not model_path.exists():
        raise FileNotFoundError(f"BiLSTM model not found: {model_path}")
    if not district_encoder_path.exists():
        raise FileNotFoundError(f"District encoder not found: {district_encoder_path}")

    logger.info('Starting BiLSTM inference pipeline with input %s', input_csv)
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    _log_step(1, total_steps, 'Loading preprocessed inference frame')
    df_prepared = pd.read_csv(input_csv)
    logger.info('Loaded rows=%d, cols=%d', len(df_prepared), len(df_prepared.columns))

    _log_step(2, total_steps, 'Normalizing hazard column aliases')
    hazard_aliases = {
        'hazard_DROUGHT': 'hazard_drought',
        'hazard_FLOOD': 'hazard_flood',
        'hazard_HEAVY_RAIN': 'hazard_heavy_rain',
        'hazard_LANDSLIDE': 'hazard_landslide',
        'hazard_LIGHTNING': 'hazard_lightning',
        'hazard_WIND': 'hazard_wind',
    }
    for upper_col, lower_col in hazard_aliases.items():
        if upper_col in df_prepared.columns and lower_col not in df_prepared.columns:
            df_prepared[lower_col] = pd.to_numeric(df_prepared[upper_col], errors='coerce').fillna(0).astype('int32')

    _log_step(3, total_steps, 'Creating temporal inference sequences')
    x_inf, meta = create_inference_sequences(df_prepared, window_size=window_size)
    logger.info('Prepared %d valid sequences', len(meta))
    if len(meta) == 0:
        empty_out = artifacts_dir / 'lstm_results.csv'
        meta.to_csv(empty_out, index=False)
        logger.warning('No valid sequences found. Saved empty result to %s', empty_out)
        return meta

    _log_step(4, total_steps, 'Loading trained BiLSTM model')
    model = tf.keras.models.load_model(
        model_path,
        custom_objects={
            'weighted_stage_ce_v2': weighted_stage_ce_v2,
            'robust_huber_loss': robust_huber_loss,
            'regression_accuracy': regression_accuracy,
        },
    )

    _log_step(5, total_steps, 'Running model inference')
    logger.info('Running inference on %d sequences...', len(meta))
    preds = model.predict([x_inf['temporal_input'], x_inf['static_input'], x_inf['district_input']], verbose=0)

    _log_step(6, total_steps, 'Formatting model outputs and stage labels')
    results_df = meta.copy()
    results_df['pred_stage_id'] = np.argmax(preds[0], axis=1)
    results_df['pred_health_z'] = preds[1].flatten()
    results_df['pred_pest_cpi'] = preds[2].flatten()
    results_df['final_health_impact'] = results_df['pred_health_z'] * results_df['is_growing']
    results_df['final_pest_impact'] = results_df['pred_pest_cpi'] * results_df['is_growing']

    stage_rev_map = {0: 'Transplant', 1: 'Vegetative', 2: 'Reproductive', 3: 'Ripening', 4: 'Harvest'}
    results_df['pred_stage_name'] = results_df['pred_stage_id'].map(stage_rev_map)

    le = joblib.load(district_encoder_path)
    results_df['district'] = le.inverse_transform(results_df['district_id'])

    if len(results_df) == 0:
        empty_out = artifacts_dir / 'lstm_results.csv'
        results_df.to_csv(empty_out, index=False)
        logger.warning('Inference result is empty after processing. Saved empty result to %s', empty_out)
        return results_df

    _log_step(7, total_steps, 'Categorizing health/pest impact and merging coordinates')
    results_df = categorize_inference_results(results_df)
    results_df = merge_coordinates(results_df, coords_csv=coords_csv)

    _log_step(8, total_steps, 'Generating map visualizations')
    visualize_health_pest_map(results_df, artifacts_dir=artifacts_dir, filename='health_pest_snapshot.png')
    visualize_stage_map(results_df, artifacts_dir=artifacts_dir, filename='growth_stage_snapshot.png')

    _log_step(9, total_steps, 'Generating district/trend/forecast reports and saving outputs')
    district_report, trend_report, forecast_report = generate_ricevision_report(results_df)

    results_df.to_csv(artifacts_dir / 'lstm_results.csv', index=False)
    district_report.to_csv(artifacts_dir / 'district_report.csv', index=False)
    trend_report.to_csv(artifacts_dir / 'trend_report.csv', index=False)
    forecast_report.to_csv(artifacts_dir / 'forecast_report.csv', index=False)

    logger.info('✅ BiLSTM inference completed successfully. Output rows=%d', len(results_df))
    logger.info('Artifacts saved in %s', artifacts_dir)
    return results_df


def run_bilstm_from_config() -> pd.DataFrame:
    paths = get_paths_config()
    models = get_models_config()
    bilstm_cfg = get_bilstm_config()
    project_root = Path(__file__).resolve().parents[1]

    return run_bilstm_inference_pipeline(
        input_csv=project_root / paths['bilstm_prepared_csv'],
        model_path=project_root / models['bilstm_model'],
        district_encoder_path=project_root / models['district_encoder'],
        coords_csv=project_root / paths['coords_lookup_csv'],
        artifacts_dir=project_root / paths['artifacts_dir'],
        window_size=int(bilstm_cfg.get('window_size', 10)),
    )


if __name__ == '__main__':
    run_bilstm_from_config()