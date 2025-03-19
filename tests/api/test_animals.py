from fastapi.testclient import TestClient
from httpx import AsyncClient
import pytest
import logging
from app.main import app

@pytest.mark.asyncio
async def test_list_animals(async_client: AsyncClient):
    response = await async_client.get("/api/v1/animals/")  # Añadir trailing slash
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_create_animal(async_client: AsyncClient):
    """Test crear animal con datos válidos"""
    # Setup
    test_animal = {
        "nom": "Test Animal",
        "explotacio": "Gurans",
        "genere": "M",
        "estado": "OK"
    }
    
    response = await async_client.post(
        "/api/v1/animals/", 
        json=test_animal,
        follow_redirects=True  # Importante: seguir redirecciones
    )
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Animal creado correctamente"
    assert data["type"] == "success"
    assert "animal" in data["data"]
    
    # Log response para debug
    logging.info(f"Response: {data}")

@pytest.mark.asyncio
async def test_list_animals_new(async_client: AsyncClient):
    """Probar nuevo endpoint optimizado"""
    response = await async_client.get("/api/v1/animals-new")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)