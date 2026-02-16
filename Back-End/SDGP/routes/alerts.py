from fastapi import APIRouter, HTTPException
from db import supabase  # ensure db.py exports your Supabase client

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# Fetch all alerts
@router.get("/all")
async def get_all_alerts():
    try:
        response = supabase.table("alerts_overview_view").select("*").order("created_at", desc=True).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="No alerts found")

        # Map DB fields to frontend shape
        mapped_data = [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "status": a.status,
                "priority": a.priority,
                "field": a.district,
                "timestamp": a.created_at,
            }
            for a in response.data
        ]

        return mapped_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
