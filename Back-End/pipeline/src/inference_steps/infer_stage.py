import pandas as pd


def infer_stage(df: pd.DataFrame, baseline_df: pd.DataFrame | None) -> pd.DataFrame:
    if baseline_df is None:
        df['stage_name'] = 'Vegetative'
        return df

    def get_most_likely_stage(row: pd.Series) -> str:
        dist_base = baseline_df[baseline_df['district'] == row['district']]
        if dist_base.empty:
            return 'Vegetative'
        scores = {}
        for _, base in dist_base.iterrows():
            ndvi_std = max(float(base['ndvi_std']), 1e-6)
            vel_std = max(float(base['vel_std']), 1e-6)
            ndvi_dist = ((row['NDVI_median_smooth'] - base['ndvi_mean']) / ndvi_std) ** 2
            vel_dist = ((row['ndvi_vel'] - base['vel_median']) / vel_std) ** 2
            scores[base['stage_name']] = ndvi_dist + vel_dist
        return min(scores, key=scores.get)

    df['stage_name'] = df.apply(get_most_likely_stage, axis=1)
    return df
