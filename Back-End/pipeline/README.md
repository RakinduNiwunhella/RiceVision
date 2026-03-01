# RiceVision Inference Pipeline (3-Step)

This folder now runs the RiceVision inference flow using exactly three pipelines:

1. `pipelines/inference_preprocessing.py`
2. `pipelines/BiLSTM_inference.py`
3. `pipelines/yield_inference.py`

`pipelines/streaming_inference_pipeline.py` is no longer used.

## What each pipeline does

### 1) Preprocess pipeline
- Loads raw satellite and weather input data
- Cleans and fills missing values
- Generates coordinate lookup and paddy point visualization
- Engineers features and aggregates to 10-day windows
- Applies stage/statistical enrichments and final schema prep
- Produces BiLSTM-ready artifacts

Main outputs in `artifacts/`:
- `inference_p1.csv`
- `inference_preprocess_engineered.csv`
- `inference_preprocess_10day.csv`
- `unique_coordinates.csv`
- `paddy_points_distribution.png`
- `bilstm_lstm_frame.csv`
- `bilstm_scaled_frame.csv`
- `Inference_preprocessed.csv`

### 2) BiLSTM inference pipeline
- Loads prepared BiLSTM input
- Builds valid temporal windows
- Runs model inference
- Produces stage/health/pest outputs
- Merges coordinate lookup
- Generates Sri Lanka map snapshots and summary reports

Main outputs in `artifacts/`:
- `lstm_results.csv`
- `district_report.csv`
- `trend_report.csv`
- `forecast_report.csv`
- `health_pest_snapshot.png`
- `growth_stage_snapshot.png`

### 3) Yield inference pipeline
- Loads BiLSTM outputs and preprocessed features
- Extracts latent embeddings from BiLSTM backbone
- Builds district-level yield features
- Predicts yield and generates final national report

Main outputs in `artifacts/`:
- `yield_df_z.csv`
- `yield_master_z.csv`
- `yield_pixel_stats.csv`
- `yield_district_summary.csv`
- `Sri_Lanka_2026_Final_Report.csv`

## Logging

All three pipelines include step-by-step, user-friendly logs.
`src/inference_steps/yield_steps.py` also includes detailed internal logs so users can see progress during latent extraction, feature engineering, and prediction.

## Setup

From this `pipeline/` directory:

### macOS / Linux
- `make install`

### Windows PowerShell
- `./make.ps1 install`

## Run pipelines

### macOS / Linux
- `make preprocess-pipeline`
- `make lstm-pipeline`
- `make yield-pipeline`
- `make run-all`

### Windows PowerShell
- `./make.ps1 preprocess-pipeline`
- `./make.ps1 lstm-pipeline`
- `./make.ps1 yield-pipeline`
- `./make.ps1 run-all`

## Clean generated artifacts

### macOS / Linux
- `make clean`

### Windows PowerShell
- `./make.ps1 clean`

## Configuration

Pipeline paths, model paths, stage mapping, and final schema columns are controlled from:
- `config.yaml`
- `utils/config.py`

## Notes

- MLflow/streaming pipeline flow is not part of this inference-only setup.
- Ensure all model/scaler files referenced in `config.yaml` exist before running.
- If you use `uv`, the install targets automatically use `uv pip` when available.
