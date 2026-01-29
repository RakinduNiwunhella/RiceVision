from fastapi import FastAPI
from app.api import auth, districts, national

app = FastAPI(title="RiceVision API")

app.include_router(auth.router)
app.include_router(districts.router)
app.include_router(national.router)


@app.get("/")
def root():
    return {"status": "RiceVision backend running"}
