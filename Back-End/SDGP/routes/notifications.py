from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..db import supabase

router = APIRouter()


def _fetch_notifications_with_read_state(user_id: str):
    notifications_response = (
        supabase
        .table("notificationpanel")
        .select("id, title, message, description, created_at")
        .order("created_at", desc=True)
        .execute()
    )

    notifications = notifications_response.data or []
    notification_ids = [item["id"] for item in notifications]

    if not notification_ids:
        return []

    user_notifications_response = (
        supabase
        .table("user_notifications")
        .select("notification_id, is_read")
        .eq("user_id", user_id)
        .in_("notification_id", notification_ids)
        .execute()
    )

    read_map = {
        row["notification_id"]: bool(row.get("is_read"))
        for row in (user_notifications_response.data or [])
    }

    return [
        {
            **notification,
            "is_read": read_map.get(notification["id"], False),
        }
        for notification in notifications
    ]


def _get_unread_count_for_user(user_id: str) -> int:
    notifications_response = (
        supabase
        .table("notificationpanel")
        .select("id")
        .execute()
    )

    notifications = notifications_response.data or []
    notification_ids = [item["id"] for item in notifications]

    if not notification_ids:
        return 0

    read_response = (
        supabase
        .table("user_notifications")
        .select("notification_id")
        .eq("user_id", user_id)
        .eq("is_read", True)
        .in_("notification_id", notification_ids)
        .execute()
    )

    return max(len(notification_ids) - len(read_response.data or []), 0)


@router.get("/notifications")
def get_notifications(current_user=Depends(get_current_user)):
    return _fetch_notifications_with_read_state(current_user["user_id"])


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user=Depends(get_current_user)):
    notification_response = (
        supabase
        .table("notificationpanel")
        .select("id")
        .eq("id", notification_id)
        .execute()
    )

    if not notification_response.data:
        raise HTTPException(status_code=404, detail="Notification not found")

    write_response = (
        supabase
        .table("user_notifications")
        .upsert(
            {
                "user_id": current_user["user_id"],
                "notification_id": notification_id,
                "is_read": True,
            },
            on_conflict="user_id,notification_id",
        )
        .select("id")
        .execute()
    )

    if getattr(write_response, "data", None) is None:
        raise HTTPException(status_code=500, detail="Failed to store notification read status")

    return {
        "message": "Notification marked as read",
        "notification_id": notification_id,
        "unread_count": _get_unread_count_for_user(current_user["user_id"]),
    }


@router.get("/notifications/unread_count")
def get_unread_count(current_user=Depends(get_current_user)):
    return {"unread_count": _get_unread_count_for_user(current_user["user_id"])}
