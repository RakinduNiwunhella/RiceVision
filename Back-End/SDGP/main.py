import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .auth import get_current_user
from .routes.dashboard import router as yield_router
from .routes.fieldData import router as field_data_router
from .routes.reportPage import router as report_router
from .routes.weather import router as weather_router
from .routes.help import router as help_router
from .routes.profile import router as profile_router
from .routes.mapPage import router as map_router
from .routes.userField import router as user_field_router
from .routes.alerts import router as alerts_router
from .routes.notifications import router as notifications_router
from .routes.chat import router as chat_router
from .routes.signin import router as signin_router
from .routes.signup import router as signup_router
from .routes.payment import router as payment_router
from pdf_report import router as pdf_router

app = FastAPI(title="RiceVision API", version="1.0.0")


app = FastAPI()
 
def _get_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    if configured.strip():
        return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]

    return [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://app.ricevisionlanka.com",
        "https://ricevision-cakt.onrender.com",
    ]

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_origin_regex=r"^https://([a-z0-9-]+\.)?ricevisionlanka\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PROTECTED ROUTES
app.include_router(yield_router, dependencies=[Depends(get_current_user)])
app.include_router(field_data_router, dependencies=[Depends(get_current_user)])
app.include_router(report_router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(weather_router, dependencies=[Depends(get_current_user)])
app.include_router(help_router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(profile_router, dependencies=[Depends(get_current_user)])
app.include_router(map_router, dependencies=[Depends(get_current_user)])
app.include_router(alerts_router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(notifications_router, dependencies=[Depends(get_current_user)])
app.include_router(chat_router, prefix="/api")
app.include_router(pdf_router, prefix="/api", dependencies=[Depends(get_current_user)])
