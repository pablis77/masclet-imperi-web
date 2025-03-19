"""
Tests para los endpoints de animales
"""
import pytest
from typing import Dict, Any
from datetime import date, datetime, timedelta
from fastapi.testclient import TestClient

from app.models.animal import Genere, Estado
from app.core.date_utils import DateConverter

API_PREFIX = "/api/v1"

def test_create_animal_basic(client, test_explotacio):
    """Test crear animal con datos básicos"""
    response = client.post(f"{API_PREFIX}/animals/", json={
        "explotacio": str(test_explotacio.id),
        "nom": "Test Animal",
        "genere": "M",
        "estado": "A"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Test Animal"
    assert data["genere"] == "M"
    assert data["estado"] == "A"
    assert data["dob"] is None

def test_create_animal_complete(client, test_explotacio):
    """Test crear animal con todos los campos"""
    dob = "01/01/2024"
    response = client.post(f"{API_PREFIX}/animals/", json={
        "explotacio": str(test_explotacio.id),
        "nom": "Test Complete",
        "genere": "F",
        "estado": "A",
        "dob": dob,
        "alletar": True,
        "quadra": "Q1",
        "cod": "TEST001",
        "num_serie": "ES123456"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Test Complete"
    assert data["dob"] == dob  # La fecha debe estar en formato ES
    assert data["alletar"] is True

def test_create_animal_with_different_date_formats(client, test_explotacio):
    """Test crear animal con diferentes formatos de fecha"""
    formats = [
        ("01/01/2024", "01/01/2024"),  # ES format -> ES format
        ("2024-01-01", "01/01/2024"),  # ISO format -> ES format
    ]
    
    for input_date, expected_date in formats:
        response = client.post(f"{API_PREFIX}/animals/", json={
            "explotacio": str(test_explotacio.id),
            "nom": f"Test Date {input_date}",
            "genere": "M",
            "estado": "A",
            "dob": input_date
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["dob"] == expected_date

def test_create_animal_validation_errors(client, test_explotacio):
    """Test validaciones al crear animal"""
    # Fecha inválida
    response = client.post(f"{API_PREFIX}/animals/", json={
        "explotacio": str(test_explotacio.id),
        "nom": "Test Invalid",
        "genere": "M",
        "estado": "A",
        "dob": "invalid-date"
    })
    assert response.status_code == 422
    
    # Macho amamantando
    response = client.post(f"{API_PREFIX}/animals/", json={
        "explotacio": str(test_explotacio.id),
        "nom": "Test Invalid",
        "genere": "M",
        "estado": "A",
        "alletar": True
    })
    assert response.status_code == 422
    
    # Género inválido
    response = client.post(f"{API_PREFIX}/animals/", json={
        "explotacio": str(test_explotacio.id),
        "nom": "Test Invalid",
        "genere": "X",
        "estado": "A"
    })
    assert response.status_code == 422

def test_get_animal(client, test_animal):
    """Test obtener un animal específico"""
    response = client.get(f"{API_PREFIX}/animals/{test_animal.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_animal.id
    assert data["nom"] == test_animal.nom
    assert data["dob"] == DateConverter.get_display_format(test_animal.dob)

def test_get_nonexistent_animal(client):
    """Test obtener animal que no existe"""
    response = client.get(f"{API_PREFIX}/animals/99999")
    assert response.status_code == 404

def test_list_animals_basic(client, test_animal, test_female_animal):
    """Test listar animales sin filtros"""
    response = client.get(f"{API_PREFIX}/animals/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert all(isinstance(item["id"], int) for item in data)

def test_list_animals_with_filters(client, test_animal, test_female_animal):
    """Test listar animales con filtros"""
    # Filtro por género
    response = client.get(f"{API_PREFIX}/animals/?genere=M")
    assert response.status_code == 200
    data = response.json()
    assert all(item["genere"] == "M" for item in data)
    
    # Filtro por estado
    response = client.get(f"{API_PREFIX}/animals/?estado=A")
    assert response.status_code == 200
    data = response.json()
    assert all(item["estado"] == "A" for item in data)
    
    # Filtro por amamantamiento
    response = client.get(f"{API_PREFIX}/animals/?alletar=true")
    assert response.status_code == 200
    data = response.json()
    assert all(item["alletar"] is True for item in data)

def test_list_animals_with_date_range(client, test_animal):
    """Test listar animales por rango de fechas"""
    response = client.get(
        f"{API_PREFIX}/animals/",
        params={
            "fecha_desde": "01/01/2020",
            "fecha_hasta": "31/12/2024"
        }
    )
    assert response.status_code == 200
    
    # Fecha inválida
    response = client.get(
        f"{API_PREFIX}/animals/",
        params={"fecha_desde": "invalid-date"}
    )
    assert response.status_code == 400

def test_update_animal(client, test_animal):
    """Test actualizar animal"""
    new_dob = "02/02/2024"
    response = client.put(f"{API_PREFIX}/animals/{test_animal.id}", json={
        "nom": "Updated Name",
        "dob": new_dob
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Updated Name"
    assert data["dob"] == new_dob

def test_update_nonexistent_animal(client):
    """Test actualizar animal que no existe"""
    response = client.put(f"{API_PREFIX}/animals/99999", json={
        "nom": "Updated Name"
    })
    assert response.status_code == 404

def test_delete_animal(client, test_animal):
    """Test eliminar (soft delete) animal"""
    response = client.delete(f"{API_PREFIX}/animals/{test_animal.id}")
    assert response.status_code == 200
    
    # Verificar que está marcado como BAIXA
    response = client.get(f"{API_PREFIX}/animals/{test_animal.id}")
    assert response.status_code == 200
    assert response.json()["estado"] == Estado.DEFUNCIO.value

def test_delete_nonexistent_animal(client):
    """Test eliminar animal que no existe"""
    response = client.delete(f"{API_PREFIX}/animals/99999")
    assert response.status_code == 404

def test_search_animals(client, test_animal):
    """Test búsqueda de animales"""
    # Búsqueda por nombre
    response = client.get(
        f"{API_PREFIX}/animals/search",
        params={"q": test_animal.nom[:4]}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert test_animal.nom in [item["nom"] for item in data]
    
    # Búsqueda sin resultados
    response = client.get(
        f"{API_PREFIX}/animals/search",
        params={"q": "nonexistent"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 0

@pytest.mark.asyncio
async def test_animal_crud_operations(client: TestClient):
    """Test completo de operaciones CRUD en animals"""
    # 1. Crear explotación para las pruebas
    explotacio_data = {
        "nom": "Test Farm",
        "ubicacio": "Test Location",
        "activa": True
    }
    response = client.post("/api/v1/explotacions/", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]

    # 2. Crear animal (CREATE)
    animal_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST-01",
        "genere": "F",
        "estado": "OK",
        "alletar": True,
        "quadra": "Q1",
        "cod": "T001",
        "num_serie": "ES123456789",
        "dob": DateConverter.get_display_format(datetime.now().date())
    }
    response = client.post("/api/v1/animals/", json=animal_data)
    assert response.status_code == 200
    created_animal = response.json()
    animal_id = created_animal["id"]

    # 3. Obtener animal (READ)
    response = client.get(f"/api/v1/animals/{animal_id}")
    assert response.status_code == 200
    assert response.json()["nom"] == "TEST-01"

    # 4. Actualizar animal (UPDATE)
    update_data = {
        "nom": "TEST-01-UPDATED",
        "quadra": "Q2"
    }
    response = client.patch(f"/api/v1/animals/{animal_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["nom"] == "TEST-01-UPDATED"
    assert response.json()["quadra"] == "Q2"

    # 5. Dar de baja animal (SOFT DELETE)
    response = client.patch(f"/api/v1/animals/{animal_id}", json={"estado": "DEF"})
    assert response.status_code == 200
    assert response.json()["estado"] == "DEF"

@pytest.mark.asyncio
async def test_animal_validations(client: TestClient):
    """Test de validaciones en la creación/actualización de animals"""
    # 1. Crear explotación para las pruebas
    explotacio_data = {
        "nom": "Test Farm 2",
        "ubicacio": "Test Location 2",
        "activa": True
    }
    response = client.post("/api/v1/explotacions/", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]

    # 2. Intentar crear animal sin campos requeridos
    invalid_data = {
        "explotacio": str(explotacio_id)
    }
    response = client.post("/api/v1/animals/", json=invalid_data)
    assert response.status_code == 422

    # 3. Intentar crear animal con género inválido
    invalid_gender_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST-02",
        "genere": "X",  # Inválido
        "estado": "OK"
    }
    response = client.post("/api/v1/animals/", json=invalid_gender_data)
    assert response.status_code == 422

    # 4. Validar alletar solo para hembras
    male_nursing_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST-03",
        "genere": "M",
        "estado": "OK",
        "alletar": True  # No debería permitirse para machos
    }
    response = client.post("/api/v1/animals/", json=male_nursing_data)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_animal_search_and_filters(client: TestClient):
    """Test de búsqueda y filtros de animals"""
    # 1. Crear explotación para las pruebas
    explotacio_data = {
        "nom": "Test Farm 3",
        "ubicacio": "Test Location 3",
        "activa": True
    }
    response = client.post("/api/v1/explotacions/", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]

    # 2. Crear varios animales para pruebas
    animals_data = [
        {
            "explotacio": str(explotacio_id),
            "nom": "SEARCH-01",
            "genere": "F",
            "estado": "OK",
            "alletar": True,
            "cod": "S001"
        },
        {
            "explotacio": str(explotacio_id),
            "nom": "SEARCH-02",
            "genere": "M",
            "estado": "OK",
            "cod": "S002"
        },
        {
            "explotacio": str(explotacio_id),
            "nom": "SEARCH-03",
            "genere": "F",
            "estado": "DEF",
            "cod": "S003"
        }
    ]

    for animal_data in animals_data:
        response = client.post("/api/v1/animals/", json=animal_data)
        assert response.status_code == 200

    # 3. Probar búsqueda por nombre
    response = client.get("/api/v1/animals/search?q=SEARCH")
    assert response.status_code == 200
    assert len(response.json()) == 3

    # 4. Probar filtro por género
    response = client.get(f"/api/v1/animals/?explotacio_id={explotacio_id}&genere=F")
    assert response.status_code == 200
    assert len(response.json()) == 2

    # 5. Probar filtro por estado
    response = client.get(f"/api/v1/animals/?explotacio_id={explotacio_id}&estado=DEF")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # 6. Probar filtro por alletar
    response = client.get(f"/api/v1/animals/?explotacio_id={explotacio_id}&alletar=true")
    assert response.status_code == 200
    assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_animal_date_validations(client: TestClient):
    """Test de validaciones de fechas en animals"""
    # 1. Crear explotación para las pruebas
    explotacio_data = {
        "nom": "Test Farm 4",
        "ubicacio": "Test Location 4",
        "activa": True
    }
    response = client.post("/api/v1/explotacions/", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]

    # 2. Probar fecha de nacimiento inválida
    invalid_date_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST-04",
        "genere": "F",
        "estado": "OK",
        "dob": "31/02/2024"  # Fecha inválida
    }
    response = client.post("/api/v1/animals/", json=invalid_date_data)
    assert response.status_code == 422

    # 3. Probar fecha futura
    future_date = (datetime.now() + timedelta(days=1)).strftime("%d/%m/%Y")
    future_date_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST-05",
        "genere": "F",
        "estado": "OK",
        "dob": future_date
    }
    response = client.post("/api/v1/animals/", json=future_date_data)
    assert response.status_code == 422

    # 4. Probar fecha válida
    valid_date_data = {
        "explotacio": str(explotacio_id),
        "nom": "TEST-06",
        "genere": "F",
        "estado": "OK",
        "dob": "01/01/2024"
    }
    response = client.post("/api/v1/animals/", json=valid_date_data)
    assert response.status_code == 200
    assert response.json()["dob"] == "01/01/2024"