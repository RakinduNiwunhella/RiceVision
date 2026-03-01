from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from src.inference_steps import (
    categorize_inference_results,
    extract_lstm_frame,
    generate_ricevision_report,
    prepare_inference_physics,
    run_model_inference,
    scale_lstm_features,
)


def run_bilstm_inference_pipeline(
    input_csv: Path,
    scaler_path: Path,
    model_path: Path,
    district_encoder_path: Path,
    artifacts_dir: Path,
    window_size: int = 10,
) -> pd.DataFrame:
    if not input_csv.exists():
        raise FileNotFoundError(f"Preprocessed input not found: {input_csv}")
    if not scaler_path.exists():
        raise FileNotFoundError(f"LSTM scaler not found: {scaler_path}")
    if not model_path.exists():
        raise FileNotFoundError(f"BiLSTM model not found: {model_path}")
    if not district_encoder_path.exists():
        raise FileNotFoundError(f"District encoder not found: {district_encoder_path}")

    artifacts_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_csv)
    df_lstm = extract_lstm_frame(df)
    df_lstm.to_csv(artifacts_dir / 'bilstm_lstm_frame.csv', index=False)

    df_scaled = scale_lstm_features(df_lstm, scaler_path=str(scaler_path))
    df_scaled.to_csv(artifacts_dir / 'bilstm_scaled_frame.csv', index=False)

    df_prepared = prepare_inference_physics(df_scaled)
    inference_preprocessed_path = artifacts_dir / 'Inference_preprocessed.csv'
    df_prepared.to_csv(inference_preprocessed_path, index=False)

    results_df = run_model_inference(
        df_prepared,
        model_path=str(model_path),
        district_encoder_path=str(district_encoder_path),
        window_size=window_size,
    )

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
        default=project_root / 'artifacts' / 'inference_p1.csv',
        help='Path to preprocessing output CSV',
    )
    parser.add_argument(
        '--scaler',
        type=Path,
        default=project_root / 'scalers' / 'lstm_scaler.joblib',
        help='Path to LSTM scaler',
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
        scaler_path=args.scaler,
        model_path=args.model,
        district_encoder_path=args.district_encoder,
        artifacts_dir=args.artifacts_dir,
        window_size=args.window_size,
    )
    print(f"Saved BiLSTM outputs in: {args.artifacts_dir}")
    print(results.head())