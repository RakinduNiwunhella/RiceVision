import pandas as pd
from io import StringIO
from google.cloud import storage
from google.oauth2 import service_account


def combine_timestep_csvs():

    print("\n==============================")
    print("COMBINING 10 TIMESTEP CSVs")
    print("==============================\n")

    PROJECT_ID = "ricevision-487918"
    BUCKET_NAME = "ricevision-gee-exports"
    PREFIX = "district_exports/districts_csv_"
    OUTPUT_NAME = "district_exports/combined_10_timesteps.csv"

    SERVICE_ACCOUNT_PATH = (
        "Automation/credentials/gee-service-account.json"
    )

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

    print("\nFinal combined shape:", final_df.shape)
    print("Total rows:", len(final_df))

    if "date" in final_df.columns and "pixel_id" in final_df.columns:
        final_df = final_df.sort_values(
            by=["pixel_id", "date"]
        ).reset_index(drop=True)

    output_blob = bucket.blob(OUTPUT_NAME)

    output_blob.upload_from_string(
        final_df.to_csv(index=False),
        content_type="text/csv"
    )

    print("\n✅ Combined CSV uploaded to:")
    print(f"gs://{BUCKET_NAME}/{OUTPUT_NAME}\n")


if __name__ == "__main__":
    combine_timestep_csvs()