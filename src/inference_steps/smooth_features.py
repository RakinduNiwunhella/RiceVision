import pandas as pd
from scipy.signal import savgol_filter
import logging

logger = logging.getLogger(__name__)
def smooth_features(df: pd.DataFrame, window_length: int = 5, poly_order: int = 2) -> pd.DataFrame:
    logger.info("Starting Savitzky-Golay smoothing (preserving all columns)...")
    
    # 1. Ensure data is sorted for temporal consistency
    df = df.sort_values(by=['pixel_id', 'ten_day_start']).reset_index(drop=True)
    
    target_cols = [col for col in df.columns if col.endswith('_median')]
    
    # 2. Define the smoothing logic as a standalone function for transform
    def apply_savgol(series):
        if len(series) >= window_length:
            return savgol_filter(series, window_length, poly_order)
        return series # Fallback if time-series is too short

    # 3. Use .transform() instead of .apply()
    # This guarantees 'pixel_id' and all other columns stay exactly where they are
    for col in target_cols:
        new_col_name = f"{col}_smooth"
        df[new_col_name] = df.groupby('pixel_id', group_keys=False)[col].transform(apply_savgol)
    
    # 4. Final Verification
    if 'pixel_id' not in df.columns:
        logger.warning("pixel_id hidden in index, resetting...")
        df = df.reset_index()

    logger.info(f"Smoothing complete. Added {len(target_cols)} smoothed features.")
    return df