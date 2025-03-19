"""
Tests completos para endpoints de animales usando datos reales
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, date
from app.models.animal import Animal
from app.models.animal import Part

# Datos de prueba basados en casos reales del matriz_master.csv
TEST_CASES = {
    "toro_simple": {
        "explotacio": "Gurans",
        "nom": "1",
        "genere": "M",
        "estado": "OK",
        "quadra": "Riera",
        "cod": "7892",
        "num_serie": "ES07090513",
        "dob": "31/01/2020"
    },
    "vaca_partos": {
        "explotacio": "Gurans",
        "nom": "20-36",
        "genere": "F",
        "estado": "OK",
        "alletar": "no",
        "pare": "Xero",
        "mare": "11-03",
        "cod": "6350",
        "num_serie": "ES02090513",
        "dob": "02/03/2020"
    },
    "vaca_historica": {
        "explotacio": "Gurans",
        "nom": "R-32",
        "genere": "F",
        "estado": "OK",
        "alletar": "no",
        "cod": "6144",
        "dob": "17/02/2018"
    }
}

@pytest.mark.asyncio
async def test_create_real_animals(async_client: AsyncClient):
    """Test creación de animales con datos reales"""
    for case_name, animal_data in TEST_CASES.items():
        response = await async_client.post("/api/v1/animals", json=animal_data)
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "success"
        assert data["data"]["nom"] == animal_data["nom"]
        assert data["data"]["explotacio"] == animal_data["explotacio"]

@pytest.mark.asyncio
async def test_gurans_filters(async_client: AsyncClient):
    """Test filtros específicos para explotación Gurans"""
    # Crear varios animales de prueba
    for case_data in TEST_CASES.values():
        await Animal.create(**case_data)
    
    # Filtrar por explotación
    response = await async_client.get("/api/v1/animals", params={
        "explotacio": "Gurans"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 3
    
    # Filtrar por cuadra
    response = await async_client.get("/api/v1/animals", params={
        "explotacio": "Gurans",
        "quadra": "Riera"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 1
    assert data["data"]["items"][0]["nom"] == "1"

@pytest.mark.asyncio
async def test_complex_searches(async_client: AsyncClient):
    """Test búsquedas complejas"""
    # Crear animales de prueba
    for case_data in TEST_CASES.values():
        await Animal.create(**case_data)
    
    # Búsqueda por código
    response = await async_client.get("/api/v1/animals/search", params={
        "q": "7892"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["nom"] == "1"
    
    # Búsqueda por número de serie
    response = await async_client.get("/api/v1/animals/search", params={
        "q": "ES07090513"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["cod"] == "7892"

@pytest.mark.asyncio
async def test_historical_data(async_client: AsyncClient):
    """Test datos históricos y relaciones"""
    # Crear vaca con historial
    vaca = await Animal.create(**TEST_CASES["vaca_partos"])
    
    # Añadir partos históricos
    partos = [
        {"fecha": "19/12/2022", "genere_cria": "esforrada", "estado_cria": "DEF"},
        {"fecha": "17/11/2023", "genere_cria": "Mascle", "estado_cria": "OK"}
    ]
    
    for parto_data in partos:
        await Part.create(animal_id=vaca.id, **parto_data)
    
    # Obtener historial completo
    response = await async_client.get(f"/api/v1/animals/{vaca.id}/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["partos"]) == 2
    assert "genealogia" in data["data"]
    assert data["data"]["genealogia"]["pare"] == "Xero"

@pytest.mark.asyncio
async def test_naming_patterns(async_client: AsyncClient):
    """Test diferentes patrones de nombres"""
    patterns = [
        {"nom": "1", "tipo": "simple"},
        {"nom": "20-36", "tipo": "compuesto"},
        {"nom": "R-32", "tipo": "alfanumerico"},
        {"nom": "K-75", "tipo": "alfanumerico"},
        {"nom": "E6", "tipo": "mixto"}
    ]
    
    for pattern in patterns:
        response = await async_client.post("/api/v1/animals", json={
            **TEST_CASES["toro_simple"],
            "nom": pattern["nom"],
            "cod": f"TEST{pattern['nom']}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["nom"] == pattern["nom"]

@pytest.mark.asyncio
async def test_validation_rules(async_client: AsyncClient):
    """Test reglas de validación específicas"""
    # Intentar crear animal con número de serie duplicado
    response = await async_client.post("/api/v1/animals", json=TEST_CASES["toro_simple"])
    assert response.status_code == 200
    
    response = await async_client.post("/api/v1/animals", json={
        **TEST_CASES["toro_simple"],
        "nom": "otro_toro"
    })
    assert response.status_code == 400
    assert "serie" in response.json()["detail"].lower()
    
    # Validar estado alletar solo en hembras
    response = await async_client.post("/api/v1/animals", json={
        **TEST_CASES["toro_simple"],
        "alletar": "si",
        "num_serie": "ES99999999"
    })
    assert response.status_code == 400
    assert "alletar" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_update_scenarios(async_client: AsyncClient):
    """Test escenarios de actualización"""
    # Crear animal de prueba
    animal = await Animal.create(**TEST_CASES["vaca_partos"])
    
    # Actualización simple
    response = await async_client.put(f"/api/v1/animals/{animal.id}", json={
        "quadra": "Nueva Quadra"
    })
    assert response.status_code == 200
    assert response.json()["data"]["quadra"] == "Nueva Quadra"
    
    # Intentar cambiar género (no permitido)
    response = await async_client.put(f"/api/v1/animals/{animal.id}", json={
        "genere": "M"
    })
    assert response.status_code == 400
    assert "género" in response.json()["detail"].lower()
    
    # Animal fallecido
    await animal.update_from_dict({"estado": "DEF"})
    await animal.save()
    
    # Intentar actualizar animal fallecido
    response = await async_client.put(f"/api/v1/animals/{animal.id}", json={
        "quadra": "Otra Quadra"
    })
    assert response.status_code == 400
    assert "fallecido" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_statistics(async_client: AsyncClient):
    """Test estadísticas de explotación"""
    # Crear varios animales
    for case_data in TEST_CASES.values():
        await Animal.create(**case_data)
    
    # Obtener estadísticas
    response = await async_client.get("/api/v1/stats/explotacion/Gurans")
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert data["total_animales"] == 3
    assert data["total_machos"] == 1
    assert data["total_hembras"] == 2
    assert "total_alletar" in data
    assert "distribucion_estados" in data