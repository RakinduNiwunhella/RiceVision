from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.dashboard import router as yield_router
from .routes.fieldData import router as field_data_router
from .routes.reportPage import router as report_router
from .routes.weather import router as weather_router
from .routes.help import router as help_router
from .routes.profile import router as profile_router
from .routes.mapPage import router as map_router
from .routes.alerts import router as alerts_router
from .routes.notifications import router as notifications_router
from .routes.chat import router as chat_router

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # local React dev
        "https://ricevision-cakt.onrender.com",  # deployed frontend (change to your real frontend URL)
                                     # temporary: allow all during testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(yield_router)
app.include_router(field_data_router)
app.include_router(report_router, prefix="/api")
app.include_router(weather_router)
app.include_router(help_router, prefix="/api")
app.include_router(profile_router)
app.include_router(map_router)
app.include_router(alerts_router, prefix="/api")
app.include_router(notifications_router)
app.include_router(chat_router)

