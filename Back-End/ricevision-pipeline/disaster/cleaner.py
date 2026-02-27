
import pandas as pd
from config.settings import DISASTER_CSV_DIR


# --- hazard classifier ---
def classify_disaster(text):
    t = str(text).lower()

    # WATER EXCESS
    if any(k in t for k in ["flood", "flash flood"]):
        return "FLOOD"

    if "heavy rain" in t or "rain" in t:
        return "HEAVY_RAIN"

    # WATER DEFICIT
    if any(k in t for k in ["drought", "dry", "water scarcity"]):
        return "DROUGHT"

    # WIND DAMAGE
    if any(k in t for k in ["wind", "cyclone", "tornado"]):
        return "WIND"

    # SLOPE / SOIL FAILURE
    if any(k in t for k in ["landslide", "rock", "cutting failure", "subsidence"]):
        return "LANDSLIDE"

    # PLANT DAMAGE
    if "lightning" in t or "thunder" in t:
        return "LIGHTNING"

    # everything else → ignore
    return None


def clean_disaster_data():

    files = list(DISASTER_CSV_DIR.glob("*.csv"))
    clean_rows = []

    print(f"Processing {len(files)} files...")

    for file in files:
        try:
            # encoding-safe read
            try:
                df = pd.read_csv(file, encoding="utf-8")
            except:
                try:
                    df = pd.read_csv(file, encoding="utf-8-sig")
                except:
                    df = pd.read_csv(file, encoding="latin1")

            # clean column names
            df.columns = (
                df.columns
                .str.replace('\ufeff', '', regex=False)
                .str.strip()
                .str.lower()
            )

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

        except Exception as e:
            print(f"Skipping {file.name}: {e}")

    # --- create dataframe ---
    clean_df = pd.DataFrame(clean_rows)

    if clean_df.empty:
        print("No valid disaster records found.")
        return

    # one-hot encode hazards
    final_df = pd.get_dummies(clean_df, columns=["hazard"])

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

    # group same day same DS division
    final_df = (
        final_df
        .groupby(["ds_division", "date"])[required_hazards]
        .max()
        .reset_index()
    )

    output_path = DISASTER_CSV_DIR / "clean_disaster_dataset.csv"
    final_df.to_csv(output_path, index=False)

    print("\nDONE ✅ Created:", output_path)
    print(f"Rows: {len(final_df)}")