"""
Tests de integración para el manejo de fechas con la base de datos
"""

import pytest
from datetime import date, timedelta
from app.models.animal import Animal
from app.models.animal import Part
from app.core.date_utils import (
    parse_date,
    format_date,
    validate_parto_date,
    DateError
)

# Datos de prueba basados en casos reales
TEST_VACA = {
    "explotacio": "Gurans",
    "nom": "R-32",
    "genere": "F",
    "estado": "OK",
    "alletar": False,
    "cod": "6144",
    "dob": "17/02/2018"
}

TEST_PARTOS = [
    {"fecha": "28/11/2019", "genere_cria": "Femella", "estado_cria": "OK"},
    {"fecha": "05/02/2021", "genere_cria": "Femella", "estado_cria": "OK"},
    {"fecha": "28/02/2022", "genere_cria": "Femella", "estado_cria": "OK"},
    {"fecha": "10/02/2023", "genere_cria": "Mascle", "estado_cria": "OK"},
    {"fecha": "06/02/2024", "genere_cria": "Femella", "estado_cria": "OK"}
]

@pytest.mark.asyncio
async def test_date_storage():
    """Test almacenamiento y recuperación de fechas en la BD"""
    # Crear animal
    animal = await Animal.create(**TEST_VACA)
    
    # Verificar que la fecha se almacenó correctamente
    assert animal.dob == parse_date(TEST_VACA["dob"])
    assert format_date(animal.dob) == TEST_VACA["dob"]
    
    # Actualizar fecha
    new_date = "18/02/2018"
    await animal.update_from_dict({"dob": new_date})
    await animal.save()
    
    # Verificar actualización
    updated_animal = await Animal.get(id=animal.id)
    assert format_date(updated_animal.dob) == new_date

@pytest.mark.asyncio
async def test_parto_sequence():
    """Test secuencia de partos en la BD"""
    # Crear animal
    animal = await Animal.create(**TEST_VACA)
    
    # Crear partos en orden
    for parto_data in TEST_PARTOS:
        await Part.create(
            animal_id=animal.id,
            fecha=parse_date(parto_data["fecha"]),
            genere_cria=parto_data["genere_cria"],
            estado_cria=parto_data["estado_cria"],
            numero_parto=await Part.filter(animal_id=animal.id).count() + 1
        )
    
    # Verificar orden y datos
    partos = await Part.filter(animal_id=animal.id).order_by("fecha")
    assert len(partos) == len(TEST_PARTOS)
    
    for i, parto in enumerate(partos):
        assert format_date(parto.fecha) == TEST_PARTOS[i]["fecha"]
        assert parto.numero_parto == i + 1

@pytest.mark.asyncio
async def test_date_queries():
    """Test consultas por fecha"""
    # Crear animal con partos
    animal = await Animal.create(**TEST_VACA)
    for parto_data in TEST_PARTOS:
        await Part.create(
            animal_id=animal.id,
            fecha=parse_date(parto_data["fecha"]),
            genere_cria=parto_data["genere_cria"],
            estado_cria=parto_data["estado_cria"]
        )
    
    # Consultar por año
    partos_2023 = await Part.filter(
        fecha__gte=date(2023, 1, 1),
        fecha__lt=date(2024, 1, 1)
    )
    assert len(partos_2023) == 1
    assert format_date(partos_2023[0].fecha) == "10/02/2023"
    
    # Consultar por rango
    partos_rango = await Part.filter(
        fecha__gte=parse_date("01/01/2021"),
        fecha__lte=parse_date("31/12/2022")
    )
    assert len(partos_rango) == 2

@pytest.mark.asyncio
async def test_date_constraints():
    """Test restricciones de fechas en la BD"""
    animal = await Animal.create(**TEST_VACA)
    
    # Intentar crear parto con fecha anterior al nacimiento
    with pytest.raises(DateError):
        await Part.create(
            animal_id=animal.id,
            fecha=parse_date("01/01/2018"),
            genere_cria="Mascle",
            estado_cria="OK"
        )
    
    # Crear primer parto
    parto1 = await Part.create(
        animal_id=animal.id,
        fecha=parse_date("28/11/2019"),
        genere_cria="Femella",
        estado_cria="OK"
    )
    
    # Intentar crear parto con fecha muy cercana al anterior
    with pytest.raises(DateError):
        await Part.create(
            animal_id=animal.id,
            fecha=parse_date("01/12/2019"),
            genere_cria="Mascle",
            estado_cria="OK"
        )

@pytest.mark.asyncio
async def test_date_filters():
    """Test filtros por fecha en consultas"""
    # Crear varios animales con diferentes fechas
    dates = ["01/01/2020", "02/03/2020", "03/03/2020"]
    for i, dob in enumerate(dates):
        await Animal.create(
            explotacio="Test",
            nom=f"test-{i}",
            genere="F",
            estado="OK",
            dob=dob
        )
    
    # Filtrar por mes específico
    march_animals = await Animal.filter(
        dob__month=3
    )
    assert len(march_animals) == 2
    
    # Filtrar por año
    animals_2020 = await Animal.filter(
        dob__year=2020
    )
    assert len(animals_2020) == 3
    
    # Filtrar por rango
    range_animals = await Animal.filter(
        dob__gte=parse_date("02/03/2020"),
        dob__lte=parse_date("03/03/2020")
    )
    assert len(range_animals) == 2

@pytest.mark.asyncio
async def test_real_world_scenarios():
    """Test escenarios del mundo real"""
    # Caso: Vaca con partos gemelos
    vaca = await Animal.create(
        explotacio="Gurans",
        nom="20-50",
        genere="F",
        estado="OK",
        dob="24/01/2020"
    )
    
    # Crear partos gemelos (mismo día)
    fecha_parto = "23/02/2024"
    for _ in range(2):
        await Part.create(
            animal_id=vaca.id,
            fecha=parse_date(fecha_parto),
            genere_cria="Mascle",
            estado_cria="OK",
            numero_parto=await Part.filter(animal_id=vaca.id).count() + 1
        )
    
    # Verificar partos gemelos
    partos = await Part.filter(
        animal_id=vaca.id,
        fecha=parse_date(fecha_parto)
    )
    assert len(partos) == 2
    assert partos[0].numero_parto != partos[1].numero_parto