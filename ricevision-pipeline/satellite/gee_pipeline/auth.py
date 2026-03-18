
import ee
from pathlib import Path
from config.settings import BASE_DIR, SERVICE_ACCOUNT, PROJECT_ID


def initialize_gee():
    print("Starting EE initialization...")

    # Correct path: ricevision-pipeline/credentials/gee-service-account.json
    key_path = BASE_DIR / "credentials" / "gee-service-account.json"

    print("Using key file at:", key_path)
    print("File exists?", key_path.exists())

    if not key_path.exists():
        raise FileNotFoundError(
            f"GEE service account key not found at: {key_path}"
        )

    credentials = ee.ServiceAccountCredentials(
        SERVICE_ACCOUNT,
        str(key_path)
    )

    ee.Initialize(credentials, project=PROJECT_ID)

    print("Initialized with SERVICE ACCOUNT:", SERVICE_ACCOUNT)
