import pandas as pd


def extract_date_parts(full_dataset: pd.DataFrame) -> pd.DataFrame:
    full_dataset['date'] = pd.to_datetime(full_dataset['date'], format='%Y-%m-%d')
    full_dataset['year'] = full_dataset['date'].dt.year
    full_dataset['month'] = full_dataset['date'].dt.month
    full_dataset['day'] = full_dataset['date'].dt.day
    full_dataset['month_day'] = full_dataset['date'].dt.strftime('%m-%d')
    
    return full_dataset
