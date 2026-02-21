from fastapi import APIRouter, Query
from typing import List, Optional
from db import supabase

router = APIRouter()

# Mapping UI health names -> DB health names
HEALTH_MAP = {
    "Healthy": "Normal",
    "Stressed": "Mild Stress",
    "Damaged": "Severe Stress",
}

@router.get("/map-fields")
async def get_map_fields(
    health: Optional[List[str]] = Query(None),
    districts: Optional[List[str]] = Query(None),
):
    try:
        # Query correct ML table
        query = supabase.table("final_ml_predictions").select(
            "lat, lng, paddy_health, District"
        )

        # Always remove Not Applicable
        query = query.neq("paddy_health", "Not Applicable")

        # Filter by district (from frontend)
        if districts:
            query = query.in_("District", districts)

        # Filter by health (convert UI → DB values)
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