from pathlib import Path
import pandas as pd
from tqdm import tqdm

# ================= CONFIG =================
BASE_DIR = Path(__file__).resolve().parents[1]

DISASTER_FOLDER = BASE_DIR / "data" / "disaster_csv"
SAT_FOLDER = BASE_DIR / "data" / "sat_csv"
OUTPUT_FOLDER = BASE_DIR / "data" / "merged"
# ==========================================


def merge_disasters(sat_df, disaster_df):
    # Ensure date columns are datetime
    sat_df["date"] = pd.to_datetime(sat_df["date"], errors="coerce")
    disaster_df["date"] = pd.to_datetime(disaster_df["date"], errors="coerce")

    sat_df = sat_df.sort_values("date")
    disaster_df = disaster_df.sort_values("date")

    hazard_cols = [c for c in disaster_df.columns if "hazard_" in c]
    merged_rows = []

    for _, s_row in tqdm(sat_df.iterrows(), total=len(sat_df), desc="Matching disasters"):
        div = s_row.get("ds_division")
        s_date = s_row.get("date")

        if pd.isna(div) or pd.isna(s_date):
            merged_rows.append(s_row)
            continue

        d_sub = disaster_df[disaster_df["ds_division"] == div]
        if len(d_sub) == 0:
            merged_rows.append(s_row)
            continue

        d_sub = d_sub.copy()
        d_sub["diff"] = (d_sub["date"] - s_date).dt.days
        d_sub = d_sub[d_sub["diff"].abs() <= 5]
        if len(d_sub) == 0:
            merged_rows.append(s_row)
            continue

        d_sub["priority"] = d_sub["diff"].abs()
        best = d_sub.sort_values(["priority", "diff"], ascending=[True, False]).iloc[0]

        new_row = s_row.copy()
        for col in hazard_cols:
            new_row[col] = best[col]

        merged_rows.append(new_row)

    final_df = pd.DataFrame(merged_rows)

    # Ensure all hazard columns exist and default to False
    for col in hazard_cols:
        if col not in final_df.columns:
            final_df[col] = False
        else:
            final_df[col] = final_df[col].fillna(False)

    return final_df


def run_merge():
    disaster_files = list(DISASTER_FOLDER.glob("*.csv"))
    sat_files = list(SAT_FOLDER.glob("*.csv"))

    if len(disaster_files) != 1:
        raise Exception("There must be exactly ONE CSV inside data/disaster_csv")

    if len(sat_files) != 1:
        raise Exception("There must be exactly ONE CSV inside data/sat_csv")

    disaster_file = disaster_files[0]
    sat_file = sat_files[0]

    print(f"Using disaster file: {disaster_file.name}")
    print(f"Using satellite file: {sat_file.name}")

    sat_df = pd.read_csv(sat_file)
    disaster_df = pd.read_csv(disaster_file)

    final_df = merge_disasters(sat_df, disaster_df)

    OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_FOLDER / f"merged_{sat_file.name}"
    final_df.to_csv(output_path, index=False)

    print(f"Merged file saved to: {output_path}")


if __name__ == "__main__":
    run_merge()