"""
Tests de integración para endpoints de partos
"""
import pytest
from datetime import datetime, date

from app.models.animal import Animal, Part, Genere, Estado
from app.core.date_utils import DateConverter

API_PREFIX = "/api/v1"

def test_create_parto(client, test_female_animal):
    """Test de creación de parto"""
    response = client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31/12/2023",
        "genere_fill": "M",
        "estat_fill": "A"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == "31/12/2023"
    assert data["genere_fill"] == "M"
    assert data["estat_fill"] == "A"
    assert data["numero_part"] == 1
    assert "created_at" in data

def test_create_parto_invalid_animal(client):
    """Test de creación de parto con animal inválido"""
    response = client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": 99999,
        "data": "31/12/2023",
        "genere_fill": "M",
        "estat_fill": "A"
    })
    
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"]

def test_create_parto_male_animal(client, test_animal):
    """Test de creación de parto para un animal macho"""
    response = client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_animal.id,
        "data": "31/12/2023",
        "genere_fill": "M",
        "estat_fill": "A"
    })
    
    assert response.status_code == 400
    assert "Solo las hembras" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_parto(client, test_female_animal):
    """Test de recuperación de parto"""
    # Crear parto
    parto = await Part.create(
        animal=test_female_animal,
        data=date(2023, 12, 31),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.ACTIU,
        numero_part=1
    )
    
    response = client.get(f"{API_PREFIX}/partos/{parto.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == "31/12/2023"
    assert data["genere_fill"] == "M"
    assert data["estat_fill"] == "A"
    assert data["numero_part"] == 1

@pytest.mark.asyncio
async def test_list_animal_partos(client, test_female_animal):
    """Test de listado de partos de un animal"""
    # Crear varios partos
    await Part.create(
        animal=test_female_animal,
        data=date(2023, 12, 31),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.ACTIU,
        numero_part=1
    )
    await Part.create(
        animal=test_female_animal,
        data=date(2024, 1, 15),
        genere_fill=Genere.FEMELLA,
        estat_fill=Estado.ACTIU,
        numero_part=2
    )
    
    response = client.get(f"{API_PREFIX}/partos/animal/{test_female_animal.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["data"] == "15/01/2024"  # Ordenados por fecha descendente
    assert data[1]["data"] == "31/12/2023"

@pytest.mark.asyncio
async def test_update_parto(client, test_female_animal):
    """Test de actualización de parto"""
    # Crear parto
    parto = await Part.create(
        animal=test_female_animal,
        data=date(2023, 12, 31),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.ACTIU,
        numero_part=1
    )
    
    response = client.put(f"{API_PREFIX}/partos/{parto.id}", json={
        "data": "01/01/2024",
        "estat_fill": "B"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == "01/01/2024"
    assert data["estat_fill"] == "B"

@pytest.mark.asyncio
async def test_delete_parto(client, test_female_animal):
    """Test de eliminación de parto"""
    # Crear varios partos
    parto1 = await Part.create(
        animal=test_female_animal,
        data=date(2023, 12, 31),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.ACTIU,
        numero_part=1
    )
    parto2 = await Part.create(
        animal=test_female_animal,
        data=date(2024, 1, 15),
        genere_fill=Genere.FEMELLA,
        estat_fill=Estado.ACTIU,
        numero_part=2
    )
    
    response = client.delete(f"{API_PREFIX}/partos/{parto1.id}")
    
    assert response.status_code == 200
    
    # Verificar que el segundo parto ahora tiene numero_part = 1
    parto2_updated = await Part.get(id=parto2.id)
    assert parto2_updated.numero_part == 1