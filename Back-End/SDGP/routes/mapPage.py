from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..db import supabase
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Supabase column names for each overlay type ──────────────────────────────
OVERLAY_COLUMN = {
    "ndvi": "NDVI_smooth",
    "evi":  "EVI_smooth",
}

# ── Colour scale ranges for each index ───────────────────────────────────────
OVERLAY_RANGE = {
    "ndvi": (-0.2, 0.9),
    "evi":  (-0.2, 0.9),
    "vv":   (-25.0, 0.0),   # dB
    "vh":   (-30.0, -5.0),  # dB
}

# ── GEE helper ────────────────────────────────────────────────────────────────
def _get_ee():
    """Initialise and return the earthengine-api module, or None if unavailable."""
    try:
        import ee  # type: ignore

        # Use a service-account JSON stored in an env var, or fall back to
        # application-default credentials (works on local dev after `earthengine authenticate`).
        key_file = os.getenv("GEE_SERVICE_ACCOUNT_KEY_FILE")
        sa_email = os.getenv("GEE_SERVICE_ACCOUNT_EMAIL")
        project   = os.getenv("GEE_PROJECT", "")

        if key_file and sa_email:
            credentials = ee.ServiceAccountCredentials(sa_email, key_file)
            ee.Initialize(credentials, project=project)
        else:
            ee.Initialize(project=project or None)

        return ee
    except Exception as exc:
        logger.warning("GEE unavailable: %s", exc)
        return None

@router.get("/map-fields")
async def get_map_fields(
    health: List[str] = Query(default=[]),
    districts: List[str] = Query(default=[]),
):
    try:

        query = supabase.table("Final_Dataset_Points").select(
            "lat, lon, paddy_health, district"
        )

        # district filter
        if districts:
            query = query.in_("district", districts)

        # health filter (direct DB values)
        if health and len(health) > 0:
    query = query.in_("paddy_health", health)

        response = query.execute()

        data = [
            {
                "lat": r["lat"],
                "lng": r["lon"],
                "paddy_health": r["paddy_health"],
                "district": r["district"],
            }
            for r in response.data
        ]

        return {
            "status": "success",
            "count": len(data),
            "data": data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# ── NDVI / EVI overlay ────────────────────────────────────────────────────────

@router.get("/map-overlay")
async def get_map_overlay(
    type: str = Query(..., description="ndvi or evi"),
    districts: List[str] = Query(default=[]),
):
    """
    Return per-point { lat, lng, value } rows for NDVI or EVI from Supabase.
    Values come from the smoothed index columns in Final_Dataset_Points.
    """
    overlay_type = type.lower()
    if overlay_type not in OVERLAY_COLUMN:
        raise HTTPException(status_code=400, detail=f"Unsupported overlay type: {type}. Use ndvi or evi.")

    col = OVERLAY_COLUMN[overlay_type]

    try:
        query = (
            supabase.table("Final_Dataset_Points")
            .select(f"lat, lon, {col}")
            .not_.is_(col, "null")
        )

        if districts:
            query = query.in_("district", districts)

        response = query.execute()

        vmin, vmax = OVERLAY_RANGE[overlay_type]

        data = []
        for r in response.data:
            raw = r.get(col)
            if raw is None:
                continue
            val = float(raw)
            # Normalise 0-1 for colour mapping on the frontend
            norm = max(0.0, min(1.0, (val - vmin) / (vmax - vmin)))
            data.append({
                "lat": r["lat"],
                "lng": r["lon"],
                "value": round(val, 4),
                "norm": round(norm, 4),
            })

        return {
            "status": "success",
            "overlay": overlay_type,
            "vmin": vmin,
            "vmax": vmax,
            "count": len(data),
            "data": data,
        }

    except HTTPException:
        raise
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── VV / VH tile URL (Google Earth Engine → Sentinel-1) ──────────────────────

@router.get("/map-gee-tiles")
async def get_gee_tiles(
    type: str = Query(..., description="vv, vh, ndvi, or evi"),
    district: Optional[str] = Query(default=None),
    start_date: Optional[str] = Query(default="2024-01-01"),
    end_date: Optional[str]   = Query(default="2024-04-30"),
):
    """
    Generate a Google Earth Engine XYZ tile URL for:
    - Sentinel-1 SAR: VV or VH backscatter
    - Sentinel-2 optical: NDVI or EVI vegetation indices
    Requires GEE credentials (env vars GEE_SERVICE_ACCOUNT_EMAIL +
    GEE_SERVICE_ACCOUNT_KEY_FILE, or application-default credentials).
    """
    layer_type = type.lower()
    if layer_type not in ("vv", "vh", "ndvi", "evi"):
        raise HTTPException(status_code=400, detail="type must be vv, vh, ndvi, or evi")

    vmin, vmax = OVERLAY_RANGE[layer_type]

    ee = _get_ee()
    if ee is None:
        raise HTTPException(
            status_code=503,
            detail="Google Earth Engine is not configured on this server. "
                   "Set GEE_PROJECT (and optionally GEE_SERVICE_ACCOUNT_EMAIL / "
                   "GEE_SERVICE_ACCOUNT_KEY_FILE) environment variables.",
        )

    try:
        if layer_type in ("vv", "vh"):
            band = layer_type.upper()
            image = (
                ee.ImageCollection("COPERNICUS/S1_GRD")
                .filter(ee.Filter.eq("instrumentMode", "IW"))
                .filter(ee.Filter.listContains("transmitterReceiverPolarisation", band))
                .filter(ee.Filter.eq("orbitProperties_pass", "DESCENDING"))
                .filterDate(start_date, end_date)
                .select(band)
                .mean()
            )
            palette = ["#000080", "#0000ff", "#00ffff", "#ffff00", "#ff0000"]

        elif layer_type == "ndvi":
            s2 = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterDate(start_date, end_date)
                .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
                .median()
            )
            image = s2.normalizedDifference(["B8", "B4"]).rename("NDVI")
            palette = ["#7f2700", "#d4a017", "#aaff44", "#228b22", "#004d00"]

        else:  # evi
            s2 = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterDate(start_date, end_date)
                .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
                .median()
            )
            image = s2.expression(
                "2.5 * ((NIR - RED) / (NIR + 6.0 * RED - 7.5 * BLUE + 1.0))",
                {
                    "NIR":  s2.select("B8").divide(10000),
                    "RED":  s2.select("B4").divide(10000),
                    "BLUE": s2.select("B2").divide(10000),
                },
            ).rename("EVI")
            palette = ["#7f2700", "#d4a017", "#aaff44", "#228b22", "#004d00"]

        vis = {"min": vmin, "max": vmax, "palette": palette}
        map_id = image.getMapId(vis)
        tile_url: str = map_id["tile_fetcher"].url_format

        return {
            "status": "success",
            "type": layer_type,
            "tile_url": tile_url,
            "vmin": vmin,
            "vmax": vmax,
        }

    except Exception as exc:
        logger.error("GEE tile generation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))