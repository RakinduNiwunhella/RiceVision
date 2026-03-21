import os
import traceback
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
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
from .pdf_report import router as pdf_router

app = FastAPI(title="RiceVision API", version="1.0.0") 

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.get("/api/available-dates")
def get_available_dates():
    """Fallback dummy endpoint for Earth Engine layers."""
    return ["2026-03-01", "2026-02-15", "2026-02-01", "2026-01-15", "2025-12-01", "2025-11-15"]

def _get_cors_origins() -> list[str]:
    """Get allowed origin URLs from environment or use defaults."""
    configured = os.getenv("CORS_ORIGINS", "")
    if configured.strip():
        return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]

    return [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://app.ricevisionlanka.com",
        "https://ricevision-cakt.onrender.com",
    ]


# Configure CORS middleware with proper settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_origin_regex=r"^https://([a-z0-9-]+\.)?ricevisionlanka\.com$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# PUBLIC ROUTES (no authentication required)
app.include_router(signin_router)
app.include_router(signup_router)
# PayHere /payment/notify is called server-to-server (no JWT) so we register
# the whole router as public; the hash endpoint enforces auth internally via Depends.
app.include_router(payment_router)


@app.get("/health")
def health_check():
    """Health check endpoint - always available."""
    return {"status": "ok", "api": "RiceVision API"}


# PROTECTED ROUTES (authentication required)
app.include_router(yield_router, dependencies=[Depends(get_current_user)])
app.include_router(field_data_router, dependencies=[Depends(get_current_user)])
app.include_router(report_router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(weather_router, dependencies=[Depends(get_current_user)])
app.include_router(help_router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(profile_router, dependencies=[Depends(get_current_user)])
app.include_router(map_router, dependencies=[Depends(get_current_user)])
app.include_router(user_field_router, dependencies=[Depends(get_current_user)])
app.include_router(alerts_router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(notifications_router, dependencies=[Depends(get_current_user)])
app.include_router(chat_router, prefix="/api")
app.include_router(pdf_router, prefix="/api", dependencies=[Depends(get_current_user)])
