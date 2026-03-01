import numpy as np
import pandas as pd


def rescaling_and_masking(full_dataset: pd.DataFrame) -> pd.DataFrame:
    bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    existing_bands = [col for col in bands if col in full_dataset.columns]

    full_dataset[existing_bands] = full_dataset[existing_bands].astype('float32') / 10000.0

    clean_mask = (
        full_dataset['SCL'].astype(float).round().isin([4, 5, 6, 7])
    ) & (full_dataset['cloud_pct'] <= 50)

    full_dataset.loc[~clean_mask, existing_bands] = np.nan
    full_dataset['is_clean'] = clean_mask
    return full_dataset
