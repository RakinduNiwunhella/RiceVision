import pdfplumber
import pandas as pd
import re
import os
from Automation.config.settings import PDF_DIR, CSV_DIR

DATE_REGEX = re.compile(r"\d{4}\.\d{2}\.\d{2}")
ENGLISH_ONLY = re.compile(r"^[A-Za-z][A-Za-z &/.\-]*$")


def is_english(text):
    if not text:
        return False
    text = text.strip()
    return bool(ENGLISH_ONLY.match(text))


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
    os.makedirs(CSV_DIR, exist_ok=True)

    for file in os.listdir(PDF_DIR):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(PDF_DIR, file)
            df = extract_rows(pdf_path)

            if not df.empty:
                output_path = os.path.join(CSV_DIR, f"{file.replace('.pdf', '.csv')}")
                df.to_csv(output_path, index=False)
                print(f"Processed {file}")