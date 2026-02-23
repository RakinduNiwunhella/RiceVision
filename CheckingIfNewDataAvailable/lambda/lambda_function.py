import ee
import boto3
from datetime import datetime

BUCKET = "gee-sentinel-memory-ricevision"
KEY = "last_date.txt"

# --- Authenticate Earth Engine ---
credentials = ee.ServiceAccountCredentials(
    None,
    "gee_auth.json"
)
ee.Initialize(credentials)

s3 = boto3.client("s3")


def get_latest_date():
    sri_lanka = ee.Geometry.Rectangle([79.5, 5.5, 82.1, 10.1])

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(sri_lanka)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 80))
        .sort("system:time_start", False)
    )

    latest = collection.first()
    date = ee.Date(latest.get("system:time_start")).format("YYYY-MM-dd")
    return date.getInfo()


def read_s3_date():
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=KEY)
        return obj["Body"].read().decode().strip()
    except:
        return "1900-01-01"


def write_s3_date(date):
    s3.put_object(Bucket=BUCKET, Key=KEY, Body=date)


def lambda_handler(event, context):

    latest = get_latest_date()
    stored = read_s3_date()

    print("Latest:", latest)
    print("Stored:", stored)

    if latest > stored:
        print("NEW_DATA_AVAILABLE")
        write_s3_date(latest)
        return {"status": "NEW_DATA", "latest": latest}

    return {"status": "NO_NEW_DATA", "latest": latest}