#!/bin/bash

# RiceVision Test Runner
# Comprehensive test execution script with multiple run configurations

set -e

echo "🌾 RiceVision Test Suite Runner"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to Back-End directory
cd "$(dirname "$0")"

# Parse command line arguments
RUN_TYPE=${1:-"all"}

case "$RUN_TYPE" in
    "all")
        echo "📊 Running all tests..."
        pytest -v
        ;;

    "coverage")
        echo "📈 Running tests with coverage report..."
        pytest --cov=SDGP --cov=ricevision_pipeline \
               --cov-report=html \
               --cov-report=term-missing \
               --cov-branch
        echo ""
        echo "📂 Coverage report generated at: htmlcov/index.html"
        ;;

    "fast")
        echo "⚡ Running fast tests only..."
        pytest -v -m "not slow"
        ;;

    "vegetation")
        echo "🌱 Running vegetation index tests..."
        pytest tests/test_vegetation_indices.py -v
        ;;

    "yield")
        echo "📊 Running yield prediction tests..."
        pytest tests/test_yield_prediction.py -v
        ;;

    "api")
        echo "🌐 Running API endpoint tests..."
        pytest tests/test_api_endpoints.py -v
        ;;

    "edge")
        echo "🔍 Running edge case tests..."
        pytest tests/test_edge_cases.py -v
        ;;

    "parallel")
        echo "⚡ Running tests in parallel..."
        pytest -n auto -v
        ;;

    "watch")
        echo "👀 Running tests in watch mode..."
        pytest-watch -- -v
        ;;

    "failed")
        echo "🔁 Re-running failed tests..."
        pytest --lf -v
        ;;

    "help")
        echo "Usage: ./run_tests.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  all         Run all tests (default)"
        echo "  coverage    Run with coverage report"
        echo "  fast        Run only fast tests"
        echo "  vegetation  Run only vegetation index tests"
        echo "  yield       Run only yield prediction tests"
        echo "  api         Run only API endpoint tests"
        echo "  edge        Run only edge case tests"
        echo "  parallel    Run tests in parallel"
        echo "  watch       Run in watch mode"
        echo "  failed      Re-run only failed tests"
        echo "  help        Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./run_tests.sh                # Run all tests"
        echo "  ./run_tests.sh coverage       # Run with coverage"
        echo "  ./run_tests.sh vegetation     # Run vegetation tests"
        ;;

    *)
        echo -e "${RED}❌ Unknown option: $RUN_TYPE${NC}"
        echo "Run './run_tests.sh help' for usage information"
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed successfully!${NC}"
else
    echo -e "${RED}❌ Tests failed!${NC}"
    exit 1
fi
