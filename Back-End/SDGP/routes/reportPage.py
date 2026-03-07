from fastapi import APIRouter, Query, HTTPException
import boto3
import pandas as pd
import io

router = APIRouter()

# Initialize S3 Client
s3_client = boto3.client('s3')

# CORRECT BUCKET NAME (Extracted from your URL)
BUCKET_NAME = "ricevision"

@router.get("/compare-reports")
def compare_reports(
    date_a: str = Query(..., description="Format: YYYY-MM-DD"),
    date_b: str = Query(..., description="Format: YYYY-MM-DD"),
    district: str = Query(None)
):
    """
    Fetches prediction artifacts from S3 for two different dates 
    and returns a comparison delta for the report page.
    """
    try:
        def get_df_from_s3(date_str):
            # Log exactly what we are looking for
            key = f"FinalPredictions/{date_str}/modelPredictions/lstm_results.csv"
            print(f"DEBUG: Looking for bucket: {BUCKET_NAME}")
            print(f"DEBUG: Looking for key: {key}")
            
            try:
                obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
                return pd.read_csv(io.BytesIO(obj['Body'].read()))
            except s3_client.exceptions.NoSuchKey:
                print(f"ERROR: The file {key} DOES NOT EXIST in bucket {BUCKET_NAME}")
                raise HTTPException(status_code=404, detail=f"File not found in S3: {key}")
            except Exception as e:
                print(f"ERROR: Unexpected S3 error: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
       

        # Download both datasets
        df_a = get_df_from_s3(date_a)
        df_b = get_df_from_s3(date_b)

        # Filter by district if requested
        if district:
            df_a = df_a[df_a['district'].str.lower() == district.lower()]
            df_b = df_b[df_b['district'].str.lower() == district.lower()]

        if df_a.empty or df_b.empty:
            return {"error": "No data found for the selected district in one or both dates."}

        # Calculate Aggregates for comparison
        # Using the column names identified in your previous snippets (pred_health_z, pred_pest_cpi)
        stats = {
            "baseline_date": date_a,
            "comparison_date": date_b,
            "baseline": {
                "avg_health": float(df_a['pred_health_z'].mean()),
                "avg_pest": float(df_a['pred_pest_cpi'].mean()),
                "common_stage": str(df_a['pred_stage_name'].mode()[0] if not df_a['pred_stage_name'].empty else "N/A")
            },
            "current": {
                "avg_health": float(df_b['pred_health_z'].mean()),
                "avg_pest": float(df_b['pred_pest_cpi'].mean()),
                "common_stage": str(df_b['pred_stage_name'].mode()[0] if not df_b['pred_stage_name'].empty else "N/A")
            },
            "deltas": {
                "health_change": float(df_b['pred_health_z'].mean() - df_a['pred_health_z'].mean()),
                "pest_trend": "Increasing" if df_b['pred_pest_cpi'].mean() > df_a['pred_pest_cpi'].mean() else "Stable/Decreasing",
                "is_health_improving": bool(df_b['pred_health_z'].mean() > df_a['pred_health_z'].mean())
            }
        }
        
        return stats

    except Exception as e:
        print(f"S3 Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))