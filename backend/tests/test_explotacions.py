"""
Tests para los endpoints de explotaciones
"""
import pytest
from datetime import datetime, timedelta

from app.models.animal import Animal, Genere, Estado
from app.models.explotacio import Explotacio
from app.core.date_utils import DateConverter

API_PREFIX = "/api/v1"

def test_create_explotacio_basic(client):
    """Test crear explotación con datos básicos"""
    response = client.post(f"{API_PREFIX}/explotacions/", json={
        "nom": "Test Explotació",
        "ubicacio": "Test Location"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Test Explotació"
    assert data["ubicacio"] == "Test Location"
    assert data["activa"] is True

def test_create_explotacio_validation(client):
    """Test validaciones al crear explotación"""
    # Nombre vacío
    response = client.post(f"{API_PREFIX}/explotacions/", json={
        "nom": "",
        "ubicacio": "Test"
    })
    assert response.status_code == 422

    # Sin nombre
    response = client.post(f"{API_PREFIX}/explotacions/", json={
        "ubicacio": "Test"
    })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_get_explotacio_with_stats(client, test_explotacio, test_animal, test_female_animal):
    """Test obtener explotación con estadísticas"""
    # Crear algunos animales adicionales
    await Animal.create(
        explotacio=test_explotacio,
        nom="Test Macho 2",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU
    )
    await Animal.create(
        explotacio=test_explotacio,
        nom="Test Hembra 2",
        genere=Genere.FEMELLA,
        estado=Estado.ACTIU,
        alletar=False  # Cambiado a False para tener solo 1 amamantando
    )
    
    # Asegurar que solo test_female_animal está amamantando
    await Animal.filter(id=test_female_animal.id).update(alletar=True)
    
    response = client.get(f"{API_PREFIX}/explotacions/{test_explotacio.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_explotacio.id
    assert "stats" in data
    assert data["stats"]["total"] == 4, "Debe haber 4 animales en total"
    assert data["stats"]["toros"] == 2, "Debe haber 2 machos"
    assert data["stats"]["vacas"] == 2, "Debe haber 2 hembras"
    assert data["stats"]["terneros"] == 1, "Debe haber 1 hembra amamantando"

def test_list_explotacions(client, test_explotacio):
    """Test listar explotaciones"""
    response = client.get(f"{API_PREFIX}/explotacions/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert all(isinstance(item["id"], int) for item in data)

def test_list_explotacions_with_filters(client, test_explotacio):
    """Test listar explotaciones con filtros"""
    # Filtrar por activas
    response = client.get(f"{API_PREFIX}/explotacions/?activa=true")
    assert response.status_code == 200
    data = response.json()
    assert all(item["activa"] is True for item in data)

    # Búsqueda por nombre
    response = client.get(f"{API_PREFIX}/explotacions/?search={test_explotacio.nom[:4]}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert test_explotacio.nom in [item["nom"] for item in data]

@pytest.mark.asyncio
async def test_update_explotacio(client, test_explotacio):
    """Test actualizar explotación"""
    response = client.put(f"{API_PREFIX}/explotacions/{test_explotacio.id}", json={
        "nom": "Updated Name",
        "activa": False
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Updated Name"
    assert data["activa"] is False

@pytest.mark.asyncio
async def test_delete_explotacio(client, test_explotacio):
    """Test eliminar explotación"""
    # No se puede eliminar con animales activos
    await Animal.create(
        explotacio=test_explotacio,
        nom="Test Animal",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU
    )
    
    response = client.delete(f"{API_PREFIX}/explotacions/{test_explotacio.id}")
    assert response.status_code == 400
    
    # Dar de baja los animales
    await Animal.filter(explotacio_id=test_explotacio.id).update(estado=Estado.DEFUNCIO)
    
    response = client.delete(f"{API_PREFIX}/explotacions/{test_explotacio.id}")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_dashboard_stats(client, test_explotacio):
    """Test estadísticas del dashboard"""
    # Crear algunos datos históricos
    one_month_ago = datetime.now() - timedelta(days=30)
    
    # Partos recientes
    await Animal.create(
        explotacio=test_explotacio,
        nom="Madre",
        genere=Genere.FEMELLA,
        estado=Estado.ACTIU,
        alletar=True,
        created_at=one_month_ago
    )
    
    # Algunas bajas
    await Animal.create(
        explotacio=test_explotacio,
        nom="Baja",
        genere=Genere.MASCLE,
        estado=Estado.DEFUNCIO,
        created_at=one_month_ago
    )
    
    response = client.get(f"{API_PREFIX}/explotacions/{test_explotacio.id}/dashboard")
    
    assert response.status_code == 200
    data = response.json()
    assert "dashboard_stats" in data
    assert "bajas_ultimo_mes" in data["dashboard_stats"]
    assert "partos_ultimo_mes" in data["dashboard_stats"]
    assert "ultimos_partos" in data
    assert "ultimas_bajas" in data