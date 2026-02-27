import logging
from abc import ABC, abstractmethod
from typing import Dict, List

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class FeatureBinningStrategy(ABC):
    @abstractmethod
    def bin_feature(self, df: pd.DataFrame, column: str) -> pd.DataFrame:
        pass


class TenDayAggregationStrategy:
    """Notebook-aligned 10-day temporal aggregation for inference features."""

    def __init__(self):
        self.spectral_indices = [
            "NDVI", "EVI", "EVI2", "LSWI", "NDWI", "GLI", "GCI", "CVI",
            "SIPI", "RENDVI", "RECI", "CCCI", "S2REP", "BSI", "NPCRI", "NDSMI",
        ]
        self.raw_bands = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "B11", "B12"]
        self.env_cols = [
            "rain_1d", "rain_3d", "rain_7d", "rain_14d", "rain_30d",
            "tmean", "tmax", "tmin", "t_day", "t_night", "rh_mean",
        ]
        self.static_meta = [
            "lat", "lon", "elevation", "slope", "pixel_id", "year", "month", "day",
            "month_day", "is_clean", "timestep", "SCL", "cloud_pct", "date", "district",
        ]

    def aggregate(self, df: pd.DataFrame) -> pd.DataFrame:
        if "date" not in df.columns:
            raise ValueError("Expected 'date' column for 10-day aggregation")
        if "pixel_id" not in df.columns:
            raise ValueError("Expected 'pixel_id' column for 10-day aggregation")

        df = df.copy()
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df[df["date"].notna()].copy()
        df["ten_day"] = df["date"].dt.to_period("10D")

        agg_dict: Dict[str, str] = {}
        for col in (self.spectral_indices + self.raw_bands):
            if col in df.columns:
                agg_dict[col] = "median"
        for col in self.env_cols:
            if col in df.columns:
                agg_dict[col] = "mean"
        for col in self.static_meta:
            if col in df.columns:
                agg_dict[col] = "first"

        df_agg = df.groupby(["pixel_id", "ten_day"], as_index=False).agg(agg_dict)
        df_agg["ten_day_start"] = df_agg["ten_day"].dt.start_time
        df_agg = df_agg.sort_values(["pixel_id", "ten_day_start"])

        df_agg["delta_days"] = (
            df_agg.groupby("pixel_id")["ten_day_start"].diff().dt.days.fillna(10).astype(float)
        )
        df_agg["doy"] = df_agg["ten_day_start"].dt.dayofyear
        df_agg["doy_sin"] = np.sin(2 * np.pi * df_agg["doy"] / 365.25)
        df_agg["doy_cos"] = np.cos(2 * np.pi * df_agg["doy"] / 365.25)

        rename_map = {col: f"{col}_median" for col in self.spectral_indices if col in df_agg.columns}
        rename_map.update({col: f"{col}_mean" for col in self.env_cols if col in df_agg.columns})
        df_agg = df_agg.rename(columns=rename_map).drop(columns=["ten_day"])
        return df_agg


class CustomBinningStratergy(FeatureBinningStrategy):
    """Backward-compatible wrapper; now delegates to 10-day aggregation behavior."""

    def __init__(self, bin_definitions=None):
        self.bin_definitions = bin_definitions or {}

    def bin_feature(self, df: pd.DataFrame, column: str) -> pd.DataFrame:
        return df

    def aggregate_ten_day(self, df: pd.DataFrame) -> pd.DataFrame:
        return TenDayAggregationStrategy().aggregate(df)