from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.yield_routes import router as yield_router

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(yield_router)