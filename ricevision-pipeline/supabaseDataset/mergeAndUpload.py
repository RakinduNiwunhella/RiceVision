import os
import pandas as pd
import numpy as np
from tqdm import tqdm
from dotenv import load_dotenv
from supabase import create_client

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
print("Initial df rows:", len(df))
print("Initial inference rows:", len(inference_df))

# ================================
# MERGE FEATURE COLUMNS FIRST
# ================================
df = pd.merge(
    df,
    inference_df[["pixel_id", "date"] + [
        "ndvi_median_smooth",
        "lswi_median_smooth",
        "evi_median_smooth",
        "ndwi_median_smooth",
        "bsi_median_smooth",
        "ndvi_vel_z",
        "lswi_vel_z",
        "rain_7d_mean",
        "rain_14d_mean",
        "tmean_mean",
        "bsi_z",
        "rh_mean_mean",
        "season",
        "elevation",
        "slope"
    ]],
    on=["pixel_id", "date"],
    how="left"
)

# if any feature values are missing keep them as null (do not drop rows)

# ================================
# DISASTER RISK PROCESSING
# ================================
hazard_columns = [
    "hazard_drought",
    "hazard_flood",
    "hazard_heavy_rain",
    "hazard_landslide",
    "hazard_lightning",
    "hazard_wind"
]

feature_columns = [
    "ndvi_median_smooth",
    "lswi_median_smooth",
    "evi_median_smooth",
    "ndwi_median_smooth",
    "bsi_median_smooth",
    "ndvi_vel_z",
    "lswi_vel_z",
    "rain_7d_mean",
    "rain_14d_mean",
    "tmean_mean",
    "bsi_z",
    "rh_mean_mean",
    "season",
    "elevation",
    "slope"
]

inference_df[hazard_columns] = (
    inference_df[hazard_columns]
    .apply(pd.to_numeric, errors="coerce")
    .fillna(0)
)

inference_df = inference_df[
    (inference_df[hazard_columns] == 1).any(axis=1)
]
print("Rows after hazard filter:", len(inference_df))

def get_active_hazard(row):
    for col in hazard_columns:
        if row[col] == 1:
            return col
    return None

inference_df["disaster_risk"] = inference_df.apply(get_active_hazard, axis=1)
inference_df = inference_df.rename(columns={"date": "date_hazard"})
merged = pd.merge(
    df,
    inference_df[["pixel_id", "date_hazard", "disaster_risk"] + feature_columns],
    on="pixel_id",
    how="left"
)
merged["date_diff"] = (merged["date"] - merged["date_hazard"]).dt.days
print("Merged rows before date filter:", len(merged))
merged = merged[
    (merged["date_diff"] >= 0) &
    (merged["date_diff"] <= 100)
]
print("Merged rows after date filter:", len(merged))
merged = merged.sort_values("date_hazard", ascending=False)
merged = merged.drop_duplicates(subset=["pixel_id", "date"])

# merge disaster risk back into main dataframe
df = pd.merge(
    df,
    merged[["pixel_id", "date", "disaster_risk"]],
    on=["pixel_id", "date"],
    how="left"
)

# ensure missing feature values remain null instead of removing rows
df[feature_columns] = df[feature_columns].where(pd.notnull(df[feature_columns]), None)

# if hazard not found keep as Not Applicable
df["disaster_risk"] = df["disaster_risk"].fillna("Not Applicable")

# ================================
# FINAL DATASET FOR SUPABASE
# ================================
final_df = df[[
    "pixel_id",
    "date",
    "district",
    "pred_stage_name",
    "health_category",
    "pest_flag",
    "lat",
    "lon",
    "disaster_risk"
] + feature_columns].rename(columns={
    "pixel_id": "id",
    "date": "date",
    "district": "district",
    "pred_stage_name": "stage_name",
    "health_category": "paddy_health",
    "pest_flag": "pest_risk"
})

numeric_cols = final_df.select_dtypes(include=["float64", "int64"]).columns
final_df[numeric_cols] = final_df[numeric_cols].round(2)

