import os
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from tqdm import tqdm

# 🔹 Folder containing your CSV files
folder_path = "with disasters"   # change if full path is needed

all_points = []
skipped_files = 0

# 🔹 Loop through all CSV files with progress bar
csv_files = [f for f in os.listdir(folder_path) if f.endswith(".csv")]

for file in tqdm(csv_files, desc="Processing CSV files"):
    file_path = os.path.join(folder_path, file)

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"⚠️ Skipping corrupted file: {file}")
        skipped_files += 1
        continue

    # Make sure lat/lon columns exist
    if "lat" in df.columns and "lon" in df.columns:
        temp = df[["lat", "lon"]].dropna()
        all_points.append(temp)

# 🔹 Combine all CSVs
combined_df = pd.concat(all_points, ignore_index=True)

# 🔹 Remove duplicate coordinate pairs
combined_df = combined_df.drop_duplicates(subset=["lat", "lon"])
print(f"📍 Total unique points: {len(combined_df)}")
print(f"⚠️ Total skipped files: {skipped_files}")

# 🔹 Create geometry column
geometry = [
    Point(xy) 
    for xy in tqdm(
        zip(combined_df["lon"], combined_df["lat"]),
        total=len(combined_df),
        desc="Creating geometries"
    )
]

gdf = gpd.GeoDataFrame(combined_df, geometry=geometry, crs="EPSG:4326")

# 🔹 Save as GeoJSON
output_file = "all_points.geojson"
gdf.to_file(output_file, driver="GeoJSON")

print("✅ GeoJSON created:", output_file)