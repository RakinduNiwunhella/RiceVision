import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PDF_DIR = os.path.join(BASE_DIR, "data", "pdfs")
CSV_DIR = os.path.join(BASE_DIR, "data", "csvs")
COMBINED_DIR = os.path.join(BASE_DIR, "data", "combined")

DMC_URL = "https://www.dmc.gov.lk/index.php?option=com_dmcreports&view=reports&Itemid=273&limit=0&search=&report_type_id=1&fromdate=2022-01-01&todate=2026-02-18&lang=en"