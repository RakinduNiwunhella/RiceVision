import ee
import boto3
from botocore.exceptions import ClientError

# ==============================
# CONFIG
# ==============================

PROJECT_ID = "stable-being-427214-c6"
BUCKET_NAME = "gee-sentinel-memory-ricevision"
OBJECT_KEY = "last_date.txt"

# ==============================
# INITIALIZE SERVICES
# ==============================

# Initialize Earth Engine
ee.Initialize(project=PROJECT_ID)

# Initialize S3 client
s3 = boto3.client("s3")

# ==============================
# GET LATEST SENTINEL-2 DATE
# ==============================

# Sri Lanka boundary
sri_lanka = ee.Geometry.Rectangle([79.5, 5.5, 82.1, 10.1])

collection = (
    ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(sri_lanka)
    .sort("system:time_start", False)
)

latest = collection.first()

latest_date = ee.Date(
    latest.get("system:time_start")
).format("YYYY-MM-dd").getInfo()

# ==============================
# FUNCTIONS TO READ / WRITE S3
# ==============================

def read_last_date():
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=OBJECT_KEY)
        return response["Body"].read().decode("utf-8").strip()
    except ClientError:
        return None


def save_last_date(date_value):
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=OBJECT_KEY,
        Body=date_value.encode("utf-8")
    )


# ==============================
# MAIN LOGIC
# ==============================

stored_date = read_last_date()

print("Latest:", latest_date)
print("Stored:", stored_date)

if stored_date is None:
    print("No stored date found. Saving first date...")
    save_last_date(latest_date)
    print("Initialized memory.")

elif latest_date != stored_date:
    print("NEW_DATA_AVAILABLE")
    save_last_date(latest_date)
    print("Memory updated.")

else:
    print("NO_NEW_DATA")