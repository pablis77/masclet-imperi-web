"""
Fixtures compartidos para pruebas de base de datos
"""
import pytest
from datetime import datetime, date, timedelta
from typing import Optional

from app.models.animal import Animal, Genere, Estado, Part
from app.models.explotacio import Explotacio
from app.core.date_utils import DateConverter


@pytest.fixture
async def test_explotacio() -> Explotacio:
    """Test explotación"""
    return await Explotacio.create(
        nom="Test Farm",
        ubicacio="Test Location",
        activa=True
    )

@pytest.fixture
def test_dob() -> str:
    """Test fecha de nacimiento"""
    return DateConverter.get_display_format(date(2020, 1, 1))

@pytest.fixture
async def test_animal(test_explotacio: Explotacio, test_dob: str) -> Animal:
    """Test animal (macho)"""
    return await Animal.create(
        explotacio=test_explotacio,
        nom="Test Bull",
        genere=Genere.MASCLE,
        estado=Estado.ACTIU,
        alletar=False,
        dob=DateConverter.to_db_format(test_dob)
    )

@pytest.fixture
async def test_female_animal(test_explotacio: Explotacio, test_dob: str) -> Animal:
    """Test animal (hembra amamantando)"""
    return await Animal.create(
        explotacio=test_explotacio,
        nom="Test Cow",
        genere=Genere.FEMELLA,
        estado=Estado.ACTIU,
        alletar=True,
        dob=DateConverter.to_db_format(test_dob)
    )

@pytest.fixture
async def test_part_date() -> str:
    """Test fecha de parto"""
    return DateConverter.get_display_format(date(2020, 6, 1))

@pytest.fixture
async def test_parto(test_female_animal: Animal, test_part_date: str) -> Optional[Part]:
    """Test parto"""
    return await Part.create(
        animal=test_female_animal,
        data=DateConverter.to_db_format(test_part_date),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.ACTIU,
        numero_part=1
    )