from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.dashboard import router as yield_router
from .routes.fieldData import router as field_data_router
from .routes.reportPage import router as report_router
from .routes.weather import router as weather_router
from routes.help import router as help_router

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # local React dev
        "https://ricevision-frontend.onrender.com",  # deployed frontend (change to your real frontend URL)
        "*"                                # temporary: allow all during testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(yield_router)
app.include_router(field_data_router)
app.include_router(report_router, prefix="/api")
app.include_router(weather_router)
app.include_router(help_router, prefix="/api")