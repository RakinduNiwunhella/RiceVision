import numpy as np
from numpy.typing import NDArray


def calculate_ndvi(nir: float | NDArray, red: float | NDArray) -> float | NDArray:
    """Calculate Normalized Difference Vegetation Index (NDVI).

    NDVI = (NIR - Red) / (NIR + Red)

    Args:
        nir: Near-infrared reflectance (Band 8 for Sentinel-2)
        red: Red reflectance (Band 4 for Sentinel-2)

    Returns:
        NDVI value(s) in range [-1, 1]
    """
    numerator = nir - red
    denominator = nir + red

    with np.errstate(divide='ignore', invalid='ignore'):
        ndvi = np.divide(numerator, denominator)
        ndvi = np.where(denominator == 0, 0.0, ndvi)

    return np.clip(ndvi, -1.0, 1.0)
