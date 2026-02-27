import pandas as pd
import os
from difflib import get_close_matches
from Automation.config.settings import CSV_DIR, FINAL_DIR

DS_TO_DISTRICT = {
    "colombo": "Colombo",
    "dehiwala": "Colombo",
    "kotte": "Colombo",
    "maharagama": "Colombo",
    "kesbewa": "Colombo",
    "moratuwa": "Colombo",
    "gampaha": "Gampaha",
    "negombo": "Gampaha",
    "kalutara": "Kalutara",
    "galle": "Galle",
    "matara": "Matara",
    "hambantota": "Hambantota",
    "ratnapura": "Ratnapura",
    "kandy": "Kandy"
}


def add_district_column():
    print("Adding district column...")

    input_file = os.path.join(CSV_DIR, "clean_disaster_dataset.csv")

    if not os.path.exists(input_file):
        print("Clean dataset not found.")
        return

    df = pd.read_csv(input_file)

    df["ds_clean"] = df["ds_division"].astype(str).str.lower().str.strip()

    official_names = list(DS_TO_DISTRICT.keys())

    def resolve_district(name):
        if name in DS_TO_DISTRICT:
            return DS_TO_DISTRICT[name]

        match = get_close_matches(name, official_names, n=1, cutoff=0.75)
        if match:
            return DS_TO_DISTRICT[match[0]]

        return "Unknown"

    df["district"] = df["ds_clean"].apply(resolve_district)

    df.drop(columns=["ds_clean"], inplace=True)

    output_path = os.path.join(FINAL_DIR, "clean_disaster_dataset_with_district.csv")
    df.to_csv(output_path, index=False)

    print("Final dataset saved to FINAL folder.")