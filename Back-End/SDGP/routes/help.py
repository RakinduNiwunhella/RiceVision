from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..db import supabase  # Ensure this points to your Supabase client

# Define the router with the /help prefix
router = APIRouter(prefix="/help", tags=["Help"])

# --- Models ---
class Complaint(BaseModel):
    user_id: Optional[str] = None
    full_name: str
    position: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    complaint_type: Optional[str] = None
    message: str
    is_anonymous: bool = False

# --- Endpoints ---

@router.get("/faqs")
def get_faqs():
    """Fetches questions and answers from the 'faq' table."""
    try:
        response = supabase.table("faq") \
            .select("id, question, answer") \
            .order("created_at", desc=False) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complaints")
def create_complaint(payload: Complaint):
    """Inserts a new complaint into the 'complains' table."""
    try:
        # Construct the data dictionary
        data = {
            "full_name": payload.full_name,
            "position": payload.position,
            "province": payload.province,
            "district": payload.district,
            "complaint_type": payload.complaint_type,
            "message": payload.message,
            "is_anonymous": payload.is_anonymous
        }

        # Fix for the UUID error: Only add user_id if it's a real ID
        if payload.user_id and payload.user_id != "string" and payload.user_id.strip() != "":
            data["user_id"] = payload.user_id

        # Insert into Supabase
        response = supabase.table("complains").insert(data).execute()
        
        return {"status": "success", "message": "Complaint submitted successfully"}
            
    except Exception as e:
        # This catches the 'null value violates not-null constraint'
        raise HTTPException(status_code=400, detail=str(e))