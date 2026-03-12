from pathlib import Path
import logging

import pandas as pd

logger = logging.getLogger(__name__)


def merge_coordinates(results_df: pd.DataFrame, coords_csv: str | Path) -> pd.DataFrame:
    coords_path = Path(coords_csv)
    if not coords_path.exists():
        logger.warning('Coordinates file not found: %s. Skipping merge.', coords_path)
        return results_df

    df_coord = pd.read_csv(coords_path)
    logger.info('Merging coordinates into results dataframe from %s', coords_path)
    merged = results_df.merge(df_coord, on='pixel_id', how='left')
    return merged
