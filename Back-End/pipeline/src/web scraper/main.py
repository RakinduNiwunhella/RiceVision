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