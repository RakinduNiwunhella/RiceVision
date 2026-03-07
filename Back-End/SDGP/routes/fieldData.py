from fastapi import APIRouter, HTTPException
from ..db import supabase  # make sure db.py exports supabase client

router = APIRouter(prefix="/field-data", tags=["Field Data"])


# 1️⃣ Get Summary Stats
@router.get("/summary")
async def get_field_summary():
    try:
        response = supabase.table("field_summary_view").select("*").single().execute()

        if response.data is None:
            raise HTTPException(status_code=404, detail="No summary data found")

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2️⃣ Get District Table Data
@router.get("/districts")
async def get_district_health_summary():
    try:
        response = supabase.table("field_summary_view").select("*").maybe_single().execute()

        if response.data is None:
            raise HTTPException(status_code=404, detail="No district data found")

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))