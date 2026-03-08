from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import supabase

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertStatusUpdate(BaseModel):
    status: str

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

@router.put("/{alert_id}")
async def update_alert_status(alert_id: int, body: AlertStatusUpdate):
    try:
        response = (
            supabase
            .table("alerts")  # use your real base table name if different
            .update({"status": body.status})
            .eq("id", alert_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"message": "Alert updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))