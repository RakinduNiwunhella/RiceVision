from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import supabase

router = APIRouter(prefix="/api", tags=["Signup"])


class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str


@router.post("/signup")
async def signup(data: SignupRequest):

    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {"full_name": data.full_name}
            }
        })

        if response.user is None:
            raise HTTPException(status_code=400, detail="Signup failed")

        return {
            "message": "Signup successful",
            "id": response.user.id,
            "email": response.user.email,
            "full_name": data.full_name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
