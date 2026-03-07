from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import supabase

router = APIRouter(prefix="/alerts", tags=["Alerts"])


class AlertStatusUpdate(BaseModel):
    status: str


# -----------------------------
# 1️⃣ GET ALL ALERTS
# -----------------------------
@router.get("/all")
async def get_all_alerts():
    try:
        response = (
            supabase
            .table("alerts_overview_view")
            .select("*")
            .order("date", desc=True)
            .execute()
        )

        if not response.data:
            return []

        mapped_data = [
            {
                "id": a.get("id"),
                "title": a.get("alert_type"),
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


# -----------------------------
# 2️⃣ GET PEST RISK BY DISTRICT
# -----------------------------
@router.get("/pest-risk")
async def get_pest_risk_by_district():
    try:
        response = (
            supabase
            .table("pest_risk_by_district")
            .select("*")
            .execute()
        )

        if not response.data:
            return []

        mapped_data = [
            {
                "district": r.get("district"),
                "total_pixels": r.get("total_pixels"),
                "risky_pixels": r.get("risky_pixels"),
                "risky_pixel_locations": r.get("risky_pixel_locations")
            }
            for r in response.data
        ]

        return mapped_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# 3️⃣ GET DISASTER RISK
# -----------------------------
@router.get("/disasters")
async def get_disasters():
    try:
        response = (
            supabase
            .table("alerts_overview_view")
            .select("*")
            .in_("disaster_risk", ["Flood", "Drought", "Storm"])
            .order("date", desc=True)
            .execute()
        )

        if not response.data:
            return []

        mapped_data = [
            {
                "id": a.get("id"),
                "district": a.get("district"),
                "disaster_type": a.get("disaster_risk"),
                "stage": a.get("stage_name"),
                "health": a.get("paddy_health"),
                "timestamp": a.get("date"),
                "lat": a.get("lat"),
                "lon": a.get("lon")
            }
            for a in response.data
        ]

        return mapped_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))        


# -----------------------------
# 3️⃣ UPDATE ALERT STATUS
# -----------------------------
@router.put("/{alert_id}")
async def update_alert_status(alert_id: int, body: AlertStatusUpdate):
    try:
        response = (
            supabase
            .table("alerts")
            .update({"status": body.status})
            .eq("id", alert_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"message": "Alert updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))