from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd

from src.inference_steps import (
    STAGE_MAPPING,
    add_cpi,
    add_ndvi_zscore,
    add_season,
    add_velocities,
    aggregate_10day,
    drop_unnecessary_columns,
    engineer_features,
    finalize_schema,
    handle_missing_values,
    infer_stage,
    map_pixels,
    mask_and_fill_spectral,
    smooth_features,
)


def run_preprocessing_pipeline(
    input_csv: Path,
    output_csv: Path,
    baseline_csv: Path,
    district_encoder_path: Path,
    artifacts_dir: Path,
) -> pd.DataFrame:
    if not input_csv.exists():
        raise FileNotFoundError(f"Input dataset not found: {input_csv}")

    artifacts_dir.mkdir(parents=True, exist_ok=True)
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    baseline_df = pd.read_csv(baseline_csv) if baseline_csv.exists() else None
    df = pd.read_csv(input_csv)

    bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    weather_cols = ['rain_1d', 'rain_3d', 'rain_7d', 'rain_14d', 'rain_30d', 'tmean', 'tmin', 'tmax', 't_day', 't_night', 'rh_mean']
    terrain_cols = ['elevation', 'slope']

    df = drop_unnecessary_columns(df)
    # Has to check 10 sequences per each pixel is there after this.
    df = map_pixels(df, artifacts_dir=artifacts_dir, coords_filename='unique_coordinates.csv')

    df = handle_missing_values(df, bands=bands, weather_cols=weather_cols, terrain_cols=terrain_cols)

    df = mask_and_fill_spectral(df, bands=bands)
    df = engineer_features(df)
    df.to_csv(artifacts_dir / 'inference_preprocess_engineered.csv', index=False)

    df = aggregate_10day(df)
    df.to_csv(artifacts_dir / 'inference_preprocess_10day.csv', index=False)

    df = smooth_features(df)
    df = add_velocities(df)
    df = infer_stage(df, baseline_df)
    df = add_ndvi_zscore(df, baseline_df)
    df = add_cpi(df)
    df = add_season(df)
    df = finalize_schema(df, stage_mapping=STAGE_MAPPING)

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
        artifacts_dir=args.artifacts_dir,
    )
    print(f"Saved preprocessing output: {args.output}")
    print(result.head())