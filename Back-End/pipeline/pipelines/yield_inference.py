from __future__ import annotations

import logging
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
from utils.config import get_baselines_config, get_bilstm_config, get_models_config, get_paths_config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _log_step(step_no: int, total_steps: int, title: str) -> None:
    logger.info('▶️  [%d/%d] %s', step_no, total_steps, title)


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
    total_steps = 12
    logger.info('Starting yield inference pipeline...')
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

    _log_step(1, total_steps, 'Loading preprocessed features, BiLSTM results, and yield baselines')
    df_preprocessed = pd.read_csv(preprocessed_csv)
    df_lstm_results = pd.read_csv(lstm_results_csv)
    df_yield_baselines = pd.read_csv(yield_baseline_csv)
    logger.info('Preprocessed rows=%d | LSTM rows=%d | Baseline rows=%d', len(df_preprocessed), len(df_lstm_results), len(df_yield_baselines))

    _log_step(2, total_steps, 'Dropping duplicate stage columns from preprocessed frame if present')
    if {'stage_name', 'stage'}.issubset(df_preprocessed.columns):
        df_preprocessed = df_preprocessed.drop(columns=['stage_name', 'stage'])

    _log_step(3, total_steps, 'Loading scalers, PCA, and yield regression model')
    main_scaler = joblib.load(lstm_scaler_path)
    yield_scaler = joblib.load(yield_scaler_path)
    pca = joblib.load(pca_path)
    lasso_yield_model = joblib.load(yield_model_path)

    _log_step(4, total_steps, 'Loading BiLSTM model and creating latent feature extractor')
    lstm_model = tf.keras.models.load_model(lstm_model_path, compile=False)
    feature_extractor = tf.keras.Model(
        inputs=lstm_model.input,
        outputs=lstm_model.get_layer('dense_1').output,
    )

    _log_step(5, total_steps, 'Standardizing live input features for yield flow')
    all_features_to_scale = list(set(TS_FEATURES + STATIC_FEATURES + main_scaler.feature_names_in_.tolist()))
    df_z = standardize_live(df_preprocessed.copy(), feature_names=all_features_to_scale)
    df_z.to_csv(artifacts_dir / 'yield_df_z.csv', index=False)
    logger.info('Saved standardized frame: %s', artifacts_dir / 'yield_df_z.csv')

    _log_step(6, total_steps, 'Creating LSTM input windows for latent extraction')
    x_input, valid_indices = create_lstm_inputs(df_z, window_size=window_size)

    _log_step(7, total_steps, 'Extracting latent embeddings from BiLSTM backbone')
    latents = extract_latents(feature_extractor, x_input, batch_size=1024)

    _log_step(8, total_steps, 'Building master latent feature table and applying PCA')
    df_master_z = build_master_z(df_z, valid_indices, latents, pca, df_lstm_results)
    df_master_z.to_csv(artifacts_dir / 'yield_master_z.csv', index=False)
    logger.info('Saved master latent table: %s', artifacts_dir / 'yield_master_z.csv')

    _log_step(9, total_steps, 'Summarizing pixel-level and district-level yield statistics')
    pixel_stats, district_summary = build_district_summary(df_master_z, df_yield_baselines)
    pixel_stats.to_csv(artifacts_dir / 'yield_pixel_stats.csv', index=False)
    logger.info('Saved pixel summary: %s', artifacts_dir / 'yield_pixel_stats.csv')

    _log_step(10, total_steps, 'Engineering district-level yield features')
    district_summary = engineer_yield_features(district_summary, df_yield_baselines)

    _log_step(11, total_steps, 'Predicting district yield values')
    district_summary, _ = predict_yield(district_summary, yield_scaler, lasso_yield_model)
    district_summary.to_csv(artifacts_dir / 'yield_district_summary.csv', index=False)
    logger.info('Saved district summary: %s', artifacts_dir / 'yield_district_summary.csv')

    _log_step(12, total_steps, 'Building final Sri Lanka yield report')
    final_report = build_final_report(district_summary, df_lstm_results)
    final_report.to_csv(artifacts_dir / 'Sri_Lanka_2026_Final_Report.csv', index=False)

    logger.info('✅ Yield inference completed successfully. Final report rows=%d', len(final_report))
    logger.info('Final report saved in %s', artifacts_dir)
    return final_report


def run_yield_from_config() -> pd.DataFrame:
    project_root = Path(__file__).resolve().parents[1]
    paths = get_paths_config()
    models = get_models_config()
    baselines = get_baselines_config()
    bilstm_cfg = get_bilstm_config()

    return run_yield_inference_pipeline(
        preprocessed_csv=project_root / paths['bilstm_prepared_csv'],
        lstm_results_csv=project_root / paths['bilstm_results_csv'],
        lstm_model_path=project_root / models['bilstm_model'],
        pca_path=project_root / models['pca_model'],
        lstm_scaler_path=project_root / models['lstm_scaler'],
        yield_scaler_path=project_root / models['yield_scaler'],
        yield_model_path=project_root / models['yield_model'],
        yield_baseline_csv=project_root / baselines['yield_baseline'],
        artifacts_dir=project_root / paths['artifacts_dir'],
        window_size=int(bilstm_cfg.get('window_size', 10)),
    )


if __name__ == '__main__':
    run_yield_from_config()