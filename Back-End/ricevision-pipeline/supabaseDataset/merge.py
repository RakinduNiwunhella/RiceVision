import os
import pandas as pd

# Paths

INPUT_PATH =("data/final/modelPredictions/lstm_results.csv")
OUTPUT_PATH = ("data/final/finalPredictions/FinalMlPredictions.csv")
INFERENCE_PATH = "data/final/modelPredictions/Inference_preprocessed.csv"



# Read source CSV
df = pd.read_csv(INPUT_PATH)

print("Unique pixel_ids in predictions:", df["pixel_id"].nunique())

# Read inference file for disaster risk
inference_df = pd.read_csv(INFERENCE_PATH)

# Convert date columns to datetime
inference_df["date"] = pd.to_datetime(inference_df["date"])
df["date"] = pd.to_datetime(df["date"])

# Ensure pixel_id types match (convert both to string)
inference_df["pixel_id"] = inference_df["pixel_id"].astype(str)
df["pixel_id"] = df["pixel_id"].astype(str)

# Hazard columns
hazard_columns = [
    "hazard_drought",
    "hazard_flood",
    "hazard_heavy_rain",
    "hazard_landslide",
    "hazard_lightning",
    "hazard_wind"
]

# DEBUG: Check hazard column types and values
print("\n--- DEBUG HAZARD COLUMN TYPES ---")
print(inference_df[hazard_columns].dtypes)
print("\n--- SAMPLE HAZARD VALUES ---")
print(inference_df[hazard_columns].head())

# Convert hazard columns to numeric (in case they are strings)
inference_df[hazard_columns] = inference_df[hazard_columns].apply(pd.to_numeric, errors="coerce").fillna(0)

# Keep only rows where at least one hazard == 1
inference_df = inference_df[(inference_df[hazard_columns] == 1).any(axis=1)]

print("\n--- DEBUG AFTER FILTER ---")
print("Rows with hazard=1:", len(inference_df))
print("Unique pixel_ids in inference:", inference_df["pixel_id"].nunique())

# Create disaster_risk column default 'Not Applicable'

df["disaster_risk"] = "Not Applicable"

# For each row in predictions, check hazards within 5 days before
for idx, row in df.iterrows():
    pixel = str(row["pixel_id"])
    pred_date = row["date"]

    # Filter inference by same pixel_id and within 5 days before
    matched = inference_df[
        (inference_df["pixel_id"] == pixel) &
        (inference_df["date"] <= pred_date) &
        (inference_df["date"] >= pred_date - pd.Timedelta(days=100))
    ]

    if not matched.empty:
        # Pick most recent hazard within 100-day window
        matched = matched.sort_values(by="date", ascending=False)
        hazard_row = matched.iloc[0]

        # Assign the first active hazard (most recent)
        for col in hazard_columns:
            if hazard_row[col] == 1:
                df.at[idx, "disaster_risk"] = col
                break
print(hazard_row[hazard_columns])
# Select and rename required columns
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
    "date": "Date",
    "district": "District",
    "pred_stage_name": "stage_name",
    "health_category": "paddy_health",
    "pest_flag": "pest_risk",
    "disaster_risk": "disaster_risk"
})

# Save final CSV
final_df.to_csv(OUTPUT_PATH, index=False)

print(f"✅ FinalMlPredictions.csv saved to: {OUTPUT_PATH}")