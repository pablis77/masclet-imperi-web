"""
Fixtures y configuraciones para tests.
"""
import os
import pytest
from tortoise import Tortoise
from typing import Generator

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Crea un event loop para los tests."""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function", autouse=True)
async def initialize_tests():
    """Inicializa la base de datos de test."""
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