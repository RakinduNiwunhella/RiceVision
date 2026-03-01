from __future__ import annotations

import logging
from io import StringIO
from pathlib import Path

import joblib
import pandas as pd

from src.inference_steps.add_cpi_zvel import add_cpi_zvel
from src.inference_steps.add_ndvi_zscore import add_ndvi_zscore
from src.inference_steps.add_season import add_season
from src.inference_steps.add_velocities import add_velocities
from src.inference_steps.aggregate_10day import aggregate_10day
from src.inference_steps.bilstm_prepare import extract_lstm_frame, prepare_inference_physics, scale_lstm_features
from src.inference_steps.date_extraction import extract_date_parts
from src.inference_steps.disaster_vectorization import vectorize_disasters
from src.inference_steps.drop_unnecessary_columns import drop_unnecessary_columns
from src.inference_steps.engineer_features import engineer_features
from src.inference_steps.filling_nans import filling_nans
from src.inference_steps.finalize_schema import finalize_schema
from src.inference_steps.handle_missing_values import handle_missing_values
from src.inference_steps.infer_stage import infer_stage
from src.inference_steps.map_pixels import map_pixels
from src.inference_steps.rescaling_and_masking import rescaling_and_masking
from src.inference_steps.smooth_features import smooth_features
from src.inference_steps.visualize_points import visualize_unique_points
from utils.config import get_baselines_config, get_config, get_models_config, get_paths_config, get_stage_mapping

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _log_step(step_no: int, total_steps: int, title: str) -> None:
    logger.info('▶️  [%d/%d] %s', step_no, total_steps, title)


def _log_df_info(df: pd.DataFrame, context: str) -> None:
    buffer = StringIO()
    df.info(buf=buffer, show_counts=True)
    logger.info('%s\n%s', context, buffer.getvalue())


