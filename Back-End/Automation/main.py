from Automation.scrapers.dmc_scraper import scrape_dmc_reports
from Automation.processors.pdf_extractor import process_all_pdfs
from Automation.processors.csv_combiner import combine_csvs

def run_pipeline():
    print("Starting pipeline...")
    scrape_dmc_reports()
    process_all_pdfs()
    combine_csvs()
    print("Pipeline finished.")


if __name__ == "__main__":
    run_pipeline()