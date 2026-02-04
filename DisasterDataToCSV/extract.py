import pdfplumber
import pandas as pd
import re
from pathlib import Path

PDF_DIR = Path("pdfs")
OUT_DIR = Path("csv_output")
OUT_DIR.mkdir(exist_ok=True)

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
                # Find date anywhere in the row
                joined = " ".join(cell or "" for cell in row)
                date_match = DATE_REGEX.search(joined)
                if not date_match:
                    continue

                date = date_match.group()

                # Keep only English cells
                english_cells = [cell.strip() for cell in row if cell and is_english(cell)]

                if len(english_cells) < 2:
                    continue

                ds_division = english_cells[0]
                disaster = english_cells[1]

                rows.append({
                    "DS Division": ds_division,
                    "Disaster": disaster,
                    "Date of commenced": date
                })

    return pd.DataFrame(rows)

for pdf in PDF_DIR.glob("*.pdf"):
    df = extract_rows(pdf)

    if not df.empty:
        out = OUT_DIR / f"{pdf.stem}.csv"
        df.to_csv(out, index=False)
        print(f"✅ {pdf.name} → {len(df)} rows")
    else:
        print(f"⚠️ No English rows found in {pdf.name}")