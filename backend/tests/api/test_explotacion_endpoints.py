"""
Tests para los endpoints de explotaciones.
"""
import pytest
import logging
from app.models.explotacio import Explotacio

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_list_explotacions_empty(client, clean_db):
    """Test para obtener lista de explotaciones (vacía inicialmente)."""
    response = client.get("/api/v1/explotacions/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0
    
    logger.info("Test de listado de explotaciones vacío completado exitosamente")

@pytest.mark.asyncio
async def test_create_explotacio(client, clean_db):
    """Test para crear una explotación mediante API."""
    # Datos para crear la explotación
    explotacio_data = {
        "nom": "Explotación Test API",
        "activa": True
    }
    
    response = client.post("/api/v1/explotacions/", json=explotacio_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Explotación Test API"
    assert data["activa"] == True
    
    # Verificar que se ha creado en la base de datos
    explotacio_id = data["id"]
    created_explotacio = await Explotacio.get(id=explotacio_id)
    assert created_explotacio.nom == "Explotación Test API"
    
    logger.info(f"Test de creación de explotación completado. Explotación ID: {explotacio_id}")
    return explotacio_id

@pytest.mark.asyncio
async def test_get_explotacio_by_id(client, clean_db):
    """Test para obtener una explotación específica por su ID."""
    # Crear una explotación para la prueba
    explotacio = await Explotacio.create(nom="Explotación Get Test", activa=True)
    
    response = client.get(f"/api/v1/explotacions/{explotacio.id}/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == explotacio.id
    assert data["nom"] == "Explotación Get Test"
    assert data["activa"] == True
    
    logger.info(f"Test de obtención de explotación por ID completado. Explotación ID: {explotacio.id}")

@pytest.mark.asyncio
async def test_get_explotacio_not_found(client, clean_db):
    """Test para verificar el comportamiento cuando se busca una explotación inexistente."""
    # Usar un ID que probablemente no exista
    non_existent_id = 99999
    
    response = client.get(f"/api/v1/explotacions/{non_existent_id}/")
    
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    # La respuesta puede ser en inglés o español dependiendo de la configuración
    assert "not found" in data["detail"].lower() or "no encontrada" in data["detail"].lower()
    
    logger.info("Test de explotación no encontrada completado exitosamente")

@pytest.mark.asyncio
async def test_update_explotacio(client, clean_db):
    """Test para actualizar datos de una explotación."""
    # Crear una explotación para actualizar
    explotacio = await Explotacio.create(nom="Explotación Update Original", activa=True)
    
    # Datos para la actualización
    update_data = {
        "nom": "Explotación Update Modified",
        "activa": False
    }
    
    response = client.put(f"/api/v1/explotacions/{explotacio.id}/", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["nom"] == "Explotación Update Modified"
    assert data["activa"] == False
    
    # Verificar en la base de datos
    updated_explotacio = await Explotacio.get(id=explotacio.id)
    assert updated_explotacio.nom == "Explotación Update Modified"
    assert updated_explotacio.activa == False
    
    logger.info(f"Test de actualización de explotación completado. Explotación ID: {explotacio.id}")

@pytest.mark.asyncio
async def test_update_explotacio_not_found(client, clean_db):
    """Test para verificar el comportamiento al actualizar una explotación inexistente."""
    # Usar un ID que probablemente no exista
    non_existent_id = 99999
    
    update_data = {
        "nom": "Explotación Inexistente",
        "activa": True
    }
    
    response = client.put(f"/api/v1/explotacions/{non_existent_id}/", json=update_data)
    
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    # La respuesta puede ser en inglés o español dependiendo de la configuración
    assert "not found" in data["detail"].lower() or "no encontrada" in data["detail"].lower()
    
    logger.info("Test de actualización de explotación inexistente completado exitosamente")

@pytest.mark.asyncio
async def test_list_explotacions_with_data(client, clean_db):
    """Test para listar explotaciones cuando hay datos."""
    # Crear varias explotaciones
    await Explotacio.create(nom="Explotación Lista 1", activa=True)
    await Explotacio.create(nom="Explotación Lista 2", activa=True)
    await Explotacio.create(nom="Explotación Lista 3", activa=False)
    
    response = client.get("/api/v1/explotacions/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    
    # Verificar que todas las explotaciones están en la respuesta
    nombres = [explotacio["nom"] for explotacio in data]
    assert "Explotación Lista 1" in nombres
    assert "Explotación Lista 2" in nombres
    assert "Explotación Lista 3" in nombres
    
    # Verificar que se muestran correctamente las explotaciones activas e inactivas
    activas = [explotacio["activa"] for explotacio in data if explotacio["nom"] == "Explotación Lista 3"]
    assert activas[0] == False
    
    logger.info("Test de listado de explotaciones con datos completado exitosamente")
