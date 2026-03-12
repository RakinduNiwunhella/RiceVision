# RiceVision Inference Pipeline

**Version:** 1.0.0

End-to-end satellite remote sensing inference system for Sri Lanka paddy rice. Given merged Sentinel-2 satellite, weather, and disaster hazard data for ~4,719 paddy pixel locations, it predicts crop growth stage, crop health, pest pressure, and district-level yield through a three-stage sequential pipeline.

## Pipelines

1. `pipelines/inference_preprocessing.py` — Raw data → BiLSTM-ready features
2. `pipelines/BiLSTM_inference.py` — BiLSTM model inference → stage/health/pest predictions
3. `pipelines/yield_inference.py` — Latent embeddings → district-level yield forecast

## Data Flow

```
data/raw/merged_combined_satellite.csv
        │
        ▼
[Pipeline 1: inference_preprocessing.py — 19 steps]
        │  artifacts/unique_coordinates.csv
        │  artifacts/paddy_points_distribution.png
        ▼
        artifacts/Inference_preprocessed.csv
[Pipeline 2: BiLSTM_inference.py — 9 steps]
        │  artifacts/lstm_results.csv
        │  artifacts/district_report.csv
        │  artifacts/trend_report.csv
        │  artifacts/forecast_report.csv
        │  artifacts/health_pest_snapshot.png
        │  artifacts/growth_stage_snapshot.png
        ▼
        artifacts/Inference_preprocessed.csv + artifacts/lstm_results.csv
[Pipeline 3: yield_inference.py — 12 steps]
           artifacts/yield_pixel_stats.csv
           artifacts/yield_district_summary.csv
           artifacts/Sri_Lanka_2026_Final_Report.csv
```

---

## What each pipeline does

### Pipeline 1 — Preprocessing (`inference_preprocessing.py`)

19-step pipeline converting raw satellite input into a cleaned, feature-engineered, and scaled BiLSTM-ready frame.

| Step | Action |
|------|--------|
| 1 | Load `merged_combined_satellite.csv` and `sri_lanka_district_baselines.csv` |
| 2 | Drop GEE metadata columns (`.geo`, `constant`, `ds_division`, `system:index`) |
| 3 | Save pixel-ID → lat/lon lookup to `unique_coordinates.csv` |
| 4 | Cast disaster/hazard flags to int; create lowercase column aliases |
| 5 | Spatial KD-tree weather imputation; linear spectral band interpolation |
| 6 | Parse date string; add year, month, day, month_day columns |
| 7 | Scatter-plot all 4,719 paddy pixel locations → `paddy_points_distribution.png` |
| 8 | Normalise bands ÷10,000 to [0,1] reflectance; NaN-mask cloudy/unclean pixels (SCL ∉ {4,5,6,7} or cloud_pct > 50) |
| 9 | 3-phase spectral imputation: spatial KNN (cKDTree) → temporal linear interpolation → global mean fallback |
| 10 | Compute 16 spectral indices from Sentinel-2 bands (NDVI, EVI, EVI2, LSWI, BSI, NDWI, GLI, CVI, SIPI, S2REP, CCCI, RENDVI, RECI, NPCRI, GCI, NDSMI) |
| 11 | Aggregate daily data to 10-day windows (spectral→median, env→mean, hazards→max, statics→first); add doy_sin, doy_cos, delta_days |
| 12 | Savitzky-Golay temporal smoothing per pixel on all `*_median` columns → `*_median_smooth` |
| 13 | Compute per-pixel temporal velocities: ndvi_vel, lswi_vel, bsi_vel |
| 14 | Assign crop growth stage via minimum squared distance to per-district baseline statistics |
| 15 | Compute district/stage-matched NDVI z-score (clipped ±3) |
| 16 | Compute robust IQR z-scores for ndvi_vel, BSI, lswi_vel → Crop Pressure Index (CPI) |
| 17 | Assign Yala (May–Aug) / Maha season; encode district_id; create season_id and cycle_id |
| 18 | Lowercase all columns; select final 63-column schema; map stage_name → integer |
| 19 | Select and type-cast LSTM feature set; apply StandardScaler; add physics augmentation (flood_index, ndvi_delta, is_growing) |

**Main outputs in `artifacts/`:**
- `Inference_preprocessed.csv`
- `unique_coordinates.csv`
- `paddy_points_distribution.png`

---

### Pipeline 2 — BiLSTM Inference (`BiLSTM_inference.py`)

9-step pipeline running the trained tri-head BiLSTM model to predict crop growth stage, health z-score, and pest/CPI index per pixel-date.

