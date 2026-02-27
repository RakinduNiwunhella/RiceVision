import pandas as pd

from .constants import FINAL_TARGET_COLUMNS


def finalize_schema(df: pd.DataFrame, stage_mapping) -> pd.DataFrame:
    df.columns = [col.lower() for col in df.columns]
    existing = [col for col in FINAL_TARGET_COLUMNS if col in df.columns]
    final_df = df[existing].copy()
    if 'stage_name' in final_df.columns:
        final_df['stage'] = final_df['stage_name'].map(stage_mapping).fillna(1).astype(int)
    return final_df
