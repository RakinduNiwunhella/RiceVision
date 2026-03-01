import pandas as pd

from .filling_nans import filling_nans
from .rescaling_and_masking import rescaling_and_masking


def mask_and_fill_spectral(df: pd.DataFrame, bands) -> pd.DataFrame:
    _ = bands
    df = rescaling_and_masking(df)
    return filling_nans(df)