| Step | Action |
|------|--------|
| 1 | Load `artifacts/Inference_preprocessed.csv` |
| 2 | Normalise UPPER→lower hazard column aliases |
| 3 | Build temporal inference sequences: window_size=10, vectorised same-pixel windowing |
| 4 | Load `models/ricevision_v7_district_aware.keras` with custom loss objects |
| 5 | Run `model.predict()` → 3 outputs: stage logits, health_z, pest_cpi |
| 6 | Format results: argmax stage, scale by `is_growing` flag, decode district name from encoder |
| 7 | Categorise health labels and derive statistical pest flag |
| 8 | Generate side-by-side health/pest scatter map and phenological stage scatter map |
| 9 | Aggregate district_report, trend_report, and forecast_report (estimated harvest dates) |

**Model inputs per sequence:**
- `temporal_input`: shape `(N, 10, 25)` — 10-day window of 25 time-series features
- `static_input`: shape `(N, 7)` — per-pixel static/geographic features
- `district_input`: shape `(N,)` — encoded district ID

**Model outputs:** stage classification (5 classes), health regression, pest regression

**Custom loss functions:**
- `weighted_stage_ce_v2`: class-weighted sparse categorical cross-entropy (weights: Transplant=3.0, Vegetative=1.5, Reproductive=4.0, Ripening=1.5, Harvest=1.0)
- `robust_huber_loss`: Huber loss with δ=1.0
- `regression_accuracy`: within-0.5 tolerance accuracy metric

**Main outputs in `artifacts/`:**
- `lstm_results.csv`
- `district_report.csv` — risk score, severe_stress_pct, pest_attack_count per district
- `trend_report.csv`
- `forecast_report.csv` — estimated harvest date per district
- `health_pest_snapshot.png`
- `growth_stage_snapshot.png`

---

### Pipeline 3 — Yield Inference (`yield_inference.py`)

12-step pipeline that extracts latent embeddings from the BiLSTM backbone, applies PCA, and runs a Lasso regression model to predict district-level paddy yield (kg/ha) for Sri Lanka 2026.

| Step | Action |
|------|--------|
| 1 | Load preprocessed CSV, BiLSTM results, and yield baselines |
| 2 | Drop duplicate stage columns from preprocessed frame |
| 3 | Load lstm_scaler, yield_scaler, PCA model (.pkl), and Lasso model (.pkl) |
| 4 | Build feature extractor sub-model: BiLSTM backbone → `dense_1` layer output |
| 5 | Z-score standardise time-series and static features |
| 6 | Window sequences by `(pixel_id, cycle_id)` for LSTM input |
| 7 | Batch-predict latent vectors from BiLSTM backbone (batch_size=1024) |
| 8 | PCA-transform latents to 5 components (±5 clip); merge with BiLSTM results |
| 9 | Compute pixel stats and blend with historical district baselines |
| 10 | Engineer yield features: heat_stress_combo, health_per_day, heat_rain_ratio, repro_efficiency |
| 11 | Predict yield: 40% Lasso prediction + 60% historical average + health_boost; clip to 1,500–6,500 kg/ha |
| 12 | Build final report: district name, predicted yield, historical average, yield gap, % change, health index, climate stress index |

**Main outputs in `artifacts/`:**
- `yield_pixel_stats.csv`
- `yield_district_summary.csv`
- `Sri_Lanka_2026_Final_Report.csv`

---

## Logging

All three pipelines emit step-by-step structured logs. `src/inference_steps/yield_steps.py` includes detailed internal logs for latent extraction, feature engineering, and prediction progress.

---

## Project Structure

```
.
├── config.yaml                          # Single source of truth for all pipeline config
├── Makefile                             # macOS/Linux task runner
├── make.ps1                             # Windows PowerShell task runner
├── requirements.txt                     # Python dependencies
├── data/
│   ├── raw/
│   │   └── merged_combined_satellite.csv   # Primary input (Sentinel-2 + weather + hazards)
│   └── baselines/
│       ├── sri_lanka_district_baselines.csv # Per-district/stage NDVI statistics
│       └── yield_baselines.csv              # Per-district historical yield averages
├── models/
│   ├── ricevision_v7_district_aware.keras  # Trained tri-head BiLSTM model
│   ├── pca_model/
│   │   └── rice_yield_pca_v7.pkl           # PCA transformer (5 components)
│   ├── rice_yield_model_final.pkl          # Lasso yield regression model
│   └── yield_scaler.pkl                    # Scaler for yield model features
├── scalers/
│   └── lstm_scaler.joblib                  # StandardScaler for LSTM features
├── pipelines/
│   ├── inference_preprocessing.py
│   ├── BiLSTM_inference.py
│   ├── yield_inference.py
│   └── encoders/
│       └── district_encoder.joblib         # LabelEncoder for district name → integer
├── src/
│   └── inference_steps/                   # Modular step implementations (18 modules)
├── utils/
│   ├── config.py                          # Config loader and sectional accessors
│   └── __init__.py
├── notebooks/                             # Kaggle-origin reference notebooks (not locally runnable)
│   ├── ricevision-inference-pipeline1.ipynb
│   ├── ricevision-inference-pipeline2.ipynb
│   └── ricevision-inference-pipeline3-for-yield.ipynb
└── artifacts/                             # All generated outputs (git-ignored)
```

