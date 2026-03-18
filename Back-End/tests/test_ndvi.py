import pytest
import numpy as np
from SDGP.vegetation_indices import calculate_ndvi


class TestNDVI:
    """Test suite for NDVI calculation."""

    def test_healthy_vegetation(self):
        """Healthy vegetation should have high NDVI."""
        nir = 0.5
        red = 0.1
        result = calculate_ndvi(nir, red)
        assert result == pytest.approx(0.6667, abs=1e-3)

    def test_bare_soil(self):
        """Bare soil should have NDVI near zero."""
        nir = 0.3
        red = 0.3
        result = calculate_ndvi(nir, red)
        assert result == pytest.approx(0.0, abs=1e-6)

    def test_water_body(self):
        """Water bodies should have negative NDVI."""
        nir = 0.1
        red = 0.4
        result = calculate_ndvi(nir, red)
        assert result < 0
        assert result == pytest.approx(-0.6, abs=1e-3)

    def test_zero_denominator_returns_zero(self):
        """When NIR + Red = 0, NDVI should be 0."""
        nir = 0.0
        red = 0.0
        result = calculate_ndvi(nir, red)
        assert result == 0.0

    def test_clipping_upper_bound(self):
        """NDVI should be clipped to maximum of 1.0."""
        nir = 1.0
        red = 0.0
        result = calculate_ndvi(nir, red)
        assert result == 1.0

    def test_clipping_lower_bound(self):
        """NDVI should be clipped to minimum of -1.0."""
        nir = 0.0
        red = 1.0
        result = calculate_ndvi(nir, red)
        assert result == -1.0

    def test_numpy_array_input(self):
        """NDVI should handle NumPy array inputs."""
        nir = np.array([0.8, 0.6, 0.4])
        red = np.array([0.1, 0.2, 0.3])
        result = calculate_ndvi(nir, red)

        assert isinstance(result, np.ndarray)
        assert len(result) == 3
        assert result[0] == pytest.approx(0.7778, abs=1e-3)
        assert result[1] == pytest.approx(0.5000, abs=1e-3)
        assert result[2] == pytest.approx(0.1429, abs=1e-3)

    def test_mixed_zero_denominator_in_array(self):
        """Arrays with zero denominators should handle gracefully."""
        nir = np.array([0.5, 0.0, 0.6])
        red = np.array([0.1, 0.0, 0.2])
        result = calculate_ndvi(nir, red)

        assert result[0] == pytest.approx(0.6667, abs=1e-3)
        assert result[1] == 0.0
        assert result[2] == pytest.approx(0.5000, abs=1e-3)

    @pytest.mark.parametrize("nir,red,expected", [
        (0.8, 0.1, 0.7778),
        (0.6, 0.2, 0.5000),
        (0.4, 0.3, 0.1429),
        (0.2, 0.4, -0.3333),
    ])
    def test_various_reflectance_values(self, nir, red, expected):
        """Test NDVI for various reflectance combinations."""
        result = calculate_ndvi(nir, red)
        assert result == pytest.approx(expected, abs=1e-3)

    def test_precise_calculation(self):
        """Verify mathematical precision of NDVI calculation."""
        nir = 0.7
        red = 0.3
        result = calculate_ndvi(nir, red)
        expected = (0.7 - 0.3) / (0.7 + 0.3)
        assert result == pytest.approx(expected, abs=1e-10)

    def test_output_range(self):
        """NDVI output must always be in [-1, 1] range."""
        test_cases = [
            (0.9, 0.1),
            (0.1, 0.9),
            (0.5, 0.5),
            (0.0, 0.5),
            (0.5, 0.0),
        ]
        for nir, red in test_cases:
            result = calculate_ndvi(nir, red)
            assert -1.0 <= result <= 1.0

    def test_large_array_performance(self):
        """NDVI should handle large arrays efficiently."""
        size = 10000
        nir = np.random.uniform(0.0, 1.0, size)
        red = np.random.uniform(0.0, 1.0, size)
        result = calculate_ndvi(nir, red)

        assert len(result) == size
        assert np.all(result >= -1.0)
        assert np.all(result <= 1.0)
