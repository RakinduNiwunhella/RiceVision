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
            .table("pest_risk_view")
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
                "status": r.get("status") or "Open",
                "risky_pixel_locations": r.get("risky_pixel_locations") or []
            }
            for r in response.data
        ]

        return mapped_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 3️⃣ GET DISASTER ALERTS
# -----------------------------
@router.get("/disasters")
async def get_disasters():
    try:
        response = (
            supabase
            .table("disaster_risk_view")
            .select("*")
            .neq("disaster_risk", "Not Applicable")
            .order("date", desc=True)
            .execute()
        )

        if not response.data:
            return []

        mapped_data = [
            {
                "id": a.get("id"),
                "district": a.get("district"),
                "disaster_type": (
                    a.get("disaster_risk")
                    .replace("hazard_", "")
                    .lower()
                    .replace("_", " ")
                ),
                "stage": a.get("stage_name"),
                "health": a.get("paddy_health"),
                "timestamp": a.get("date"),
                "lat": a.get("lat"),
                "lon": a.get("lon"),
                "status": a.get("status") or "Open"
            }
            for a in response.data
        ]

        return mapped_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 4️⃣ UPDATE DISASTER ALERT STATUS (by ID)
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


# -----------------------------
# 5️⃣ UPDATE PEST ALERT STATUS (by district)
# -----------------------------
@router.put("/pest/{district}")
async def update_pest_status(district: str, body: AlertStatusUpdate):
    try:
        response = (
            supabase
            .table("alerts")
            .update({"status": body.status})
            .ilike("district", district)
            .eq("pest_risk", 1)
            .execute()
        )

        return {"message": f"Pest alerts in {district} updated"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 6️⃣ GET PAST ALERTS
# -----------------------------
@router.get("/past")
async def get_past_alerts():
    try:
        response = (
            supabase
            .table("past_alerts_view")
            .select("*")
            .order("date", desc=True)
            .execute()
        )

        if not response.data:
            return []

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))