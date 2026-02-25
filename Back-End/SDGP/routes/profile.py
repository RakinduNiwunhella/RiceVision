from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from ..db import supabase

router = APIRouter()

# ------------------ Helper ------------------
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = authorization.replace("Bearer ", "")
    user_response = supabase.auth.get_user(token)
    user = user_response.user
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user

# ------------------ Models ------------------
class ProfileUpdate(BaseModel):
    firstName: str
    lastName: str
    phone: Optional[str] = None
    nic: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    avatarUrl: Optional[str] = None

# ------------------ Endpoints ------------------
@router.get("/profile")
def fetch_profile(user=Depends(get_current_user)):
    user_metadata = user.user_metadata or {}
    full_name = user_metadata.get("full_name", "")
    name_parts = full_name.split(" ", 1)

    return {
        "firstName": name_parts[0] if name_parts else "",
        "lastName": name_parts[1] if len(name_parts) > 1 else "",
        "email": user.email,
        "phone": user_metadata.get("phone", ""),
        "nic": user_metadata.get("nic", ""),
        "district": user_metadata.get("district", ""),
        "address": user_metadata.get("address", ""),
        "avatarUrl": user_metadata.get("avatar_url", "")
    }

@router.put("/profile")
def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    full_name = f"{data.firstName} {data.lastName}".strip()
    update_data = {
        "full_name": full_name,
        "phone": data.phone,
        "nic": data.nic,
        "district": data.district,
        "address": data.address,
        "avatar_url": data.avatarUrl
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}

    response = supabase.auth.update_user({
        "id": user.id,
        "data": update_data
    })

    if response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    
    return {"message": "Profile updated successfully"}