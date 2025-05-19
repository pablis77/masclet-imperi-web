import pytest
from tortoise import Tortoise
from datetime import date
from app.models.enums import Genere, Estat

async def get_models():
    """Obtener modelos de forma segura"""
    return Tortoise.apps.get("models")

@pytest.mark.asyncio
async def test_create_part_basic(clean_db):
    """Test crear parto básico"""
    models = await get_models()
    Animal = models.get("Animal")
    Part = models.get("Part")
    
    mother = await Animal.create(
        explotacio="Test Farm",
        nom="Mother Test",
        genere=Genere.FEMELLA,
        estado=Estat.OK
    )
    
    part = await Part.create(
        animal=mother,
        data=date.today(),
        genere_fill=Genere.MASCLE,
        estat_fill=Estat.OK,
        numero_part=1
    )
    
    assert part.id is not None
    assert part.animal_id == mother.id