import joblib
import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def add_season(df: pd.DataFrame, district_encoder_path: str | None = None) -> pd.DataFrame:
    if 'ten_day_start' in df.columns:
        df['month'] = pd.to_datetime(df['ten_day_start']).dt.month

    if 'month' not in df.columns and 'date' in df.columns:
        df['month'] = pd.to_datetime(df['date']).dt.month

    if 'year' not in df.columns and 'date' in df.columns:
        df['year'] = pd.to_datetime(df['date']).dt.year

    df['season'] = np.where(df['month'].isin([4, 5, 6, 7, 8]), 'Yala', 'Maha')

    if 'ten_day_start' in df.columns:
        logger.info('Season sample:\n%s', df[['ten_day_start', 'month', 'season']].head().to_string(index=False))

    if district_encoder_path and 'district' in df.columns:
        spelling_fixes = {
            'Kalutara': 'Kaluthara',
            'kalutara': 'Kaluthara',
            'Kaluthara ': 'Kaluthara',
        }

        df['district'] = df['district'].replace(spelling_fixes)
        df['district'] = df['district'].astype(str).str.strip()

        le = joblib.load(district_encoder_path)
        try:
            df['district_id'] = le.transform(df['district'])
            logger.info('District encoding successful.')
        except ValueError as e:
            logger.warning('Still missing a district label: %s', e)

    cond_yala = (df['month'] >= 5) & (df['month'] <= 8)
    cond_maha_p2 = (df['month'] <= 3)

    df['season_id'] = np.where(cond_yala, 1, 0)
    df['cycle_id'] = np.select(
        [cond_yala, cond_maha_p2],
        [
            df['year'].astype(str) + '_Yala',
            (df['year'] - 1).astype(str) + '_' + df['year'].astype(str) + '_Maha',
        ],
        default=df['year'].astype(str) + '_' + (df['year'] + 1).astype(str) + '_Maha',
    )
    logger.info('Season encoding successful.')
    return df
