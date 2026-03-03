from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ..db import supabase

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GET ALL NOTIFICATIONS
@app.get("/notifications")
def get_notifications():
    response = supabase.table("notificationpanel") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    return response.data


# GET UNREAD COUNT
@app.get("/notifications/unread-count")
def get_unread_count():
    response = supabase.table("notificationpanel") \
        .select("id", count="exact") \
        .eq("is_read", False) \
        .execute()

    return {"unread_count": response.count}


# MARK AS READ
@app.put("/notifications/{notification_id}")
def mark_as_read(notification_id: int):
    response = supabase.table("notificationpanel") \
        .update({"is_read": True}) \
        .eq("id", notification_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"message": "Marked as read"}