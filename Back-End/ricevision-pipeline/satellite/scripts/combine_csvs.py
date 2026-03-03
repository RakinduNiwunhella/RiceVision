import pandas as pd
from io import StringIO
from google.cloud import storage
from google.oauth2 import service_account
import os
import geopandas as gpd
from shapely.geometry import Point
from tqdm import tqdm


def combine_timestep_csvs():

    print("\n==============================")
    print("COMBINING 10 TIMESTEP CSVs")
    print("==============================\n")

    PROJECT_ID = "ricevision-487918"
    BUCKET_NAME = "ricevision-gee-exports"
    PREFIX = "district_exports/districts_csv_"
    OUTPUT_NAME = "district_exports/combined_10_timesteps.csv"

    from config.settings import BASE_DIR, SATELLITE_CSV_DIR

    SERVICE_ACCOUNT_PATH = BASE_DIR / "credentials" / "gee-service-account.json"

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_PATH
    )

    client = storage.Client(
        project=PROJECT_ID,
        credentials=credentials
    )

    bucket = client.bucket(BUCKET_NAME)

    blobs = list(client.list_blobs(BUCKET_NAME, prefix=PREFIX))
    csv_files = [b for b in blobs if b.name.endswith(".csv")]

    if not csv_files:
        print("❌ No CSV files found.")
        return

    # Sort by blob updated time (newest first)
    csv_files = sorted(csv_files, key=lambda b: b.updated, reverse=True)

    # Keep only the 10 most recent files
    csv_files = csv_files[:10]

    print(f"Found {len(csv_files)} timestep CSV files.\n")

    dfs = []

    for blob in sorted(csv_files, key=lambda x: x.name):

        print("Reading:", blob.name)

        content = blob.download_as_text()

        # Skip empty files
        if len(content.strip()) == 0:
            print("⚠ Skipping empty file:", blob.name)
            continue

        try:
            df = pd.read_csv(StringIO(content))

            # Skip if dataframe has no rows
            if df.empty:
                print("⚠ Skipping file with 0 rows:", blob.name)
                continue

            dfs.append(df)

        except Exception as e:
            print("⚠ Could not read file:", blob.name)
            print("Error:", e)
            continue

    if not dfs:
        print("❌ No valid CSV files to combine.")
        return

    final_df = pd.concat(dfs, ignore_index=True)

    # ================= REBUILD PIXEL_ID BASED ON LAT/LON =================
    print("\nRebuilding pixel_id based on unique lat/lon pairs...")

    # Remove old pixel_id if it exists
    final_df = final_df.drop(columns=["pixel_id"], errors="ignore")

    # Create new pixel_id where identical lat/lon share the same ID
    final_df["pixel_id"] = (
        final_df.groupby(["lat", "lon"], sort=False)
        .ngroup()
    )

    print("New pixel_id column created.")

    # ===================== ADD DISTRICT & DS DIVISION ===================== #
    print("\nAdding district and ds_division columns using spatial join...")

    # Remove old columns if they exist
    final_df = final_df.drop(columns=["district", "ds_division"], errors="ignore")

    # Load GeoJSON from same directory as this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ds_geo_path = os.path.join(base_dir, "DSdevisions.geojson")

    ds_gdf = gpd.read_file(ds_geo_path)

    print("Available GeoJSON columns:", list(ds_gdf.columns))

    # Create GeoDataFrame with progress bar
    print("Creating point geometries...")
    geometry = [
        Point(xy) for xy in tqdm(
            zip(final_df["lon"], final_df["lat"]),
            total=len(final_df),
            desc="Building geometries"
        )
    ]

    points_gdf = gpd.GeoDataFrame(final_df.copy(), geometry=geometry, crs="EPSG:4326")

    # Ensure CRS matches
    if ds_gdf.crs != points_gdf.crs:
        ds_gdf = ds_gdf.to_crs(points_gdf.crs)

    print("Performing spatial join...")
    joined = gpd.sjoin(points_gdf, ds_gdf, how="left", predicate="within")

    # Use known GeoJSON property names
    # adm2_name = District
    # adm3_name = DS Division

    if "adm2_name" in joined.columns:
        final_df["district"] = joined["adm2_name"].values
    else:
        final_df["district"] = None

    if "adm3_name" in joined.columns:
        final_df["ds_division"] = joined["adm3_name"].values
    else:
        final_df["ds_division"] = None

    print("Spatial join complete.")

    print("\nFinal combined shape:", final_df.shape)
    print("Total rows:", len(final_df))

    if "date" in final_df.columns and "pixel_id" in final_df.columns:
        final_df = final_df.sort_values(
            by=["pixel_id", "date"]
        ).reset_index(drop=True)


    # ================= SAVE LOCALLY =================
    from config.settings import BASE_DIR
    from pathlib import Path

    # Force save to: ricevision-pipeline/data/sat_csv
    output_dir = BASE_DIR / "data" / "sat_csv"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "combined_satellite.csv"

    final_df.to_csv(output_path, index=False)

    print("\nSaved combined satellite CSV locally:")
    print(output_path)


if __name__ == "__main__":
    combine_timestep_csvs()