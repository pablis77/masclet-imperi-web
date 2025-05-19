"""
Tests para validación de fechas en partos
"""
import pytest
from datetime import datetime, date, timedelta

API_PREFIX = "/api/v1"

@pytest.mark.asyncio
async def test_create_parto_invalid_date_format(client, test_female_animal):
    """Test crear parto con formato de fecha inválido"""
    # Formato americano MM/DD/YYYY
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "12/31/2023",
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

    # Formato ISO YYYY-MM-DD
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "2023-12-31",
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

@pytest.mark.asyncio
async def test_create_parto_invalid_date(client, test_female_animal):
    """Test crear parto con fecha inválida"""
    # Día inválido
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31/02/2023",  # Febrero no tiene 31 días
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

    # Mes inválido
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31/13/2023",  # Mes 13 no existe
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

@pytest.mark.asyncio
async def test_create_parto_future_date(client, test_female_animal):
    """Test crear parto con fecha futura"""
    tomorrow = date.today() + timedelta(days=1)
    future_date = tomorrow.strftime("%d/%m/%Y")
    
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": future_date,
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "no puede ser futura" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_create_parto_invalid_separators(client, test_female_animal):
    """Test crear parto con separadores inválidos"""
    # Usando guiones
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31-12-2023",
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

    # Usando puntos
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31.12.2023",
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

@pytest.mark.asyncio
async def test_update_parto_invalid_date(client, test_female_animal):
    """Test actualizar parto con fecha inválida"""
    # Crear parto inicial
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31/12/2023",
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 200
    parto_id = response.json()["id"]
    
    # Intentar actualizar con fecha inválida
    response = await client.put(f"{API_PREFIX}/partos/{parto_id}", json={
        "data": "2023-12-31"  # Formato incorrecto
    })
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]

@pytest.mark.asyncio
async def test_filter_partos_invalid_dates(client, test_female_animal):
    """Test filtrar partos con fechas inválidas"""
    # Crear un parto para tener datos
    response = await client.post(f"{API_PREFIX}/partos/", json={
        "animal_id": test_female_animal.id,
        "data": "31/12/2023",
        "genere_fill": "M",
        "estat_fill": "OK"
    })
    
    assert response.status_code == 200
    
    # Filtrar con fecha desde inválida
    response = await client.get(
        f"{API_PREFIX}/partos/animal/{test_female_animal.id}",
        params={"desde": "2023-01-01"}  # Formato incorrecto
    )
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]
    
    # Filtrar con fecha hasta inválida
    response = await client.get(
        f"{API_PREFIX}/partos/animal/{test_female_animal.id}",
        params={"hasta": "31-12-2023"}  # Formato incorrecto
    )
    
    assert response.status_code == 400
    assert "formato DD/MM/YYYY" in response.json()["detail"]