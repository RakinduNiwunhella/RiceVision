import io
import os
import boto3
import pandas as pd
import numpy as np
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, HTTPException

router = APIRouter()
BUCKET_NAME = "ricevision"


def _s3():
    """Create an S3 client using env-var credentials (required on Render)."""
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_DEFAULT_REGION", "ap-southeast-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def sanitize(val):
    if pd.isna(val): return None
    if isinstance(val, (np.integer, int, np.int64)): return int(val)
    if isinstance(val, (np.floating, float, np.float64)): return float(val)
    if isinstance(val, pd.Timestamp): return str(val)
    if isinstance(val, dict): return {k: sanitize(v) for k, v in val.items()}
    if isinstance(val, list): return [sanitize(v) for v in val]
    return val


def _check_s3_date_exists(client, date_str):
    prefix = f"SupabasePredictions/{date_str}/"
    resp = client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix, MaxKeys=1)
    return "Contents" in resp


def _get_csv_from_s3(client, key):
    try:
        obj = client.get_object(Bucket=BUCKET_NAME, Key=key)
        return pd.read_csv(io.BytesIO(obj["Body"].read()))
    except Exception:
        return None


@router.get("/available-dates")
async def get_available_dates():
    """Return sorted list of dates that have prediction data in S3."""
    try:
        client = _s3()
        resp = client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix="SupabasePredictions/",
            Delimiter="/",
        )
        prefixes = resp.get("CommonPrefixes", [])
        dates = sorted(
            [p["Prefix"].split("/")[1] for p in prefixes if p.get("Prefix")],
            reverse=True,
        )
        return {"dates": dates}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=503, detail=f"S3 error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/detailed-report")
async def get_detailed_report(date: str, district: str, season: str):
    try:
        client = _s3()

        if not _check_s3_date_exists(client, date):
            raise HTTPException(status_code=404, detail=f"No data for date {date} in S3.")

        df_yield = _get_csv_from_s3(client, f"SupabasePredictions/{date}/yieldPredictions.csv")
        if df_yield is None:
            raise HTTPException(status_code=404, detail="Prediction files missing for this date.")

        def norm(name): return str(name).strip().lower().replace("th", "t")
        target = norm(district)

        y_match = df_yield[
            (df_yield["districtname"].apply(norm) == target) &
            (df_yield["season"].str.lower() == season.lower())
        ]

        if y_match.empty:
            raise HTTPException(status_code=404, detail="No matching district/season record found.")

        row = y_match.iloc[0]

        def safe_float(val, default=0.0):
            try: return float(val) if not pd.isna(val) else default
            except: return default

        def safe_int(val, default=0):
            try: return int(val) if not pd.isna(val) else default
            except: return default

        def safe_str(val, default="N/A"):
            return str(val) if pd.notna(val) else default

        stress_pct = safe_float(row.get("severe_stress_pct"))

        response_dict = {
            "summary": {
                "yield":      safe_float(row.get("predictedyield_kg_ha")),
                "historical": safe_float(row.get("historicalavg_kg_ha")),
                "total_kg":   safe_float(row.get("totalyield_kg")),
                "gap":        safe_float(row.get("yieldgap_kg_ha")),
            },
            "categories": {
                "current_stage": safe_str(row.get("most_common_stage")),
                "health_status": "Normal" if stress_pct < 5 else "Action Required",
            },
            "metrics": {
                "stress_pct":   stress_pct,
                "pest_count":   safe_int(row.get("pest_attack_count")),
                "risk_score":   safe_float(row.get("risk_score")),
                "harvest_date": safe_str(row.get("est_harvest_date")).split(" ")[0],
            },
            "raw_data": {
                "yield_csv": row.to_dict(),
            },
        }

        return sanitize(response_dict)

    except HTTPException:
        raise
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=503, detail=f"S3 error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))