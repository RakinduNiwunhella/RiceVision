import io
import boto3
import pandas as pd
import numpy as np  # Add this import
from fastapi import APIRouter

router = APIRouter()
s3_client = boto3.client('s3')
BUCKET_NAME = "ricevision"

# HELPER: Converts NumPy types to standard Python types for JSON safety
def sanitize(val):
    if isinstance(val, (np.integer, np.int64)):
        return int(val)
    if isinstance(val, (np.floating, np.float64)):
        return float(val)
    if isinstance(val, pd.Timestamp):
        return str(val)
    if isinstance(val, dict):
        return {k: sanitize(v) for k, v in val.items()}
    if isinstance(val, list):
        return [sanitize(v) for v in val]
    return val

def get_csv_from_s3(key):
    try:
        obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
        return pd.read_csv(io.BytesIO(obj['Body'].read()))
    except:
        return None

@router.get("/detailed-report")
async def get_detailed_report(date: str, district: str, season: str):
    df_pixel = get_csv_from_s3(f"SupabasePredictions/{date}/FinalMlPredictions.csv")
    df_yield = get_csv_from_s3(f"SupabasePredictions/{date}/yieldPredictions.csv")

    def norm(name): return str(name).strip().lower().replace("th", "t")
    target = norm(district)

    y_match = df_yield[df_yield['districtname'].apply(norm) == target] if df_yield is not None else pd.DataFrame()
    p_match = df_pixel[df_pixel['district'].apply(norm) == target] if df_pixel is not None else pd.DataFrame()

    # Use .item() to convert numpy scalars to python scalars immediately
    res = {
        "summary": {
            "yield": float(y_match.iloc[0]['predictedyield_kg_ha']) if not y_match.empty else 0.0,
            "historical": float(y_match.iloc[0]['historicalavg_kg_ha']) if not y_match.empty else 0.0,
            "gap": float(y_match.iloc[0]['yieldgap_kg_ha']) if not y_match.empty else 0.0,
            "change": float(y_match.iloc[0]['percent_change']) if not y_match.empty else 0.0
        },
        "categories": {
            "current_stage": str(p_match['stage_name'].mode()[0]) if not p_match.empty else "N/A",
            "health_status": str(p_match['paddy_health'].mode()[0]) if not p_match.empty else "N/A",
            "most_common_stage": str(y_match.iloc[0]['most_common_stage']) if not y_match.empty else "N/A"
        },
        "metrics": {
            "stress_pct": float(y_match.iloc[0]['severe_stress_pct']) if not y_match.empty else 0.0,
            "pest_count": int(y_match.iloc[0]['pest_attack_count']) if not y_match.empty else 0,
            "risk_score": float(y_match.iloc[0]['risk_score']) if not y_match.empty else 0.0,
            "harvest_date": str(y_match.iloc[0]['est_harvest_date']) if not y_match.empty else "TBD"
        },
        "raw_data": {
            # Sanitize the entire dictionary before sending
            "yield_csv": sanitize(y_match.iloc[0].to_dict()) if not y_match.empty else {},
            "sample_pixel": sanitize(p_match.iloc[0].to_dict()) if not p_match.empty else {}
        }
    }
    
    return res