import pandas as pd
import glob

# --- find ALL csv files inside csv_output (including subfolders) ---
files = glob.glob("csv_output/**/*.csv", recursive=True)

print(f"Found {len(files)} files")

all_disasters = set()

for file in files:
    try:
        # --- try multiple encodings ---
        try:
            df = pd.read_csv(file, encoding="utf-8")
        except:
            try:
                df = pd.read_csv(file, encoding="utf-8-sig")
            except:
                df = pd.read_csv(file, encoding="latin1")

        # --- clean column names ---
        df.columns = (
            df.columns
            .str.replace('\ufeff', '', regex=False)  # remove BOM
            .str.strip()
            .str.lower()
        )

        # --- find disaster column automatically ---
        disaster_col = None
        for col in df.columns:
            if "disaster" in col:
                disaster_col = col
                break

        if disaster_col is None:
            print(f"Skipped (no disaster column): {file}")
            continue

        # --- collect unique disasters ---
        disasters = (
            df[disaster_col]
            .dropna()
            .astype(str)
            .str.strip()
            .str.lower()
            .unique()
        )

        all_disasters.update(disasters)

    except Exception as e:
        print(f"Error reading {file}: {e}")

# --- print results ---
print("\nUnique Disaster Types:\n")
for d in sorted(all_disasters):
    print(d)

print(f"\nTotal disaster types: {len(all_disasters)}")