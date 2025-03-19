"""
Tests para los endpoints de Animals API
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, date
from app.models.animal import Animal, Part
from app.core.date_utils import format_date

# Datos de prueba
TEST_ANIMAL = {
    "explotacio": "Test Farm",
    "nom": "Test Animal",
    "genere": "M",
    "estado": "OK",
    "alletar": False,
    "cod": "TEST001",
    "num_serie": "ES12345",
    "dob": "01/01/2024"
}

@pytest.mark.asyncio
async def test_list_animals_empty(async_client: AsyncClient):
    """Test listar animales cuando no hay registros"""
    response = await async_client.get("/api/v1/animals")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert len(data["data"]["items"]) == 0
    assert data["data"]["total"] == 0

@pytest.mark.asyncio
async def test_create_animal(async_client: AsyncClient):
    """Test crear un nuevo animal"""
    response = await async_client.post("/api/v1/animals", json=TEST_ANIMAL)
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert data["data"]["nom"] == TEST_ANIMAL["nom"]
    assert data["data"]["explotacio"] == TEST_ANIMAL["explotacio"]
    
    # Verificar que se creó en la BD
    animal = await Animal.get_or_none(nom=TEST_ANIMAL["nom"])
    assert animal is not None
    assert animal.explotacio == TEST_ANIMAL["explotacio"]

@pytest.mark.asyncio
async def test_get_animal(async_client: AsyncClient):
    """Test obtener un animal específico"""
    # Crear animal de prueba
    animal = await Animal.create(**TEST_ANIMAL)
    
    response = await async_client.get(f"/api/v1/animals/{animal.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert data["data"]["nom"] == TEST_ANIMAL["nom"]
    
    # Verificar que incluye historial de partos si es hembra
    if animal.genere == "F":
        assert "historial_partos" in data["data"]

@pytest.mark.asyncio
async def test_update_animal(async_client: AsyncClient):
    """Test actualizar un animal"""
    # Crear animal de prueba
    animal = await Animal.create(**TEST_ANIMAL)
    
    # Datos para actualizar
    update_data = {
        "nom": "Updated Name",
        "estado": "OK"
    }
    
    response = await async_client.put(
        f"/api/v1/animals/{animal.id}",
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert data["data"]["nom"] == update_data["nom"]
    
    # Verificar actualización en BD
    updated_animal = await Animal.get(id=animal.id)
    assert updated_animal.nom == update_data["nom"]

@pytest.mark.asyncio
async def test_delete_animal(async_client: AsyncClient):
    """Test eliminar (soft delete) un animal"""
    # Crear animal de prueba
    animal = await Animal.create(**TEST_ANIMAL)
    
    response = await async_client.delete(f"/api/v1/animals/{animal.id}")
    assert response.status_code == 200
    
    # Verificar que el estado cambió a DEF
    updated_animal = await Animal.get(id=animal.id)
    assert updated_animal.estado == "DEF"

@pytest.mark.asyncio
async def test_search_animals(async_client: AsyncClient):
    """Test búsqueda de animales"""
    # Crear algunos animales de prueba
    animals = [
        {**TEST_ANIMAL, "nom": "Test 1", "cod": "CODE1"},
        {**TEST_ANIMAL, "nom": "Test 2", "cod": "CODE2"},
        {**TEST_ANIMAL, "nom": "Other", "cod": "OTHER"}
    ]
    
    for animal_data in animals:
        await Animal.create(**animal_data)
    
    # Buscar por término que debe encontrar 2 animales
    response = await async_client.get("/api/v1/animals/search?q=Test")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert len(data["data"]) == 2
    
    # Buscar por código
    response = await async_client.get("/api/v1/animals/search?q=CODE")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2

@pytest.mark.asyncio
async def test_validation_errors(async_client: AsyncClient):
    """Test varios casos de error de validación"""
    
    # Intentar crear sin campos requeridos
    response = await async_client.post("/api/v1/animals", json={})
    assert response.status_code == 400
    
    # Intentar crear con género inválido
    invalid_animal = {**TEST_ANIMAL, "genere": "X"}
    response = await async_client.post("/api/v1/animals", json=invalid_animal)
    assert response.status_code == 400
    
    # Intentar actualizar animal que no existe
    response = await async_client.put("/api/v1/animals/999999", json=TEST_ANIMAL)
    assert response.status_code == 404
    
    # Intentar actualizar estado de animal fallecido
    animal = await Animal.create(**{**TEST_ANIMAL, "estado": "DEF"})
    response = await async_client.put(
        f"/api/v1/animals/{animal.id}",
        json={"estado": "OK"}
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_filter_animals(async_client: AsyncClient):
    """Test filtrado de animales"""
    # Crear animales con diferentes características
    animals = [
        {**TEST_ANIMAL, "explotacio": "Farm1", "genere": "M"},
        {**TEST_ANIMAL, "explotacio": "Farm1", "genere": "F"},
        {**TEST_ANIMAL, "explotacio": "Farm2", "genere": "M"},
    ]
    
    for animal_data in animals:
        await Animal.create(**animal_data)
    
    # Filtrar por explotación
    response = await async_client.get("/api/v1/animals?explotacio=Farm1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 2
    
    # Filtrar por género
    response = await async_client.get("/api/v1/animals?genere=M")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 2
    
    # Filtrar por explotación y género
    response = await async_client.get("/api/v1/animals?explotacio=Farm1&genere=F")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 1