from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.dashboard import router as yield_router
from routes.fieldData import router as field_data_router
from routes.reportPage import router as report_router
from routes.mapPage import router as map_router
from routes.profile import router as profile_router
from routes.alerts import router as alerts_router  # added alerts router

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(yield_router)
app.include_router(field_data_router)
app.include_router(report_router, prefix="/api")
app.include_router(map_router, prefix="/api", tags=["Map"])
app.include_router(profile_router)
app.include_router(alerts_router, prefix="/api", tags=["Alerts"])
