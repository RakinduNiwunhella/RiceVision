from fastapi import APIRouter
from db import supabase

router = APIRouter()

@router.get("/yield")
def get_yield():
    response = supabase.table("yield_forecast_view") \
        .select("total_yield_tons") \
        .single() \
        .execute()

    return response.data



# ------------------ Additional Endpoints ------------------

@router.get("/best-districts")
def get_best_yield_districts():
    response = supabase.table("best_yield_districts_view") \
        .select("District, total_yield_ton_ha") \
        .limit(5) \
        .execute()
    return response.data


@router.get("/health-summary")
def get_health_summary():
    response = supabase.table("paddy_health_summary_view") \
        .select("normal_pct, mild_stress_pct, severe_stress_pct") \
        .eq("district", "kurunegala") \
        .single() \
        .execute()
    return response.data


@router.get("/outbreaks")
def get_outbreaks():
    response = supabase.table("disaster_risk_overview_view") \
        .select("id, title, district, event_date") \
        .order("event_date", desc=True) \
        .execute()
    return response.data


@router.get("/ndvi-trend")
def get_ndvi_trend():
    response = supabase.table("national_ndvi_trend_view") \
        .select("date, mean_ndvi") \
        .order("date") \
        .execute()

    return [
        {"day": row["date"], "value": row["mean_ndvi"]}
        for row in response.data
    ]


@router.get("/district-health")
def get_district_health():
    response = supabase.table("paddy_health_summary_view") \
        .select("district, normal_pct") \
        .order("normal_pct", desc=True) \
        .execute()
    return response.data