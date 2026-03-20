# RiceVision Test Suite

Production-quality unit tests for the RiceVision satellite-based rice crop monitoring system.

## Project Structure

```
Back-End/
├── tests/
│   ├── __init__.py
│   ├── conftest.py                    # Shared fixtures
│   ├── test_vegetation_indices.py     # Vegetation index calculations
│   ├── test_yield_prediction.py       # ML prediction and yield estimation
│   ├── test_api_endpoints.py          # FastAPI endpoint tests
│   └── test_edge_cases.py             # Edge cases and error handling
├── SDGP/
│   ├── vegetation_indices.py          # Core vegetation index functions
│   ├── main.py                        # FastAPI application
│   └── routes/                        # API route modules
├── pytest.ini                         # Pytest configuration
└── requirements.txt                   # Dependencies
```

## Running Tests

### Run all tests
```bash
cd Back-End
pytest
```

### Run specific test file
```bash
pytest tests/test_vegetation_indices.py
```

### Run specific test class
```bash
pytest tests/test_vegetation_indices.py::TestNDVI
```

### Run specific test
```bash
pytest tests/test_vegetation_indices.py::TestNDVI::test_calculates_correct_value_for_healthy_vegetation
```

### Run with coverage report
```bash
pytest --cov=SDGP --cov-report=html
```

### Run only fast tests (exclude slow)
```bash
pytest -m "not slow"
```

### Run with verbose output
```bash
pytest -v
```

### Run tests in parallel (requires pytest-xdist)
```bash
pytest -n auto
```

## Test Categories

### 1. Vegetation Index Tests (`test_vegetation_indices.py`)

Tests for satellite-based vegetation index calculations:

- **NDVI** (Normalized Difference Vegetation Index)
  - Correct calculations for various reflectance values
  - Range constraints (-1 to 1)
  - Zero denominator handling
  - NumPy array support

- **EVI** (Enhanced Vegetation Index)
  - Standard and custom parameters
  - Aerosol resistance coefficients
  - Clipping extreme values

- **NDWI** (Normalized Difference Water Index)
  - Water content detection
  - Range validation

- **LSWI** (Land Surface Water Index)
  - Consistency with NDWI formula

**Key Test Coverage:**
- Parametrized tests for edge cases
- Array and scalar input handling
- Boundary value testing
- Division by zero protection

### 2. Yield Prediction Tests (`test_yield_prediction.py`)

Tests for ML-based yield prediction pipeline:

- **Data Standardization**
  - Zero mean normalization
  - Unit variance scaling
  - Missing feature handling

- **LSTM Input Creation**
  - Sliding window generation
  - Temporal sequence validation
  - Multiple window sizes

- **Latent Feature Extraction**
  - Mock model integration
  - Batch processing
  - PCA transformation and clipping

- **District Summary**
  - Pixel-level aggregation
  - Blended historical/current data
  - Season-based calculations

- **Yield Prediction**
  - Calibrated blend models
  - Range constraints (1500-6500 kg/ha)
  - Invalid input handling

- **Crop Health Classification**
  - Healthy/stressed/critical categories
  - Trend detection
  - Sudden drop identification

**Key Test Coverage:**
- Mock objects for external dependencies
- Parametrized classification scenarios
- Error handling for edge cases

### 3. API Endpoint Tests (`test_api_endpoints.py`)

Tests for FastAPI REST endpoints:

- **Health Check** (`/health`)
- **Weather Data** (`/api/weather`)
- **Profile Management** (`/api/profile`)
- **Dashboard** (`/yield`, `/health-summary`, `/best-districts`)
- **Map Visualization** (`/map-fields`, `/map-overlay`)
- **Report Generation** (`/available-dates`, `/detailed-report`)

**Key Test Coverage:**
- Authentication/authorization
- Request validation
- Response schema validation
- Error handling (404, 422, 500)
- External service mocking
- Query parameter validation

### 4. Edge Case Tests (`test_edge_cases.py`)

Comprehensive edge case and error handling:

- **NaN Handling**
  - Input arrays with NaN values
  - All-NaN scenarios

- **Infinity Prevention**
  - Extreme value clipping
  - Numeric stability

- **Empty Inputs**
  - Empty arrays
  - Empty DataFrames

- **Malformed Data**
  - Mismatched array shapes
  - Wrong data types

- **Boundary Values**
  - Zero reflectance
  - Maximum reflectance
  - Very small/large numbers

- **Large Datasets**
  - Performance with 10,000+ elements

