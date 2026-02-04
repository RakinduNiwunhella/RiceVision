import pandas as pd
import glob

files = glob.glob("csv_output/**/*.csv", recursive=True)

clean_rows = []

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

    if "heat" in t:
        return "HEAT"

    # everything else → ignore
    return None


print(f"Processing {len(files)} files...")

for file in files:
    try:
        # encoding safe read
        try:
            df = pd.read_csv(file, encoding="utf-8")
        except:
            try:
                df = pd.read_csv(file, encoding="utf-8-sig")
            except:
                df = pd.read_csv(file, encoding="latin1")

        # clean columns
        df.columns = df.columns.str.replace('\ufeff','',regex=False).str.strip().str.lower()

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

    except:
        pass

# --- create dataframe ---
clean_df = pd.DataFrame(clean_rows)

# convert to ML format (one-hot per day per DS division)
final_df = pd.get_dummies(clean_df, columns=["hazard"])

# group same day same DS division
final_df = final_df.groupby(["ds_division","date"]).max().reset_index()

# save
final_df.to_csv("clean_disaster_dataset.csv", index=False)

print("\nDONE ✅ Created: clean_disaster_dataset.csv")
print(f"Rows: {len(final_df)}")