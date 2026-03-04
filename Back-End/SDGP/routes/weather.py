from fastapi import APIRouter, HTTPException, Query
import requests

router = APIRouter(prefix="/api", tags=["Weather"])


@router.get("/weather")
def get_weather(
    latitude: float = Query(...),
    longitude: float = Query(...)
):
    """
    Fetch weather details from Open-Meteo
    based on dynamic user location.
    """
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}&longitude={longitude}"
            "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,cloud_cover"
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max"
            "&past_days=7&timezone=auto"
        )

        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Weather provider failed")

        return response.json()

    except requests.exceptions.RequestException:
        raise HTTPException(status_code=500, detail="Cannot connect to weather service")