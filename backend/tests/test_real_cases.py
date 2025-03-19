"""
Tests basados en casos reales del matriz_master.csv
"""

import pytest
from httpx import AsyncClient
import csv
from pathlib import Path
from app.models.animal import Animal
from app.models.animal import Part
from app.core.date_utils import parse_date

# Ruta al archivo de datos de prueba
TEST_DATA_PATH = Path(__file__).parent / "assets" / "test_real_cases.csv"

async def import_test_data():
    """Importa los datos de prueba del CSV"""
    with open(TEST_DATA_PATH, encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            # Crear animal si no existe
            animal = await Animal.get_or_none(nom=row['NOM'])
            if not animal:
                animal = await Animal.create(
                    explotacio=row['explotació'],
                    nom=row['NOM'],
                    genere=row['Genere'],
                    estado=row['Estado'],
                    alletar=row['Alletar'].lower() == 'si',
                    pare=row['Pare'] or None,
                    mare=row['Mare'] or None,
                    quadra=row['Quadra'],
                    cod=row['COD'],
                    num_serie=row['Nº Serie'],
                    dob=parse_date(row['DOB'])
                )
                
            # Crear parto si existe
            if row['part']:
                await Part.create(
                    animal_id=animal.id,
                    fecha=parse_date(row['part']),
                    genere_cria=row['GenereT'],
                    estado_cria=row['EstadoT'],
                    numero_parto=await Part.filter(animal_id=animal.id).count() + 1
                )

@pytest.mark.asyncio
async def test_toro_simple(async_client: AsyncClient):
    """Test caso del toro '1' - caso simple sin partos"""
    await import_test_data()
    
    # Obtener el toro
    response = await async_client.get("/api/v1/animals/search?q=1")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert len(data["data"]) == 1
    
    toro = data["data"][0]
    assert toro["nom"] == "1"
    assert toro["genere"] == "M"
    assert toro["alletar"] == False
    assert not await Part.filter(animal_id=toro["id"]).exists()

@pytest.mark.asyncio
async def test_vaca_con_partos(async_client: AsyncClient):
    """Test caso de la vaca '20-36' - caso complejo con múltiples partos"""
    await import_test_data()
    
    # Obtener la vaca
    response = await async_client.get("/api/v1/animals/search?q=20-36")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "success"
    assert len(data["data"]) == 1
    
    vaca = data["data"][0]
    assert vaca["nom"] == "20-36"
    assert vaca["genere"] == "F"
    assert vaca["alletar"] == True
    
    # Verificar historial de partos
    response = await async_client.get(f"/api/v1/animals/{vaca['id']}/partos")
    assert response.status_code == 200
    partos = response.json()["data"]
    assert len(partos) == 3
    
    # Verificar orden cronológico y detalles de los partos
    assert partos[0]["fecha"] == "30/12/2023"
    assert partos[0]["genere_cria"] == "M"
    assert partos[0]["estado_cria"] == "DEF"
    
    assert partos[1]["fecha"] == "15/06/2023"
    assert partos[1]["genere_cria"] == "F"
    assert partos[1]["estado_cria"] == "OK"
    
    assert partos[2]["fecha"] == "01/01/2023"
    assert partos[2]["genere_cria"] == "M"
    assert partos[2]["estado_cria"] == "OK"

@pytest.mark.asyncio
async def test_estadisticas_explotacion(async_client: AsyncClient):
    """Test estadísticas de explotación con datos reales"""
    await import_test_data()
    
    response = await async_client.get("/api/v1/dashboard/stats?explotacio=Gurans")
    assert response.status_code == 200
    data = response.json()["data"]
    
    # Verificar conteos
    assert data["total_animals"] == 2  # 1 toro + 1 vaca
    assert data["total_toros"] == 1    # toro "1"
    assert data["total_vacas"] == 1    # vaca "20-36"
    assert data["total_alletar"] == 1  # vaca "20-36"
    
    # Verificar estadísticas de partos
    assert data["total_partos"] == 3
    assert data["partos_activos"] == 2  # 2 OK, 1 DEF
    assert data["partos_ultimo_mes"] == 1  # El último parto

@pytest.mark.asyncio
async def test_validaciones_parto(async_client: AsyncClient):
    """Test validaciones específicas para partos"""
    await import_test_data()
    
    # Obtener la vaca para las pruebas
    vaca = await Animal.get(nom="20-36")
    
    # Intentar registrar parto con fecha anterior al último
    response = await async_client.post("/api/v1/partos", json={
        "animal_id": vaca.id,
        "fecha": "01/01/2023",  # Fecha anterior al último parto
        "genere_cria": "M",
        "estado_cria": "OK"
    })
    assert response.status_code == 400
    
    # Intentar registrar parto para el toro
    toro = await Animal.get(nom="1")
    response = await async_client.post("/api/v1/partos", json={
        "animal_id": toro.id,
        "fecha": "01/01/2024",
        "genere_cria": "M",
        "estado_cria": "OK"
    })
    assert response.status_code == 400
    assert "solo pueden tener partos los animales hembra" in response.json()["detail"].lower()