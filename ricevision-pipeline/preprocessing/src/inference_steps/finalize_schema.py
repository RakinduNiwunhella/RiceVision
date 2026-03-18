import pandas as pd

from utils.config import get_final_target_columns


def finalize_schema(df: pd.DataFrame, stage_mapping) -> pd.DataFrame:
    df.columns = [col.lower() for col in df.columns]
    final_target_columns = get_final_target_columns()
    if not final_target_columns:
        final_target_columns = df.columns.tolist()
    existing = [col for col in final_target_columns if col in df.columns]
    final_df = df[existing].copy()
    if 'stage_name' in final_df.columns:
        final_df['stage'] = final_df['stage_name'].map(stage_mapping).fillna(1).astype(int)
    return final_df
