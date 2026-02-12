from pathlib import Path
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from tqdm import tqdm

# ================= CONFIG =================
GEOJSON_FILE = "DSdevisions.geojson"
DISASTER_FILE = "clean_disaster_dataset.csv"
LAT_COL = "lat"
LON_COL = "lon"
DATE_COLUMN = "date"
# ==========================================

# ---------- STEP 1 : ADD DS DIVISION ----------
def add_ds_division(csv_path, ds_gdf):
    df = pd.read_csv(csv_path)

    if LAT_COL not in df.columns or LON_COL not in df.columns:
        print(f"⚠ Skipping {csv_path.name} (lat/lon missing)")
        return None

    geometry = [Point(xy) for xy in zip(df[LON_COL], df[LAT_COL])]
    points = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")

    joined = gpd.sjoin(points, ds_gdf, how="left", predicate="within")
    joined["DS Division"] = joined["adm3_name"]
    joined = joined[list(df.columns) + ["DS Division"]]
    return joined

# ---------- STEP 2 : SORT ----------
def sort_by_date(df):
    df[DATE_COLUMN] = pd.to_datetime(df[DATE_COLUMN], errors="coerce")
    return df.sort_values(DATE_COLUMN)

# ---------- STEP 3 : MERGE DISASTERS ----------
def merge_disasters(paddy_df, disaster_df):
    paddy = paddy_df.copy()
    disaster = disaster_df.copy()

    paddy.columns = paddy.columns.str.strip().str.lower()
    disaster.columns = disaster.columns.str.strip().str.lower()

    paddy = paddy.rename(columns={"ds division": "ds_division", DATE_COLUMN: "date"})

    paddy["date"] = pd.to_datetime(paddy["date"], errors="coerce")
    disaster["date"] = pd.to_datetime(disaster["date"], errors="coerce")

    paddy = paddy.sort_values("date")
    disaster = disaster.sort_values("date")

    hazard_cols = [c for c in disaster.columns if "hazard_" in c]
    merged_rows = []

    for _, p_row in tqdm(paddy.iterrows(), total=len(paddy), desc="Matching disasters"):
        div = p_row.get("ds_division")
        p_date = p_row.get("date")

        if pd.isna(div) or pd.isna(p_date):
            merged_rows.append(p_row)
            continue

        d_sub = disaster[disaster["ds_division"] == div]
        if len(d_sub) == 0:
            merged_rows.append(p_row)
            continue

        d_sub = d_sub.copy()
        d_sub["diff"] = (d_sub["date"] - p_date).dt.days
        d_sub = d_sub[d_sub["diff"].abs() <= 5]
        if len(d_sub) == 0:
            merged_rows.append(p_row)
            continue

        d_sub["priority"] = d_sub["diff"].abs()
        best = d_sub.sort_values(["priority", "diff"], ascending=[True, False]).iloc[0]

        new_row = p_row.copy()
        for col in hazard_cols:
            new_row[col] = best[col]
        merged_rows.append(new_row)

    final_df = pd.DataFrame(merged_rows)

    # ensure all hazard columns exist and use pandas nullable boolean dtype (avoids FutureWarning)
    for col in hazard_cols:
        if col not in final_df.columns:
            final_df[col] = pd.Series(False, index=final_df.index, dtype="boolean")
        else:
            final_df[col] = (
                final_df[col]
                .astype("boolean")
                .fillna(False)
            )

    return final_df

# ---------- MAIN PIPELINE ----------
def process_folder(folder_path):
    base_folder = Path(folder_path)
    input_folder = base_folder / "ToBeAdded"
    output_folder = base_folder / "Done"
    output_folder.mkdir(parents=True, exist_ok=True)

    csv_files = list(input_folder.rglob("*.csv"))
    if len(csv_files) == 0:
        print("No CSV files found in ToBeAdded folder")
        return

    print(f"\nFound {len(csv_files)} CSV files in ToBeAdded")

    print("Loading DS divisions...")
    ds_gdf = gpd.read_file(GEOJSON_FILE)
    ds_gdf = ds_gdf.set_crs("EPSG:4326", allow_override=True)

    print("Loading disaster dataset...")
    disaster_df = pd.read_csv(DISASTER_FILE)

    for csv_file in tqdm(csv_files, desc="Processing files", unit="file"):
        print(f"\n==============================")
        print(f"Processing: {csv_file}")

        df = add_ds_division(csv_file, ds_gdf)
        if df is None:
            continue

        df = sort_by_date(df)
        final_df = merge_disasters(df, disaster_df)

        relative_path = csv_file.relative_to(input_folder)
        out_file = output_folder / relative_path
        out_file.parent.mkdir(parents=True, exist_ok=True)

        final_df.to_csv(out_file, index=False)
        print(f"Saved → {out_file}")

    print("\n🎉 ALL FILES COMPLETED")

# ---------- RUN ----------
if __name__ == "__main__":
    path = input("Paste the parent folder path (the folder containing ToBeAdded and Done):\n> ").strip()
    process_folder(path)