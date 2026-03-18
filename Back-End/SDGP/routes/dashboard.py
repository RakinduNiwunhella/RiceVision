from fastapi import APIRouter
from ..db import supabase

router = APIRouter()

@router.get("/yield")
def get_yield():
    response = supabase.table("Final_Dataset_Yield") \
        .select("districtname, season, totalyield_kg") \
        .limit(5000) \
        .execute()

    rows = response.data or []
    if not rows:
        return {
            "season": None,
            "total_yield_kgs": 0,
            "district_count": 0,
        }

    season_groups = {}
    for row in rows:
        season_raw = (row.get("season") or "").strip()
        district_raw = (row.get("districtname") or "").strip().lower()
        total_yield = float(row.get("totalyield_kg") or 0)

        if not season_raw or not district_raw:
            continue

        season_key = season_raw.lower()
        group = season_groups.setdefault(season_key, {
            "season": season_raw,
            "districts": set(),
            "total_yield_kgs": 0.0,
            "rows": 0,
        })

        group["districts"].add(district_raw)
        group["total_yield_kgs"] += total_yield
        group["rows"] += 1

    if not season_groups:
        return {
            "season": None,
            "total_yield_kgs": 0,
            "district_count": 0,
        }

    # Prefer the season that covers the most districts (expected: 25 districts).
    best = max(
        season_groups.values(),
        key=lambda g: (len(g["districts"]), g["rows"], g["total_yield_kgs"]),
    )

    return {
        "season": best["season"],
        "total_yield_kgs": best["total_yield_kgs"],
        "district_count": len(best["districts"]),
    }



# ------------------ Additional Endpoints ------------------

@router.get("/best-districts")
def get_best_yield_districts():
    response = supabase.table("best_yield_districts_view") \
        .select("District, total_yield_kg_ha") \
        .limit(5) \
        .execute()
    return response.data


@router.get("/health-summary")
def get_health_summary():
    response = supabase.table("sri_lanka_paddy_health_summary") \
        .select("normal_pct, mild_stress_pct, severe_stress_pct") \
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




@router.get("/district-health")
def get_district_health():
    response = supabase.table("paddy_health_summary_view") \
        .select("district, normal_pct") \
        .order("normal_pct", desc=True) \
        .execute()
    return response.data

@router.get("/stage-distribution")
def get_stage_distribution():
    response = supabase.table("stage_name_counts_view") \
        .select("stage_name, stage_count") \
        .execute()

    return response.data