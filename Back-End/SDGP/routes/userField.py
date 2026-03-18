from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Optional

from ..auth import get_current_user
from ..db import supabase

router = APIRouter(prefix="/user-field", tags=["User Field"])


class UserFieldUpsert(BaseModel):
    field_name: Optional[str] = None
    geojson: dict[str, Any] = Field(..., description="GeoJSON Feature of the user field")
    area_acres: float = Field(..., gt=0)
    price_lkr: int = Field(..., ge=0)
    district: Optional[str] = None


@router.get("")
def get_user_field(current_user: dict = Depends(get_current_user)):
    try:
        response = (
            supabase.table("user_fields")
            .select("*")
            .eq("user_id", current_user["user_id"])
            .maybe_single()
            .execute()
        )

        # response.data is None if no field exists for this user — that's the expected behavior
        # when a user hasn't registered a field yet
        data = response.data if response else None
        return {"status": "success", "data": data}
    except Exception as exc:
        # Log the exception for debugging but don't expose internals
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch user field. Please try again later."
        )


@router.put("")
def upsert_user_field(payload: UserFieldUpsert, current_user: dict = Depends(get_current_user)):
    try:
        row = {
            "user_id": current_user["user_id"],
            "field_name": payload.field_name,
            "geojson": payload.geojson,
            "area_acres": payload.area_acres,
            "price_lkr": payload.price_lkr,
            "district": payload.district,
        }

        response = (
            supabase.table("user_fields")
            .upsert(row, on_conflict="user_id")
            .select("*")
            .maybe_single()
            .execute()
        )

        return {
            "status": "success",
            "message": "User field saved successfully",
            "data": response.data,
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to save user field: {str(exc)}")


@router.delete("")
def delete_user_field(current_user: dict = Depends(get_current_user)):
    try:
        (
            supabase.table("user_fields")
            .delete()
            .eq("user_id", current_user["user_id"])
            .execute()
        )

        return {"status": "success", "message": "User field deleted successfully"}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to delete user field: {str(exc)}")
