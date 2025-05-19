"""
Tests de integración para endpoints
"""
import pytest
from datetime import datetime, date
from app.models.animal import Animal, Genere, Estado
from app.core.date_utils import DateConverter

API_PREFIX = "/api/v1"

# Test de creación de animal
@pytest.mark.asyncio
async def test_create_animal(client):
    """Test de creación de animal con fechas"""
    # Crear animal con fecha en formato español
    response = await client.post(f"{API_PREFIX}/animals/", json={
        "explotacio": "Test",
        "nom": "Test Animal",
        "genere": "M",
        "estado": "OK",
        "dob": "31/12/2023"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["dob"] == "31/12/2023"  # Verifica formato de respuesta
    assert "created_at" in data
    assert "updated_at" in data
    assert data["explotacio"] == "Test"
    assert data["nom"] == "Test Animal"
    assert data["genere"] == "M"
    assert data["estado"] == "OK"

# Test de listado de animales
@pytest.mark.asyncio
async def test_list_animals(client):
    """Test de listado de animales con filtros de fecha"""
    # Crear animal de prueba
    await Animal.create(
        explotacio="Test",
        nom="Test Animal",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU,
        dob=date(2023, 12, 31)
    )
    
    # Probar filtro por fecha
    response = await client.get(f"{API_PREFIX}/animals/", params={
        "fecha_desde": "01/12/2023",
        "fecha_hasta": "31/12/2023"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    animal = data[0]
    assert animal["dob"] == "31/12/2023"
    assert animal["explotacio"] == "Test"
    assert animal["genere"] == "M"
    assert animal["estado"] == "OK"

# Test de recuperación de animal
@pytest.mark.asyncio
async def test_get_animal(client):
    """Test de recuperación de animal individual"""
    # Crear animal de prueba
    animal = await Animal.create(
        explotacio="Test",
        nom="Test Animal",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU,
        dob=date(2023, 12, 31)
    )
    
    response = await client.get(f"{API_PREFIX}/animals/{animal.id}/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["dob"] == "31/12/2023"
    assert data["id"] == animal.id
    assert data["explotacio"] == "Test"
    assert data["genere"] == "M"
    assert data["estado"] == "OK"
    assert "created_at" in data
    assert "updated_at" in data

# Test de actualización de animal
@pytest.mark.asyncio
async def test_update_animal(client):
    """Test de actualización de animal con fechas"""
    # Crear animal de prueba
    animal = await Animal.create(
        explotacio="Test",
        nom="Test Animal",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU,
        dob=date(2023, 12, 31)
    )
    
    # Actualizar fecha de nacimiento
    response = await client.put(f"{API_PREFIX}/animals/{animal.id}/", json={
        "dob": "01/01/2024"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["dob"] == "01/01/2024"
    
    # Verificar que la fecha se guardó correctamente
    animal_db = await Animal.get(id=animal.id)
    assert animal_db.dob == date(2024, 1, 1)

# Test de búsqueda de animales
@pytest.mark.asyncio
async def test_search_animals(client):
    """Test de búsqueda de animales con fechas en respuesta"""
    # Crear animal de prueba
    await Animal.create(
        explotacio="Test",
        nom="Test Animal Search",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU,
        dob=date(2023, 12, 31)
    )
    
    response = await client.get(f"{API_PREFIX}/animals/search/", params={"q": "Search"})
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    animal = data[0]
    assert animal["dob"] == "31/12/2023"
    assert animal["nom"] == "Test Animal Search"
    assert animal["genere"] == "M"
    assert animal["estado"] == "OK"