from fastapi import APIRouter, HTTPException
from db import supabase

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/all")
async def get_all_alerts():
    try:
        response = (
            supabase
            .table("alerts_overview_view")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        # If no data, return empty list instead of error
        if not response.data:
            return []

        # Supabase returns dictionaries, so use ["key"] not .key
        mapped_data = [
            {
                "id": a.get("id"),
                "title": a.get("title"),
                "description": a.get("description"),
                "status": a.get("status"),
                "priority": a.get("priority"),
                "field": a.get("district"),
                "timestamp": a.get("created_at"),
            }
            for a in response.data
        ]

        return mapped_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))