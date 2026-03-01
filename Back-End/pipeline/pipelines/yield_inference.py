from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
import tensorflow as tf

from src.inference_steps.yield_steps import (
    STATIC_FEATURES,
    TS_FEATURES,
    build_district_summary,
    build_final_report,
    build_master_z,
    create_lstm_inputs,
    engineer_yield_features,
    extract_latents,
    predict_yield,
    standardize_live,
)


def run_yield_inference_pipeline(
    preprocessed_csv: Path,
    lstm_results_csv: Path,
    lstm_model_path: Path,
    pca_path: Path,
    lstm_scaler_path: Path,
    yield_scaler_path: Path,
    yield_model_path: Path,
    yield_baseline_csv: Path,
    artifacts_dir: Path,
    window_size: int = 10,
) -> pd.DataFrame:
    required = [
        preprocessed_csv,
        lstm_results_csv,
        lstm_model_path,
        pca_path,
        lstm_scaler_path,
        yield_scaler_path,
        yield_model_path,
        yield_baseline_csv,
    ]
    for path in required:
        if not path.exists():
            raise FileNotFoundError(f"Required file not found: {path}")

    artifacts_dir.mkdir(parents=True, exist_ok=True)

    df_preprocessed = pd.read_csv(preprocessed_csv)
    df_lstm_results = pd.read_csv(lstm_results_csv)
    df_yield_baselines = pd.read_csv(yield_baseline_csv)

    if {'stage_name', 'stage'}.issubset(df_preprocessed.columns):
        df_preprocessed = df_preprocessed.drop(columns=['stage_name', 'stage'])

    main_scaler = joblib.load(lstm_scaler_path)
    yield_scaler = joblib.load(yield_scaler_path)
    pca = joblib.load(pca_path)
    lasso_yield_model = joblib.load(yield_model_path)

    lstm_model = tf.keras.models.load_model(lstm_model_path, compile=False)
    feature_extractor = tf.keras.Model(
        inputs=lstm_model.input,
        outputs=lstm_model.get_layer('dense_1').output,
    )

    all_features_to_scale = list(set(TS_FEATURES + STATIC_FEATURES + main_scaler.feature_names_in_.tolist()))
    df_z = standardize_live(df_preprocessed.copy(), feature_names=all_features_to_scale)
    df_z.to_csv(artifacts_dir / 'yield_df_z.csv', index=False)

    x_input, valid_indices = create_lstm_inputs(df_z, window_size=window_size)
    latents = extract_latents(feature_extractor, x_input, batch_size=1024)

    df_master_z = build_master_z(df_z, valid_indices, latents, pca, df_lstm_results)
    df_master_z.to_csv(artifacts_dir / 'yield_master_z.csv', index=False)

    pixel_stats, district_summary = build_district_summary(df_master_z, df_yield_baselines)
    pixel_stats.to_csv(artifacts_dir / 'yield_pixel_stats.csv', index=False)

    district_summary = engineer_yield_features(district_summary, df_yield_baselines)
    district_summary, _ = predict_yield(district_summary, yield_scaler, lasso_yield_model)
    district_summary.to_csv(artifacts_dir / 'yield_district_summary.csv', index=False)

    final_report = build_final_report(district_summary, df_lstm_results)
    final_report.to_csv(artifacts_dir / 'Sri_Lanka_2026_Final_Report.csv', index=False)

    return final_report


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description='RiceVision yield inference pipeline')
    parser.add_argument(
        '--preprocessed',
        type=Path,
        default=project_root / 'artifacts' / 'Inference_preprocessed.csv',
        help='Path to BiLSTM preprocessed CSV',
    )
    parser.add_argument(
        '--lstm-results',
        type=Path,
        default=project_root / 'artifacts' / 'lstm_results.csv',
        help='Path to BiLSTM results CSV',
    )
    parser.add_argument(
        '--lstm-model',
        type=Path,
        default=project_root / 'models' / 'ricevision_v7_district_aware.keras',
        help='Path to LSTM model for feature extractor',
    )
    parser.add_argument(
        '--pca',
        type=Path,
        default=project_root / 'models' / 'pca_model' / 'rice_yield_pca_v7.pkl',
        help='Path to yield PCA model',
    )
    parser.add_argument(
        '--lstm-scaler',
        type=Path,
        default=project_root / 'scalers' / 'lstm_scaler.joblib',
        help='Path to LSTM scaler used for live standardization',
    )
    parser.add_argument(
        '--yield-scaler',
        type=Path,
        default=project_root / 'scalers' / 'yield_scaler.pkl',
        help='Path to yield scaler',
    )
    parser.add_argument(
        '--yield-model',
        type=Path,
        default=project_root / 'models' / 'rice_yield_model_final.pkl',
        help='Path to yield prediction model',
    )
    parser.add_argument(
        '--yield-baseline',
        type=Path,
        default=project_root / 'artifacts' / 'yield_baselines.csv',
        help='Path to yield baseline CSV',
    )
    parser.add_argument(
        '--artifacts-dir',
        type=Path,
        default=project_root / 'artifacts',
        help='Artifacts folder for intermediate and final outputs',
    )
    parser.add_argument('--window-size', type=int, default=10, help='Temporal window size')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    report = run_yield_inference_pipeline(
        preprocessed_csv=args.preprocessed,
        lstm_results_csv=args.lstm_results,
        lstm_model_path=args.lstm_model,
        pca_path=args.pca,
        lstm_scaler_path=args.lstm_scaler,
        yield_scaler_path=args.yield_scaler,
        yield_model_path=args.yield_model,
        yield_baseline_csv=args.yield_baseline,
        artifacts_dir=args.artifacts_dir,
        window_size=args.window_size,
    )
    print(f"Saved yield outputs in: {args.artifacts_dir}")
    print(report.head())