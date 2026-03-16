from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

def get_current_user(token=Depends(security)):
    jwt_token = token.credentials

    if not jwt_token:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    return jwt_token