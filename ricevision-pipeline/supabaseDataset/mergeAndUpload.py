import os
import pandas as pd
import numpy as np
from tqdm import tqdm
from dotenv import load_dotenv
from supabase import create_client
import re

load_dotenv()

# ================================
# FILE PATHS
# ================================
INPUT_PATH = "data/final/modelPredictions/lstm_results.csv"
INFERENCE_PATH = "data/final/modelPredictions/Inference_preprocessed.csv"
OUTPUT_PATH = "data/final/finalPredictions/FinalMlPredictions.csv"

YIELD_SOURCE_PATH = "data/final/modelPredictions/Sri_Lanka_2026_Final_Report.csv"
DISTRICT_AREA_PATH = "supabaseDataset/district_areas.csv"
DISTRICT_REPORT_PATH = "data/final/modelPredictions/district_report.csv"
FORECAST_REPORT_PATH = "data/final/modelPredictions/forecast_report.csv"
YIELD_OUTPUT_PATH = "data/final/finalPredictions/yieldPredictions.csv"

# ================================
# LOAD DATA
# ================================
df = pd.read_csv(INPUT_PATH)
inference_df = pd.read_csv(INFERENCE_PATH)

df["date"] = pd.to_datetime(df["date"])
inference_df["date"] = pd.to_datetime(inference_df["date"])

df["pixel_id"] = df["pixel_id"].astype(str)
inference_df["pixel_id"] = inference_df["pixel_id"].astype(str)

# ================================
# MERGE FEATURE COLUMNS
# ================================
feature_columns = [
    "ndvi_median_smooth", "lswi_median_smooth", "evi_median_smooth",
    "ndwi_median_smooth", "bsi_median_smooth", "ndvi_vel_z",
    "lswi_vel_z", "rain_7d_mean", "rain_14d_mean", "tmean_mean",
    "bsi_z", "rh_mean_mean", "season", "elevation", "slope"
]

df = pd.merge(
    df,
    inference_df[["pixel_id", "date"] + feature_columns],
    on=["pixel_id", "date"],
    how="left"
)

# ================================
# DISASTER RISK PROCESSING
# ================================
hazard_columns = ["hazard_drought", "hazard_flood", "hazard_heavy_rain", "hazard_landslide", "hazard_lightning", "hazard_wind"]
inference_df[hazard_columns] = inference_df[hazard_columns].apply(pd.to_numeric, errors="coerce").fillna(0)

def get_active_hazard(row):
    for col in hazard_columns:
        if row[col] == 1: return col
    return "Not Applicable"

inference_df["disaster_risk"] = inference_df.apply(get_active_hazard, axis=1)

# Simplified merge for brevity in this fix, maintaining core logic
df = pd.merge(df, inference_df[["pixel_id", "date", "disaster_risk"]], on=["pixel_id", "date"], how="left")
df["disaster_risk"] = df["disaster_risk"].fillna("Not Applicable")

# ================================
# FINAL DATASET FOR SUPABASE (Points)
# ================================
final_df = df[[
    "pixel_id", "date", "district", "pred_stage_name", "health_category", "pest_flag", "lat", "lon", "disaster_risk"
] + feature_columns].rename(columns={
    "pixel_id": "id", "pred_stage_name": "stage_name", "health_category": "paddy_health", "pest_flag": "pest_risk"
})

final_df["date"] = pd.to_datetime(final_df["date"]).dt.strftime("%Y-%m-%d")
final_df = final_df.replace([np.inf, -np.inf], np.nan).astype(object).where(pd.notnull(final_df), None)

# ================================
# YIELD DATASET
# ================================
yield_df = pd.read_csv(YIELD_SOURCE_PATH)
area_df = pd.read_csv(DISTRICT_AREA_PATH)
district_report_df = pd.read_csv(DISTRICT_REPORT_PATH)
forecast_report_df = pd.read_csv(FORECAST_REPORT_PATH)

# Extract year from filename
year_match = re.search(r'(\d{4})', YIELD_SOURCE_PATH)
year_val = int(year_match.group(1)) if year_match else None

# Merges
yield_df = yield_df.merge(area_df, on="District Name", how="left")
yield_df["totalyield_kg"] = yield_df["Predicted Yield (kg/ha)"] * yield_df["area_ha"]
district_report_df = district_report_df.rename(columns={"district": "District Name"})
yield_df = yield_df.merge(district_report_df, on="District Name", how="left")
forecast_report_df = forecast_report_df.rename(columns={"district": "District Name"})
yield_df = yield_df.merge(forecast_report_df[["District Name", "est_harvest_date"]], on="District Name", how="left")

yield_selected = yield_df[[
    "District Name", "Predicted Yield (kg/ha)", "Historical Avg (kg/ha)", "Yield Gap (kg/ha)",
    "% Change", "Health Index (Z)", "Climate Stress Index", "totalyield_kg", "total_pixels",
    "severe_stress_pct", "pest_attack_count", "most_common_stage", "risk_score", "est_harvest_date"
]].rename(columns={
    "District Name": "districtname", "Predicted Yield (kg/ha)": "predictedyield_kg_ha",
    "Historical Avg (kg/ha)": "historicalavg_kg_ha", "Yield Gap (kg/ha)": "yieldgap_kg_ha",
    "% Change": "percent_change", "Health Index (Z)": "health_index_z", "Climate Stress Index": "climate_stress_index"
})

yield_selected["year"] = year_val

# Season from final_df mode
if "season" in final_df.columns:
    yield_selected["season"] = final_df["season"].mode()[0] if not final_df["season"].dropna().empty else None

yield_numeric_cols = yield_selected.select_dtypes(include=["float64", "int64"]).columns
yield_selected[yield_numeric_cols] = yield_selected[yield_numeric_cols].round(2)
yield_selected = yield_selected.replace([np.inf, -np.inf], np.nan).astype(object).where(pd.notnull(yield_selected), None)

# ================================
# SUPABASE UPLOAD
# ================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_in_batches(table_name, df, conflict_column):
    records = df.to_dict(orient="records")
    for i in tqdm(range(0, len(records), 1000), desc=f"Uploading to {table_name}"):
        supabase.table(table_name).upsert(records[i:i + 1000], on_conflict=conflict_column).execute()

# CLEAR TABLES
supabase.table("Final_Dataset_Points").delete().gte("id", 0).execute()
if year_val:
    supabase.table("Final_Dataset_Yield").delete().eq("year", year_val).execute()
else:
    supabase.table("Final_Dataset_Yield").delete().neq("districtname", "").execute()

# UPLOAD
upload_in_batches("Final_Dataset_Points", final_df, "id")
upload_in_batches("Final_Dataset_Yield", yield_selected, "districtname")

print("All uploads completed successfully!")