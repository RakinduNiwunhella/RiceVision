import logging
from abc import ABC, abstractmethod
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class DataSplittingStrategy(ABC):
    @abstractmethod
    def split_data(self, df: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        pass


class SimpleTrainTestSplitStratergy(DataSplittingStrategy):
    def __init__(self, test_size: float = 0.2, random_state: int = 42):
        self.test_size = test_size
        self.random_state = random_state

    def split_data(self, df: pd.DataFrame, target_column: str):
        y = df[target_column]
        x = df.drop(columns=[target_column])
        return train_test_split(
            x,
            y,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=y if y.nunique() > 1 else None,
        )


class PixelSequenceSplitStrategy:
    """Create fixed-length sequence windows per pixel for temporal models."""

    def __init__(self, sequence_length: int = 10):
        self.sequence_length = sequence_length

    def create_sequences(
        self,
        df: pd.DataFrame,
        feature_columns,
        target_column: str,
    ):
        if "pixel_id" not in df.columns:
            raise ValueError("Expected 'pixel_id' column for sequence splitting")
        if "ten_day_start" not in df.columns:
            raise ValueError("Expected 'ten_day_start' column for sequence splitting")

        x_seqs, y_seqs, pixel_refs = [], [], []
        sorted_df = df.sort_values(["pixel_id", "ten_day_start"]).copy()

        for pixel_id, group in sorted_df.groupby("pixel_id"):
            values = group[feature_columns].to_numpy(dtype=np.float32)
            targets = group[target_column].to_numpy()

            if len(group) < self.sequence_length:
                continue

            for start_idx in range(0, len(group) - self.sequence_length + 1):
                end_idx = start_idx + self.sequence_length
                x_seqs.append(values[start_idx:end_idx])
                y_seqs.append(targets[end_idx - 1])
                pixel_refs.append(pixel_id)

        return np.array(x_seqs), np.array(y_seqs), np.array(pixel_refs)