import ee
import boto3
from datetime import datetime

# ---------------- CONFIG ----------------
BUCKET = "gee-sentinel-memory-ricevision"
KEY = "last_date.txt"

REGION = "ap-south-1"
INSTANCE_ID = "i-0f62250d285897010"  # <-- your EC2 instance ID 2
# ----------------------------------------

# AWS Clients
s3 = boto3.client("s3")
ec2 = boto3.client("ec2", region_name=REGION)

# --- Authenticate Earth Engine ---
credentials = ee.ServiceAccountCredentials(
    None,
    "gee_auth.json"
)
ee.Initialize(credentials)


def get_latest_date():
    sri_lanka = ee.Geometry.Rectangle([79.5, 5.5, 82.1, 10.1])

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(sri_lanka)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 80))
        .sort("system:time_start", False)
    )

    latest = collection.first()

    if latest is None:
        return None

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


def start_ec2_instance():
    print("🚀 Starting EC2 instance...")
    ec2.start_instances(InstanceIds=[INSTANCE_ID])
    print("✅ EC2 start command sent.")


def lambda_handler(event, context):

    print("🔍 Checking for latest Sentinel data...")

    latest = get_latest_date()

    if latest is None:
        print("No images found.")
        return {"status": "NO_DATA"}

    stored = read_s3_date()

    print("Latest:", latest)
    print("Stored:", stored)

    if latest > stored:
        print("🟢 NEW_DATA_AVAILABLE")
        write_s3_date(latest)
        start_ec2_instance()

        return {
            "status": "NEW_DATA",
            "latest": latest,
            "ec2_triggered": True
        }

    print("🔵 No new data.")
    return {
        "status": "NO_NEW_DATA",
        "latest": latest,
        "ec2_triggered": False
    }