import pytest
from tortoise import Tortoise
from tortoise.exceptions import IntegrityError
from app.models.enums import Genere, Estat
from app.models.animal import Animal

@pytest.mark.asyncio
class TestConstraints:
    async def test_unique_constraints(self, clean_db):
        # Create first animal
        animal = await Animal.create(
            explotacio="Test Farm",
            nom="Test Animal",
            genere=Genere.FEMELLA,
            estado=Estat.OK,
            num_serie="ES12345"
        )
        print(f"Animal created: {animal.nom}")
        
        # Try to create duplicate
        with pytest.raises(Exception) as exc:
            await Animal.create(
                explotacio="Test Farm",
                nom="Test Animal 2",
                genere=Genere.FEMELLA,
                estado=Estat.OK,
                num_serie="ES12345"
            )
        print(f"Exception raised as expected: {exc.type}")