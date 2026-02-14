from fastapi import APIRouter, Query
from typing import List, Optional
from db import supabase  # make sure this matches your file name

router = APIRouter()

@router.get("/map-fields")
async def get_map_fields(
    districts: Optional[List[str]] = Query(None),
    season: Optional[str] = Query(None),
    health: Optional[List[str]] = Query(None),
):
    try:
        query = supabase.table("fields").select("*")

        if districts:
            query = query.in_("district", districts)

        if season and season != "all":
            query = query.eq("season", season)

        if health:
            query = query.in_("health", health)

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