import pandas as pd

# load csv
filename = "Anuradhapura_2025_Dec_p1.csv"
df = pd.read_csv(filename)
district_name = filename.split("_")[0]

# calculate NDVI
df["NDVI_smooth"] = (df["B8"] - df["B4"]) / (df["B8"] + df["B4"])
df = df.rename(columns={"lon": "lng", "date": "Date"})
df["District"] = district_name
df["stage_name"] = "Reproductive Stage"

import numpy as np

health_labels = ["Normal", "Severe Stress", "Mild Stress"]
health_weights = [0.85, 0.05, 0.10]

df["paddy_health"] = np.random.choice(
    health_labels,
    size=len(df),
    p=health_weights
)

# generate random yield values that sum to 112

yields = np.random.dirichlet(np.ones(len(df))) * 217994
df["yield_ton_ha"] = yields

# create disaster_risk column with fixed counts
risks = (
    ["Drought"] * 5 +
    ["Flood"] * 3 +
    ["Heat Stress"] * 6
)

# fill the rest with "Not Applicable"
remaining = len(df) - len(risks)
if remaining > 0:
    risks += ["Not Applicable"] * remaining

np.random.shuffle(risks)
df["disaster_risk"] = risks[:len(df)]

# create pest_risk column with fixed counts
pest = (
    ["Mid (Blast)"] * 12 +
    ["High (Blast)"] * 8
)

remaining_pest = len(df) - len(pest)
if remaining_pest > 0:
    pest += ["Low"] * remaining_pest

np.random.shuffle(pest)
df["pest_risk"] = pest[:len(df)]


cols_to_drop = [
    "system:index",
    "B1", "B2", "B3", "B4", "B5", "B6", "B7",
    "B8", "B8A", "B9", "B11", "B12",
    "SCL", "cloud_pct", "elevation",
    "rain_14d", "rain_1d", "rain_30d", "rain_3d", "rain_7d",
    "random", "rh_mean", "slope", "t_day", "t_night",
    "tmax", "tmean", "tmin", ".geo",
    "month",
    "period",
    "period_end",
    "period_start",
]

df = df.drop(columns=cols_to_drop, errors="ignore")

# move District to first column
if "District" in df.columns:
    cols = ["District"] + [c for c in df.columns if c != "District"]
    df = df[cols]

# save new csv
df.to_csv("DB_"+district_name+"_2025_M12.csv", index=False)