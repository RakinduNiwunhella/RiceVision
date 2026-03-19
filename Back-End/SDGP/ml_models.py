import numpy as np
from numpy.typing import NDArray
from typing import Protocol


class YieldModel(Protocol):
    """Protocol for yield prediction models."""
    def predict(self, X: NDArray) -> NDArray:
        ...


def predict_yield(features: list[float], model: YieldModel | None = None) -> float:
    """Predict rice yield from vegetation features.

    Args:
        features: List of vegetation indices and temporal features
        model: ML model with predict() method. If None, uses stub model.

    Returns:
        Predicted yield in kg/ha

    Raises:
        ValueError: If features contain NaN, inf, or are empty
    """
    if not features:
        raise ValueError("Features cannot be empty")

    arr = np.array(features, dtype=float)

    if np.any(np.isnan(arr)):
        raise ValueError("Features contain NaN values")

    if np.any(np.isinf(arr)):
        raise ValueError("Features contain infinite values")

    if model is None:
        model = StubYieldModel()

    prediction = model.predict(arr.reshape(1, -1))[0]

    return max(0.0, float(prediction))


class StubYieldModel:
    """Lightweight stub for testing without loading heavy models."""

    def predict(self, X: NDArray) -> NDArray:
        """Simple yield prediction based on first feature (usually NDVI)."""
        ndvi = X[:, 0] if X.shape[1] > 0 else np.array([0.5])
        base_yield = 3500
        yield_prediction = base_yield + (ndvi * 2000)
        return yield_prediction
