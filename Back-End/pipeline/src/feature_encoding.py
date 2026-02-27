import logging
from abc import ABC, abstractmethod
from typing import Dict, Optional

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


DISTRICT_CENTERS = {
    "Ampara": (7.28, 81.67), "Anuradhapura": (8.31, 80.41), "Badulla": (6.99, 81.05),
    "Batticaloa": (7.71, 81.70), "Colombo": (6.92, 79.86), "Galle": (6.05, 80.22),
    "Gampaha": (7.08, 80.00), "Hambantota": (6.14, 81.12), "Jaffna": (9.66, 80.01),
    "Kaluthara": (6.58, 79.96), "Kandy": (7.29, 80.63), "Kegalle": (7.25, 80.34),
    "Kilinochchi": (9.38, 80.40), "Kurunegala": (7.48, 80.36), "Mannar": (8.98, 79.91),
    "Matale": (7.46, 80.62), "Matara": (5.94, 80.53), "Monaragala": (6.87, 81.35),
    "Mullaitivu": (9.27, 80.81), "Nuwara Eliya": (6.97, 80.78), "Polonnaruwa": (7.94, 81.00),
    "Puttalam": (8.03, 79.82), "Ratnapura": (6.68, 80.40), "Trincomalee": (8.57, 81.23),
    "Vavuniya": (8.75, 80.50),
}

STAGE_MAP = {
    "Transplant": 0,
    "Vegetative": 1,
    "Reproductive": 2,
    "Ripening": 3,
    "Harvest": 4,
}


class FeatureEncodingStrategy(ABC):
    @abstractmethod
    def encode(self, df: pd.DataFrame) -> pd.DataFrame:
        pass


class DistrictMappingStrategy(FeatureEncodingStrategy):
    def encode(self, df: pd.DataFrame) -> pd.DataFrame:
        if "district" in df.columns:
            return df
        if not {"lat", "lon"}.issubset(df.columns):
            return df

        pixel_coords = df[["pixel_id", "lat", "lon"]].drop_duplicates().copy()

        def closest_district(row: pd.Series) -> str:
            distances = {
                district: np.sqrt((row["lat"] - center[0]) ** 2 + (row["lon"] - center[1]) ** 2)
                for district, center in DISTRICT_CENTERS.items()
            }
            return min(distances, key=distances.get)

        pixel_coords["district"] = pixel_coords.apply(closest_district, axis=1)
        return df.merge(pixel_coords[["pixel_id", "district"]], on="pixel_id", how="left")


class StageInferenceStrategy(FeatureEncodingStrategy):
    def __init__(self, baseline_df: pd.DataFrame):
        self.baseline_df = baseline_df.copy()

    def encode(self, df: pd.DataFrame) -> pd.DataFrame:
        required = {"district", "NDVI_median_smooth", "ndvi_vel"}
        if not required.issubset(df.columns):
            return df

        def infer_row(row: pd.Series) -> str:
            district_base = self.baseline_df[self.baseline_df["district"] == row["district"]]
            if district_base.empty:
                return "Vegetative"

            scores: Dict[str, float] = {}
            for _, base in district_base.iterrows():
                ndvi_std = max(float(base.get("ndvi_std", 1.0)), 1e-6)
                vel_std = max(float(base.get("vel_std", 1.0)), 1e-6)
                ndvi_dist = ((row["NDVI_median_smooth"] - base["ndvi_mean"]) / ndvi_std) ** 2
                vel_dist = ((row["ndvi_vel"] - base["vel_median"]) / vel_std) ** 2
                scores[str(base["stage_name"])] = ndvi_dist + vel_dist

            return min(scores, key=scores.get)

        out = df.copy()
        out["stage_name"] = out.apply(infer_row, axis=1)
        out["stage"] = out["stage_name"].map(STAGE_MAP).fillna(1).astype(int)
        return out


class SeasonEncodingStrategy(FeatureEncodingStrategy):
    def encode(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        if "ten_day_start" in out.columns:
            out["month"] = pd.to_datetime(out["ten_day_start"]).dt.month
        elif "date" in out.columns:
            out["month"] = pd.to_datetime(out["date"]).dt.month
        else:
            return out

        out["season"] = np.where(out["month"].isin([4, 5, 6, 7, 8]), "Yala", "Maha")
        return out


def add_district_zscore(df: pd.DataFrame, baseline_df: pd.DataFrame) -> pd.DataFrame:
    if not {"district", "stage_name", "NDVI_median_smooth"}.issubset(df.columns):
        return df

    merged = df.merge(
        baseline_df[["district", "stage_name", "ndvi_mean", "ndvi_std"]],
        on=["district", "stage_name"],
        how="left",
    )
    denom = merged["ndvi_std"].replace(0, np.nan)
    merged["ndvi_zscore"] = ((merged["NDVI_median_smooth"] - merged["ndvi_mean"]) / denom).fillna(0).clip(-3, 3)
    return merged


class NominalEncodingStrategy(FeatureEncodingStrategy):
    def __init__(self, nominal_columns):
        self.nominal_columns = nominal_columns

    def encode(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        for column in self.nominal_columns:
            if column in out.columns:
                out[column] = out[column].astype("category").cat.codes
        return out


class OrdinalEncodingStratergy(FeatureEncodingStrategy):
    def __init__(self, ordinal_mappings: Optional[Dict[str, Dict[str, int]]]):
        self.ordinal_mappings = ordinal_mappings or {}

    def encode(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        for column, mapping in self.ordinal_mappings.items():
            if column in out.columns:
                out[column] = out[column].map(mapping)
        return out

            

