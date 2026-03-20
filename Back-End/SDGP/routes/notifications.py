from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..db import supabase

router = APIRouter()

TABLE_NOTIFICATIONS = "notificationpanel"
TABLE_READS = "notification_reads"


def _fetch_notifications_with_read_state(user_id: str):
    """Fetch all notifications and attach per-user read state."""
    notifications_response = (
        supabase
        .table(TABLE_NOTIFICATIONS)
        .select("id, title, message, description, created_at")
        .order("created_at", desc=True)
        .execute()
    )

    notifications = notifications_response.data or []
    notification_ids = [n["id"] for n in notifications]

    if not notification_ids:
        return []

    # Get which notifications this user has read
    reads_response = (
        supabase
        .table(TABLE_READS)
        .select("notification_id")
        .eq("user_id", user_id)
        .in_("notification_id", notification_ids)
        .execute()
    )

    read_ids = {row["notification_id"] for row in (reads_response.data or [])}

    return [
        {**n, "is_read": n["id"] in read_ids}
        for n in notifications
    ]


def _get_unread_count_for_user(user_id: str) -> int:
    """Count how many notifications this user has NOT read."""
    notifications_response = (
        supabase
        .table(TABLE_NOTIFICATIONS)
        .select("id")
        .execute()
    )

    all_ids = [n["id"] for n in (notifications_response.data or [])]

    if not all_ids:
        return 0

    reads_response = (
        supabase
        .table(TABLE_READS)
        .select("notification_id")
        .eq("user_id", user_id)
        .in_("notification_id", all_ids)
        .execute()
    )

    read_count = len(reads_response.data or [])
    return max(len(all_ids) - read_count, 0)


@router.get("/notifications")
def get_notifications(current_user=Depends(get_current_user)):
    return _fetch_notifications_with_read_state(current_user["user_id"])


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user=Depends(get_current_user)):
    # Verify notification exists
    notification_response = (
        supabase
        .table(TABLE_NOTIFICATIONS)
        .select("id")
        .eq("id", notification_id)
        .execute()
    )

    if not notification_response.data:
        raise HTTPException(status_code=404, detail="Notification not found")

    user_id = current_user["user_id"]

    # Check if already marked as read
    existing = (
        supabase
        .table(TABLE_READS)
        .select("id")
        .eq("user_id", user_id)
        .eq("notification_id", notification_id)
        .execute()
    )

    if not (existing.data):
        # Insert a new read record
        supabase.table(TABLE_READS).insert({
            "user_id": user_id,
            "notification_id": notification_id,
        }).execute()

    return {
        "message": "Notification marked as read",
        "notification_id": notification_id,
        "unread_count": _get_unread_count_for_user(user_id),
    }


@router.get("/notifications/unread_count")
def get_unread_count(current_user=Depends(get_current_user)):
    return {"unread_count": _get_unread_count_for_user(current_user["user_id"])}
