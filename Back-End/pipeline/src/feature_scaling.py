import logging
from abc import ABC, abstractmethod
from typing import List

import numpy as np
import pandas as pd
from scipy.signal import savgol_filter
from sklearn.preprocessing import StandardScaler

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class FeatureScalingStrategy(ABC):
    @abstractmethod
    def scale(self, df: pd.DataFrame, columns_to_scale: List[str]) -> pd.DataFrame:
        pass


class SpectralScalingStrategy:
    def __init__(self, scale_factor: float = 10000.0):
        self.scale_factor = scale_factor

    def scale_bands(self, df: pd.DataFrame, band_columns: List[str]) -> pd.DataFrame:
        out = df.copy()
        existing = [col for col in band_columns if col in out.columns]
        if existing:
            out[existing] = out[existing].astype("float32") / self.scale_factor
        return out


class SavitzkyGolaySmoothingStrategy:
    def __init__(self, window_length: int = 5, poly_order: int = 2):
        self.window_length = window_length
        self.poly_order = poly_order

    def smooth(self, df: pd.DataFrame, target_columns: List[str]) -> pd.DataFrame:
        out = df.sort_values(["pixel_id", "ten_day_start"]).copy()

        def smooth_group(group: pd.DataFrame) -> pd.DataFrame:
            if len(group) < self.window_length:
                for col in target_columns:
                    if col in group.columns:
                        group[f"{col}_smooth"] = group[col]
                return group

            for col in target_columns:
                if col in group.columns:
                    group[f"{col}_smooth"] = savgol_filter(group[col], self.window_length, self.poly_order)
            return group

        return out.groupby("pixel_id", group_keys=False).apply(smooth_group)


class StandardScalingStratergy(FeatureScalingStrategy):
    def __init__(self):
        self.scaler = StandardScaler()
        self.fitted = False

    def transform(self, df: pd.DataFrame, columns_to_transform: List[str]) -> pd.DataFrame:
        out = df.copy()
        for col in columns_to_transform:
            if col in out.columns:
                out[col] = np.log1p(out[col])
        return out

    def scale(self, df: pd.DataFrame, columns_to_scale: List[str]) -> pd.DataFrame:
        out = df.copy()
        existing = [col for col in columns_to_scale if col in out.columns]
        if not existing:
            return out
        out[existing] = self.scaler.fit_transform(out[existing])
        self.fitted = True
        return out

    def get_scaler(self):
        return self.scaler

