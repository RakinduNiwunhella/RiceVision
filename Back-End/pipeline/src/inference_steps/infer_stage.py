import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def infer_stage(df: pd.DataFrame, baseline_df: pd.DataFrame | None) -> pd.DataFrame:
    logger.info('Starting statistical stage inference (district-matched)...')

    if baseline_df is None:
        logger.warning('Baseline dataframe is missing; defaulting stage_name to Vegetative.')
        df['stage_name'] = 'Vegetative'
        return df

    baselines = baseline_df.copy()
    baselines['district'] = baselines['district'].astype(str).str.strip()

    df['district'] = df['district'].astype(str).str.strip()
    df['ndvi_vel'] = df.groupby('pixel_id')['NDVI_median_smooth'].diff().fillna(0)

    baseline_districts = baselines['district'].unique()
    logger.info('Found %d districts in baseline file.', len(baseline_districts))

    def get_most_likely_stage(row: pd.Series) -> str:
        if row['district'] not in baseline_districts:
            return np.nan

        dist_base = baselines[baselines['district'] == row['district']]
        if dist_base.empty:
            return np.nan

        scores = {}
        for _, base in dist_base.iterrows():
            ndvi_std = max(float(base['ndvi_std']), 1e-6)
            vel_std = max(float(base['vel_std']), 1e-6)
            ndvi_dist = ((row['NDVI_median_smooth'] - base['ndvi_mean']) / ndvi_std) ** 2
            vel_dist = ((row['ndvi_vel'] - base['vel_median']) / vel_std) ** 2
            scores[base['stage_name']] = ndvi_dist + vel_dist

        return min(scores, key=scores.get)

    df['stage_name'] = df.apply(get_most_likely_stage, axis=1)

    skipped_count = int(df['stage_name'].isna().sum())
    processed_count = int(len(df) - skipped_count)
    logger.info('Inference results - processed: %d, skipped: %d', processed_count, skipped_count)

    if skipped_count > 0:
        missing = [d for d in df['district'].dropna().unique() if d not in baseline_districts]
        logger.warning('Skipped districts not in baseline: %s', missing)

    logger.info('Statistical stage inference complete.')
    return df
