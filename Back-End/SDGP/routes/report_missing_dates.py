import boto3
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

def backfill_s3_with_env(bucket_name, base_prefix, source_date_folder):
    # Initialize S3 client using .env credentials
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION')
    )
    
    # Date Range: Jan 1, 2022 to March 28, 2026
    start_date = datetime(2022, 1, 1)
    end_date = datetime(2026, 3, 5)
    
    source_prefix = f"{base_prefix}{source_date_folder}/"
    
    # 1. Fetch files from the source folder to duplicate
    print(f"Reading source data from: {source_prefix}...")
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix)
    
    if 'Contents' not in response:
        print(f"Error: Source folder {source_prefix} is empty or not found.")
        return

    source_files = [obj['Key'] for obj in response['Contents']]
    print(f"Found {len(source_files)} files to copy.")

    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        target_prefix = f"{base_prefix}{date_str}/"

        # 2. Check if the target folder already exists
        check_exists = s3.list_objects_v2(Bucket=bucket_name, Prefix=target_prefix, MaxKeys=1)
        
        if 'Contents' in check_exists:
            print(f"[-] Skipping {date_str}: Folder already exists.")
        else:
            print(f"[+] Duplicating data into {date_str}...")
            for file_key in source_files:
                # Build the new path by swapping the date folder name
                new_key = file_key.replace(source_prefix, target_prefix)
                
                s3.copy_object(
                    Bucket=bucket_name,
                    CopySource={'Bucket': bucket_name, 'Key': file_key},
                    Key=new_key
                )
        
        # Increment by 5 days
        current_date += timedelta(days=5)

    print("\n--- Backfill Process Complete ---")

if __name__ == "__main__":
    # Configuration
    BUCKET = "ricevision"
    PREFIX = "SupabasePredictions/"
    SOURCE = "2026-03-27" # The existing folder to duplicate
    
    backfill_s3_with_env(BUCKET, PREFIX, SOURCE)