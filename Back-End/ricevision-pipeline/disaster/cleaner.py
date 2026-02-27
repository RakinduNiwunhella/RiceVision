import pandas as pd
from config.settings import DISASTER_CSV_DIR

def classify_disaster(text):
    t = str(text).lower()

    if "flood" in t:
        return "FLOOD"
    if "rain" in t:
        return "HEAVY_RAIN"
    if "drought" in t or "dry" in t:
        return "DROUGHT"
    if "wind" in t or "cyclone" in t:
        return "WIND"
    if "landslide" in t:
        return "LANDSLIDE"
    if "lightning" in t:
        return "LIGHTNING"

    return None

def clean_disaster_data():

    files = list(DISASTER_CSV_DIR.glob("*.csv"))
    clean_rows = []

    for file in files:
        df = pd.read_csv(file)

        for _, row in df.iterrows():
            hazard = classify_disaster(row["Disaster"])
            if hazard is None:
                continue

            clean_rows.append({
                "ds_division": row["DS Division"],
                "date": row["Date of commenced"],
                "hazard": hazard
            })

    clean_df = pd.DataFrame(clean_rows)

    final_df = pd.get_dummies(clean_df, columns=["hazard"])

    # Ensure all hazard columns always exist
    required_hazards = [
        "hazard_FLOOD",
        "hazard_HEAVY_RAIN",
        "hazard_LANDSLIDE",
        "hazard_LIGHTNING",
        "hazard_WIND",
        "hazard_DROUGHT"
    ]

    for col in required_hazards:
        if col not in final_df.columns:
            final_df[col] = 0

    final_df = final_df.groupby(["ds_division", "date"])[required_hazards].max().reset_index()

    output_path = DISASTER_CSV_DIR / "clean_disaster_dataset.csv"
    final_df.to_csv(output_path, index=False)

    print("Saved:", output_path)