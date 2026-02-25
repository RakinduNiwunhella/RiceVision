from fastapi import APIRouter, Query
from typing import List
from ..db import supabase

router = APIRouter()

# Mapping UI health names -> DB health names
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
        # Query ML predictions table
        query = supabase.table("final_ml_predictions").select(
            "lat, lng, paddy_health, District"
        )

        # Always remove Not Applicable
        query = query.neq("paddy_health", "Not Applicable")

        # Filter by district (match DB column name exactly: "District")
        if districts:
            query = query.in_("District", districts)

        # Filter by health (convert UI values → DB values)
        if health:
            db_health_values = [
                HEALTH_MAP[h] for h in health if h in HEALTH_MAP
            ]
            if db_health_values:
                query = query.in_("paddy_health", db_health_values)

        response = query.execute()

        return {
            "status": "success",
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }