import numpy as np
import pandas as pd


def map_districts(df: pd.DataFrame, district_centers) -> pd.DataFrame:
    if 'district' in df.columns and df['district'].notna().all():
        return df

    pixel_coords = df[['pixel_id', 'lat', 'lon']].drop_duplicates().copy()

    existing_district = None
    if 'district' in df.columns:
        existing_district = df[['pixel_id', 'district']].dropna().drop_duplicates('pixel_id')

    def find_closest(row: pd.Series) -> str:
        distances = {
            district: np.sqrt((row['lat'] - center[0]) ** 2 + (row['lon'] - center[1]) ** 2)
            for district, center in district_centers.items()
        }
        return min(distances, key=distances.get)

    pixel_coords['district_mapped'] = pixel_coords.apply(find_closest, axis=1)

    if existing_district is not None and not existing_district.empty:
        pixel_coords = pixel_coords.merge(existing_district, on='pixel_id', how='left')
        pixel_coords['district'] = pixel_coords['district'].fillna(pixel_coords['district_mapped'])
    else:
        pixel_coords['district'] = pixel_coords['district_mapped']

    mapped = df.merge(pixel_coords[['pixel_id', 'district']], on='pixel_id', how='left', suffixes=('', '_new'))
    if 'district_new' in mapped.columns:
        mapped['district'] = mapped['district'].fillna(mapped['district_new'])
        mapped = mapped.drop(columns=['district_new'])
    return mapped
