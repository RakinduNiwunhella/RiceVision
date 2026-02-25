from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import requests
import os
import time
from Automation.config.settings import PDF_DIR, DMC_URL


def scrape_dmc_reports():
    os.makedirs(PDF_DIR, exist_ok=True)

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get(DMC_URL)
    wait = WebDriverWait(driver, 20)

    pdf_links = set()
    page = 1

    while True:
        print(f"Scraping page {page}")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))

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

    print(f"Found {len(pdf_links)} PDFs")

    for pdf_url in pdf_links:
        filename = pdf_url.split("/")[-1]
        filepath = os.path.join(PDF_DIR, filename)

        if os.path.exists(filepath):
            continue

        try:
            r = requests.get(pdf_url)
            with open(filepath, "wb") as f:
                f.write(r.content)
            print("Downloaded:", filename)
        except Exception as e:
            print("Failed:", filename, e)

    print("Scraping complete.")