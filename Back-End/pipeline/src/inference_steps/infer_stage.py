import pandas as pd


def infer_stage(df: pd.DataFrame, baseline_df: pd.DataFrame | None) -> pd.DataFrame:
    if baseline_df is None:
        df['stage_name'] = 'Vegetative'
        return df

    def get_most_likely_stage(row: pd.Series) -> str:
        dist_base = baseline_df[baseline_df['district'] == row['district']]
        if dist_base.empty:
            return 'Vegetative'
        scores = {}
        for _, base in dist_base.iterrows():
            ndvi_std = max(float(base['ndvi_std']), 1e-6)
            vel_std = max(float(base['vel_std']), 1e-6)
            ndvi_dist = ((row['NDVI_median_smooth'] - base['ndvi_mean']) / ndvi_std) ** 2
            vel_dist = ((row['ndvi_vel'] - base['vel_median']) / vel_std) ** 2
            scores[base['stage_name']] = ndvi_dist + vel_dist
        return min(scores, key=scores.get)

    df['stage_name'] = df.apply(get_most_likely_stage, axis=1)
    return df

# this whole thing has to be included
# def infer_stage_statistically(df, baseline_path='/kaggle/input/datasets/sanilawijesekara/sl-baselines/sri_lanka_district_baselines.csv'):
#     print("🧠 Starting Statistical Stage Inference (District-Matched)...")
    
#     # 1. Load Baselines
#     try:
#         baselines = pd.read_csv(baseline_path)
#         # Standardize baseline district names to avoid mismatch
#         baselines['district'] = baselines['district'].str.strip()
#     except FileNotFoundError:
#         print(f"❌ Baseline file not found at {baseline_path}!")
#         return df

#     # 2. Pre-process Inference Data
#     # Ensure district names are clean and match the baseline format
#     df['district'] = df['district'].str.strip()
    
#     # Calculate Velocity (Change in NDVI) for the 2D matching logic
#     df['ndvi_vel'] = df.groupby('pixel_id')['NDVI_median_smooth'].diff().fillna(0)
    
#     # 3. Identify overlap between Inference districts and Baseline districts
#     baseline_districts = baselines['district'].unique()
#     print(f"✅ Found {len(baseline_districts)} districts in baseline file.")

#     # 4. Define the robust scoring function
#     def get_most_likely_stage(row):
#         # SKIP LOGIC: If the district is not in our baseline, skip processing
#         if row['district'] not in baseline_districts:
#             return np.nan
        
#         # Filter baselines for this specific district
#         dist_base = baselines[baselines['district'] == row['district']]
        
#         # Double check for empty dataframe to prevent min() error
#         if dist_base.empty:
#             return np.nan
        
#         scores = {}
#         for _, b in dist_base.iterrows():
#             # Distance Calculation (Z-score based)
#             # We measure how many standard deviations the pixel is from the stage mean
#             ndvi_dist = ((row['NDVI_median_smooth'] - b['ndvi_mean']) / b['ndvi_std'])**2
#             vel_dist = ((row['ndvi_vel'] - b['vel_median']) / b['vel_std'])**2
            
#             # Combine for total statistical distance
#             scores[b['stage_name']] = ndvi_dist + vel_dist
        
#         # Return the stage name with the smallest distance
#         return min(scores, key=scores.get)

#     # 5. Apply the function
#     df['stage_name'] = df.apply(get_most_likely_stage, axis=1)
    
#     # 6. Reporting
#     skipped_count = df['stage_name'].isna().sum()
#     processed_count = len(df) - skipped_count
    
#     print(f"📊 Inference Results:")
#     print(f"   - Processed: {processed_count} rows")
#     print(f"   - Skipped:   {skipped_count} rows (Districts not in baseline)")
    
#     if skipped_count > 0:
#         missing = [d for d in df['district'].unique() if d not in baseline_districts]
#         print(f"   - Skipped Districts: {missing}")

#     print("✅ Statistical inference complete.")
#     return df

# # Execute
# df = infer_stage_statistically(df)