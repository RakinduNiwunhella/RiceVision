from disaster.scraper import scrape_dmc_reports
from disaster.pdf_extractor import process_all_pdfs
from disaster.cleaner import clean_disaster_data
from config.settings import PDF_DIR, DISASTER_CSV_DIR


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

    print("=== DISASTER PIPELINE STARTED ===")

    # Step 1: Scrape PDFs from DMC
    scrape_dmc_reports()

    # Step 2: Extract tables from PDFs → CSVs
    process_all_pdfs()

    # Step 3: Clean and classify disaster data (FINAL CSV)
    clean_disaster_data()

    # Step 4: Remove PDFs and intermediate CSV files
    cleanup_intermediate_files()

    print("=== DISASTER PIPELINE COMPLETED ===")


if __name__ == "__main__":
    run_pipeline()