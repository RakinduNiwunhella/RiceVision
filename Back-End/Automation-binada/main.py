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

    print("=== Pipeline Completed Successfully ===")


if __name__ == "__main__":
    run_pipeline()