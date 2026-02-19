import pandas as pd
import glob
import os

def combine_panel():

    base_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../downloads")
    )

    pattern = os.path.join(base_path, "national_csv_t*.csv")

    files = sorted(glob.glob(pattern))

    if not files:
        print("No CSV files found.")
        return

    df_list = [pd.read_csv(f) for f in files]

    combined = pd.concat(df_list, ignore_index=True)

    output_path = os.path.join(base_path, "national_500m_panel.csv")
    combined.to_csv(output_path, index=False)

    print("Panel dataset saved at:", output_path)


if __name__ == "__main__":
    combine_panel()
