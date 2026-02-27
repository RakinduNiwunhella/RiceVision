from Automation.scrapers.dmc_scraper import scrape_dmc_reports
from Automation.processors.pdf_extractor import process_all_pdfs
from Automation.processors.csv_combiner import combine_csvs
from Automation.processors.clean_and_merge import clean_disaster_data
from Automation.processors.add_district_column import add_district_column


def run_pipeline():
    print("=== DMC Disaster Pipeline Started ===")

    scrape_dmc_reports()
    process_all_pdfs()
    combine_csvs()
    clean_disaster_data()
    add_district_column()

    # ================= FINAL MERGE STEP =================
    print("Running final satellite + disaster merge...")

    from Automation.scripts.combine_csvs import combine_timestep_csvs
    combine_timestep_csvs()

    print("Uploading FINAL merged dataset to S3...")

    import boto3
    from datetime import datetime
    import pandas as pd

    s3 = boto3.client("s3")

    bucket_name = "ricevision-original-sat-data"
    file_key = f"final_runs/run_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    # Path of merged file created by combine_timestep_csvs
    merged_path = "district_exports/combined_10_timesteps.csv"

    with open(merged_path, "rb") as f:
        s3.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=f,
            ContentType="text/csv"
        )

    print(f"Uploaded FINAL merged dataset to s3://{bucket_name}/{file_key}")

    # ================= DELETE INTERMEDIATE MERGE FILES =================
    try:
        # Delete satellite combined file
        if os.path.exists(merged_path):
            os.remove(merged_path)
            print("Deleted intermediate satellite combined CSV.")

        # Delete disaster cleaned dataset
        disaster_final_path = os.path.join(FINAL_DIR, "clean_disaster_dataset_with_district.csv")
        if os.path.exists(disaster_final_path):
            os.remove(disaster_final_path)
            print("Deleted intermediate disaster dataset CSV.")

    except Exception as e:
        print(f"Failed to delete intermediate merge files: {e}")

    # ================= CLEANUP INTERMEDIATE FILES =================
    import os
    from Automation.config.settings import PDF_DIR, CSV_DIR, FINAL_DIR

    print("Cleaning up intermediate files...")

    # Delete all PDFs
    if os.path.exists(PDF_DIR):
        for file in os.listdir(PDF_DIR):
            if file.endswith(".pdf"):
                try:
                    os.remove(os.path.join(PDF_DIR, file))
                except:
                    pass

    # Delete all CSVs except final output
    final_file = os.path.join(FINAL_DIR, "clean_disaster_dataset_with_district.csv")

    if os.path.exists(CSV_DIR):
        for file in os.listdir(CSV_DIR):
            if file.endswith(".csv"):
                try:
                    os.remove(os.path.join(CSV_DIR, file))
                except:
                    pass

    print("Intermediate files deleted. Only final dataset remains.")

    print("=== Pipeline Completed Successfully ===")


if __name__ == "__main__":
    run_pipeline()