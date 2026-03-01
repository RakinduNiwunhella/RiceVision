from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from src.inference_steps import (
    categorize_inference_results,
    generate_ricevision_report,
)
from src.inference_steps.bilstm_predict import (
    regression_accuracy,
    robust_huber_loss,
    weighted_stage_ce_v2,
)


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
    artifacts_dir: Path,
    window_size: int = 10,
) -> pd.DataFrame:
    if not input_csv.exists():
        raise FileNotFoundError(f"Preprocessed input not found: {input_csv}")
    if not model_path.exists():
        raise FileNotFoundError(f"BiLSTM model not found: {model_path}")
    if not district_encoder_path.exists():
        raise FileNotFoundError(f"District encoder not found: {district_encoder_path}")

    artifacts_dir.mkdir(parents=True, exist_ok=True)

    df_prepared = pd.read_csv(input_csv)

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

    x_inf, meta = create_inference_sequences(df_prepared, window_size=window_size)
    if len(meta) == 0:
        empty_out = artifacts_dir / 'lstm_results.csv'
        meta.to_csv(empty_out, index=False)
        return meta

    model = tf.keras.models.load_model(
        model_path,
        custom_objects={
            'weighted_stage_ce_v2': weighted_stage_ce_v2,
            'robust_huber_loss': robust_huber_loss,
            'regression_accuracy': regression_accuracy,
        },
    )

    print(f'🚀 Running inference on {len(meta)} sequences...')
    preds = model.predict([x_inf['temporal_input'], x_inf['static_input'], x_inf['district_input']], verbose=0)

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
        return results_df

    results_df = categorize_inference_results(results_df)

    district_report, trend_report, forecast_report = generate_ricevision_report(results_df)

    results_df.to_csv(artifacts_dir / 'lstm_results.csv', index=False)
    district_report.to_csv(artifacts_dir / 'district_report.csv', index=False)
    trend_report.to_csv(artifacts_dir / 'trend_report.csv', index=False)
    forecast_report.to_csv(artifacts_dir / 'forecast_report.csv', index=False)

    return results_df


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description='RiceVision BiLSTM inference pipeline')
    parser.add_argument(
        '--input',
        type=Path,
        default=project_root / 'artifacts' / 'Inference_preprocessed.csv',
        help='Path to preprocessed LSTM-ready CSV',
    )
    parser.add_argument(
        '--model',
        type=Path,
        default=project_root / 'models' / 'ricevision_v7_district_aware.keras',
        help='Path to BiLSTM model',
    )
    parser.add_argument(
        '--district-encoder',
        type=Path,
        default=project_root / 'pipelines' / 'encoders' / 'district_encoder.joblib',
        help='Path to district encoder',
    )
    parser.add_argument(
        '--artifacts-dir',
        type=Path,
        default=project_root / 'artifacts',
        help='Artifacts folder for intermediate and output CSVs',
    )
    parser.add_argument('--window-size', type=int, default=10, help='Temporal window size')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    results = run_bilstm_inference_pipeline(
        input_csv=args.input,
        model_path=args.model,
        district_encoder_path=args.district_encoder,
        artifacts_dir=args.artifacts_dir,
        window_size=args.window_size,
    )
    print(f"Saved BiLSTM outputs in: {args.artifacts_dir}")
    print(results.head())