## Test Fixtures (`conftest.py`)

Reusable fixtures available across all tests:

### Core Fixtures
- `test_client`: FastAPI TestClient instance
- `mock_supabase`: Mocked Supabase client
- `mock_auth_user`: Sample authenticated user
- `valid_sentinel_bands`: Sample Sentinel-2 band data
- `ndvi_time_series`: Health status time series data

### Usage Example
```python
def test_endpoint(test_client, mock_auth_user):
    response = test_client.get("/api/data")
    assert response.status_code == 200
```

## Dependencies

Core testing libraries:
```
pytest>=9.0.2
pytest-cov>=4.0.0
pytest-asyncio>=0.21.0
httpx>=0.28.1
```

Optional:
```
pytest-xdist    # Parallel test execution
pytest-timeout  # Test timeout handling
pytest-mock     # Enhanced mocking
```

## Best Practices Implemented

### 1. Clear Test Naming
```python
def test_calculates_correct_value_for_healthy_vegetation(self):
    # Test name clearly describes behavior
```

### 2. Arrange-Act-Assert Pattern
```python
def test_ndvi_calculation(self):
    # Arrange
    b8, b4 = 0.5, 0.1

    # Act
    result = calculate_ndvi(b8, b4)

    # Assert
    assert result == pytest.approx(0.667, abs=1e-3)
```

### 3. Parametrized Tests
```python
@pytest.mark.parametrize("b8,b4,expected", [
    (0.8, 0.1, 0.7778),
    (0.6, 0.2, 0.5000),
])
def test_ndvi_parametrized(self, b8, b4, expected):
    result = calculate_ndvi(b8, b4)
    assert result == pytest.approx(expected, abs=1e-4)
```

### 4. Behavior-Focused Tests
Tests validate outputs and behavior, not implementation details.

### 5. Isolation and Determinism
- No random behavior
- Mocked external dependencies
- Independent test execution

### 6. Meaningful Assertions
```python
assert 1500 <= yield_value <= 6500  # Clear constraint
assert not np.isnan(result)         # Explicit NaN check
```

## Example Test Run Output

```bash
$ pytest -v

==================== test session starts ====================
collected 87 items

tests/test_vegetation_indices.py::TestNDVI::test_calculates_correct_value_for_healthy_vegetation PASSED [ 1%]
tests/test_vegetation_indices.py::TestNDVI::test_handles_various_reflectance_ranges[0.8-0.1-0.7778] PASSED [ 2%]
tests/test_vegetation_indices.py::TestNDVI::test_handles_zero_denominator PASSED [ 3%]
tests/test_vegetation_indices.py::TestEVI::test_calculates_correct_value_with_default_parameters PASSED [ 4%]
tests/test_yield_prediction.py::TestStandardization::test_standardize_live_zero_mean PASSED [20%]
tests/test_yield_prediction.py::TestYieldPrediction::test_predict_yield_range_constraint PASSED [45%]
tests/test_api_endpoints.py::TestHealthEndpoint::test_returns_ok_status PASSED [60%]
tests/test_edge_cases.py::TestNaNHandling::test_ndvi_with_nan_input PASSED [80%]

==================== 87 passed in 2.34s ===================

---------- coverage: platform win32, python 3.11.0 ----------
Name                              Stmts   Miss  Cover
-----------------------------------------------------
SDGP/vegetation_indices.py           42      0   100%
SDGP/routes/dashboard.py            125     18    86%
SDGP/routes/weather.py               45      5    89%
-----------------------------------------------------
TOTAL                               412     23    94%
```

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest --cov --cov-report=xml
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Import Errors
**Problem:** `ModuleNotFoundError: No module named 'SDGP'`

**Solution:**
```bash
# Add project root to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/Back-End"
pytest
```

**Or** install package in development mode:
```bash
pip install -e .
```

### Fixture Not Found
**Problem:** `fixture 'test_client' not found`

**Solution:** Ensure `conftest.py` is in the tests directory and contains the fixture.

### S Slow Tests
**Mark slow tests** and exclude them:
```python
@pytest.mark.slow
def test_large_dataset_processing(self):
    # Long-running test
    pass
```

Run without slow tests:
```bash
pytest -m "not slow"
```

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use fixtures from `conftest.py`
3. Add parametrized tests for multiple scenarios
4. Test both success and failure cases
5. Ensure tests are deterministic
6. Add docstrings for complex test logic

## Contact

For questions about the test suite, refer to the main RiceVision documentation or open an issue on GitHub.
