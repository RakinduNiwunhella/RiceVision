import os
import pandas as pd
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

inference_df[hazard_columns] = (
    inference_df[hazard_columns]
    .apply(pd.to_numeric, errors="coerce")
    .fillna(0)
)

inference_df = inference_df[
    (inference_df[hazard_columns] == 1).any(axis=1)
]

def get_active_hazard(row):
    for col in hazard_columns:
        if row[col] == 1:
            return col
    return None

inference_df["disaster_risk"] = inference_df.apply(get_active_hazard, axis=1)

merged = pd.merge(
    df,
    inference_df[["pixel_id", "date", "disaster_risk"]],
    on="pixel_id",
    how="left",
    suffixes=("", "_hazard")
)

merged["date_diff"] = (merged["date"] - merged["date_hazard"]).dt.days

merged = merged[
    (merged["date_diff"] >= 0) &
    (merged["date_diff"] <= 100)
]

merged = merged.sort_values("date_hazard", ascending=False)
merged = merged.drop_duplicates(subset=["pixel_id", "date"])

df = pd.merge(
    df,
    merged[["pixel_id", "date", "disaster_risk"]],
    on=["pixel_id", "date"],
    how="left"
)

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
]].rename(columns={
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

# ================================
# YIELD DATASET
# ================================
yield_df = pd.read_csv(YIELD_SOURCE_PATH)
area_df = pd.read_csv(DISTRICT_AREA_PATH)

yield_df = yield_df.merge(area_df, on="District Name", how="left")

yield_df["totalyield_kg"] = (
    yield_df["Predicted Yield (kg/ha)"] * yield_df["area_ha"]
)

yield_selected = yield_df[[
    "District Name",
    "Predicted Yield (kg/ha)",
    "Historical Avg (kg/ha)",
    "totalyield_kg"
]].rename(columns={
    "District Name": "districtname",
    "Predicted Yield (kg/ha)": "predictedyield_kg_ha",
    "Historical Avg (kg/ha)": "historicalavg_kg_ha"
})

yield_numeric_cols = yield_selected.select_dtypes(include=["float64", "int64"]).columns
yield_selected[yield_numeric_cols] = yield_selected[yield_numeric_cols].round(2)

yield_selected.to_csv(YIELD_OUTPUT_PATH, index=False)

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