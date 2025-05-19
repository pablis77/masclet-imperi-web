import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_animal_endpoint():
    """Test the POST /api/animals endpoint"""
    response = client.post(
        "/api/animals/",
        json={
            "explotacio": "Test Farm",
            "nom": "Test Animal API",
            "genere": "FEMELLA",
            "estado": "OK"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nom"] == "Test Animal API"