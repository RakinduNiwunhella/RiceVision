import subprocess
import sys
import boto3
from pathlib import Path
from datetime import datetime
from satellite.gee_pipeline.runner import run_national_inference_pipeline
from satellite.scripts.combine_csvs import combine_timestep_csvs

from disaster.scraper import scrape_dmc_reports
from disaster.pdf_extractor import process_all_pdfs
from disaster.cleaner import clean_disaster_data
from config.settings import PDF_DIR, DISASTER_CSV_DIR

from merge.merge_pipeline import run_merge


BUCKET_NAME = "ricevision"
S3_PREFIX = "FinalPredictions"
SUPABASE_S3_PREFIX = "SupabasePredictions"


def upload_final_outputs():
    print("\n Uploading results to S3...")

    s3 = boto3.client("s3")

    today_str = datetime.now().strftime("%Y-%m-%d")
    base_prefix = f"{S3_PREFIX}/{today_str}"

    local_final_path = Path("data/final")

    if not local_final_path.exists():
        print("⚠️ data/final folder not found.")
        return

    for file_path in local_final_path.rglob("*"):
        if file_path.is_file():
            relative_path = file_path.relative_to(local_final_path)
            s3_key = f"{base_prefix}/{relative_path}"

            print(f"Uploading {file_path} -> s3://{BUCKET_NAME}/{s3_key}")
            s3.upload_file(
                str(file_path),
                BUCKET_NAME,
                s3_key
            )

    print("✅ Upload completed successfully.")


def upload_supabase_predictions():
    print("\n Uploading Supabase predictions to S3...")

    s3 = boto3.client("s3")

    today_str = datetime.now().strftime("%Y-%m-%d")
    base_prefix = f"{SUPABASE_S3_PREFIX}/{today_str}"

    local_supabase_path = Path("data/final/finalPredictions")

    if not local_supabase_path.exists():
        print("⚠️ data/final/finalPredictions folder not found.")
        return

    for file_path in local_supabase_path.rglob("*"):
        if file_path.is_file():
            relative_path = file_path.relative_to(local_supabase_path)
            s3_key = f"{base_prefix}/{relative_path}"

            print(f"Uploading {file_path} -> s3://{BUCKET_NAME}/{s3_key}")
            s3.upload_file(
                str(file_path),
                BUCKET_NAME,
                s3_key
            )

    print("✅ Supabase upload completed successfully.")


def cleanup_intermediate_files():
    print("Cleaning up intermediate files...")

    # Delete all PDFs
    for pdf in PDF_DIR.glob("*.pdf"):
        try:
            pdf.unlink()
        except Exception as e:
            print(f"Could not delete {pdf.name}: {e}")

    # Delete all CSVs except the final clean dataset
    for csv_file in DISASTER_CSV_DIR.glob("*.csv"):
        if csv_file.name != "clean_disaster_dataset.csv":
            try:
                csv_file.unlink()
            except Exception as e:
                print(f"Could not delete {csv_file.name}: {e}")

    print("Cleanup completed.")


def run_pipeline():
    print("=== FULL PIPELINE STARTED ===")

    # ---------------- SATELLITE PIPELINE ----------------
    print("=== SATELLITE PIPELINE STARTED ===")
    run_national_inference_pipeline()
    combine_timestep_csvs()
    print("=== SATELLITE PIPELINE COMPLETED ===")

    # ---------------- DISASTER PIPELINE ----------------
    print("=== DISASTER PIPELINE STARTED ===")
    scrape_dmc_reports()
    process_all_pdfs()
    clean_disaster_data()
    cleanup_intermediate_files()
    print("=== DISASTER PIPELINE COMPLETED ===")

    # ---------------- MERGE PIPELINE ----------------
    print("=== MERGE PIPELINE STARTED ===")
    run_merge()
    print("=== MERGE PIPELINE COMPLETED ===")

    # ---------------- S3 UPLOADS ----------------
    print("=== S3 UPLOADS STARTED ===")

    upload_final_outputs()

    print("\n🚀 Running Supabase merge and upload...")
    subprocess.run(
        [sys.executable, "supabaseDataset/mergeAndUpload.py"],
        check=True,
    )

    upload_supabase_predictions()

    print("=== S3 UPLOADS COMPLETED ===")

    print("=== FULL PIPELINE COMPLETED ===")


if __name__ == "__main__":
    run_pipeline()