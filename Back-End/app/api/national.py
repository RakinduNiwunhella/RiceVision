from fastapi import APIRouter

router = APIRouter(prefix="/national", tags=["National"])


@router.get("/summary")
def national_summary():
    return {
        "year": 2025,
        "total_production_tons": 4_200_000,
        "total_consumption_tons": 3_800_000,
        "imports_tons": 120_000,
        "self_sufficiency": True
    }


@router.get("/season/{season}")
def season_summary(season: str):
    return {
        "season": season,
        "cultivated_area_ha": 1_100_000,
        "avg_yield_t_ha": 4.2
    }
