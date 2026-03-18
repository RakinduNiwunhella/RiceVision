from fastapi import APIRouter, HTTPException
import requests

router = APIRouter(prefix="/api", tags=["Weather"])

# Colombo coordinates
LAT = 6.9271
LON = 79.8612


@router.get("/weather")
def get_weather():
    """
    Fetch weather details from Open-Meteo
    and send them to the frontend.
    """
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={LAT}&longitude={LON}"
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