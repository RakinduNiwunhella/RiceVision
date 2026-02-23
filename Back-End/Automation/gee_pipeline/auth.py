import ee
import os

def initialize_gee():
    print("Starting EE initialization...")

    SERVICE_ACCOUNT = "gee-worker@ricevision-487918.iam.gserviceaccount.com"

    BASE_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )

    KEY_PATH = os.path.join(BASE_DIR, "credentials", "gee-service-account.json")

    print("Using key file at:", KEY_PATH)
    print("File exists?", os.path.exists(KEY_PATH))

    credentials = ee.ServiceAccountCredentials(
        SERVICE_ACCOUNT,
        KEY_PATH
    )

    ee.Initialize(credentials, project="ricevision-487918")

    print("Initialized with SERVICE ACCOUNT:", SERVICE_ACCOUNT)
