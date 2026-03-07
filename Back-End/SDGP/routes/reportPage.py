import io
import boto3
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException

router = APIRouter()
s3_client = boto3.client('s3')
BUCKET_NAME = "ricevision"

def sanitize(val):
    if isinstance(val, (np.integer, np.int64)): return int(val)
    if isinstance(val, (np.floating, np.float64)): return float(val)
    if isinstance(val, pd.Timestamp): return str(val)
    if isinstance(val, dict): return {k: sanitize(v) for k, v in val.items()}
    if isinstance(val, list): return [sanitize(v) for v in val]
    return val

def check_s3_date_exists(date_str):
    """Checks if the 'folder' for the date exists in S3"""
    prefix = f"SupabasePredictions/{date_str}/"
    response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix, MaxKeys=1)
    return 'Contents' in response

def get_csv_from_s3(key):
    try:
        obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
        return pd.read_csv(io.BytesIO(obj['Body'].read()))
    except:
        return None

@router.get("/detailed-report")
async def get_detailed_report(date: str, district: str, season: str):
    # 1. Validation: Check if date exists
    if not check_s3_date_exists(date):
        raise HTTPException(status_code=404, detail=f"Data for date {date} is not available in S3.")

    # 2. Fetch Files
    df_yield = get_csv_from_s3(f"SupabasePredictions/{date}/yieldPredictions.csv")
    
    if df_yield is None:
        raise HTTPException(status_code=404, detail="Prediction files missing for this date.")

    def norm(name): return str(name).strip().lower().replace("th", "t")
    target = norm(district)

    # 3. Filter Data
    y_match = df_yield[(df_yield['districtname'].apply(norm) == target) & 
                       (df_yield['season'].str.lower() == season.lower())]

    if y_match.empty:
        raise HTTPException(status_code=404, detail="No matching district/season record found.")

    row = y_match.iloc[0]

    # 4. Construct Response with new 'total_kg' field
    res = {
        "summary": {
            "yield": float(row['predictedyield_kg_ha']),
            "historical": float(row['historicalavg_kg_ha']),
            "total_kg": float(row['totalyield_kg']), # New Field
            "gap": float(row['yieldgap_kg_ha']),
        },
        "categories": {
            "current_stage": str(row['most_common_stage']),
            "health_status": "Normal" if float(row['severe_stress_pct']) < 5 else "Action Required"
        },
        "metrics": {
            "stress_pct": float(row['severe_stress_pct']),
            "pest_count": int(row['pest_attack_count']),
            "risk_score": float(row['risk_score']),
            "harvest_date": str(row['est_harvest_date']).split(' ')[0]
        },
        "raw_data": {
            "yield_csv": sanitize(row.to_dict())
        }
    }
    return res