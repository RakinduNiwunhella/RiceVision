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

    # ===================== MATCH GEE TIMESTEPS ===================== #
    today = datetime.utcnow()

    timestep_dates = []
    for i in range(10):
        t_end = today - timedelta(days=15 * i)
        timestep_dates.append(t_end)

    newest_date = max(timestep_dates)
    oldest_date = min(timestep_dates)

    from_date = oldest_date.strftime("%Y-%m-%d")
    to_date = newest_date.strftime("%Y-%m-%d")

    print(f"Matching GEE timesteps:")
    print(f"Oldest timestep: {from_date}")
    print(f"Newest timestep: {to_date}")

    # ===================== BUILD URL ===================== #
    url = (
        "https://www.dmc.gov.lk/index.php?"
        f"option=com_dmcreports&view=reports&Itemid=273&limit=0"
        f"&search=&report_type_id=1"
        f"&fromdate={from_date}"
        f"&todate={to_date}&lang=en"
    )

    # ===================== CHROME SETUP ===================== #
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")

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
            break

    driver.quit()

    print(f"Found {len(pdf_links)} PDF files.")

    # ===================== DOWNLOAD ===================== #
    for pdf_url in pdf_links:
        filename = pdf_url.split("/")[-1]
        filepath = os.path.join(PDF_DIR, filename)

        if os.path.exists(filepath):
            continue

        try:
            response = requests.get(pdf_url)
            response.raise_for_status()

            with open(filepath, "wb") as f:
                f.write(response.content)

            print(f"Downloaded: {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")

    print("Scraping completed.")