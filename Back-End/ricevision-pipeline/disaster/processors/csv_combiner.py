import os
import pandas as pd
from config.settings import DISASTER_CSV_DIR


def combine_csvs():
    print("Combining CSV files...")

    all_dfs = []

    for file in os.listdir(DISASTER_CSV_DIR):
        if file.endswith(".csv"):
            path = os.path.join(DISASTER_CSV_DIR, file)

            try:
                df = pd.read_csv(path)

                # Add source file column (VERY useful later)
                df["source_file"] = file

                all_dfs.append(df)

            except Exception as e:
                print(f"Skipping {file}: {e}")

    if not all_dfs:
        print("No CSV files found.")
        return

    combined_df = pd.concat(all_dfs, ignore_index=True)

    output_path = os.path.join(DISASTER_CSV_DIR, "combined_dmc_data.csv")

    combined_df.to_csv(output_path, index=False)

    print(f"Combined file saved to: {output_path}")