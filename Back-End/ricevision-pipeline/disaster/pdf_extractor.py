import pdfplumber
import pandas as pd
import re
from config.settings import PDF_DIR, DISASTER_CSV_DIR

DATE_REGEX = re.compile(r"\d{4}\.\d{2}\.\d{2}")
ENGLISH_ONLY = re.compile(r"^[A-Za-z][A-Za-z &/.\-]*$")

def is_english(text):
    if not text:
        return False
    return bool(ENGLISH_ONLY.match(text.strip()))

def extract_rows(pdf_path):
    rows = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue

            for row in table:
                joined = " ".join(cell or "" for cell in row)
                date_match = DATE_REGEX.search(joined)
                if not date_match:
                    continue

                date = date_match.group()
                english_cells = [cell.strip() for cell in row if cell and is_english(cell)]

                if len(english_cells) < 2:
                    continue

                rows.append({
                    "DS Division": english_cells[0],
                    "Disaster": english_cells[1],
                    "Date of commenced": date
                })

    return pd.DataFrame(rows)

def process_all_pdfs():

    DISASTER_CSV_DIR.mkdir(parents=True, exist_ok=True)

    for pdf in PDF_DIR.glob("*.pdf"):
        df = extract_rows(pdf)

        if not df.empty:
            out = DISASTER_CSV_DIR / f"{pdf.stem}.csv"
            df.to_csv(out, index=False)
            print("Processed:", pdf.name)