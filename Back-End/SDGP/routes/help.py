from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import supabase

router = APIRouter(prefix="/help", tags=["Help"])


# -------------------- Complaint Model --------------------

class Complaint(BaseModel):
    full_name: str
    position: str | None = None
    province: str | None = None
    district: str | None = None
    complaint_type: str | None = None
    message: str


# -------------------- GET FAQs --------------------

@router.get("/faqs")
def get_faqs():
    try:
        response = supabase.table("faq") \
            .select("id, question, answer") \
            .execute()

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- POST Complaint --------------------

@router.post("/complaint")
def create_complaint(complaint: Complaint):
    try:
        data = {
            "full_name": complaint.full_name,
            "position": complaint.position,
            "province": complaint.province,
            "district": complaint.district,
            "complaint_type": complaint.complaint_type,
            "message": complaint.message,
        }

        response = supabase.table("complains") \
            .insert(data) \
            .execute()

        return {
            "message": "Complaint submitted successfully",
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))