import subprocess
import sys
import boto3
from pathlib import Path
from datetime import datetime


BUCKET_NAME = "ricevision"
S3_PREFIX = "FinalPredictions"


def upload_final_outputs():
    print("\n☁️ Uploading results to S3...")

    s3 = boto3.client("s3")

    # Today's date folder
    today_str = datetime.now().strftime("%Y-%m-%d")
    base_prefix = f"{S3_PREFIX}/{today_str}"

    local_final_path = Path("data/final")

    if not local_final_path.exists():
        print("⚠️ data/final folder not found.")
        return

    for file_path in local_final_path.rglob("*"):
        if file_path.is_file():
            relative_path = file_path.relative_to(local_final_path)
            s3_key = f"{base_prefix}/{relative_path}"

            print(f"Uploading {file_path} -> s3://{BUCKET_NAME}/{s3_key}")
            s3.upload_file(
                str(file_path),
                BUCKET_NAME,
                s3_key
            )

    print("✅ Upload completed successfully.")


def run_pipeline():
    print("=== FULL INFERENCE PIPELINE STARTED ===")

    # Run preprocessing
    print("\n🚀 Running preprocessing pipeline...")
    subprocess.run(
        [sys.executable, "-m", "pipelines.inference_preprocessing"],
        check=True,
        cwd="preprocessing",
    )

    # Run BiLSTM inference
    print("\n🚀 Running BiLSTM inference pipeline...")
    subprocess.run(
        [sys.executable, "-m", "pipelines.BiLSTM_inference"],
        check=True,
        cwd="preprocessing",
    )

    # Run yield inference
    print("\n🚀 Running yield inference pipeline...")
    subprocess.run(
        [sys.executable, "-m", "pipelines.yield_inference"],
        check=True,
        cwd="preprocessing",
    )

    print("\n=== PIPELINE COMPLETED SUCCESSFULLY ===")

    # Upload to S3 after everything is done
    upload_final_outputs()


if __name__ == "__main__":
    run_pipeline()