---

## Setup

### macOS / Linux
```bash
make install
```

### Windows PowerShell
```powershell
./make.ps1 install
```

The install target creates a `.venv` virtual environment, upgrades pip, and installs `requirements.txt`. If `uv` is available on `PATH`, it uses `uv pip` automatically.

---

## Run Pipelines

### macOS / Linux

| Command | Action |
|---------|--------|
| `make preprocess-pipeline` | Run Pipeline 1 only |
| `make lstm-pipeline` | Run Pipelines 1 → 2 |
| `make yield-pipeline` | Run Pipelines 1 → 2 → 3 |
| `make run-all` | Alias for `make yield-pipeline` |

### Windows PowerShell

| Command | Action |
|---------|--------|
| `./make.ps1 preprocess-pipeline` | Run Pipeline 1 only |
| `./make.ps1 lstm-pipeline` | Run Pipelines 1 → 2 |
| `./make.ps1 yield-pipeline` | Run Pipelines 1 → 2 → 3 |
| `./make.ps1 run-all` | Alias for `yield-pipeline` |

Each pipeline target depends on the previous one as a Makefile prerequisite, so stages execute sequentially and stop on failure.

---

## Clean Generated Artifacts

### macOS / Linux
```bash
make clean
```

### Windows PowerShell
```powershell
./make.ps1 clean
```

Deletes everything under `artifacts/`. Baseline files in `data/baselines/` are never removed.

---

## Configuration

All pipeline paths, model paths, stage mappings, spectral indices, BiLSTM window settings, and the 63-column final schema are controlled from:

- [`config.yaml`](config.yaml) — primary configuration file
- [`utils/config.py`](utils/config.py) — config loader with sectional accessors

### Key `config.yaml` sections

| Section | Purpose |
|---------|---------|
| `project` | Name and version |
| `stage_mapping` | Stage name → integer (Transplant=0, Vegetative=1, Reproductive=2, Ripening=3, Harvest=4) |
| `final_target_columns` | The 63 columns that form the BiLSTM handoff schema |
| `paths` | All input/output/artifact file paths |
| `models` | Paths to all model and scaler files |
| `baselines` | Paths to the two baseline CSVs |
| `preprocessing` | Sentinel-2 band list, hazard column names, clean SCL classes, cloud threshold |
| `bilstm` | window_size=10; 25 time-series features; 7 static features |
| `aggregation` | 16 spectral indices; 11 environmental columns |

`utils/config.py` supports dot-notation runtime updates via `update_config("section.key", value)`.

---

## Dependencies

Key packages (see `requirements.txt` for pinned versions):

| Category | Packages |
|----------|----------|
| Data / ML | pandas, numpy, scipy, scikit-learn, tensorflow, joblib |
| Visualisation | matplotlib, seaborn |
| Config / utilities | pyyaml, python-dateutil |
| Notebook support | jupyter, ipykernel |
| Dev / quality | pytest, pytest-cov, black, flake8 |

---

## Reference Notebooks

Three Kaggle-origin notebooks in `notebooks/` serve as the exploratory/development reference for the corresponding production pipeline modules. They are **not runnable locally as-is** because they contain hardcoded Kaggle input paths (`/kaggle/input/...`).

| Notebook | Mirrors |
|----------|---------|
| `ricevision-inference-pipeline1.ipynb` | `pipelines/inference_preprocessing.py` |
| `ricevision-inference-pipeline2.ipynb` | `pipelines/BiLSTM_inference.py` |
| `ricevision-inference-pipeline3-for-yield.ipynb` | `pipelines/yield_inference.py` |

---

## Notes

- Ensure all model and scaler files referenced in `config.yaml` exist before running Pipeline 3. The Lasso yield model (`models/rice_yield_model_final.pkl`) and its scaler (`models/yield_scaler.pkl`) must be present.
- The MLflow/streaming pipeline is not part of this inference-only setup.
- If you use `uv`, the install targets automatically detect and use `uv pip`.
