import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys


@pytest.fixture
def test_client():
    """FastAPI TestClient instance."""
    mock_modules = {
        'supabase': MagicMock(),
        'boto3': MagicMock(),
        'botocore': MagicMock(),
        'botocore.exceptions': MagicMock(),  # important fix
        'openai': MagicMock(),
        'SDGP.db': MagicMock(),
    }

    with patch.dict(sys.modules, mock_modules):
        from SDGP.main import app
        return TestClient(app)


@pytest.fixture
def mock_supabase():
    """Mocked Supabase client."""
    mock = MagicMock()
    mock.table.return_value.select.return_value.execute.return_value.data = []
    return mock


@pytest.fixture
def mock_auth_user():
    """Mock authenticated user."""
    return {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "role": "farmer"
    }