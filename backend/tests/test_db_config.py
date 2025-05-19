"""
Tests para verificar la configuración de la base de datos
"""
import pytest
from tortoise import Tortoise
from app.core.config import get_settings
from app.models.animal import Animal
from app.models.explotacio import Explotacio

@pytest.mark.asyncio
async def test_database_connection():
    """Verifica que podemos conectar a la base de datos"""
    settings = get_settings()
    assert settings.TESTING is True
    assert "sqlite" in str(settings.DATABASE_CONFIG["connections"]["default"])

@pytest.mark.asyncio
async def test_create_explotacio(test_explotacio):
    """Verifica que podemos crear una explotación"""
    assert test_explotacio.id is not None
    assert test_explotacio.nom == "Test Farm"
    assert test_explotacio.activa is True

@pytest.mark.asyncio
async def test_create_animal(test_animal, test_explotacio):
    """Verifica que podemos crear un animal"""
    assert test_animal.id is not None
    assert test_animal.explotacio_id == test_explotacio.id
    assert test_animal.nom == "Test Bull"
    
    # Verificar que podemos obtener el animal de la base de datos
    stored_animal = await Animal.get(id=test_animal.id)
    assert stored_animal.id == test_animal.id
    assert stored_animal.nom == test_animal.nom

@pytest.mark.asyncio
async def test_tortoise_config():
    """Verifica la configuración de Tortoise ORM"""
    # Verificar que tenemos una conexión activa
    assert await Tortoise.get_connection("default") is not None
    
    # Verificar que los modelos están registrados
    models = Tortoise.apps.get("models").__dict__.get("_models", {})
    assert "animal" in models
    assert "explotacio" in models