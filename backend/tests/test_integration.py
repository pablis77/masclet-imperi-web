"""
Tests de integración para flujos completos de la aplicación
"""
import pytest
from datetime import datetime, date, timedelta
from typing import Dict

from app.models.animal import Animal, Genere, Estado
from app.models.explotacio import Explotacio
from app.core.date_utils import DateConverter

API_PREFIX = "/api/v1"

@pytest.mark.asyncio
async def test_animal_lifecycle_with_partos(client, test_explotacio):
    """Test del ciclo de vida completo de un animal con partos"""
    
    # 1. Crear animal hembra
    animal_data = {
        "explotacio": str(test_explotacio.id),
        "nom": "Test Madre",
        "genere": "F",
        "estado": "A",
        "dob": "01/01/2022"  # 2 años de edad
    }
    
    response = client.post(f"{API_PREFIX}/animals/", json=animal_data)
    assert response.status_code == 200
    animal = response.json()
    animal_id = animal["id"]
    
    # 2. Verificar animal creado
    response = client.get(f"{API_PREFIX}/animals/{animal_id}")
    assert response.status_code == 200
    assert response.json()["genere"] == "F"
    assert response.json()["partos"]["total"] == 0
    
    # 3. Registrar primer parto
    parto1_data = {
        "animal_id": animal_id,
        "data": "01/01/2024",
        "genere_fill": "M",
        "estat_fill": "A"
    }
    
    response = client.post(f"{API_PREFIX}/partos/", json=parto1_data)
    assert response.status_code == 200
    assert response.json()["numero_part"] == 1
    
    # 4. Verificar actualización de estado
    response = client.get(f"{API_PREFIX}/animals/{animal_id}")
    assert response.status_code == 200
    animal_data = response.json()
    assert animal_data["alletar"] is True
    assert animal_data["partos"]["total"] == 1
    
    # 5. Registrar segundo parto
    parto2_data = {
        "animal_id": animal_id,
        "data": "01/02/2024",
        "genere_fill": "F",
        "estat_fill": "B"  # Cría no sobrevivió
    }
    
    response = client.post(f"{API_PREFIX}/partos/", json=parto2_data)
    assert response.status_code == 200
    assert response.json()["numero_part"] == 2
    
    # 6. Verificar estado después del segundo parto
    response = client.get(f"{API_PREFIX}/animals/{animal_id}")
    assert response.status_code == 200
    animal_data = response.json()
    assert animal_data["alletar"] is False  # No amamantando porque la cría no sobrevivió
    assert animal_data["partos"]["total"] == 2
    assert animal_data["partos"]["ultimo"]["data"] == "01/02/2024"
    
    # 7. Verificar estadísticas en explotación
    response = client.get(f"{API_PREFIX}/explotacions/{test_explotacio.id}")
    assert response.status_code == 200
    stats = response.json()["stats"]
    assert stats["vacas"] >= 1
    assert stats["terneros"] == 0  # No hay crías amamantando
    
    # 8. Dar de baja al animal
    response = client.delete(f"{API_PREFIX}/animals/{animal_id}")
    assert response.status_code == 200
    
    # 9. Verificar estado final
    response = client.get(f"{API_PREFIX}/animals/{animal_id}")
    assert response.status_code == 200
    animal_data = response.json()
    assert animal_data["estado"] == "B"  # Baja
    assert animal_data["alletar"] is False
    
    # 10. Verificar que no se pueden añadir más partos
    parto3_data = {
        "animal_id": animal_id,
        "data": "01/03/2024",
        "genere_fill": "M",
        "estat_fill": "A"
    }
    
    response = client.post(f"{API_PREFIX}/partos/", json=parto3_data)
    assert response.status_code == 400  # No se puede añadir parto a animal dado de baja

@pytest.mark.asyncio
async def test_invalid_parto_dates(client, test_explotacio):
    """Test de validaciones de fechas en partos"""
    
    # 1. Crear animal hembra
    animal_data = {
        "explotacio": str(test_explotacio.id),
        "nom": "Test Fechas",
        "genere": "F",
        "estado": "A",
        "dob": "01/01/2024"  # Animal muy joven
    }
    
    response = client.post(f"{API_PREFIX}/animals/", json=animal_data)
    assert response.status_code == 200
    animal_id = response.json()["id"]
    
    # 2. Intentar registrar parto con fecha anterior al nacimiento
    parto_data = {
        "animal_id": animal_id,
        "data": "01/01/2023",  # Fecha anterior al nacimiento
        "genere_fill": "M",
        "estat_fill": "A"
    }
    
    response = client.post(f"{API_PREFIX}/partos/", json=parto_data)
    assert response.status_code == 400
    assert "fecha" in response.json()["detail"].lower()
    
    # 3. Intentar registrar parto con fecha futura
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%d/%m/%Y")
    parto_data["data"] = tomorrow
    
    response = client.post(f"{API_PREFIX}/partos/", json=parto_data)
    assert response.status_code == 400
    assert "futura" in response.json()["detail"].lower()