"""
payment.py
----------
Handles PayHere payment integration for RiceVision.

Endpoints:
  POST /payment/hash    – Generate the MD5 hash required by PayHere checkout.
                          Called by the frontend before opening the payment popup.
  POST /payment/notify  – PayHere's server-to-server payment notification webhook.
                          Updates the user_fields row with payment status.

Environment variables required:
  PAYHERE_MERCHANT_ID      – Your PayHere merchant ID (also in the frontend)
  PAYHERE_MERCHANT_SECRET  – Your PayHere merchant secret (server-side only)
"""

import hashlib
import os
import traceback

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from ..auth import get_current_user
from ..db import supabase

router = APIRouter(prefix="/payment", tags=["Payment"])

PAYHERE_MERCHANT_ID = os.getenv("PAYHERE_MERCHANT_ID", "")
PAYHERE_MERCHANT_SECRET = os.getenv("PAYHERE_MERCHANT_SECRET", "")


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _md5_upper(value: str) -> str:
    """Return uppercase MD5 hex digest of a UTF-8 encoded string."""
    return hashlib.md5(value.encode("utf-8")).hexdigest().upper()


# ---------------------------------------------------------------------------
# Schema models
# ---------------------------------------------------------------------------

class HashRequest(BaseModel):
    order_id: str
    amount: str   # formatted as "1000.00"
    currency: str = "LKR"


# ---------------------------------------------------------------------------
# POST /payment/hash  (protected – requires auth token)
# ---------------------------------------------------------------------------

@router.post("/hash")
def generate_payment_hash(
    payload: HashRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate the MD5 hash required by PayHere for checkout verification.

    Formula (from PayHere docs):
        hash = MD5( UPPER(MD5(merchant_secret)) )
        full_hash = MD5(merchant_id + order_id + amount + currency + hash)
    The final hash must be UPPERCASE.
    """
    if not PAYHERE_MERCHANT_ID or not PAYHERE_MERCHANT_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway is not configured. Contact support.",
        )

    secret_hash = _md5_upper(PAYHERE_MERCHANT_SECRET)

    raw = (
        PAYHERE_MERCHANT_ID
        + payload.order_id
        + payload.amount
        + payload.currency
        + secret_hash
    )
    final_hash = _md5_upper(raw)

    return {
        "status": "success",
        "merchant_id": PAYHERE_MERCHANT_ID,
        "hash": final_hash,
        "order_id": payload.order_id,
        "amount": payload.amount,
        "currency": payload.currency,
    }


# ---------------------------------------------------------------------------
# POST /payment/notify  (PUBLIC – called by PayHere servers, no JWT)
# ---------------------------------------------------------------------------

@router.post("/notify")
async def payment_notify(request: Request):
    """
    PayHere server-to-server notification webhook.

    PayHere POSTs a form-encoded body containing payment details.
    We verify the MD5 signature and, if valid, update the user_fields table.

    Verification formula (from PayHere docs):
        local_hash = MD5(
            merchant_id + order_id + payhere_amount + payhere_currency
            + status_code + UPPER(MD5(merchant_secret))
        )
        valid if local_hash == md5sig (case-insensitive)
    """
    try:
        form = await request.form()
        data = dict(form)

        merchant_id  = data.get("merchant_id", "")
        order_id     = data.get("order_id", "")
        amount       = data.get("payhere_amount", "")
        currency     = data.get("payhere_currency", "LKR")
        status_code  = data.get("status_code", "")
        md5sig       = data.get("md5sig", "").upper()

        # ── Verify signature ──────────────────────────────────────────────
        secret_hash = _md5_upper(PAYHERE_MERCHANT_SECRET)
        raw = merchant_id + order_id + amount + currency + status_code + secret_hash
        expected_hash = _md5_upper(raw)

        if expected_hash != md5sig:
            # Invalid signature — do not update DB
            return {"status": "invalid_signature"}

        # ── status_code meanings (PayHere docs) ───────────────────────────
        # 2  = success
        # 0  = pending
        # -1 = cancelled
        # -2 = failed
        # -3 = chargedback
        payment_status = {
            "2":  "paid",
            "0":  "pending",
            "-1": "cancelled",
            "-2": "failed",
            "-3": "chargedback",
        }.get(str(status_code), "unknown")

        # ── Derive user_id from order_id  (format: "rv-<user_id>") ───────
        user_id = None
        if order_id.startswith("rv-"):
            user_id = order_id[3:]

        if user_id:
            # Update payment_status column in user_fields
            supabase.table("user_fields").update(
                {
                    "payment_status": payment_status,
                    "payment_order_id": order_id,
                }
            ).eq("user_id", user_id).execute()

        return {"status": "ok", "payment_status": payment_status}

    except Exception:
        traceback.print_exc()
        # Always return 200 to PayHere to avoid repeated retries
        return {"status": "error"}
