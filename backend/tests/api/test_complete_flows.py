"""
Tests para verificar flujos completos de la API.
Estos tests comprueban escenarios de uso completos que involucran
múltiples endpoints y verifican la integridad de los datos a través
de diferentes operaciones.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    initializer(
        modules=["app.models.animal", "app.models.parto", "app.models.explotacio"]
    )
    yield
    finalizer()

@pytest.mark.asyncio
async def test_complete_animal_parto_flow():
    """
    Test para verificar el flujo completo de:
    1. Crear explotación
    2. Crear animales (macho y hembra)
    3. Registrar parto
    4. Verificar que los datos se reflejan en el dashboard
    """
    # Limpiar datos existentes para tener un estado conocido
    await Animal.all().delete()
    await Part.all().delete()
    await Explotacio.all().delete()
    
    # 1. Crear explotación
    explotacio_data = {
        "nom": "Flujo Completo Test",
        "activa": True
    }
    
    response = client.post("/api/explotacions", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]
    
    # 2. Crear un toro
    toro_data = {
        "nom": "Toro-Padre",
        "explotacio_id": explotacio_id,
        "genere": "M",
        "estado": "OK",
        "cod": "TORO-001"
    }
    
    response = client.post("/api/animals", json=toro_data)
    assert response.status_code == 201
    toro_id = response.json()["data"]["id"]
    
    # 3. Crear una vaca
    vaca_data = {
        "nom": "Vaca-Madre",
        "explotacio_id": explotacio_id,
        "genere": "F",
        "estado": "OK",
        "cod": "VACA-001",
        "alletar": 0  # Sin terneros inicialmente
    }
    
    response = client.post("/api/animals", json=vaca_data)
    assert response.status_code == 201
    vaca_id = response.json()["data"]["id"]
    
    # 4. Registrar un parto
    fecha_parto = datetime.now().strftime("%d/%m/%Y")
    parto_data = {
        "animal_id": vaca_id,
        "data": fecha_parto,
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post("/api/partos", json=parto_data)
    assert response.status_code == 201
    parto_id = response.json()["data"]["id"]
    
    # 5. Verificar que la vaca ahora tiene un ternero (alletar = 1)
    response = client.get(f"/api/animals/{vaca_id}")
    assert response.status_code == 200
    vaca_updated = response.json()["data"]
    assert vaca_updated["alletar"] == 1
    
    # 6. Verificar que el parto aparece en la lista de partos de la madre
    response = client.get("/api/partos", params={"animal_id": vaca_id})
    assert response.status_code == 200
    partos_madre = response.json()["data"]
    assert len(partos_madre) == 1
    assert partos_madre[0]["id"] == parto_id
    
    # 7. Verificar que los datos se reflejan en el dashboard
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()["data"]
    
    # Verificar estadísticas generales
    assert stats["total_animals"] == 2  # 1 toro + 1 vaca
    assert stats["por_genero"]["M"] == 1
    assert stats["por_genero"]["F"] == 1
    assert stats["total_terneros"] == 1
    
    # 8. Verificar estadísticas por explotación
    response = client.get(f"/api/dashboard/explotacions/{explotacio_id}")
    assert response.status_code == 200
    explotacio_stats = response.json()["data"]
    assert explotacio_stats["total_animals"] == 2
    assert explotacio_stats["total_terneros"] == 1
    
    logger.info("Test de flujo completo animal-parto-dashboard completado exitosamente")

@pytest.mark.asyncio
async def test_multiple_partos_flow():
    """
    Test para verificar el flujo de múltiples partos para una misma vaca:
    1. Crear explotación
    2. Crear una vaca
    3. Registrar varios partos
    4. Verificar historial de partos
    5. Verificar actualización de estado de amamantamiento
    """
    # Limpiar datos existentes
    await Animal.all().delete()
    await Part.all().delete()
    await Explotacio.all().delete()
    
    # 1. Crear explotación
    explotacio_data = {
        "nom": "Multiple Partos Test",
        "activa": True
    }
    
    response = client.post("/api/explotacions", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]
    
    # 2. Crear una vaca
    vaca_data = {
        "nom": "Vaca-Multiple-Partos",
        "explotacio_id": explotacio_id,
        "genere": "F",
        "estado": "OK",
        "cod": "VMP-001"
    }
    
    response = client.post("/api/animals", json=vaca_data)
    assert response.status_code == 201
    vaca_id = response.json()["data"]["id"]
    
    # 3. Registrar primer parto (ternero vivo)
    fecha_parto1 = (datetime.now() - timedelta(days=365)).strftime("%d/%m/%Y")  # Hace un año
    parto1_data = {
        "animal_id": vaca_id,
        "data": fecha_parto1,
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post("/api/partos", json=parto1_data)
    assert response.status_code == 201
    
    # Verificar que la vaca tiene un ternero
    response = client.get(f"/api/animals/{vaca_id}")
    assert response.status_code == 200
    vaca_updated = response.json()["data"]
    assert vaca_updated["alletar"] == 1
    
    # 4. Registrar segundo parto (ternero vivo)
    fecha_parto2 = (datetime.now() - timedelta(days=180)).strftime("%d/%m/%Y")  # Hace 6 meses
    parto2_data = {
        "animal_id": vaca_id,
        "data": fecha_parto2,
        "genere_fill": "F",
        "estat_fill": "OK",
        "numero_part": 2
    }
    
    response = client.post("/api/partos", json=parto2_data)
    assert response.status_code == 201
    
    # Verificar que la vaca tiene dos terneros
    response = client.get(f"/api/animals/{vaca_id}")
    assert response.status_code == 200
    vaca_updated = response.json()["data"]
    assert vaca_updated["alletar"] == 2
    
    # 5. Registrar tercer parto (ternero fallecido)
    fecha_parto3 = datetime.now().strftime("%d/%m/%Y")  # Hoy
    parto3_data = {
        "animal_id": vaca_id,
        "data": fecha_parto3,
        "genere_fill": "M",
        "estat_fill": "DEF",  # Fallecido
        "numero_part": 3
    }
    
    response = client.post("/api/partos", json=parto3_data)
    assert response.status_code == 201
    
    # Verificar que la vaca sigue con dos terneros (el tercero está fallecido)
    response = client.get(f"/api/animals/{vaca_id}")
    assert response.status_code == 200
    vaca_updated = response.json()["data"]
    assert vaca_updated["alletar"] == 2
    
    # 6. Verificar historial completo de partos
    response = client.get("/api/partos", params={"animal_id": vaca_id})
    assert response.status_code == 200
    partos = response.json()["data"]
    assert len(partos) == 3
    
    # Verificar que los partos están ordenados por fecha (más reciente primero)
    assert partos[0]["numero_part"] == 3
    assert partos[1]["numero_part"] == 2
    assert partos[2]["numero_part"] == 1
    
    # 7. Verificar dashboard
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()["data"]
    assert stats["total_animals"] == 1
    assert stats["total_terneros"] == 2  # Solo los vivos
    
    logger.info("Test de flujo de múltiples partos completado exitosamente")

@pytest.mark.asyncio
async def test_animal_lifecycle_flow():
    """
    Test para verificar el ciclo de vida completo de un animal:
    1. Crear explotación
    2. Crear animal
    3. Actualizar datos
    4. Marcar como fallecido (soft delete)
    5. Verificar que se refleja en el dashboard
    """
    # Limpiar datos existentes
    await Animal.all().delete()
    await Explotacio.all().delete()
    
    # 1. Crear explotación
    explotacio_data = {
        "nom": "Lifecycle Test",
        "activa": True
    }
    
    response = client.post("/api/explotacions", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]
    
    # 2. Crear animal
    animal_data = {
        "nom": "Animal-Lifecycle",
        "explotacio_id": explotacio_id,
        "genere": "M",
        "estado": "OK",
        "cod": "LIFE-001"
    }
    
    response = client.post("/api/animals", json=animal_data)
    assert response.status_code == 201
    animal_id = response.json()["data"]["id"]
    
    # 3. Actualizar datos del animal
    update_data = {
        "nom": "Animal-Updated",
        "cod": "LIFE-002"
    }
    
    response = client.put(f"/api/animals/{animal_id}", json=update_data)
    assert response.status_code == 200
    updated_animal = response.json()["data"]
    assert updated_animal["nom"] == "Animal-Updated"
    assert updated_animal["cod"] == "LIFE-002"
    
    # Verificar dashboard antes de marcar como fallecido
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats_before = response.json()["data"]
    assert stats_before["total_animals"] == 1
    assert stats_before["por_estado"]["OK"] == 1
    assert "DEF" not in stats_before["por_estado"] or stats_before["por_estado"]["DEF"] == 0
    
    # 4. Marcar animal como fallecido (soft delete)
    response = client.delete(f"/api/animals/{animal_id}")
    assert response.status_code == 200
    
    # 5. Verificar que el animal está marcado como fallecido
    response = client.get(f"/api/animals/{animal_id}")
    assert response.status_code == 200
    deleted_animal = response.json()["data"]
    assert deleted_animal["estado"] == "DEF"
    
    # 6. Verificar que se refleja en el dashboard
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats_after = response.json()["data"]
    assert stats_after["total_animals"] == 1  # El animal sigue contando en el total
    assert "OK" not in stats_after["por_estado"] or stats_after["por_estado"]["OK"] == 0
    assert stats_after["por_estado"]["DEF"] == 1
    
    logger.info("Test de ciclo de vida de animal completado exitosamente")

@pytest.mark.asyncio
async def test_explotacion_management_flow():
    """
    Test para verificar el flujo de gestión de explotaciones:
    1. Crear explotación
    2. Crear animales en la explotación
    3. Desactivar la explotación
    4. Verificar que los animales siguen accesibles
    5. Verificar que se refleja correctamente en el dashboard
    """
    # Limpiar datos existentes
    await Animal.all().delete()
    await Explotacio.all().delete()
    
    # 1. Crear explotación
    explotacio_data = {
        "nom": "Explotación Management",
        "activa": True
    }
    
    response = client.post("/api/explotacions", json=explotacio_data)
    assert response.status_code == 200
    explotacio_id = response.json()["id"]
    
    # 2. Crear animales en la explotación
    for i in range(1, 6):
        animal_data = {
            "nom": f"Animal-Expl-{i}",
            "explotacio_id": explotacio_id,
            "genere": "M" if i % 2 == 0 else "F",
            "estado": "OK",
            "cod": f"EXPL-{i:03d}"
        }
        
        response = client.post("/api/animals", json=animal_data)
        assert response.status_code == 201
    
    # Verificar que los animales aparecen en el listado
    response = client.get("/api/animals")
    assert response.status_code == 200
    animals_before = response.json()["data"]
    assert len(animals_before) == 5
    
    # 3. Desactivar la explotación
    update_data = {
        "activa": False
    }
    
    response = client.put(f"/api/explotacions/{explotacio_id}", json=update_data)
    assert response.status_code == 200
    updated_explotacio = response.json()
    assert updated_explotacio["activa"] == False
    
    # 4. Verificar que los animales siguen accesibles
    response = client.get("/api/animals")
    assert response.status_code == 200
    animals_after = response.json()["data"]
    assert len(animals_after) == 5  # Los animales siguen siendo accesibles
    
    # 5. Verificar que se refleja correctamente en el dashboard
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()["data"]
    
    # Verificar que la explotación aparece como inactiva en el dashboard
    explotaciones = stats["por_explotacio"]
    assert str(explotacio_id) in explotaciones
    assert explotaciones[str(explotacio_id)]["activa"] == False
    assert explotaciones[str(explotacio_id)]["total"] == 5
    
    logger.info("Test de gestión de explotaciones completado exitosamente")
