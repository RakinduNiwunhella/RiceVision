from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

PDF_DIR = DATA_DIR / "pdfs"
DISASTER_CSV_DIR = DATA_DIR / "disaster_csv"
SATELLITE_CSV_DIR = DATA_DIR / "satellite_csv"
MERGED_DIR = DATA_DIR / "merged"
FINAL_DIR = DATA_DIR / "final"

GCS_BUCKET = "ricevision-gee-exports"
S3_BUCKET = "ricevision-original-sat-data"

PROJECT_ID = "ricevision-487918"
SERVICE_ACCOUNT = "gee-worker@ricevision-487918.iam.gserviceaccount.com"