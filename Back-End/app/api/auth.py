from fastapi import APIRouter, Depends
from app.core.security import verify_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
def get_current_user(user=Depends(verify_token)):
    return {
        "user_id": user["sub"],
        "email": user.get("email"),
        "role": user.get("role", "authenticated"),
    }
