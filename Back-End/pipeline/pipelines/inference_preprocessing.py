from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd

from src.inference_steps import (
    STAGE_MAPPING,
    add_cpi_zvel,
    add_ndvi_zscore,
    add_season,
    add_velocities,
    aggregate_10day,
    drop_unnecessary_columns,
    engineer_features,
    extract_date_parts,
    extract_lstm_frame,
    filling_nans,
    finalize_schema,
    handle_missing_values,
    infer_stage,
    map_pixels,
    prepare_inference_physics,
    rescaling_and_masking,
    scale_lstm_features,
    smooth_features,
    vectorize_disasters,
    visualize_unique_points,
)


def run_preprocessing_pipeline(
    input_csv: Path,
    output_csv: Path,
    baseline_csv: Path,
    district_encoder_path: Path,
    scaler_path: Path,
    artifacts_dir: Path,
) -> pd.DataFrame:
    if not input_csv.exists():
        raise FileNotFoundError(f"Input dataset not found: {input_csv}")

    artifacts_dir.mkdir(parents=True, exist_ok=True)
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    baseline_df = pd.read_csv(baseline_csv) if baseline_csv.exists() else None
    df = pd.read_csv(input_csv)

    df = drop_unnecessary_columns(df)
    df = map_pixels(df, artifacts_dir=artifacts_dir, coords_filename='unique_coordinates.csv')
    df = vectorize_disasters(df)
    df = handle_missing_values(df)
    df = extract_date_parts(df)

    visualize_unique_points(df, artifacts_dir=artifacts_dir, image_name='paddy_points_distribution.png')

    df = rescaling_and_masking(df)
    df = filling_nans(df)
    df = engineer_features(df)
    df.to_csv(artifacts_dir / 'inference_preprocess_engineered.csv', index=False)

    df = aggregate_10day(df)
    df.to_csv(artifacts_dir / 'inference_preprocess_10day.csv', index=False)

    df = smooth_features(df)
    df = add_velocities(df)
    df = infer_stage(df, baseline_df)
    df = add_ndvi_zscore(df, baseline_df)
    df = add_cpi_zvel(df)
    df = add_season(df, district_encoder_path=str(district_encoder_path) if district_encoder_path.exists() else None)
    df = finalize_schema(df, stage_mapping=STAGE_MAPPING)

    df_lstm = extract_lstm_frame(df)
    df_lstm.to_csv(artifacts_dir / 'bilstm_lstm_frame.csv', index=False)

    if scaler_path.exists():
        df_scaled = scale_lstm_features(df_lstm, scaler_path=str(scaler_path))
    else:
        df_scaled = df_lstm.copy()
    df_scaled.to_csv(artifacts_dir / 'bilstm_scaled_frame.csv', index=False)

    df_prepared = prepare_inference_physics(df_scaled)
    df_prepared.to_csv(artifacts_dir / 'Inference_preprocessed.csv', index=False)
    
    if district_encoder_path.exists() and 'district' in df.columns and 'district_id' not in df.columns:
        encoder = joblib.load(district_encoder_path)
        df['district_id'] = encoder.transform(df['district']).astype('int32')

    hazard_cols = [col for col in df.columns if col.startswith('hazard_')]
    for col in hazard_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('int32')

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')

    df.to_csv(output_csv, index=False)
    return df


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description='RiceVision inference preprocessing pipeline')
    parser.add_argument(
        '--input',
        type=Path,
        default=project_root / 'data' / 'raw' / 'merged_combined_satellite.csv',
        help='Path to merged_combined_satellite.csv',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=project_root / 'artifacts' / 'inference_p1.csv',
        help='Output CSV path for preprocessing result',
    )
    parser.add_argument(
        '--baseline',
        type=Path,
        default=project_root / 'artifacts' / 'sri_lanka_district_baselines.csv',
        help='District baseline CSV path',
    )
    parser.add_argument(
        '--district-encoder',
        type=Path,
        default=project_root / 'pipelines' / 'encoders' / 'district_encoder.joblib',
        help='District encoder path',
    )
    parser.add_argument(
        '--scaler',
        type=Path,
        default=project_root / 'scalers' / 'lstm_scaler.joblib',
        help='Path to LSTM scaler for preprocessing handoff artifacts',
    )
    parser.add_argument(
        '--artifacts-dir',
        type=Path,
        default=project_root / 'artifacts',
        help='Artifacts folder for intermediate CSVs',
    )
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    result = run_preprocessing_pipeline(
        input_csv=args.input,
        output_csv=args.output,
        baseline_csv=args.baseline,
        district_encoder_path=args.district_encoder,
        scaler_path=args.scaler,
        artifacts_dir=args.artifacts_dir,
    )
    print(f"Saved preprocessing output: {args.output}")
    print(result.head())