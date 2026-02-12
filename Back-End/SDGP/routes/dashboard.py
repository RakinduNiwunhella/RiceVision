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