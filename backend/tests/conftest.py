"""
Fixtures y configuraciones para tests.
"""
import os
import pytest
import asyncio
from tortoise import Tortoise
from typing import Generator

# Configuración global del event_loop a nivel de sesión
@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Crea un único event loop para todos los tests de la sesión."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

# Base de datos compartida para tests que la necesiten
@pytest.fixture(scope="session")
async def db_session():
    """Inicializa la base de datos de test a nivel de sesión."""
    print("Configurando Tortoise ORM con modelos...")
    
    DB_URL = os.getenv("TEST_DB_URL", "sqlite://:memory:")
    await Tortoise.init(
        db_url=DB_URL,
        modules={
            "models": [
                "app.models.animal",  
                "app.models.user",
                "app.models.explotacio",
                "aerich.models"
            ]
        }
    )
    await Tortoise.generate_schemas()
    
    yield
    
    await Tortoise.close_connections()

# Fixture para limpiar datos entre tests individuales
@pytest.fixture(scope="function")
async def clean_db(db_session, request):
    """Limpia los datos de la base de datos entre tests."""
    # Dejar pasar la inicialización de db_session primero
    yield
    
    # Limpiar datos después de cada test
    # Solo para tests que no tengan el marcador no_cleanup
    if not request.node.get_closest_marker("no_cleanup"):
        print("Limpiando datos de prueba...")
        # Aquí añadir lógica para limpiar tablas específicas si es necesario