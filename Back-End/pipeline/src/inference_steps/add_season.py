import joblib
import numpy as np
import pandas as pd


def add_season(df: pd.DataFrame, district_encoder_path: str | None = None) -> pd.DataFrame:
    if 'ten_day_start' in df.columns:
        df['month'] = pd.to_datetime(df['ten_day_start']).dt.month

    if 'month' not in df.columns and 'date' in df.columns:
        df['month'] = pd.to_datetime(df['date']).dt.month

    if 'year' not in df.columns and 'date' in df.columns:
        df['year'] = pd.to_datetime(df['date']).dt.year

    df['season'] = np.where(df['month'].isin([4, 5, 6, 7, 8]), 'Yala', 'Maha')

    if 'ten_day_start' in df.columns:
        print(df[['ten_day_start', 'month', 'season']].head())

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
            print('✅ District encoding successful!')
        except ValueError as e:
            print(f'❌ Still missing a label: {e}')

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
    print('season encoding successsful')
    return df

# # 2. Extract the month
# df['month'] = df['ten_day_start'].dt.month

# # 3. Define the season logic
# # If month is between 4 (April) and 8 (August), it's Yala. Otherwise, it's Maha.
# df['season'] = np.where(df['month'].isin([4, 5, 6, 7, 8]), 'Yala', 'Maha')

# # Example check:
# # A date like '2022-01-15' has month 1, which will be assigned 'Maha'
# print(df[['ten_day_start', 'month', 'season']].head())

# # import joblib
# le = joblib.load("/kaggle/input/models/sanilawijesekara/encoder-scaler/scikitlearn/default/1/district_encoder.joblib")
# # 1. Standardize spelling to match the LabelEncoder classes
# # We change 'Kalutara' -> 'Kaluthara' and 'Nuwara-Eliya' -> 'Nuwara Eliya' if needed
# spelling_fixes = {
#     'Kalutara': 'Kaluthara',
#     'kalutara': 'Kaluthara',
#     'Kaluthara ': 'Kaluthara' # In case of trailing spaces
# }

# df['district'] = df['district'].replace(spelling_fixes)

# # 2. Safety Step: Strip any accidental whitespace
# df['district'] = df['district'].str.strip()

# # 3. Now perform the transformation
# try:
#     df['district_id'] = le.transform(df['district'])
#     print("✅ District encoding successful!")
# except ValueError as e:
#     # If it still fails, this will tell us exactly which name is the problem
#     print(f"❌ Still missing a label: {e}")
# # Vectorized Season/Cycle Logic
# cond_yala = (df['month'] >= 5) & (df['month'] <= 8)
# cond_maha_p2 = (df['month'] <= 3)

# df['season_id'] = np.where(cond_yala, 1, 0) # Yala=1, Maha=0
# df['cycle_id'] = np.select(
#     [cond_yala, cond_maha_p2],
#     [df['year'].astype(str) + '_Yala', (df['year']-1).astype(str) + '_' + df['year'].astype(str) + '_Maha'],
#     default=df['year'].astype(str) + '_' + (df['year']+1).astype(str) + '_Maha'
# )
# print("season encoding successsful")