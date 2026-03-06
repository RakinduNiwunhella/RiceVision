import pandas as pd
import os
from difflib import get_close_matches
from Automation.config.settings import CSV_DIR, FINAL_DIR
import boto3

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
    os.makedirs(FINAL_DIR, exist_ok=True)
    df.to_csv(output_path, index=False)

    print("Final dataset saved to FINAL folder.")

    # ================= UPLOAD TO S3 =================
    try:
        s3 = boto3.client("s3")

        bucket_name = "ricevision-original-sat-data"
        s3_key = "disaster_outputs/clean_disaster_dataset_with_district.csv"

        s3.upload_file(output_path, bucket_name, s3_key)

        print("Uploaded final dataset to S3 → disaster_outputs folder.")
    except Exception as e:
        print(f"S3 upload failed: {e}")