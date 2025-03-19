import asyncio
import pytest
from tortoise import Tortoise, exceptions
from app.core.config import settings, TORTOISE_ORM

@pytest.mark.asyncio
async def test_tortoise_setup():
    """Test complete Tortoise initialization"""
    # 1. Initialize
    await Tortoise.init(
        db_url="asyncpg://postgres:1234@localhost:5432/masclet_imperi",
        modules={'models': ['app.models.animal', 'app.models.explotacio']}
    )
    
    try:
        # 2. Check connection
        conn = Tortoise.get_connection("default")
        result = await conn.execute_query("SELECT 1")
        assert result[1][0][0] == 1, "Database connection failed"
        
        # 3. Check models registration
        models = Tortoise.apps.get("models")
        assert models is not None, "Models app not found"
        assert "Animal" in models, "Animal model not registered"
        assert "Part" in models, "Part model not registered (desde animal.py)"
        assert "Explotacio" in models, "Explotacio model not registered"
        
        print("✓ Tortoise setup verified successfully")
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(test_tortoise_setup())