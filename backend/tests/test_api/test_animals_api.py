import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
class TestAnimalAPI:
    @pytest.fixture
    def base_url(self):
        return "http://test"

    async def test_create_animal_api(self, base_url):
        """Test creating animal through API endpoint"""
        async with AsyncClient(app=app, base_url=base_url) as client:
            response = await client.post(
                "/api/animals/",
                json={
                    "explotacio": "Test Farm",
                    "nom": "Test Animal API",
                    "genere": "FEMELLA",
                    "estado": "OK"
                }
            )
            
            assert response.status_code == 201
            data = response.json()
            assert data["nom"] == "Test Animal API"
            assert data["explotacio"] == "Test Farm"

    async def test_get_animal_api(self, base_url):
        """Test getting animal through API endpoint"""
        async with AsyncClient(app=app, base_url=base_url) as client:
            response = await client.get("/api/animals/")
            assert response.status_code == 200