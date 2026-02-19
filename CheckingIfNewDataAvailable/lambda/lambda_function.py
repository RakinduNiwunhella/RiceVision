import ee
import boto3
import json
from botocore.exceptions import ClientError

# ==============================
# LOAD SERVICE ACCOUNT JSON
# ==============================

SERVICE_ACCOUNT = "gee-lambda@stable-being-427214-c6.iam.gserviceaccount.com"

with open("gee_auth.json") as f:
    key_data = json.load(f)

credentials = ee.ServiceAccountCredentials(
    SERVICE_ACCOUNT,
    key_data=json.dumps(key_data)
)

ee.Initialize(credentials)

# ==============================
# S3 CONFIG
# ==============================

BUCKET_NAME = "gee-sentinel-memory-ricevision"
OBJECT_KEY = "last_date.txt"

s3 = boto3.client("s3")

# ==============================
# LAMBDA HANDLER
# ==============================

def lambda_handler(event, context):

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

    stored_date = read_last_date()

    if stored_date is None:
        save_last_date(latest_date)
        return "Initialized memory."

    elif latest_date != stored_date:
        save_last_date(latest_date)
        return "NEW_DATA_AVAILABLE"

    else:
        return "NO_NEW_DATA"