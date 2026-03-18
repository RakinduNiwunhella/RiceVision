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
    # Primary source: precomputed top-yield view for quick dashboard preview.
    response = supabase.table("best_yield_districts_view") \
        .select("District, total_yield_kg_ha") \
        .order("total_yield_kg_ha", desc=True) \
        .limit(5) \
        .execute()

    ranked = [
        row for row in (response.data or [])
        if (row.get("District") or "").strip() and row.get("total_yield_kg_ha") is not None
    ]

    # Fallback: when the view returns fewer than 5 valid rows, compute from raw dataset.
    if len(ranked) < 5:
        raw = supabase.table("Final_Dataset_Yield") \
            .select("districtname, predictedyield_kg_ha") \
            .limit(5000) \
            .execute()

        district_stats = {}
        for row in (raw.data or []):
            district = (row.get("districtname") or "").strip()
            value = row.get("predictedyield_kg_ha")

            if not district or value is None:
                continue

            try:
                numeric_value = float(value)
            except (TypeError, ValueError):
                continue

            stats = district_stats.setdefault(district, {"sum": 0.0, "count": 0})
            stats["sum"] += numeric_value
            stats["count"] += 1

        fallback_ranked = sorted(
            [
                {
                    "District": district,
                    "total_yield_kg_ha": stats["sum"] / stats["count"],
                }
                for district, stats in district_stats.items()
                if stats["count"] > 0
            ],
            key=lambda item: float(item["total_yield_kg_ha"]),
            reverse=True,
        )

        seen = {
            (row.get("District") or "").strip().lower()
            for row in ranked
        }

        for row in fallback_ranked:
            district_key = (row.get("District") or "").strip().lower()
            if not district_key or district_key in seen:
                continue

            ranked.append(row)
            seen.add(district_key)

            if len(ranked) >= 5:
                break

    return ranked[:5]


@router.get("/district-yields")
def get_district_yields():
    response = supabase.table("Final_Dataset_Yield") \
        .select("districtname, predictedyield_kg_ha, totalyield_kg") \
        .limit(5000) \
        .execute()

    rows = response.data or []
    district_stats = {}

    for row in rows:
        district = (row.get("districtname") or "").strip()
        if not district:
            continue

        district_key = district.lower()
        stats = district_stats.setdefault(
            district_key,
            {
                "districtname": district,
                "sum_predicted": 0.0,
                "predicted_count": 0,
                "sum_total_yield": 0.0,
            },
        )

        predicted_value = row.get("predictedyield_kg_ha")
        total_yield_value = row.get("totalyield_kg")

        try:
            if predicted_value is not None:
                stats["sum_predicted"] += float(predicted_value)
                stats["predicted_count"] += 1
        except (TypeError, ValueError):
            pass

        try:
            if total_yield_value is not None:
                stats["sum_total_yield"] += float(total_yield_value)
        except (TypeError, ValueError):
            pass

    district_rows = []
    for stats in district_stats.values():
        predicted_avg = (
            stats["sum_predicted"] / stats["predicted_count"]
            if stats["predicted_count"] > 0
            else 0.0
        )

        district_rows.append(
            {
                "districtname": stats["districtname"],
                "predictedyield_kg_ha": predicted_avg,
                "totalyield_kg": stats["sum_total_yield"],
            }
        )

    district_rows.sort(
        key=lambda item: (
            float(item.get("totalyield_kg") or 0),
            float(item.get("predictedyield_kg_ha") or 0),
        ),
        reverse=True,
    )

    return district_rows[:25]


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