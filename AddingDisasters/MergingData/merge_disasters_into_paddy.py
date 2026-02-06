import pandas as pd
from tqdm import tqdm

# load
paddy = pd.read_csv("sorted_badulla_sl_paddy.csv")
disaster = pd.read_csv("clean_disaster_dataset.csv")

# clean columns
paddy.columns = paddy.columns.str.strip().str.lower()
disaster.columns = disaster.columns.str.strip().str.lower()

paddy = paddy.rename(columns={"ds division": "ds_division", "ten_day": "date"})

# convert dates
paddy["date"] = pd.to_datetime(paddy["date"], errors="coerce")
disaster["date"] = pd.to_datetime(disaster["date"], errors="coerce")

# sort
paddy = paddy.sort_values("date")
disaster = disaster.sort_values("date")

hazard_cols = [c for c in disaster.columns if "hazard_" in c]

merged_rows = []

print(f"Processing {len(paddy)} paddy records...")

# progress bar added here
for _, p_row in tqdm(paddy.iterrows(), total=len(paddy), desc="Merging disasters"):

    div = p_row["ds_division"]
    p_date = p_row["date"]

    d_sub = disaster[disaster["ds_division"] == div]

    if len(d_sub) == 0:
        merged_rows.append(p_row)
        continue

    d_sub = d_sub.copy()
    d_sub["diff"] = (d_sub["date"] - p_date).dt.days

    # only within ±5 days
    d_sub = d_sub[d_sub["diff"].abs() <= 5]

    if len(d_sub) == 0:
        merged_rows.append(p_row)
        continue

    # closest, prefer +days
    d_sub["priority"] = d_sub["diff"].abs()
    best = d_sub.sort_values(["priority", "diff"], ascending=[True, False]).iloc[0]

    new_row = p_row.copy()

    for col in hazard_cols:
        new_row[col] = best[col]

    merged_rows.append(new_row)

final_df = pd.DataFrame(merged_rows)

for col in hazard_cols:
    final_df[col] = final_df[col].fillna(False)

final_df.to_csv("badulla_paddy_with_disasters.csv", index=False)

print("\nDONE ✅ Created paddy_with_disasters.csv")