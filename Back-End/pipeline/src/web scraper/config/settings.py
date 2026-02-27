import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(BASE_DIR, "data")
PDF_DIR = os.path.join(DATA_DIR, "pdfs")
CSV_DIR = os.path.join(DATA_DIR, "csvs")
FINAL_DIR = os.path.join(DATA_DIR, "final")

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(CSV_DIR, exist_ok=True)
os.makedirs(FINAL_DIR, exist_ok=True)