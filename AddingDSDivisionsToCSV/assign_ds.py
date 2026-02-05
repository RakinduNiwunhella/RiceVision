import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# FILES
csv_file = "ampara_sl_paddy.csv"
geojson_file = "DSdevisions.geojson"

# Load CSV
df = pd.read_csv(csv_file)

# Create point geometry from lat/lon
geometry = [Point(xy) for xy in zip(df["lon"], df["lat"])]
points_gdf = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")

# Load DS divisions
ds_gdf = gpd.read_file(geojson_file)

# (Fix CRS mismatch if exists)
ds_gdf = ds_gdf.set_crs("EPSG:4326", allow_override=True)

# Spatial join
joined = gpd.sjoin(points_gdf, ds_gdf, how="left", predicate="within")

# Create clean column
joined["DS Division"] = joined["adm3_name"]

# Remove extra columns (optional but clean)
joined = joined[ list(df.columns) + ["DS Division"] ]

# Save
joined.to_csv("Ampara_points_with_ds.csv", index=False)

print("Finished ✔ — check points_with_ds.csv")