# 🔥 Fix JSON serialization
final_df["date"] = final_df["date"].dt.strftime("%Y-%m-%d")


final_df.to_csv(OUTPUT_PATH, index=False)

# remove NaN and infinite values before upload (JSON safe)
final_df = final_df.replace([np.inf, -np.inf], np.nan)
final_df = final_df.astype(object).where(pd.notnull(final_df), None)

# ================================
# YIELD DATASET
# ================================
yield_df = pd.read_csv(YIELD_SOURCE_PATH)
area_df = pd.read_csv(DISTRICT_AREA_PATH)
district_report_df = pd.read_csv(DISTRICT_REPORT_PATH)
forecast_report_df = pd.read_csv(FORECAST_REPORT_PATH)

# merge area
yield_df = yield_df.merge(area_df, on="District Name", how="left")

# calculate total yield using district area
yield_df["totalyield_kg"] = (
    yield_df["Predicted Yield (kg/ha)"] * yield_df["area_ha"]
)

# merge district level report metrics
district_report_df = district_report_df.rename(columns={"district": "District Name"})
yield_df = yield_df.merge(district_report_df, on="District Name", how="left")

# merge forecast report (harvest date)
forecast_report_df = forecast_report_df.rename(columns={"district": "District Name"})
yield_df = yield_df.merge(
    forecast_report_df[["District Name", "est_harvest_date"]],
    on="District Name",
    how="left"
)

yield_selected = yield_df[[
    "District Name",
    "Predicted Yield (kg/ha)",
    "Historical Avg (kg/ha)",
    "Yield Gap (kg/ha)",
    "% Change",
    "Health Index (Z)",
    "Climate Stress Index",
    "totalyield_kg",
    "total_pixels",
    "severe_stress_pct",
    "pest_attack_count",
    "most_common_stage",
    "risk_score",
    "est_harvest_date"
]].rename(columns={
    "District Name": "districtname",
    "Predicted Yield (kg/ha)": "predictedyield_kg_ha",
    "Historical Avg (kg/ha)": "historicalavg_kg_ha",
    "Yield Gap (kg/ha)": "yieldgap_kg_ha",
    "% Change": "percent_change",
    "Health Index (Z)": "health_index_z",
    "Climate Stress Index": "climate_stress_index"
})

# ================================
# ADD SEASON COLUMN (same season used in FinalMlPredictions)
# ================================
season_value = None
if "season" in final_df.columns and not final_df["season"].dropna().empty:
    season_value = final_df["season"].mode()[0]

yield_selected["season"] = season_value

yield_numeric_cols = yield_selected.select_dtypes(include=["float64", "int64"]).columns
yield_selected[yield_numeric_cols] = yield_selected[yield_numeric_cols].round(2)


yield_selected.to_csv(YIELD_OUTPUT_PATH, index=False)

# clean NaN / infinite values for Supabase upload (JSON safe)
yield_selected = yield_selected.replace([np.inf, -np.inf], np.nan)
yield_selected = yield_selected.astype(object).where(pd.notnull(yield_selected), None)

# ================================
# SUPABASE CONNECTION
# ================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ================================
# HELPER FUNCTION
# ================================
def upload_in_batches(table_name, df, conflict_column):
    records = df.to_dict(orient="records")
    total_rows = len(records)

    batch_size = 1000

    for i in tqdm(range(0, total_rows, batch_size), desc=f"Uploading to {table_name}"):
        batch = records[i:i + batch_size]
        supabase.table(table_name).upsert(
            batch,
            on_conflict=conflict_column
        ).execute()

# ================================
# CLEAR TABLES
# ================================
supabase.table("Final_Dataset_Points").delete().gte("id", 0).execute()
supabase.table("Final_Dataset_Yield").delete().neq("districtname", "").execute()

# ================================
# UPLOAD
# ================================
upload_in_batches("Final_Dataset_Points", final_df, "id")
print("ML predictions uploaded!")

upload_in_batches("Final_Dataset_Yield", yield_selected, "districtname")
print("Yield predictions uploaded!")

print("All uploads completed successfully!")