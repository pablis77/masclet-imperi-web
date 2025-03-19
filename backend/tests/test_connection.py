import asyncio
import pytest
from tortoise import Tortoise, connections
from app.core.config import settings

@pytest.mark.asyncio
async def test_connection():
    """Test basic database connectivity"""
    db_url = "asyncpg://postgres:1234@localhost:5432/masclet_imperi"
    
    await Tortoise.init(
        db_url=db_url,
        modules={'models': ['app.models.animal', 'app.models.parto']}
    )
    
    try:
        conn = Tortoise.get_connection("default")
        result = await conn.execute_query("SELECT 1")
        assert result[1][0][0] == 1, "Database connection failed"
    finally:
        await Tortoise.close_connections()

@pytest.mark.asyncio
async def test_tortoise_setup(initialize_tests):
    """Verify Tortoise is properly initialized"""
    # 1. Check connection
    conn = connections.get("default")
    assert conn is not None, "No default connection found"
    
    # 2. Check router
    app = Tortoise.apps.get("models")
    assert app is not None, "No 'models' app found"
    assert app.router is not None, "Router not initialized"
    
    # 3. Check model registration
    assert "Animal" in app.models, "Animal model not registered"

if __name__ == "__main__":
    asyncio.run(test_connection())