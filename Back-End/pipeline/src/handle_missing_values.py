import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from scipy.spatial import KDTree

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class MissingValueHandlingStrategy(ABC):
    @abstractmethod
    def handle(self, df: pd.DataFrame) -> pd.DataFrame:
        pass


class DropMissingValuesStrategy(MissingValueHandlingStrategy):
    def __init__(self, critical_columns: Optional[List[str]] = None):
        self.critical_columns = critical_columns or []

    def handle(self, df: pd.DataFrame) -> pd.DataFrame:
        return df.dropna(subset=self.critical_columns)


class FillMissingValuesStrategy(MissingValueHandlingStrategy):
    def __init__(self, fill_value: float = 0.0, critical_column: Optional[List[str]] = None):
        self.fill_value = fill_value
        self.critical_column = critical_column or []

    def handle(self, df: pd.DataFrame) -> pd.DataFrame:
        if not self.critical_column:
            return df.fillna(self.fill_value)
        df[self.critical_column] = df[self.critical_column].fillna(self.fill_value)
        return df


class RiceVisionMissingValueStrategy(MissingValueHandlingStrategy):
    """Notebook-aligned cleaning and imputation for RiceVision inference."""

    def __init__(
        self,
        bands: List[str],
        weather_cols: List[str],
        terrain_cols: List[str],
    ):
        self.bands = bands
        self.weather_cols = weather_cols
        self.terrain_cols = terrain_cols

    @staticmethod
    def _mode_or_nan(series: pd.Series):
        modes = series.mode(dropna=True)
        return modes.iloc[0] if not modes.empty else np.nan

    def _spatial_impute_weather(self, df: pd.DataFrame, weather_cols: List[str]) -> pd.DataFrame:
        if "timestep" not in df.columns or "lat" not in df.columns or "lon" not in df.columns:
            return df

        for timestep in df["timestep"].dropna().unique():
            ts_mask = df["timestep"] == timestep
            for col in weather_cols:
                if col not in df.columns or not df.loc[ts_mask, col].isnull().any():
                    continue

                valid = df[ts_mask & df[col].notnull()]
                missing = df[ts_mask & df[col].isnull()]
                if valid.empty or missing.empty:
                    continue

                tree = KDTree(valid[["lat", "lon"]].values)
                _, idx = tree.query(missing[["lat", "lon"]].values)
                df.loc[missing.index, col] = valid.iloc[idx][col].values

        return df

    def _repair_dates(self, df: pd.DataFrame) -> pd.DataFrame:
        if "date" not in df.columns or "pixel_id" not in df.columns or "timestep" not in df.columns:
            return df

        df["date"] = pd.to_datetime(df["date"], errors="coerce")

        def fix_dates(group: pd.DataFrame) -> pd.DataFrame:
            has_missing = group["date"].isnull().any()
            has_valid = group["date"].notnull().any()
            if not (has_missing and has_valid):
                return group

            anchor = group[group["date"].notnull()].iloc[0]
            group["date"] = group.apply(
                lambda row: anchor["date"] + pd.Timedelta(days=(anchor["timestep"] - row["timestep"]) * 15)
                if pd.isna(row["date"])
                else row["date"],
                axis=1,
            )
            return group

        return df.groupby("pixel_id", group_keys=False).apply(fix_dates)

    def handle(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        existing_bands = [col for col in self.bands if col in df.columns]
        existing_weather = [col for col in self.weather_cols if col in df.columns]
        existing_terrain = [col for col in self.terrain_cols if col in df.columns]

        for col in existing_bands:
            df[col] = pd.to_numeric(df[col], errors="coerce").astype("float32")

        if "SCL" in df.columns:
            df["SCL"] = pd.to_numeric(df["SCL"], errors="coerce")

        if "pixel_id" in df.columns and "timestep" in df.columns:
            df = df.sort_values(by=["pixel_id", "timestep"], ascending=[True, False]).copy()

        if existing_weather:
            df = self._spatial_impute_weather(df, existing_weather)

        if existing_terrain and "pixel_id" in df.columns:
            df[existing_terrain] = df.groupby("pixel_id")[existing_terrain].ffill().bfill()

        if "SCL" in df.columns and "pixel_id" in df.columns:
            df["SCL"] = df.groupby("pixel_id")["SCL"].transform(lambda x: x.fillna(self._mode_or_nan(x)))

        if "cloud_pct" in df.columns and "pixel_id" in df.columns:
            df["cloud_pct"] = df.groupby("pixel_id")["cloud_pct"].transform(lambda x: x.fillna(x.mean()))

        if existing_bands and "pixel_id" in df.columns:
            df[existing_bands] = df.groupby("pixel_id", group_keys=False)[existing_bands].apply(
                lambda group: group.interpolate(method="linear", limit_direction="both")
            )

        if existing_weather and "pixel_id" in df.columns:
            df[existing_weather] = df.groupby("pixel_id")[existing_weather].ffill()

        df = self._repair_dates(df)

        if df.isnull().sum().sum() > 0:
            df = df.fillna(df.median(numeric_only=True)).fillna(0)

        logger.info("RiceVision missing-value handling completed: %s", df.shape)
        return df
    
