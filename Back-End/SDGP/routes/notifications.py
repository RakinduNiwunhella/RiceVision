from fastapi import APIRouter
from pydantic import BaseModel
from ..db import supabase

router = APIRouter()

class NotificationCreate(BaseModel):
    message: str


# GET notifications
@router.get("/notifications")
def get_notifications():
    response = (
        supabase
        .table("notificationpanel")
        .select("*")
        .execute()
    )

    return response.data


# CREATE notification (ADMIN)
@router.post("/notifications")
def create_notification(notification: NotificationCreate):
    try:
        response = (
            supabase
            .table("notificationpanel")
            .insert({
                "message": notification.message,
                "is_read": False
            })
            .execute()
        )
        return response.data
    except Exception as e:
        return {"error": str(e)}


# MARK AS READ
@router.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str):
    try:
        response = (
            supabase
            .table("notificationpanel")
            .update({"is_read": True})
            .eq("id", notification_id)
            .execute()
        )
        return response.data
    except Exception as e:
        return {"error": str(e)}