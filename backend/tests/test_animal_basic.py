import pytest
from tortoise import Tortoise
from app.models.animal import Animal
from app.models.enums import Genere, Estat
from app.core.config import TORTOISE_ORM

@pytest.mark.asyncio
class TestAnimalBasic:
    async def test_create_basic_animal(self):
        """Test creating animal with only required fields"""
        animal = await Animal.create(
            explotacio="Test Farm",
            nom="Basic Test Animal",
            genere=Genere.FEMELLA,
            estado=Estat.OK
        )
        
        assert animal.id is not None
        assert animal.nom == "Basic Test Animal"
        assert animal.explotacio == "Test Farm"
        assert animal.genere == Genere.FEMELLA
        assert animal.estado == Estat.OK
        
        # Verify we can fetch it back
        fetched = await Animal.get(id=animal.id)
        assert fetched.nom == animal.nom