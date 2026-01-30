from fastapi import APIRouter

router = APIRouter(prefix="/districts", tags=["Districts"])


@router.get("/")
def get_all_districts():
    return [
        {"district": "Anuradhapura", "yield_tons": 420000},
        {"district": "Polonnaruwa", "yield_tons": 380000},
        {"district": "Kurunegala", "yield_tons": 310000},
    ]


@router.get("/{district_name}")
def get_district_data(district_name: str):
    return {
        "district": district_name,
        "season": "Maha",
        "area_ha": 120000,
        "estimated_yield_tons": 350000,
        "health_index": 0.82
    }
