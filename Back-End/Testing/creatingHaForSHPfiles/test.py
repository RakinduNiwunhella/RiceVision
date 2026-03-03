# ================================
# Create yieldPredictions.csv
# ================================

YIELD_SOURCE_PATH = "data/final/modelPredictions/Sri_Lanka_2026_Final_Report.csv"
AREA_SOURCE_PATH = "district_areas.csv"
YIELD_OUTPUT_PATH = "data/final/finalPredictions/yieldPredictions.csv"

# Read yield predictions
yield_df = pd.read_csv(YIELD_SOURCE_PATH)

# Read district areas
area_df = pd.read_csv(AREA_SOURCE_PATH)

# Merge on District Name
merged_yield = yield_df.merge(
    area_df,
    on="District Name",
    how="left"
)

# Calculate total yield (kg)
merged_yield["Total Yield (kg)"] = (
    merged_yield["Predicted Yield (kg/ha)"] * merged_yield["area_ha"]
)

# Select required columns
yield_selected = merged_yield[
    [
        "District Name",
        "Predicted Yield (kg/ha)",
        "Historical Avg (kg/ha)",
        "area_ha",
        "Total Yield (kg)"
    ]
]

# Save file
yield_selected.to_csv(YIELD_OUTPUT_PATH, index=False)

print(f"✅ yieldPredictions.csv saved to: {YIELD_OUTPUT_PATH}")