"""
Tests para los endpoints de animales.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer

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
async def test_get_animals_empty():
    """Test para obtener lista de animales (vacía inicialmente)."""
    response = client.get("/api/animals")
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 0
    assert data["status"] == "success"
    
    logger.info("Test de listado vacío completado exitosamente")

@pytest.mark.asyncio
async def test_create_animal():
    """Test para crear un animal mediante API."""
    # Primero crear una explotación
    explotacio = await Explotacio.create(nom="API Test", activa=True)
    
    # Datos para crear el animal
    animal_data = {
        "nom": "API-Animal-01",
        "explotacio_id": explotacio.id,
        "genere": "M",
        "estado": "OK",
        "cod": "API-01",
        "num_serie": "ES123456789"
    }
    
    response = client.post("/api/animals", json=animal_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    assert data["data"]["nom"] == "API-Animal-01"
    assert data["data"]["genere"] == "M"
    
    # Verificar que se ha creado en la base de datos
    animal_id = data["data"]["id"]
    created_animal = await Animal.get(id=animal_id)
    assert created_animal.nom == "API-Animal-01"
    
    logger.info(f"Test de creación completado. Animal ID: {animal_id}")
    return animal_id

@pytest.mark.asyncio
async def test_get_animal_by_id(animal_id=None):
    """Test para obtener un animal específico por su ID."""
    if animal_id is None:
        # Si no se proporcionó ID, crear un animal primero
        explotacio = await Explotacio.create(nom="API Get Test", activa=True)
        animal = await Animal.create(
            nom="API-Get-Test",
            explotacio=explotacio,
            genere="F",
            estado="OK"
        )
        animal_id = animal.id
    
    response = client.get(f"/api/animals/{animal_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    assert data["data"]["id"] == animal_id
    
    logger.info(f"Test de obtención por ID completado. Animal ID: {animal_id}")

@pytest.mark.asyncio
async def test_update_animal():
    """Test para actualizar datos de un animal."""
    # Crear un animal para actualizar
    explotacio = await Explotacio.create(nom="API Update Test", activa=True)
    animal = await Animal.create(
        nom="API-Update-Original",
        explotacio=explotacio,
        genere="M",
        estado="OK",
        cod="UPDATE-01"
    )
    
    # Datos para la actualización
    update_data = {
        "nom": "API-Update-Modified",
        "cod": "UPDATE-02"
    }
    
    response = client.put(f"/api/animals/{animal.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["nom"] == "API-Update-Modified"
    assert data["data"]["cod"] == "UPDATE-02"
    
    # Verificar en la base de datos
    updated_animal = await Animal.get(id=animal.id)
    assert updated_animal.nom == "API-Update-Modified"
    assert updated_animal.cod == "UPDATE-02"
    
    logger.info(f"Test de actualización completado. Animal ID: {animal.id}")

@pytest.mark.asyncio
async def test_delete_animal():
    """Test para eliminar un animal (soft delete -> estado=DEF)."""
    # Crear un animal para eliminar
    explotacio = await Explotacio.create(nom="API Delete Test", activa=True)
    animal = await Animal.create(
        nom="API-Delete-Test",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Verificar que está activo inicialmente
    assert animal.estado == "OK"
    
    response = client.delete(f"/api/animals/{animal.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    
    # Verificar el soft delete en la base de datos
    deleted_animal = await Animal.get(id=animal.id)
    assert deleted_animal.estado == "DEF"  # Debería estar marcado como fallecido
    
    logger.info(f"Test de eliminación (soft delete) completado. Animal ID: {animal.id}")

@pytest.mark.asyncio
async def test_search_animals():
    """Test para buscar animales por criterios."""
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Busqueda Test", activa=True)
    
    # Crear varios animales para buscar
    await Animal.create(
        nom="Busqueda-Toro-01",
        explotacio=explotacio,
        genere="M",
        estado="OK",
        cod="SEARCH-01"
    )
    
    await Animal.create(
        nom="Busqueda-Vaca-02",
        explotacio=explotacio,
        genere="F",
        estado="OK",
        cod="SEARCH-02"
    )
    
    await Animal.create(
        nom="Busqueda-Toro-03",
        explotacio=explotacio,
        genere="M",
        estado="DEF",  # Fallecido
        cod="SEARCH-03"
    )
    
    # Buscar por género M
    response = client.get("/api/animals/search", params={"genere": "M"})
    assert response.status_code == 200
    data = response.json()
    males = data["data"]
    assert len(males) == 2
    
    # Buscar por estado OK
    response = client.get("/api/animals/search", params={"estado": "OK"})
    assert response.status_code == 200
    data = response.json()
    active_animals = data["data"]
    assert len(active_animals) == 2
    
    # Buscar por código (parcial)
    response = client.get("/api/animals/search", params={"cod": "SEARCH"})
    assert response.status_code == 200
    data = response.json()
    search_animals = data["data"]
    assert len(search_animals) == 3
    
    logger.info("Test de búsqueda completado exitosamente")

@pytest.mark.asyncio
async def test_animals_with_filters():
    """Test para el listado de animales con filtros."""
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Filtros Test", activa=True)
    
    # Crear animales con diferentes características
    await Animal.create(nom="Filtro-M-OK", explotacio=explotacio, genere="M", estado="OK")
    await Animal.create(nom="Filtro-F-OK-1", explotacio=explotacio, genere="F", estado="OK", alletar=1)
    await Animal.create(nom="Filtro-F-OK-0", explotacio=explotacio, genere="F", estado="OK", alletar=0)
    await Animal.create(nom="Filtro-M-DEF", explotacio=explotacio, genere="M", estado="DEF")
    
    # Filtrar por explotación y género
    response = client.get("/api/animals", params={
        "explotacio_id": explotacio.id,
        "genere": "F"
    })
    
    assert response.status_code == 200
    data = response.json()
    females = data["data"]
    assert len(females) == 2
    
    # Filtrar por explotación y estado
    response = client.get("/api/animals", params={
        "explotacio_id": explotacio.id,
        "estado": "DEF"
    })
    
    assert response.status_code == 200
    data = response.json()
    deceased = data["data"]
    assert len(deceased) == 1
    
    # Filtrar por explotación, género y alletar
    response = client.get("/api/animals", params={
        "explotacio_id": explotacio.id,
        "genere": "F",
        "alletar": 1
    })
    
    assert response.status_code == 200
    data = response.json()
    nursing = data["data"]
    assert len(nursing) == 1
    assert nursing[0]["alletar"] == 1
    
    logger.info("Test de filtros completado exitosamente")

@pytest.mark.asyncio
async def test_create_animal_validations():
    """Test para validaciones al crear animales."""
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Validaciones", activa=True)
    
    # Caso 1: Sin campos obligatorios
    response = client.post("/api/animals", json={})
    assert response.status_code == 422
    
    # Caso 2: Con campos obligatorios pero sin explotación
    response = client.post("/api/animals", json={
        "nom": "Test-Validacion",
        "genere": "M",
        "estado": "OK",
    })
    assert response.status_code == 422
    
    # Caso 3: Con campos inválidos
    response = client.post("/api/animals", json={
        "nom": "Test-Validacion",
        "explotacio_id": explotacio.id,
        "genere": "INVALID",  # Debe ser M o F
        "estado": "OK",
    })
    assert response.status_code == 422
    
    logger.info("Test de validaciones completado exitosamente")

@pytest.mark.asyncio
async def test_pagination_animals():
    """Test para verificar la paginación en el listado de animales."""
    # Crear una explotación para las pruebas
    explotacio = await Explotacio.create(nom="Paginacion Test", activa=True)
    
    # Crear 15 animales para probar la paginación
    for i in range(15):
        await Animal.create(
            nom=f"Pag-Animal-{i+1}",
            explotacio=explotacio,
            genere="M" if i % 2 == 0 else "F",
            estado="OK"
        )
    
    # Probar primera página (por defecto 10 elementos)
    response = client.get("/api/animals", params={"explotacio_id": explotacio.id})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 10
    
    # Probar segunda página
    response = client.get("/api/animals", params={
        "explotacio_id": explotacio.id,
        "offset": 10
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    
    # Probar límite personalizado
    response = client.get("/api/animals", params={
        "explotacio_id": explotacio.id,
        "limit": 5
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    
    # Probar límite y offset combinados
    response = client.get("/api/animals", params={
        "explotacio_id": explotacio.id,
        "offset": 5,
        "limit": 5
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    
    logger.info("Test de paginación completado exitosamente")