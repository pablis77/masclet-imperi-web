"""
Tests específicos para validación de fechas y partos
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, date, timedelta
from app.models.animal import Animal
from app.models.animal import Part
from app.core.date_utils import format_date, parse_date

# Datos de prueba basados en casos reales
TEST_VACA = {
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
}

TEST_PARTOS = [
    {
        "fecha": "19/12/2022",
        "genere_cria": "esforrada",
        "estado_cria": "DEF"
    },
    {
        "fecha": "17/11/2023",
        "genere_cria": "Mascle",
        "estado_cria": "OK"
    }
]

@pytest.mark.asyncio
async def test_date_formats(async_client: AsyncClient):
    """Test diferentes formatos de fecha"""
    # Crear animal con diferentes formatos de fecha
    formatos = [
        "02/03/2020",  # Formato español
        "2020-03-02",  # Formato ISO
        "02-03-2020"   # Formato alternativo
    ]
    
    for i, fecha in enumerate(formatos):
        response = await async_client.post("/api/v1/animals", json={
            **TEST_VACA,
            "nom": f"test-fecha-{i}",
            "dob": fecha
        })
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "success"
        # Verificar que la fecha se almacena en formato correcto
        assert "02/03/2020" in data["data"]["dob"]

@pytest.mark.asyncio
async def test_invalid_dates(async_client: AsyncClient):
    """Test fechas inválidas"""
    invalid_dates = [
        "31/02/2024",  # Día inválido
        "00/03/2024",  # Día cero
        "01/13/2024",  # Mes inválido
        "01/00/2024",  # Mes cero
        "01/01/1800",  # Año muy antiguo
        "01/01/2100",  # Año futuro lejano
        "abc",         # No es una fecha
        ""            # Vacío
    ]
    
    for fecha in invalid_dates:
        response = await async_client.post("/api/v1/animals", json={
            **TEST_VACA,
            "dob": fecha
        })
        assert response.status_code == 400
        assert "fecha" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_parto_date_sequence(async_client: AsyncClient):
    """Test secuencia temporal de partos"""
    # Crear animal de prueba
    animal = await Animal.create(**TEST_VACA)
    
    # Intentar crear partos en orden incorrecto
    partos = [
        {"fecha": "17/11/2023", "genere_cria": "M", "estado_cria": "OK"},
        {"fecha": "19/12/2022", "genere_cria": "F", "estado_cria": "OK"}
    ]
    
    # El primer parto debería funcionar
    response = await async_client.post("/api/v1/partos", json={
        "animal_id": animal.id,
        **partos[0]
    })
    assert response.status_code == 200
    
    # El segundo parto debería fallar por ser anterior al primero
    response = await async_client.post("/api/v1/partos", json={
        "animal_id": animal.id,
        **partos[1]
    })
    assert response.status_code == 400
    assert "fecha anterior" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_future_dates(async_client: AsyncClient):
    """Test fechas futuras"""
    # Fecha futura para nacimiento
    future_date = (datetime.now() + timedelta(days=1)).strftime("%d/%m/%Y")
    response = await async_client.post("/api/v1/animals", json={
        **TEST_VACA,
        "dob": future_date
    })
    assert response.status_code == 400
    assert "fecha futura" in response.json()["detail"].lower()
    
    # Fecha futura para parto
    animal = await Animal.create(**TEST_VACA)
    response = await async_client.post("/api/v1/partos", json={
        "animal_id": animal.id,
        "fecha": future_date,
        "genere_cria": "M",
        "estado_cria": "OK"
    })
    assert response.status_code == 400
    assert "fecha futura" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_same_day_partos(async_client: AsyncClient):
    """Test partos en el mismo día (caso de gemelos)"""
    # Crear animal de prueba
    animal = await Animal.create(**TEST_VACA)
    
    # Crear dos partos en la misma fecha
    for i in range(2):
        response = await async_client.post("/api/v1/partos", json={
            "animal_id": animal.id,
            "fecha": "23/02/2024",
            "genere_cria": "Mascle",
            "estado_cria": "OK"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "success"
        # Verificar que el número de parto se incrementa
        assert data["data"]["numero_parto"] == i + 1

@pytest.mark.asyncio
async def test_date_filters(async_client: AsyncClient):
    """Test filtros por fecha"""
    # Crear animal con varios partos
    animal = await Animal.create(**TEST_VACA)
    for parto in TEST_PARTOS:
        await Part.create(animal_id=animal.id, **parto)
    
    # Filtrar partos por rango de fechas
    response = await async_client.get(
        f"/api/v1/animals/{animal.id}/partos",
        params={
            "fecha_desde": "01/01/2023",
            "fecha_hasta": "31/12/2023"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["fecha"] == "17/11/2023"

@pytest.mark.asyncio
async def test_date_search(async_client: AsyncClient):
    """Test búsqueda por fecha"""
    # Crear varios animales con diferentes fechas
    dates = ["01/01/2020", "02/03/2020", "03/03/2020"]
    for i, dob in enumerate(dates):
        await Animal.create(**{
            **TEST_VACA,
            "nom": f"test-search-{i}",
            "dob": dob
        })
    
    # Buscar por mes/año
    response = await async_client.get("/api/v1/animals/search", params={
        "month": "03",
        "year": "2020"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2