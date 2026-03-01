import numpy as np
import pandas as pd


def aggregate_10day(df: pd.DataFrame) -> pd.DataFrame:
    print('📦 Starting 10-day Aggregation (Preserving Hazards as int64)...')

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['ten_day'] = df['date'].dt.to_period('10D')

    spectral_indices = [
        'NDVI', 'EVI', 'EVI2', 'LSWI', 'NDWI', 'GLI', 'GCI', 'CVI',
        'SIPI', 'RENDVI', 'RECI', 'CCCI', 'S2REP', 'BSI', 'NPCRI', 'NDSMI',
    ]
    raw_bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']
    env_cols = [
        'rain_1d', 'rain_3d', 'rain_7d', 'rain_14d', 'rain_30d',
        'tmean', 'tmax', 'tmin', 't_day', 't_night', 'rh_mean',
    ]

    hazard_cols = [
        'hazard_DROUGHT', 'hazard_FLOOD', 'hazard_HEAVY_RAIN',
        'hazard_LANDSLIDE', 'hazard_LIGHTNING', 'hazard_WIND',
    ]

    static_meta = ['lat', 'lon', 'elevation', 'slope', 'pixel_id', 'district']
    meta_mean = ['cloud_pct']
    meta_first = ['SCL', 'date', 'year', 'month', 'month_day', 'timestep']

    agg_dict = {}
    for col in spectral_indices + raw_bands:
        if col in df.columns:
            agg_dict[col] = 'median'
    for col in env_cols + meta_mean:
        if col in df.columns:
            agg_dict[col] = 'mean'
    for col in hazard_cols:
        if col in df.columns:
            agg_dict[col] = 'max'
    for col in static_meta + meta_first:
        if col in df.columns:
            agg_dict[col] = 'first'

    df_agg = df.groupby(['pixel_id', 'ten_day'], as_index=False).agg(agg_dict)
    df_agg['ten_day_start'] = df_agg['ten_day'].dt.start_time
    df_agg = df_agg.sort_values(['pixel_id', 'ten_day_start'])
    df_agg['delta_days'] = df_agg.groupby('pixel_id')['ten_day_start'].diff().dt.days.fillna(10)
    df_agg['doy'] = df_agg['ten_day_start'].dt.dayofyear
    df_agg['doy_sin'] = np.sin(2 * np.pi * df_agg['doy'] / 365.25)
    df_agg['doy_cos'] = np.cos(2 * np.pi * df_agg['doy'] / 365.25)

    rename_map = {col: f"{col}_median" for col in spectral_indices if col in df_agg.columns}
    rename_map.update({col: f"{col}_mean" for col in env_cols if col in df_agg.columns})
    df_agg = df_agg.rename(columns=rename_map)
    df_agg = df_agg.drop(columns=['ten_day'])

    for col in hazard_cols:
        if col in df_agg.columns:
            df_agg[col] = df_agg[col].fillna(0).astype('int64')

    print('✅ Aggregation complete. Hazards preserved as int64.')
    return df_agg

# Make sure to do each of these things
# def process_pipeline_for_inference(df):
#     print("📦 Starting 10-day Aggregation (Preserving Hazards as int64)...")
    
#     # --- 1. PREPARE TEMPORAL BINS ---
#     df['date'] = pd.to_datetime(df['date'], errors='coerce')
#     df['ten_day'] = df['date'].dt.to_period('10D')
    
#     # --- 2. DEFINE COLUMN GROUPS ---
#     spectral_indices = [
#         'NDVI','EVI','EVI2','LSWI','NDWI','GLI','GCI','CVI',
#         'SIPI','RENDVI','RECI','CCCI','S2REP','BSI','NPCRI','NDSMI'
#     ]
    
#     raw_bands = ['B1','B2','B3','B4','B5','B6','B7','B8','B8A','B9','B11','B12']
    
#     env_cols = [
#         'rain_1d','rain_3d','rain_7d','rain_14d','rain_30d',
#         'tmean','tmax','tmin','t_day','t_night','rh_mean'
#     ]
    
#     # Explicitly list hazard columns (adjust case if necessary to match your df)
#     hazard_cols = [
#         'hazard_DROUGHT', 'hazard_FLOOD', 'hazard_HEAVY_RAIN', 
#         'hazard_LANDSLIDE', 'hazard_LIGHTNING', 'hazard_WIND'
#     ]
    
#     static_meta = ['lat', 'lon', 'elevation', 'slope', 'pixel_id', 'district']
#     meta_mean = ['cloud_pct']
#     meta_first = ['SCL', 'date', 'year', 'month', 'month_day', 'timestep']

#     # --- 3. BUILD AGGREGATION DICTIONARY ---
#     agg_dict = {}
    
#     for col in (spectral_indices + raw_bands):
#         if col in df.columns: agg_dict[col] = 'median'
            
#     for col in (env_cols + meta_mean):
#         if col in df.columns: agg_dict[col] = 'mean'
            
#     # Use MAX for hazards: If hazard=1 on any day in the 10-day window, result is 1
#     for col in hazard_cols:
#         if col in df.columns:
#             agg_dict[col] = 'max'
            
#     for col in (static_meta + meta_first):
#         if col in df.columns: agg_dict[col] = 'first' 

#     # --- 4. EXECUTE AGGREGATION ---
#     df_agg = df.groupby(['pixel_id', 'ten_day'], as_index=False).agg(agg_dict)
    
#     df_agg['ten_day_start'] = df_agg['ten_day'].dt.start_time
#     df_agg = df_agg.sort_values(['pixel_id', 'ten_day_start'])

#     # --- 5. TIME FEATURE ENGINEERING ---
#     df_agg["delta_days"] = df_agg.groupby("pixel_id")["ten_day_start"].diff().dt.days.fillna(10)
#     df_agg['doy'] = df_agg['ten_day_start'].dt.dayofyear
#     df_agg['doy_sin'] = np.sin(2 * np.pi * df_agg['doy'] / 365.25)
#     df_agg['doy_cos'] = np.cos(2 * np.pi * df_agg['doy'] / 365.25)

#     # --- 6. RENAMING (Only Suffixing Indices and Weather) ---
#     # Hazards and Static Meta are NOT renamed
#     rename_map = {col: f"{col}_median" for col in spectral_indices if col in df_agg.columns}
#     rename_map.update({col: f"{col}_mean" for col in env_cols if col in df_agg.columns})
    
#     df_agg = df_agg.rename(columns=rename_map)

#     # --- 7. CLEANUP & FINAL TYPE CASTING ---
#     df_agg = df_agg.drop(columns=['ten_day'])
    
#     # Force hazards back to int64 as requested
#     for col in hazard_cols:
#         if col in df_agg.columns:
#             df_agg[col] = df_agg[col].fillna(0).astype('int64')
    
#     print(f"✅ Aggregation complete. Hazards preserved as int64.")
#     return df_agg

# # Execute
# df_inference = process_pipeline_for_inference(df)