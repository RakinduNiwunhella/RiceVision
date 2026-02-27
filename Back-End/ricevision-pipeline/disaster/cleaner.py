import pandas as pd
from config.settings import DISASTER_CSV_DIR

def classify_disaster(text):
    t = str(text).lower()

    if "flood" in t:
        return "FLOOD"
    if "rain" in t:
        return "HEAVY_RAIN"
    if "drought" in t:
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
    final_df = final_df.groupby(["ds_division", "date"]).max().reset_index()

    output_path = DISASTER_CSV_DIR / "clean_disaster_dataset.csv"
    final_df.to_csv(output_path, index=False)

    print("Saved:", output_path)