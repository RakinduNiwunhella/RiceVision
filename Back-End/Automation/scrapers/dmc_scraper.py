import os
import time
import requests
from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

from Automation.config.settings import PDF_DIR


def scrape_dmc_reports():
    print("Starting DMC scraper...")

    os.makedirs(PDF_DIR, exist_ok=True)

    # 🔹 Calculate last 10 days dynamically
    today = datetime.today()
    ten_days_ago = today - timedelta(days=10)

    from_date = ten_days_ago.strftime("%Y-%m-%d")
    to_date = today.strftime("%Y-%m-%d")

    url = (
        "https://www.dmc.gov.lk/index.php?"
        f"option=com_dmcreports&view=reports&Itemid=273&limit=0"
        f"&search=&report_type_id=1&fromdate={from_date}"
        f"&todate={to_date}&lang=en"
    )

    print(f"Scraping reports from {from_date} to {to_date}")

    # 🔹 Chrome options (Fix crash issue)
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--remote-debugging-port=9222")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    driver.get(url)
    wait = WebDriverWait(driver, 20)

    pdf_links = set()
    page = 1

    while True:
        print(f"Scraping page {page}...")

        try:
            wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        except:
            print("No table found.")
            break

        links = driver.find_elements(By.TAG_NAME, "a")

        for link in links:
            href = link.get_attribute("href")
            if href and ".pdf" in href.lower():
                pdf_links.add(href)

        try:
            next_button = driver.find_element(By.LINK_TEXT, "Next")
            driver.execute_script("arguments[0].click();", next_button)
            time.sleep(2)
            page += 1
        except:
            print("No more pages.")
            break

    driver.quit()

    print(f"Found {len(pdf_links)} PDF files.")

    # 🔹 Download PDFs
    for pdf_url in pdf_links:
        filename = pdf_url.split("/")[-1]
        filepath = os.path.join(PDF_DIR, filename)

        if os.path.exists(filepath):
            print(f"Skipping existing file: {filename}")
            continue

        try:
            response = requests.get(pdf_url)
            response.raise_for_status()

            with open(filepath, "wb") as f:
                f.write(response.content)

            print(f"Downloaded: {filename}")
            time.sleep(1)

        except Exception as e:
            print(f"Failed to download {filename}: {e}")

    print("Scraping completed.")