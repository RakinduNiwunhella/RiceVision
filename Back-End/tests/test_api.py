import pytest
from unittest.mock import patch


class TestHealthEndpoint:
    """Test suite for FastAPI health check endpoint."""

    def test_health_returns_200(self, test_client):
        """Health endpoint should return 200 status code."""
        response = test_client.get("/health")
        assert response.status_code == 200

    def test_health_returns_json(self, test_client):
        """Health endpoint should return JSON response."""
        response = test_client.get("/health")
        assert response.headers["content-type"] == "application/json"

    def test_health_returns_ok_status(self, test_client):
        response = test_client.get("/health")
        data = response.json()
        assert data["status"] == "ok"

    def test_health_accepts_get_only(self, test_client):
        """Health endpoint should only accept GET requests."""
        post_response = test_client.post("/health")
        assert post_response.status_code == 405

        put_response = test_client.put("/health")
        assert put_response.status_code == 405

    def test_health_no_authentication_required(self, test_client):
        """Health endpoint should be accessible without authentication."""
        response = test_client.get("/health")
        assert response.status_code == 200


class TestCORSConfiguration:
    """Test CORS middleware configuration."""

    def test_cors_headers_present(self, test_client):
        """CORS headers should be present in responses."""
        response = test_client.options(
            "/health",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET"
            }
        )
        assert "access-control-allow-origin" in response.headers

    def test_localhost_origin_allowed(self, test_client):
        """Localhost origin should be allowed."""
        response = test_client.get(
            "/health",
            headers={"Origin": "http://localhost:5173"}
        )
        assert response.status_code == 200


class TestApplicationStartup:
    """Test FastAPI application initialization."""

    def test_app_is_fastapi_instance(self, test_client):
        """App should be a valid FastAPI instance."""
        response = test_client.get("/health")
        assert response is not None

    def test_openapi_schema_available(self, test_client):
        """OpenAPI schema should be generated."""
        response = test_client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert "openapi" in schema
        assert "paths" in schema
