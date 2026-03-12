import numpy as np
import pandas as pd


def engineer_features(df: pd.DataFrame, eps: float = 1e-6) -> pd.DataFrame:
    df['NDVI'] = np.clip((df['B8'] - df['B4']) / (df['B8'] + df['B4'] + eps), -1, 1)
    df['GLI'] = np.clip((2 * df['B3'] - df['B4'] - df['B2']) / (2 * df['B3'] + df['B4'] + df['B2'] + eps), -1, 1)
    df['CVI'] = np.clip((df['B8'] * df['B4']) / (df['B3'] ** 2 + eps), 0, 30)
    df['SIPI'] = np.clip((df['B8'] - df['B2']) / (df['B8'] - df['B4'] + eps), 0, 2)
    df['S2REP'] = np.clip(705 + 35 * (((df['B7'] + df['B4']) / 2 - df['B5']) / (df['B6'] - df['B5'] + eps)), 680, 750)
    df['CCCI'] = np.clip(((df['B8'] - df['B5']) * (df['B8'] + df['B4'])) / (((df['B8'] + df['B5']) * (df['B8'] - df['B4'])) + eps), 0, 2)
    df['RENDVI'] = np.clip((df['B6'] - df['B5']) / (df['B6'] + df['B5'] + eps), -1, 1)
    df['RECI'] = np.clip((df['B8'] / (df['B5'] + eps)) - 1.0, 0, 10)
    df['EVI'] = np.clip((2.5 * (df['B8'] - df['B4'])) / (df['B8'] + 6 * df['B4'] - 7.5 * df['B2'] + 1 + eps), -1, 1)
    df['EVI2'] = np.clip(2.4 * (df['B8'] - df['B4']) / (df['B8'] + df['B4'] + 1 + eps), -1, 1)
    df['NDWI'] = np.clip((df['B4'] - df['B2']) / (df['B4'] + df['B2'] + eps), -1, 1)
    df['NPCRI'] = np.clip((df['B3'] - df['B8']) / (df['B3'] + df['B8'] + eps), -1, 1)
    df['LSWI'] = np.clip((df['B8'] - df['B11']) / (df['B8'] + df['B11'] + eps), -1, 1)
    df['GCI'] = np.clip((df['B8'] / (df['B3'] + eps)) - 1.0, 0, 10)
    df['BSI'] = np.clip((df['B11'] + df['B4'] - df['B8'] - df['B2']) / (df['B11'] + df['B4'] + df['B8'] + df['B2'] + eps), -1, 1)
    df['NDSMI'] = np.clip((df['B8'] - df['B11']) / (df['B8'] + df['B11'] + eps), -1, 1)
    return df
