import sys
from pathlib import Path

# Añadir backend al path
backend_dir = str(Path(__file__).parent.parent / 'backend')
sys.path.append(backend_dir)

import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client