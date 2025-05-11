import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = str(Path(__file__).parent.parent / 'backend')
sys.path.append(backend_dir)

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from app.main import app
from tortoise import Tortoise

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture(autouse=True)
async def init_db():
    """Initialize test database"""
    await Tortoise.init(
        db_url='postgres://postgres:postgres@localhost:5432/masclet_imperi',
        modules={'models': ['app.models']}
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()