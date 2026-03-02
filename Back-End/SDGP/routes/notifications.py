from fastapi import APIRouter
from ..db import supabase

router = APIRouter()

# ------------------ GET ALL NOTIFICATIONS ------------------
@router.get("/notifications")
def get_notifications():
    response = (
        supabase
        .table("notifications")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return response.data


# ------------------ MARK NOTIFICATION AS READ ------------------
@router.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int):
    response = (
        supabase
        .table("notifications")
        .update({"is_read": True})
        .eq("id", notification_id)
        .execute()
    )

    return {"message": "Notification marked as read"}