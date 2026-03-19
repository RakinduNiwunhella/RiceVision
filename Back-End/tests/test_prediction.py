import pytest
import numpy as np
from unittest.mock import Mock
from SDGP.ml_models import predict_yield, StubYieldModel


class TestPredictYield:
    """Test suite for rice yield prediction."""

    def test_returns_numeric_prediction(self):
        """Prediction should return a numeric value."""
        features = [0.7, 0.5, 0.3, 1200, 35]
        result = predict_yield(features)
        assert isinstance(result, float)
        assert result >= 0

    def test_prediction_with_stub_model(self):
        """Prediction should work with stub model."""
        features = [0.8, 0.6, 0.4]
        result = predict_yield(features)
        assert result > 0
        assert isinstance(result, float)

    def test_prediction_with_custom_model(self):
        """Prediction should accept custom model."""
        mock_model = Mock()
        mock_model.predict.return_value = np.array([4500.0])

        features = [0.7, 0.5, 0.3]
        result = predict_yield(features, model=mock_model)

        assert result == 4500.0
        mock_model.predict.assert_called_once()

    def test_empty_features_raises_error(self):
        """Empty features should raise ValueError."""
        with pytest.raises(ValueError, match="Features cannot be empty"):
            predict_yield([])

    def test_nan_features_raises_error(self):
        """NaN features should raise ValueError."""
        features = [0.7, float('nan'), 0.3]
        with pytest.raises(ValueError, match="NaN values"):
            predict_yield(features)

    def test_infinite_features_raises_error(self):
        """Infinite features should raise ValueError."""
        features = [0.7, float('inf'), 0.3]
        with pytest.raises(ValueError, match="infinite values"):
            predict_yield(features)

    def test_single_feature(self):
        """Prediction should work with single feature."""
        features = [0.75]
        result = predict_yield(features)
        assert isinstance(result, float)
        assert result >= 0

    def test_non_negative_yield(self):
        """Yield prediction should never be negative."""
        mock_model = Mock()
        mock_model.predict.return_value = np.array([-500.0])

        features = [0.1, 0.05, 0.02]
        result = predict_yield(features, model=mock_model)

        assert result == 0.0

    @pytest.mark.parametrize("ndvi,expected_min", [
        (0.8, 4000),
        (0.6, 3500),
        (0.4, 3000),
    ])
    def test_ndvi_correlation(self, ndvi, expected_min):
        """Higher NDVI should correlate with higher yield."""
        features = [ndvi, 0.5, 0.3]
        result = predict_yield(features)
        assert result >= expected_min

    def test_model_called_with_reshaped_array(self):
        """Model should be called with properly shaped array."""
        mock_model = Mock()
        mock_model.predict.return_value = np.array([3500.0])

        features = [0.7, 0.5, 0.3]
        predict_yield(features, model=mock_model)

        call_args = mock_model.predict.call_args[0][0]
        assert call_args.shape == (1, 3)


class TestStubYieldModel:
    """Test suite for stub yield model."""

    def test_stub_predicts_array(self):
        """Stub model should return array predictions."""
        model = StubYieldModel()
        X = np.array([[0.7, 0.5, 0.3]])
        result = model.predict(X)

        assert isinstance(result, np.ndarray)
        assert len(result) == 1

    def test_stub_single_sample(self):
        """Stub model should handle single sample."""
        model = StubYieldModel()
        X = np.array([[0.8]])
        result = model.predict(X)

        expected = 3500 + (0.8 * 2000)
        assert result[0] == pytest.approx(expected, abs=1e-3)

    def test_stub_ndvi_factor(self):
        """Stub model prediction should increase with NDVI."""
        model = StubYieldModel()

        low_ndvi = np.array([[0.3, 0.2, 0.1]])
        high_ndvi = np.array([[0.9, 0.8, 0.7]])

        low_yield = model.predict(low_ndvi)[0]
        high_yield = model.predict(high_ndvi)[0]

        assert high_yield > low_yield

    def test_stub_batch_prediction(self):
        """Stub model should handle batch predictions."""
        model = StubYieldModel()
        X = np.array([
            [0.7, 0.5, 0.3],
            [0.8, 0.6, 0.4],
            [0.6, 0.4, 0.2]
        ])
        result = model.predict(X)

        assert len(result) == 3
        assert all(r > 0 for r in result)

    def test_stub_base_yield(self):
        """Stub model should have reasonable base yield."""
        model = StubYieldModel()
        X = np.array([[0.5, 0.3, 0.2]])
        result = model.predict(X)

        assert result[0] >= 3000
        assert result[0] <= 6000


class TestYieldPredictionPipeline:
    """Integration tests for complete yield prediction pipeline."""

    def test_full_pipeline_with_realistic_features(self):
        """Full pipeline should work with realistic satellite features."""
        features = [
            0.75,
            0.45,
            0.28,
            1450,
            32.5,
        ]
        result = predict_yield(features)

        assert 1500 <= result <= 6500

    def test_pipeline_deterministic(self):
        """Same inputs should produce same outputs."""
        features = [0.7, 0.5, 0.3, 1200, 30]

        result1 = predict_yield(features)
        result2 = predict_yield(features)

        assert result1 == result2

    def test_pipeline_handles_boundary_values(self):
        """Pipeline should handle extreme but valid inputs."""
        low_features = [0.1, 0.05, 0.02, 800, 20]
        high_features = [0.95, 0.85, 0.75, 2000, 40]

        low_result = predict_yield(low_features)
        high_result = predict_yield(high_features)

        assert low_result >= 0
        assert high_result >= 0
        assert high_result > low_result
