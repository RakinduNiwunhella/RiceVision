import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def infer_stage(df: pd.DataFrame, baseline_df: pd.DataFrame | None) -> pd.DataFrame:
    print("🧠 Starting Statistical Stage Inference (District-Matched)...")

    try:
        baselines = baseline_df.copy() if baseline_df is not None else None
        if baselines is None:
            raise FileNotFoundError
        baselines['district'] = baselines['district'].str.strip()
    except FileNotFoundError:
        print("❌ Baseline file not found!")
        return df

    df['district'] = df['district'].str.strip()
    df['ndvi_vel'] = df.groupby('pixel_id')['NDVI_median_smooth'].diff().fillna(0)

    baseline_districts = baselines['district'].unique()
    print(f"✅ Found {len(baseline_districts)} districts in baseline file.")

    def get_most_likely_stage(row):
        if row['district'] not in baseline_districts:
            return np.nan

        dist_base = baselines[baselines['district'] == row['district']]

        if dist_base.empty:
            return np.nan

        scores = {}
        for _, b in dist_base.iterrows():
            ndvi_dist = ((row['NDVI_median_smooth'] - b['ndvi_mean']) / b['ndvi_std'])**2
            vel_dist = ((row['ndvi_vel'] - b['vel_median']) / b['vel_std'])**2
            scores[b['stage_name']] = ndvi_dist + vel_dist

        return min(scores, key=scores.get)

    df['stage_name'] = df.apply(get_most_likely_stage, axis=1)

    skipped_count = df['stage_name'].isna().sum()
    processed_count = len(df) - skipped_count

    print(f"📊 Inference Results:")
    print(f"   - Processed: {processed_count} rows")
    print(f"   - Skipped:   {skipped_count} rows (Districts not in baseline)")

    if skipped_count > 0:
        missing = [d for d in df['district'].unique() if d not in baseline_districts]
        print(f"   - Skipped Districts: {missing}")

    print("✅ Statistical inference complete.")
    return df
