import ee

SERVICE_ACCOUNT = "gee-lambda@stable-being-427214-c6.iam.gserviceaccount.com"
KEY_FILE = "gee-key.json"

credentials = ee.ServiceAccountCredentials(SERVICE_ACCOUNT, KEY_FILE)
ee.Initialize(credentials)

print("Earth Engine initialized successfully")
