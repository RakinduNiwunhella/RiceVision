from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

from .db import supabase

security = HTTPBearer(auto_error=False)


def get_current_user(credentials=Depends(security)) -> dict:
    """Validate bearer token with Supabase and return authenticated user info."""
    token = credentials.credentials if credentials else None

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    try:
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        return {
            "user_id": user.id,
            "email": user.email,
            "user": user,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(exc)}",
        )