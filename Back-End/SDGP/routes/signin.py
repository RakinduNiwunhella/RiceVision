from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import supabase

router = APIRouter(prefix="/api", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(data: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ResetPasswordRequest(BaseModel):
    email: str


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):

    try:
        supabase.auth.reset_password_for_email(
            data.email,
            {"redirect_to": "http://localhost:5173/reset-password"}
        )

        return {"message": "Password reset email sent"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))