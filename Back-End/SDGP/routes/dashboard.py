from fastapi import APIRouter, HTTPException
from ..db import supabase

router = APIRouter()


# ------------------ Yield Forecast ------------------
@router.get("/yield")
def get_yield():
    try:
        response = (
            supabase
            .table("yield_forecast_view")
            .select("total_yield_kgs")  # FIXED column name
            .maybe_single()             # FIXED (no crash if 0 rows)
            .execute()
        )

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ Best Districts ------------------
@router.get("/best-districts")
def get_best_yield_districts():
    try:
        response = (
            supabase
            .table("best_yield_districts_view")
            .select("District, total_yield_kg_ha")
            .limit(5)
            .execute()
        )

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ Health Summary ------------------
@router.get("/health-summary")
def get_health_summary():
    try:
        response = (
            supabase
            .table("paddy_health_summary_view")
            .select("normal_pct, mild_stress_pct, severe_stress_pct")
            .eq("district", "kurunegala")
            .maybe_single()  # FIXED
            .execute()
        )

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ Outbreaks ------------------
@router.get("/outbreaks")
def get_outbreaks():
    try:
        response = (
            supabase
            .table("disaster_risk_overview_view")
            .select("id, title, district, event_date")
            .order("event_date", desc=True)
            .execute()
        )

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ District Health ------------------
@router.get("/district-health")
def get_district_health():
    try:
        response = (
            supabase
            .table("paddy_health_summary_view")
            .select("district, normal_pct")
            .order("normal_pct", desc=True)
            .execute()
        )

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))