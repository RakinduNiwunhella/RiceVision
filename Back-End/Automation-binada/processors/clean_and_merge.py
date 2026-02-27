import pandas as pd
import glob
import os
from Automation.config.settings import CSV_DIR


def classify_disaster(text):
    t = str(text).lower()

    if any(k in t for k in ["flood", "flash flood"]):
        return "FLOOD"

    if "heavy rain" in t or "rain" in t:
        return "HEAVY_RAIN"

    if any(k in t for k in ["drought", "dry", "water scarcity"]):
        return "DROUGHT"

    if any(k in t for k in ["wind", "cyclone", "tornado"]):
        return "WIND"

    if any(k in t for k in ["landslide", "rock", "cutting failure", "subsidence"]):
        return "LANDSLIDE"

    if "lightning" in t or "thunder" in t:
        return "LIGHTNING"

    if "heat" in t:
        return "HEAT"

    return None


def clean_disaster_data():
    print("Cleaning disaster data...")

    files = glob.glob(os.path.join(CSV_DIR, "*.csv"))

    clean_rows = []

    for file in files:
        try:
            df = pd.read_csv(file)
            df.columns = df.columns.str.strip().str.lower()

            if "disaster" not in df.columns:
                continue

            for _, row in df.iterrows():
                hazard = classify_disaster(row["disaster"])
                if hazard is None:
                    continue

                clean_rows.append({
                    "ds_division": row.get("ds division", ""),
                    "date": row.get("date of commenced", ""),
                    "hazard": hazard
                })

        except Exception:
            continue

    clean_df = pd.DataFrame(clean_rows)

    if clean_df.empty:
        print("No disaster rows found.")
        return None

    final_df = pd.get_dummies(clean_df, columns=["hazard"])
    final_df = final_df.groupby(["ds_division", "date"]).max().reset_index()

    output_path = os.path.join(CSV_DIR, "clean_disaster_dataset.csv")
    final_df.to_csv(output_path, index=False)

    print("Created clean_disaster_dataset.csv")
    return output_path