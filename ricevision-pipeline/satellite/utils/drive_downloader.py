import time
import os
import io
import ee
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"]


# --------------------------------------------------
# BUILD DRIVE SERVICE
# --------------------------------------------------

def get_drive_service():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=DRIVE_SCOPES
    )
    return build("drive", "v3", credentials=credentials)


# --------------------------------------------------
# WAIT FOR EARTH ENGINE TASK
# --------------------------------------------------

def wait_for_task(task):
    print("Waiting for Earth Engine task to complete...")

    while True:
        status = task.status()
        state = status["state"]

        print("Task state:", state)

        if state == "COMPLETED":
            print("Export completed.")
            break
        elif state == "FAILED":
            raise Exception("Earth Engine export failed.")

        time.sleep(10)


# --------------------------------------------------
# DOWNLOAD FILE FROM DRIVE
# --------------------------------------------------

def download_and_delete_drive_file(filename, local_dir="downloads"):

    os.makedirs(local_dir, exist_ok=True)

    service = get_drive_service()

    query = f"name contains '{filename}' and trashed=false"

    results = service.files().list(
        q=query,
        spaces="drive",
        fields="files(id, name)"
    ).execute()

    files = results.get("files", [])

    if not files:
        raise Exception("No file found in Drive.")

    file_id = files[0]["id"]
    file_name = files[0]["name"]

    print("Downloading:", file_name)

    request = service.files().get_media(fileId=file_id)
    fh = io.FileIO(os.path.join(local_dir, file_name), "wb")
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()
        print(f"Download {int(status.progress() * 100)}%")

    fh.close()

    # Delete from Drive after download
    service.files().delete(fileId=file_id).execute()
    print("Deleted file from Drive.")

    return os.path.join(local_dir, file_name)
