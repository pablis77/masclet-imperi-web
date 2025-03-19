"""
Tests completos para importación de datos CSV
"""

import pytest
from httpx import AsyncClient
import csv
from pathlib import Path
from app.models.animal import Animal
from app.models.animal import Part

# Datos de importación basados en matriz_master.csv
IMPORT_DATA = """Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado;part;GenereT;EstadoT
;Gurans;1;M;;;Riera;7892;ES07090513;31/01/2020;OK;;;
no;Gurans;20-36;F;Xero;11-03;;6350;ES02090513;02/03/2020;OK;19/12/2022;esforrada;DEF
no;Gurans;20-36;F;Xero;11-03;;6350;ES02090513;02/03/2020;OK;17/11/2023;Mascle;OK
no;Gurans;20-50;F;Xero;83;;8461;ES04090513;24/01/2020;OK;23/02/2024;Mascle;OK
no;Gurans;20-50;F;Xero;83;;8461;ES04090513;24/01/2020;OK;23/02/2024;Mascle;OK"""

@pytest.fixture
async def test_csv(tmp_path):
    """Crear archivo CSV temporal para pruebas"""
    csv_path = tmp_path / "test_import.csv"
    csv_path.write_text(IMPORT_DATA, encoding='utf-8')
    return str(csv_path)

@pytest.mark.asyncio
async def test_basic_import(async_client: AsyncClient, test_csv):
    """Test importación básica de CSV"""
    with open(test_csv, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("test_import.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert data["data"]["processed"] == 5
    assert data["data"]["successful"] >= 3  # Al menos los registros únicos

    # Verificar datos importados
    animals = await Animal.all()
    assert len(animals) >= 3
    assert any(a.nom == "1" for a in animals)
    assert any(a.nom == "20-36" for a in animals)

@pytest.mark.asyncio
async def test_date_handling(async_client: AsyncClient):
    """Test manejo de diferentes formatos de fecha en importación"""
    # Datos con diferentes formatos de fecha
    data = """Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado;part;GenereT;EstadoT
;Gurans;test1;M;;;;T001;ES001;31/01/2020;OK;;;
;Gurans;test2;M;;;;T002;ES002;2020-01-31;OK;;;
;Gurans;test3;M;;;;T003;ES003;31-01-2020;OK;;;"""
    
    csv_path = Path("backend/tests/assets/date_test.csv")
    csv_path.write_text(data, encoding='utf-8')
    
    with open(csv_path, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("date_test.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["successful"] == 3
    
    # Verificar normalización de fechas
    animals = await Animal.all()
    for animal in animals:
        assert animal.dob.strftime("%d/%m/%Y") == "31/01/2020"

@pytest.mark.asyncio
async def test_duplicate_handling(async_client: AsyncClient, test_csv):
    """Test manejo de duplicados en importación"""
    # Primera importación
    with open(test_csv, 'rb') as f:
        await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("test_import.csv", f, "text/csv")}
        )
    
    # Segunda importación del mismo archivo
    with open(test_csv, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("test_import.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "duplicados" in data["data"]
    assert len(data["data"]["duplicados"]) > 0

@pytest.mark.asyncio
async def test_invalid_dates(async_client: AsyncClient):
    """Test manejo de fechas inválidas en importación"""
    data = """Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado;part;GenereT;EstadoT
;Gurans;test1;M;;;;T001;ES001;31/02/2020;OK;;;
;Gurans;test2;M;;;;T002;ES002;29/02/2021;OK;;;
;Gurans;test3;M;;;;T003;ES003;00/01/2020;OK;;;"""
    
    csv_path = Path("backend/tests/assets/invalid_dates.csv")
    csv_path.write_text(data, encoding='utf-8')
    
    with open(csv_path, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("invalid_dates.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["failed"] == 3
    assert any("fecha inválida" in error.lower() for error in data["data"]["errors"])

@pytest.mark.asyncio
async def test_parto_import(async_client: AsyncClient, test_csv):
    """Test importación de partos"""
    with open(test_csv, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("test_import.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    
    # Verificar partos importados
    animal = await Animal.get(nom="20-36")
    partos = await Part.filter(animal_id=animal.id).order_by("fecha")
    
    assert len(partos) == 2
    assert partos[0].fecha.strftime("%d/%m/%Y") == "19/12/2022"
    assert partos[0].genere_cria == "esforrada"
    assert partos[0].estado_cria == "DEF"
    
    assert partos[1].fecha.strftime("%d/%m/%Y") == "17/11/2023"
    assert partos[1].genere_cria == "Mascle"
    assert partos[1].estado_cria == "OK"

@pytest.mark.asyncio
async def test_same_day_partos_import(async_client: AsyncClient, test_csv):
    """Test importación de partos del mismo día"""
    with open(test_csv, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("test_import.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    
    # Verificar partos del mismo día
    animal = await Animal.get(nom="20-50")
    partos = await Part.filter(
        animal_id=animal.id,
        fecha=datetime.strptime("23/02/2024", "%d/%m/%Y").date()
    )
    
    assert len(partos) == 2
    assert all(p.genere_cria == "Mascle" for p in partos)
    assert all(p.estado_cria == "OK" for p in partos)
    assert partos[0].numero_parto != partos[1].numero_parto

@pytest.mark.asyncio
async def test_historical_import(async_client: AsyncClient):
    """Test importación de datos históricos"""
    data = """Alletar;explotació;NOM;Genere;Pare;Mare;Quadra;COD;Nº Serie;DOB;Estado;part;GenereT;EstadoT
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/11/2019;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;05/02/2021;Femella;OK
no;Gurans;R-32;F;;;;6144;;17/02/2018;OK;28/02/2022;Femella;OK"""
    
    csv_path = Path("backend/tests/assets/historical.csv")
    csv_path.write_text(data, encoding='utf-8')
    
    with open(csv_path, 'rb') as f:
        response = await async_client.post(
            "/api/v1/imports/csv",
            files={"file": ("historical.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    
    # Verificar datos históricos
    animal = await Animal.get(nom="R-32")
    partos = await Part.filter(animal_id=animal.id).order_by("fecha")
    
    assert len(partos) == 3
    dates = [p.fecha.strftime("%d/%m/%Y") for p in partos]
    assert dates == ["28/11/2019", "05/02/2021", "28/02/2022"]