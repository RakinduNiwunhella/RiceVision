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
            .order("date", desc=True)   # use date instead of created_at
            .execute()
        )

        if not response.data:
            return []

        mapped_data = [
            {
                "id": a.get("id"),
                "title": a.get("alert_type"),                 # derived column from view
                "description": f"Stage: {a.get('stage_name')} | Health: {a.get('paddy_health')}",
                "status": a.get("status"),
                "priority": (
                    "High" if a.get("pest_risk", 0) >= 80
                    else "Medium" if a.get("pest_risk", 0) >= 50
                    else "Low"
                ),
                "field": a.get("district"),
                "timestamp": a.get("date"),
                "lat": a.get("lat"),
                "lon": a.get("lon")
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
            .table("alerts")   # base table storing alert statuses
            .update({"status": body.status})
            .eq("id", alert_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"message": "Alert updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))