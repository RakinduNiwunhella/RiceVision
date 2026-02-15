from fastapi import APIRouter, Query
from typing import List
from ..db import supabase

router = APIRouter()


@router.get("/report-data")
def get_report_data(
    districts: str = Query(..., description="Comma separated district names"),
    month: int = Query(..., description="Month number"),
):
    """
    Fetch report analytics data filtered by districts and month
    """

    try:
        # Convert "Kurunegala,Gampaha" -> ["Kurunegala", "Gampaha"]
        district_list: List[str] = [d.strip() for d in districts.split(",")]

        # Build date range
        start_date = f"2025-{str(month).zfill(2)}-01"
        end_date = f"2025-{str(month).zfill(2)}-31"

        response = (
            supabase.table("reports_analytics_table")
            .select(
                """
                District,
                Date,
                total_yield_tons,
                healthy_percentage,
                risk_level,
                mean_ndvi,
                stage_name,
                pest_risk
                """
            )
            .in_("District", district_list)
            .gte("Date", start_date)
            .lte("Date", end_date)
            .execute()
        )

        return response.data

    except Exception as e:
        return {"error": str(e)}