def run_preprocessing_pipeline(
    input_csv: Path,
    output_csv: Path,
    baseline_csv: Path,
    district_encoder_path: Path,
    scaler_path: Path,
    artifacts_dir: Path,
) -> pd.DataFrame:
    total_steps = 19

    if not input_csv.exists():
        raise FileNotFoundError(f"Input dataset not found: {input_csv}")

    logger.info('Starting preprocessing pipeline with input %s', input_csv)

    artifacts_dir.mkdir(parents=True, exist_ok=True)
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    _log_step(1, total_steps, 'Loading input and baseline datasets')
    baseline_df = pd.read_csv(baseline_csv) if baseline_csv.exists() else None
    df = pd.read_csv(input_csv)
    logger.info('Loaded rows=%d, cols=%d', len(df), len(df.columns))
    _log_df_info(df, 'After Step 1 - Loaded input dataset')

    _log_step(2, total_steps, 'Dropping unnecessary columns')
    _log_df_info(df, 'Before Step 2 - drop_unnecessary_columns')
    df = drop_unnecessary_columns(df)
    _log_df_info(df, 'After Step 2 - drop_unnecessary_columns')

    _log_step(3, total_steps, 'Mapping pixels and exporting coordinate lookup')
    _log_df_info(df, 'Before Step 3 - map_pixels')
    df = map_pixels(df, artifacts_dir=artifacts_dir, coords_filename='unique_coordinates.csv')
    _log_df_info(df, 'After Step 3 - map_pixels')

    _log_step(4, total_steps, 'Vectorizing disaster hazard flags')
    _log_df_info(df, 'Before Step 4 - vectorize_disasters')
    df = vectorize_disasters(df)
    _log_df_info(df, 'After Step 4 - vectorize_disasters')

    _log_step(5, total_steps, 'Handling missing values and cleaning data')
    _log_df_info(df, 'Before Step 5 - handle_missing_values')
    df = handle_missing_values(df)
    _log_df_info(df, 'After Step 5 - handle_missing_values')

    _log_step(6, total_steps, 'Extracting date components')
    _log_df_info(df, 'Before Step 6 - extract_date_parts')
    df = extract_date_parts(df)
    _log_df_info(df, 'After Step 6 - extract_date_parts')

    _log_step(7, total_steps, 'Generating paddy point distribution plot')
    _log_df_info(df, 'Before Step 7 - visualize_unique_points')
    visualize_unique_points(df, artifacts_dir=artifacts_dir, image_name='paddy_points_distribution.png')
    _log_df_info(df, 'After Step 7 - visualize_unique_points')

    _log_step(8, total_steps, 'Rescaling and masking unclean pixels')
    _log_df_info(df, 'Before Step 8 - rescaling_and_masking')
    df = rescaling_and_masking(df)
    _log_df_info(df, 'After Step 8 - rescaling_and_masking')

    _log_step(9, total_steps, 'Filling spectral NaN values')
    _log_df_info(df, 'Before Step 9 - filling_nans')
    df = filling_nans(df)
    _log_df_info(df, 'After Step 9 - filling_nans')

    _log_step(10, total_steps, 'Engineering spectral and environmental features')
    _log_df_info(df, 'Before Step 10 - engineer_features')
    df = engineer_features(df)
    _log_df_info(df, 'After Step 10 - engineer_features')
    df.to_csv(artifacts_dir / 'inference_preprocess_engineered.csv', index=False)
    logger.info('Saved engineered artifact: %s', artifacts_dir / 'inference_preprocess_engineered.csv')

    _log_step(11, total_steps, 'Aggregating to 10-day windows')
    _log_df_info(df, 'Before Step 11 - aggregate_10day')
    df = aggregate_10day(df)
    _log_df_info(df, 'After Step 11 - aggregate_10day')
    df.to_csv(artifacts_dir / 'inference_preprocess_10day.csv', index=False)
    logger.info('Saved 10-day artifact: %s', artifacts_dir / 'inference_preprocess_10day.csv')

    _log_step(12, total_steps, 'Smoothing temporal features')
    _log_df_info(df, 'Before Step 12 - smooth_features')
    df = smooth_features(df)
    _log_df_info(df, 'After Step 12 - smooth_features')

    _log_step(13, total_steps, 'Computing temporal velocities')
    _log_df_info(df, 'Before Step 13 - add_velocities')
    df = add_velocities(df)
    _log_df_info(df, 'After Step 13 - add_velocities')

    _log_step(14, total_steps, 'Inferring crop growth stage statistically')
    _log_df_info(df, 'Before Step 14 - infer_stage')
    df = infer_stage(df, baseline_df)
    _log_df_info(df, 'After Step 14 - infer_stage')

    _log_step(15, total_steps, 'Computing NDVI z-score')
    _log_df_info(df, 'Before Step 15 - add_ndvi_zscore')
    df = add_ndvi_zscore(df, baseline_df)
    _log_df_info(df, 'After Step 15 - add_ndvi_zscore')

    _log_step(16, total_steps, 'Computing CPI and related z-velocity metrics')
    _log_df_info(df, 'Before Step 16 - add_cpi_zvel')
    df = add_cpi_zvel(df)
    _log_df_info(df, 'After Step 16 - add_cpi_zvel')

    _log_step(17, total_steps, 'Adding season, cycle, and district encoding')
    _log_df_info(df, 'Before Step 17 - add_season')
    df = add_season(df, district_encoder_path=str(district_encoder_path) if district_encoder_path.exists() else None)
    _log_df_info(df, 'After Step 17 - add_season')

    stage_mapping = get_stage_mapping()
    _log_step(18, total_steps, 'Finalizing schema for BiLSTM handoff')
    _log_df_info(df, 'Before Step 18 - finalize_schema')
    df = finalize_schema(df, stage_mapping=stage_mapping)
    _log_df_info(df, 'After Step 18 - finalize_schema')

    _log_step(19, total_steps, 'Creating BiLSTM handoff artifacts')
    _log_df_info(df, 'Before Step 19 - extract_lstm_frame')
    df_lstm = extract_lstm_frame(df) 
    _log_df_info(df_lstm, 'After Step 19a - extract_lstm_frame')
    df_lstm.to_csv(artifacts_dir / 'bilstm_lstm_frame.csv', index=False)
    logger.info('Saved BiLSTM frame: %s', artifacts_dir / 'bilstm_lstm_frame.csv')

    if scaler_path.exists():
        df_scaled = scale_lstm_features(df_lstm, scaler_path=str(scaler_path)) 
    else:
        df_scaled = df_lstm.copy()
    _log_df_info(df_scaled, 'After Step 19b - scale_lstm_features')
    df_scaled.to_csv(artifacts_dir / 'bilstm_scaled_frame.csv', index=False)
    logger.info('Saved scaled BiLSTM frame: %s', artifacts_dir / 'bilstm_scaled_frame.csv')

    df_prepared = prepare_inference_physics(df_scaled) 
    _log_df_info(df_prepared, 'After Step 19c - prepare_inference_physics')
    df_prepared.to_csv(artifacts_dir / 'Inference_preprocessed.csv', index=False)
    logger.info('Saved final BiLSTM input file: %s', artifacts_dir / 'Inference_preprocessed.csv')
    
    if district_encoder_path.exists() and 'district' in df.columns and 'district_id' not in df.columns:
        encoder = joblib.load(district_encoder_path)
        df['district_id'] = encoder.transform(df['district']).astype('int32')

    hazard_cols = [col for col in df.columns if col.startswith('hazard_')]
    for col in hazard_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('int32')

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')

    _log_df_info(df, 'Final output dataframe before save')
    df.to_csv(output_csv, index=False)
    logger.info('✅ Preprocessing pipeline completed successfully. Output: %s (rows=%d, cols=%d)', output_csv, len(df), len(df.columns))
    return df


def run_preprocessing_from_config() -> pd.DataFrame:
    config = get_config()
    paths = get_paths_config()
    models = get_models_config()
    baselines = get_baselines_config()

    project_root = Path(__file__).resolve().parents[1]
    _ = config
    return run_preprocessing_pipeline(
        input_csv=project_root / paths['input_csv'],
        output_csv=project_root / paths['preprocessed_output'],
        baseline_csv=project_root / baselines['district_baseline'],
        district_encoder_path=project_root / models['district_encoder'],
        scaler_path=project_root / models['lstm_scaler'],
        artifacts_dir=project_root / paths['artifacts_dir'],
    )


if __name__ == '__main__':
    run_preprocessing_from_config()