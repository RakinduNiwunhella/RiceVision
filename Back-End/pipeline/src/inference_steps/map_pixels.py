from pathlib import Path

import pandas as pd


def map_districts(
    df: pd.DataFrame,
    district_centers=None,
    artifacts_dir: str | Path | None = None,
    coords_filename: str = 'unique_coordinates.csv',
) -> pd.DataFrame:
    print('📍 Extracting coordinate lookup table...')

    required = {'pixel_id', 'lat', 'lon'}
    missing_required = required.difference(df.columns)
    if missing_required:
        raise ValueError(f"Missing required columns for coordinate lookup: {sorted(missing_required)}")

    coords_lookup = df[['pixel_id', 'lat', 'lon']].drop_duplicates(subset=['pixel_id']).copy()
    coords_lookup.info()

    if artifacts_dir is not None:
        artifacts_path = Path(artifacts_dir)
        artifacts_path.mkdir(parents=True, exist_ok=True)
        coords_lookup.to_csv(artifacts_path / coords_filename, index=False)
    else:
        coords_lookup.to_csv(coords_filename, index=False)

    return df
