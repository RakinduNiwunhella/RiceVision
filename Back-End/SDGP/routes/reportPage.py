from datetime import date, timedelta
from fastapi import APIRouter, HTTPException
from ..db import supabase

router = APIRouter()

# Sri Lanka national paddy historical average (kg/ha) used as baseline
HISTORICAL_BASELINE = 3900.0


@router.get("/detailed-report")
async def get_detailed_report(district: str, season: str = "Maha"):
    try:
        # 1. District health summary (yield, stress counts)
        health_res = (
            supabase.table("district_health_summary")
            .select("*")
            .eq("district", district)
            .single()
            .execute()
        )

        if not health_res.data:
            raise HTTPException(status_code=404, detail=f"No data found for district: {district}")

        health = health_res.data

        # 2. Latest growth stage & pest risk for this district
        stage_res = (
            supabase.table("alerts_overview_view")
            .select("stage_name, pest_risk, date")
            .eq("district", district)
            .order("date", desc=True)
            .limit(1)
            .execute()
        )
        stage = stage_res.data[0] if stage_res.data else {}

        # 3. Pest pixel count for this district
        pest_res = (
            supabase.table("pest_risk_by_district")
            .select("risky_pixels")
            .eq("district", district)
            .single()
            .execute()
        )
        pest = pest_res.data or {}

        # ---- Compute fields ----
        avg_yield   = float(health.get("avg_yield_kg_ha") or 0)
        total_yield = float(health.get("total_yield_kg")  or 0)
        total_fields = int(health.get("total_fields", 1) or 1)
        stressed  = int(health.get("stressed_fields",  0) or 0)
        critical  = int(health.get("critical_fields",  0) or 0)

        stress_pct  = round((stressed + critical) / total_fields * 100, 2)
        pest_count  = int(pest.get("risky_pixels", 0) or 0)
        # pest_risk in DB is 0–100; normalise to 0–10 for the UI risk score
        raw_risk    = float(stage.get("pest_risk", 0) or 0)
        risk_score  = round(raw_risk / 10, 2)

        current_stage = stage.get("stage_name") or "N/A"
        health_status = "Normal" if stress_pct < 5 else "Action Required"

        # Estimate harvest ~30 days from today
        harvest_date = (date.today() + timedelta(days=30)).isoformat()

        return {
            "summary": {
                "yield":      avg_yield,
                "historical": HISTORICAL_BASELINE,
                "total_kg":   total_yield,
                "gap":        round(avg_yield - HISTORICAL_BASELINE, 2),
            },
            "categories": {
                "current_stage": current_stage,
                "health_status": health_status,
            },
            "metrics": {
                "stress_pct":   stress_pct,
                "pest_count":   pest_count,
                "risk_score":   risk_score,
                "harvest_date": harvest_date,
            },
            "raw_data": {},
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))