import ee

def initialize_gee():
    print("Starting EE initialization...")

    SERVICE_ACCOUNT = "gee-worker@ricevision-487310.iam.gserviceaccount.com"
    KEY_PATH = r"C:\Users\ASUS\.gcp\gee-worker.json"

    credentials = ee.ServiceAccountCredentials(
        SERVICE_ACCOUNT,
        KEY_PATH
    )

    print("Credentials created")

    ee.Initialize(credentials, project="ricevision-487310")

    print("Initialized with SERVICE ACCOUNT:", SERVICE_ACCOUNT)
