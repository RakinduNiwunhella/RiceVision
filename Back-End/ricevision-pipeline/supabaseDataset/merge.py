import os
import pandas as pd


# -----------------------------
# Paths (Relative using ../)
# -----------------------------


LSTM_RESULTS_PATH = "data/final/lstm_results.csv"
FINAL_REPORT_PATH = "data/final/Sri_Lanka_2026_Final_Report.csv"

OUTPUT_PATH = "data/final/finalPredictions/FinalMlPredictions.csv"


# -----------------------------
# Load CSVs
# -----------------------------
lstm_df = pd.read_csv(LSTM_RESULTS_PATH)
report_df = pd.read_csv(FINAL_REPORT_PATH)


# -----------------------------
# Select required columns from lstm_results.csv
# -----------------------------
required_columns = [
    "pixel_id",
    "date",
    "district",
    "pred_stage_name",
    "health_category",
    "pest_flag",
    "lat",
    "lon",
]

lstm_df = lstm_df[required_columns]


# -----------------------------
# Rename columns as requested
# -----------------------------
lstm_df = lstm_df.rename(columns={
    "date": "Date",
    "district": "District",
    "pred_stage_name": "stage_name",
    "health_category": "paddy_health",
    "pest_flag": "pest_risk",
    "lon": "lng",
})


# -----------------------------
# Prepare district-level yield data
# -----------------------------
report_df = report_df[[
    "District Name",
    "Predicted Yield (kg/ha)",
    "Historical Avg (kg/ha)"
]].copy()

report_df = report_df.rename(columns={
    "District Name": "District"
})


# -----------------------------
# Count number of points per district
# -----------------------------
district_counts = (
    lstm_df.groupby("District")
    .size()
    .reset_index(name="point_count")
)


# Merge counts into report
report_df = report_df.merge(
    district_counts,
    on="District",
    how="left"
)


# -----------------------------
# Divide district yield values by number of points
# -----------------------------
report_df["Predicted Yield (kg/ha)"] = (
    report_df["Predicted Yield (kg/ha)"] / report_df["point_count"]
)

report_df["Historical Avg (kg/ha)"] = (
    report_df["Historical Avg (kg/ha)"] / report_df["point_count"]
)


# -----------------------------
# Merge per-point yield values back to lstm dataframe
# -----------------------------
final_df = lstm_df.merge(
    report_df[[
        "District",
        "Predicted Yield (kg/ha)",
        "Historical Avg (kg/ha)"
    ]],
    on="District",
    how="left"
)


# Rename final yield column
final_df = final_df.rename(columns={
    "Predicted Yield (kg/ha)": "yield_ton_ha"
})

# -----------------------------
# Save final CSV
# -----------------------------
final_df.to_csv(OUTPUT_PATH, index=False)

print(f"✅ Final merged CSV saved to: {OUTPUT_PATH}")