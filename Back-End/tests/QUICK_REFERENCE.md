# Quick Reference: RiceVision Test Commands

## Run Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific file
pytest tests/test_vegetation_indices.py

# Run specific class
pytest tests/test_vegetation_indices.py::TestNDVI

# Run specific test
pytest tests/test_vegetation_indices.py::TestNDVI::test_calculates_correct_value_for_healthy_vegetation

# Run tests matching pattern
pytest -k "ndvi"

# Run last failed tests
pytest --lf

# Run failed tests first
pytest --ff
```

## Coverage

```bash
# Basic coverage
pytest --cov=SDGP

# Coverage with HTML report
pytest --cov=SDGP --cov-report=html

# Coverage with missing lines
pytest --cov=SDGP --cov-report=term-missing

# Coverage for specific module
pytest --cov=SDGP.vegetation_indices tests/test_vegetation_indices.py
```

##Markers

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Skip slow tests
pytest -m "not slow"

# Run slow tests only
pytest -m slow
```

## Output Control

```bash
# Quiet mode
pytest -q

# Show test summary
pytest -ra

# Stop on first failure
pytest -x

# Stop after N failures
pytest --maxfail=3

# Show local variables on failure
pytest -l

# Full traceback
pytest --tb=long

# Short traceback
pytest --tb=short

# No traceback
pytest --tb=no
```

## Parallel Execution

```bash
# Automatic CPU count
pytest -n auto

# Specific number of workers
pytest -n 4
```

## Debugging

```bash
# Drop into debugger on failure
pytest --pdb

# Drop into debugger on first failure
pytest -x --pdb

# Capture output
pytest -s

# Show print statements
pytest --capture=no
```

## Useful Combinations

```bash
# Quick feedback (fail fast, short output)
pytest -x -q

# Comprehensive (verbose, coverage, HTML report)
pytest -v --cov=SDGP --cov-report=html

# CI/CD (coverage, XML for tools like Codecov)
pytest --cov=SDGP --cov-report=xml --cov-report=term

# Development (watch mode, requires pytest-watch)
pytest-watch

# Specific test with debugging
pytest tests/test_vegetation_indices.py::TestNDVI::test_handles_zero_denominator -s --pdb
```

## Example Workflows

### Development Workflow
```bash
# 1. Run affected tests quickly
pytest -k "ndvi" -v

# 2. If failed, debug specific test
pytest tests/test_vegetation_indices.py::TestNDVI::test_specific -s --pdb

# 3. Run full suite before commit
pytest -v --cov=SDGP
```

### Pre-Commit Workflow
```bash
# Run fast tests first
pytest -m "not slow" -q

# If pass, run all tests
pytest -v

# Generate coverage report
pytest --cov=SDGP --cov-report=html
```

### CI/CD Workflow
```bash
# Run all tests with coverage
pytest --cov=SDGP --cov=ricevision_pipeline \
       --cov-report=xml \
       --cov-report=term \
       --junitxml=junit.xml
```

## Configuration (.pytest.ini or pyproject.toml)

Defaults are in `pytest.ini`. Override from command line:

```bash
# Override test path
pytest tests/specific_dir/

# Override verbosity
pytest -v

# Add additional options
pytest --tb=short

# Ignore pytest.ini
pytest -o addopts=
```

## Common Patterns

### Test Single Function
```bash
pytest tests/test_vegetation_indices.py::TestNDVI::test_calculates_correct_value_for_healthy_vegetation -v
```

### Test with Print Debugging
```bash
pytest tests/test_yield_prediction.py -s
```

### Test with Coverage for One Module
```bash
pytest tests/test_vegetation_indices.py --cov=SDGP.vegetation_indices --cov-report=term-missing
```

### Watch and Re-run on Changes
```bash
pytest-watch -- -v
```

## Environment Variables

```bash
# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/Back-End"

# Disable warnings
export PYTHONWARNINGS="ignore"

# Set test database
export TEST_DATABASE_URL="postgresql://..."
```

## Tips

1. **Use `pytest.approx()` for floating point comparisons**
   ```python
   assert result == pytest.approx(0.667, abs=1e-3)
   ```

2. **Use fixtures for reusable test data**
   ```python
   def test_something(valid_sentinel_bands):
       # Use fixture
   ```

3. **Mark tests appropriately**
   ```python
   @pytest.mark.slow
   def test_large_dataset():
       pass
   ```

4. **Use parametrize for multiple cases**
   ```python
   @pytest.mark.parametrize("input,expected", [
       (1, 2), (2, 4), (3, 6)
   ])
   ```

5. **Mock external dependencies**
   ```python
   @patch('module.external_api')
   def test_function(mock_api):
       mock_api.return_value = {"data": "test"}
   ```
