import argparse
import logging
import os
from typing import Optional

import pandas as pd

from src.inference_steps import (
    DISTRICT_CENTERS,
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
    map_districts,
    mask_and_fill_spectral,
    smooth_features,
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class RiceVisionInferencePipeline:
    def __init__(self, baseline_path: Optional[str] = None):
        self.baseline_path = baseline_path
        self.baseline_df = pd.read_csv(baseline_path) if baseline_path and os.path.exists(baseline_path) else None
        self.bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
        self.weather_cols = ['rain_1d', 'rain_3d', 'rain_7d', 'rain_14d', 'rain_30d', 'tmean', 'tmin', 'tmax', 't_day', 't_night', 'rh_mean']
        self.terrain_cols = ['elevation', 'slope']

    def run(self, input_df: pd.DataFrame) -> pd.DataFrame:
        df = input_df.copy()
        df = self._drop_unnecessary_columns(df)
        df = self._handle_missing_values(df)
        df = self._mask_and_fill_spectral(df)
        df = self._engineer_features(df)
        df = self._aggregate_10day(df)
        df = self._map_districts(df)
        df = self._smooth_features(df)
        df = self._add_velocities(df)
        df = self._infer_stage(df)
        df = self._add_ndvi_zscore(df)
        df = self._add_cpi(df)
        df = self._add_season(df)
        df = self._finalize_schema(df)
        return df

    def _drop_unnecessary_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        return drop_unnecessary_columns(df)

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        return handle_missing_values(df, self.bands, self.weather_cols, self.terrain_cols)

    def _mask_and_fill_spectral(self, df: pd.DataFrame) -> pd.DataFrame:
        return mask_and_fill_spectral(df, self.bands)

    def _engineer_features(self, df: pd.DataFrame, eps: float = 1e-6) -> pd.DataFrame:
        return engineer_features(df, eps)

    def _aggregate_10day(self, df: pd.DataFrame) -> pd.DataFrame:
        return aggregate_10day(df)

    def _map_districts(self, df: pd.DataFrame) -> pd.DataFrame:
        return map_districts(df, DISTRICT_CENTERS)

    def _smooth_features(self, df: pd.DataFrame, window_length: int = 5, poly_order: int = 2) -> pd.DataFrame:
        return smooth_features(df, window_length, poly_order)

    def _add_velocities(self, df: pd.DataFrame) -> pd.DataFrame:
        return add_velocities(df)

    def _infer_stage(self, df: pd.DataFrame) -> pd.DataFrame:
        return infer_stage(df, self.baseline_df)

    def _add_ndvi_zscore(self, df: pd.DataFrame) -> pd.DataFrame:
        return add_ndvi_zscore(df, self.baseline_df)

    def _add_cpi(self, df: pd.DataFrame) -> pd.DataFrame:
        return add_cpi(df)

    def _add_season(self, df: pd.DataFrame) -> pd.DataFrame:
        return add_season(df)

    def _finalize_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        return finalize_schema(df, STAGE_MAPPING)


def run_inference_pipeline(input_csv: str, output_csv: str, baseline_csv: Optional[str] = None) -> pd.DataFrame:
    logger.info('Loading input data from %s', input_csv)
    input_df = pd.read_csv(input_csv)

    pipeline = RiceVisionInferencePipeline(baseline_path=baseline_csv)
    result_df = pipeline.run(input_df)

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    result_df.to_csv(output_csv, index=False)
    logger.info('Inference pipeline completed. Output saved to %s', output_csv)
    return result_df


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run single RiceVision inference-only pipeline')
    parser.add_argument('--input', default='data/raw/inference_v1.csv', help='Input CSV path')
    parser.add_argument('--output', default='artifacts/predictions/ricevision_inference_features.csv', help='Output CSV path')
    parser.add_argument('--baseline', default='artifacts/sri_lanka_district_baselines.csv', help='District baseline CSV path')
    args = parser.parse_args()

    output = run_inference_pipeline(input_csv=args.input, output_csv=args.output, baseline_csv=args.baseline)
    print(output.head())