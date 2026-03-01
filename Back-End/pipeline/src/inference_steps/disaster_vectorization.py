import pandas as pd


def vectorize_disasters(df: pd.DataFrame) -> pd.DataFrame:
    hazard_cols = [
        'hazard_DROUGHT', 'hazard_FLOOD', 'hazard_HEAVY_RAIN',
        'hazard_LANDSLIDE', 'hazard_LIGHTNING', 'hazard_WIND',
    ]

    existing = [col for col in hazard_cols if col in df.columns]
    if existing:
        df[existing] = df[existing].astype(int)

    lower_aliases = {
        'hazard_DROUGHT': 'hazard_drought',
        'hazard_FLOOD': 'hazard_flood',
        'hazard_HEAVY_RAIN': 'hazard_heavy_rain',
        'hazard_LANDSLIDE': 'hazard_landslide',
        'hazard_LIGHTNING': 'hazard_lightning',
        'hazard_WIND': 'hazard_wind',
    }
    for upper_col, lower_col in lower_aliases.items():
        if upper_col in df.columns and lower_col not in df.columns:
            df[lower_col] = df[upper_col].astype(int)

    df.info()
    return df
