from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import supabase

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileUpdate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    district: Optional[str] = None

# -----------------------------
# 1️⃣ Get User Profile
# -----------------------------
@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 2️⃣ Update User Profile
# -----------------------------
@router.put("/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    try:
        response = (
            supabase
            .table("profiles")
            .update(profile.dict())
            .eq("id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found or not updated")

        return {
            "message": "Profile updated successfully",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 3️⃣ Create Profile (Optional)
# -----------------------------
@router.post("/")
async def create_profile(profile: ProfileUpdate):
    try:
        response = (
            supabase
            .table("profiles")
            .insert(profile.dict())
            .execute()
        )

        return {
            "message": "Profile created successfully",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))