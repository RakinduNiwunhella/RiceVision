import numpy as np
import pandas as pd


def map_districts(df: pd.DataFrame, district_centers) -> pd.DataFrame:
    pixel_coords = df[['pixel_id', 'lat', 'lon']].drop_duplicates()

    def find_closest(row: pd.Series) -> str:
        distances = {
            district: np.sqrt((row['lat'] - center[0]) ** 2 + (row['lon'] - center[1]) ** 2)
            for district, center in district_centers.items()
        }
        return min(distances, key=distances.get)

    pixel_coords['district'] = pixel_coords.apply(find_closest, axis=1)
    return df.merge(pixel_coords[['pixel_id', 'district']], on='pixel_id', how='left')
