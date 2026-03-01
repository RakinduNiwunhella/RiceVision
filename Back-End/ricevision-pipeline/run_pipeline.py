from satellite.gee_pipeline.runner import run_national_inference_pipeline
from satellite.scripts.combine_csvs import combine_timestep_csvs

from disaster.scraper import scrape_dmc_reports
from disaster.pdf_extractor import process_all_pdfs
from disaster.cleaner import clean_disaster_data
from config.settings import PDF_DIR, DISASTER_CSV_DIR

from merge.merge_pipeline import run_merge


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

    print("=== FULL PIPELINE COMPLETED ===")


if __name__ == "__main__":
    run_pipeline()