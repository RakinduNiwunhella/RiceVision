import logging
import os
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

from src.feature_binning import TenDayAggregationStrategy
from src.feature_encoding import (
    DistrictMappingStrategy,
    SeasonEncodingStrategy,
    StageInferenceStrategy,
    add_district_zscore,
)
from src.feature_scaling import SavitzkyGolaySmoothingStrategy, SpectralScalingStrategy
from src.handle_missing_values import RiceVisionMissingValueStrategy

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ModelInference:
    def __init__(
        self,
        model_path: str,
        baseline_path: str = 'artifacts/sri_lanka_district_baselines.csv',
    ):
        self.model_path = model_path
        self.model = None
        self.model_type = None
        self.baseline_path = baseline_path
        self.baseline_df = pd.read_csv(baseline_path) if os.path.exists(baseline_path) else pd.DataFrame()
        self._load_model()

        self.bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
        self.weather_cols = ['rain_1d', 'rain_3d', 'rain_7d', 'rain_14d', 'rain_30d', 'tmean', 'tmin', 'tmax', 't_day', 't_night', 'rh_mean']
        self.terrain_cols = ['elevation', 'slope']

    def _load_model(self) -> None:
        if not os.path.exists(self.model_path):
            logger.warning('Model file not found at %s; running feature-only inference mode', self.model_path)
            return

        try:
            if self.model_path.endswith(('.keras', '.h5')):
                from tensorflow.keras.models import load_model

                self.model = load_model(self.model_path)
                self.model_type = 'keras'
            else:
                self.model = joblib.load(self.model_path)
                self.model_type = 'sklearn'
            logger.info('Loaded model (%s) from %s', self.model_type, self.model_path)
        except Exception as exc:
            logger.warning('Model load failed: %s. Falling back to feature-only mode.', exc)
            self.model = None
            self.model_type = None

    def _drop_unused_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        drop_cols = ['.geo', 'rand', 'constant', 'system:index']
        existing = [col for col in drop_cols if col in out.columns]
        return out.drop(columns=existing) if existing else out

    def _mask_and_fill_spectral(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        out['SCL'] = pd.to_numeric(out.get('SCL', np.nan), errors='coerce').round()
        out['cloud_pct'] = pd.to_numeric(out.get('cloud_pct', 0), errors='coerce').fillna(0)

        valid_classes = [4, 5, 6, 7]
        out['is_clean'] = (out['cloud_pct'] <= 50) & (out['SCL'].isin(valid_classes))

        target_cols = [col for col in self.bands if col in out.columns]
        out.loc[~out['is_clean'], target_cols] = np.nan

        def spatial_fill(group: pd.DataFrame) -> pd.DataFrame:
            clean = group['is_clean']
            if clean.any() and (~clean).any() and {'lat', 'lon'}.issubset(group.columns):
                coords_clean = group.loc[clean, ['lat', 'lon']].values
                vals_clean = group.loc[clean, target_cols].values
                coords_dirty = group.loc[~clean, ['lat', 'lon']].values
                tree = cKDTree(coords_clean)
                _, idx = tree.query(coords_dirty, k=1)
                group.loc[~clean, target_cols] = vals_clean[idx]
            return group

        if 'timestep' in out.columns and {'lat', 'lon'}.issubset(out.columns):
            out = out.groupby('timestep', group_keys=False).apply(spatial_fill)

        def temporal_fill(group: pd.DataFrame) -> pd.DataFrame:
            group = group.sort_values('timestep')
            subset = group[target_cols].copy()
            if subset.isna().any().any():
                subset = subset.interpolate(method='linear', limit_direction='both')
                group[target_cols] = subset
            return group

        if 'pixel_id' in out.columns and 'timestep' in out.columns:
            out = out.groupby('pixel_id', group_keys=False).apply(temporal_fill)

        if out[target_cols].isna().sum().sum() > 0:
            means = out.loc[out['is_clean'], target_cols].mean().fillna(0)
            out[target_cols] = out[target_cols].fillna(means)

        return out

    def _engineer_features(self, df: pd.DataFrame, eps: float = 1e-6) -> pd.DataFrame:
        out = df.copy()
        out['NDVI'] = np.clip((out['B8'] - out['B4']) / (out['B8'] + out['B4'] + eps), -1, 1)
        out['GLI'] = np.clip((2 * out['B3'] - out['B4'] - out['B2']) / (2 * out['B3'] + out['B4'] + out['B2'] + eps), -1, 1)
        out['CVI'] = np.clip((out['B8'] * out['B4']) / (out['B3'] ** 2 + eps), 0, 30)
        out['SIPI'] = np.clip((out['B8'] - out['B2']) / (out['B8'] - out['B4'] + eps), 0, 2)
        out['S2REP'] = np.clip(705 + 35 * (((out['B7'] + out['B4']) / 2 - out['B5']) / (out['B6'] - out['B5'] + eps)), 680, 750)
        out['CCCI'] = np.clip(((out['B8'] - out['B5']) * (out['B8'] + out['B4'])) / (((out['B8'] + out['B5']) * (out['B8'] - out['B4'])) + eps), 0, 2)
        out['RENDVI'] = np.clip((out['B6'] - out['B5']) / (out['B6'] + out['B5'] + eps), -1, 1)
        out['RECI'] = np.clip((out['B8'] / (out['B5'] + eps)) - 1.0, 0, 10)
        out['EVI'] = np.clip((2.5 * (out['B8'] - out['B4'])) / (out['B8'] + 6 * out['B4'] - 7.5 * out['B2'] + 1 + eps), -1, 1)
        out['EVI2'] = np.clip(2.4 * (out['B8'] - out['B4']) / (out['B8'] + out['B4'] + 1 + eps), -1, 1)
        out['NDWI'] = np.clip((out['B4'] - out['B2']) / (out['B4'] + out['B2'] + eps), -1, 1)
        out['NPCRI'] = np.clip((out['B3'] - out['B8']) / (out['B3'] + out['B8'] + eps), -1, 1)
        out['LSWI'] = np.clip((out['B8'] - out['B11']) / (out['B8'] + out['B11'] + eps), -1, 1)
        out['GCI'] = np.clip((out['B8'] / (out['B3'] + eps)) - 1.0, 0, 10)
        out['BSI'] = np.clip((out['B11'] + out['B4'] - out['B8'] - out['B2']) / (out['B11'] + out['B4'] + out['B8'] + out['B2'] + eps), -1, 1)
        out['NDSMI'] = np.clip((out['B8'] - out['B11']) / (out['B8'] + out['B11'] + eps), -1, 1)
        return out

    def _add_velocity_and_cpi(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.sort_values(['pixel_id', 'ten_day_start']).copy()
        out['ndvi_vel'] = out.groupby('pixel_id')['NDVI_median_smooth'].diff().fillna(0)
        out['lswi_vel'] = out.groupby('pixel_id')['LSWI_median_smooth'].diff().fillna(0)
        out['bsi_vel'] = out.groupby('pixel_id')['BSI_median_smooth'].diff().fillna(0)

        if out['pixel_id'].nunique() > 10:
            def safe_robust_z(series: pd.Series):
                if len(series) < 5:
                    return np.zeros(len(series))
                q1, q3 = series.quantile(0.25), series.quantile(0.75)
                iqr = q3 - q1
                denom = max(iqr, 0.05)
                return (series - series.median()) / denom

            groups = out.groupby(['ten_day_start', 'stage_name'])
            out['ndvi_vel_z'] = groups['ndvi_vel'].transform(safe_robust_z)
            out['bsi_z'] = groups['BSI_median_smooth'].transform(safe_robust_z)
            out['lswi_vel_z'] = groups['lswi_vel'].transform(safe_robust_z)
            out['cpi'] = (out['ndvi_vel_z'] * -1.0) + (out['bsi_z'] * 0.8) + (out['lswi_vel_z'] * -0.6)
        else:
            out['ndvi_vel_z'] = 0.0
            out['bsi_z'] = 0.0
            out['lswi_vel_z'] = 0.0
            out['cpi'] = 0.0

        return out

    def preprocess_dataframe(self, input_df: pd.DataFrame) -> pd.DataFrame:
        df = self._drop_unused_columns(input_df)

        df = RiceVisionMissingValueStrategy(self.bands, self.weather_cols, self.terrain_cols).handle(df)
        df = SpectralScalingStrategy().scale_bands(df, self.bands)
        df = self._mask_and_fill_spectral(df)
        df = self._engineer_features(df)

        df = TenDayAggregationStrategy().aggregate(df)
        df = DistrictMappingStrategy().encode(df)

        target_cols = [col for col in df.columns if col.endswith('_median')]
        df = SavitzkyGolaySmoothingStrategy(window_length=5, poly_order=2).smooth(df, target_cols)

        if not self.baseline_df.empty:
            df = StageInferenceStrategy(self.baseline_df).encode(df)
            df = add_district_zscore(df, self.baseline_df)
        else:
            df['stage_name'] = 'Vegetative'
            df['stage'] = 1
            df['ndvi_zscore'] = 0.0

        df = self._add_velocity_and_cpi(df)
        df = SeasonEncodingStrategy().encode(df)

        df.columns = [col.lower() for col in df.columns]
        return df

    def predict_batch(self, input_df: pd.DataFrame) -> pd.DataFrame:
        features_df = self.preprocess_dataframe(input_df)
        result_df = features_df.copy()

        if self.model is None:
            result_df['predicted_stage'] = result_df.get('stage_name', 'Vegetative')
            result_df['confidence'] = 0.0
            return result_df

        feature_cols = [col for col in result_df.columns if col not in {'stage', 'stage_name'}]
        x = result_df[feature_cols].select_dtypes(include=[np.number]).fillna(0)

        if self.model_type == 'keras':
            y = self.model.predict(x.values, verbose=0)
            if y.ndim == 2 and y.shape[1] > 1:
                preds = y.argmax(axis=1)
                conf = y.max(axis=1)
            else:
                conf = y.ravel()
                preds = (conf >= 0.5).astype(int)
        else:
            preds = self.model.predict(x)
            if hasattr(self.model, 'predict_proba'):
                conf = self.model.predict_proba(x).max(axis=1)
            else:
                conf = np.ones(len(preds))

        inverse_stage = {0: 'Transplant', 1: 'Vegetative', 2: 'Reproductive', 3: 'Ripening', 4: 'Harvest'}
        result_df['prediction'] = preds
        result_df['predicted_stage'] = pd.Series(preds).map(inverse_stage).fillna('Unknown')
        result_df['confidence'] = conf
        return result_df

    def predict(self, data: Dict[str, Any]) -> Dict[str, str]:
        if not data:
            raise ValueError('Input data cannot be empty')

        if 'records' in data and isinstance(data['records'], list):
            input_df = pd.DataFrame(data['records'])
        else:
            input_df = pd.DataFrame([data])

        result_df = self.predict_batch(input_df)
        first = result_df.iloc[0]
        return {
            'Status': str(first.get('predicted_stage', first.get('stage_name', 'Unknown'))),
            'Confidence': f"{float(first.get('confidence', 0.0)) * 100:.2f}%",
        }

