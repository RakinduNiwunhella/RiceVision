from fastapi import APIRouter, Query
from typing import List
from ..db import supabase

router = APIRouter()

HEALTH_MAP = {
    "Healthy": "Normal",
    "Stressed": "Mild Stress",
    "Damaged": "Severe Stress",
}

@router.get("/map-fields")
async def get_map_fields(
    health: List[str] = Query(default=[]),
    districts: List[str] = Query(default=[]),
):
    try:

        query = supabase.table("Final_Dataset_Points").select(
            "lat, lon, paddy_health, district"
        )

        query = query.neq("paddy_health", "Not Applicable")

        if districts:
            query = query.in_("district", districts)

        if health:
            db_health_values = [
                HEALTH_MAP[h] for h in health if h in HEALTH_MAP
            ]
            if db_health_values:
                query = query.in_("paddy_health", db_health_values)

        response = query.execute()

        data = [
            {
                "lat": r["lat"],
                "lng": r["lon"],
                "paddy_health": r["paddy_health"],
                "district": r["district"],
            }
            for r in response.data
        ]

        return {
            "status": "success",
            "count": len(data),
            "data": data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }