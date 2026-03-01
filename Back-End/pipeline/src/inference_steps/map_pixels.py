from pathlib import Path
import logging

import pandas as pd

logger = logging.getLogger(__name__)


def map_pixels(
    df: pd.DataFrame,
    artifacts_dir: str | Path | None = None,
    coords_filename: str = 'unique_coordinates.csv',
) -> pd.DataFrame:
    logger.info('Extracting coordinate lookup table...')

    required = {'pixel_id', 'lat', 'lon'}
    missing_required = required.difference(df.columns)
    if missing_required:
        raise ValueError(f"Missing required columns for coordinate lookup: {sorted(missing_required)}")

    coords_lookup = df[['pixel_id', 'lat', 'lon']].drop_duplicates(subset=['pixel_id']).copy()
    logger.info('Coordinate lookup rows: %d', len(coords_lookup))

    if artifacts_dir is not None:
        artifacts_path = Path(artifacts_dir)
        artifacts_path.mkdir(parents=True, exist_ok=True)
        out_path = artifacts_path / coords_filename
        coords_lookup.to_csv(out_path, index=False)
        logger.info('Saved coordinate lookup to %s', out_path)
    else:
        coords_lookup.to_csv(coords_filename, index=False)
        logger.info('Saved coordinate lookup to %s', coords_filename)

    return df


def map_districts(
    df: pd.DataFrame,
    district_centers=None,
    artifacts_dir: str | Path | None = None,
    coords_filename: str = 'unique_coordinates.csv',
) -> pd.DataFrame:
    _ = district_centers
    return map_pixels(df=df, artifacts_dir=artifacts_dir, coords_filename=coords_filename)
