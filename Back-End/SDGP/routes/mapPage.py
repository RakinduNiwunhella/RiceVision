from fastapi import APIRouter, Query
from typing import List
from ..db import supabase

router = APIRouter()


@router.get("/map-fields")
async def get_map_fields(
    health: List[str] = Query(default=[]),
    districts: List[str] = Query(default=[]),
):
    try:

        query = supabase.table("Final_Dataset_Points").select(
            "lat, lon, paddy_health, district"
        )

        # district filter
        if districts:
            query = query.in_("district", districts)

        # health filter (direct DB values)
        if health:
            query = query.in_("paddy_health", health)

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