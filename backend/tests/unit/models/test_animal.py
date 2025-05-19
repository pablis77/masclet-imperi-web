import pytest
from datetime import date
from app.models.animal import Animal
from app.models.enums import Genere, Estat

@pytest.mark.asyncio
async def test_create_animal_basic(clean_db):
    """Test crear animal con datos mínimos"""
    animal = await Animal.create(
        explotacio="Test Farm",
        nom="Basic Test Animal",
        genere=Genere.FEMELLA,
        estado=Estat.OK
    )
    
    # Verify creation
    assert animal.id is not None
    assert animal.nom == "Basic Test Animal"
    assert animal.explotacio == "Test Farm"
    assert animal.genere == Genere.FEMELLA
    assert animal.estado == Estat.OK

    # Verify we can fetch it
    fetched = await Animal.get(id=animal.id)
    assert fetched.nom == "Basic Test Animal"

@pytest.mark.asyncio
async def test_create_animal_complete(clean_db):
    """Test campos opcionales según allowed_nulls del contexto"""
    test_date = date(2020, 1, 1)
    models = await get_models()
    Animal = models.get("Animal")
    
    animal = await Animal.create(
        explotacio="Gurans",
        nom="TEST002",
        genere=Genere.FEMELLA,
        estado=Estat.OK,
        alletar=True,
        pare="TORO1",
        mare="VACA1",
        quadra="Q1",
        cod="TEST123",
        num_serie="ES12345",
        dob=test_date
    )
    
    assert animal.alletar is True  # Campo específico para hembras
    assert animal.num_serie.startswith("ES")  # Validación según contexto
    assert animal.dob == test_date

@pytest.mark.asyncio
async def test_animal_part_relationship(clean_db):
    """Test relación Animal-Part"""
    models = await get_models()
    Animal = models.get("Animal")
    Part = models.get("Part")
    
    mother = await Animal.create(
        explotacio="Gurans",
        nom="MOTHER001",
        genere=Genere.FEMELLA,
        estado=Estat.OK
    )
    
    # Asegurarse que el animal existe
    assert mother.id is not None
    
    # Crear el parto usando el ID
    part = await Part.create(
        animal_id=mother.id,  # Usar el ID en lugar del objeto
        data=date.today(),
        genere_fill=Genere.MASCLE,
        estat_fill=Estat.OK,
        numero_part=1
    )
    
    # Verificar la relación
    parts = await mother.parts.all()
    assert len(parts) == 1
    assert parts[0].id == part.id

@pytest.mark.asyncio
async def test_create_animal_with_optional_fields(clean_db):
    """Test creación con campos opcionales"""
    models = await get_models()
    Animal = models.get("Animal")
    
    animal = await Animal.create(
        explotacio="Test Farm",
        nom="Test Animal",
        genere=Genere.FEMELLA,
        estado=Estat.OK,
        alletar=True,
        num_serie="ES12345"
    )
    
    assert animal.alletar is True
    assert animal.num_serie.startswith("ES")

@pytest.mark.asyncio
async def test_validate_constraints(clean_db):
    """Test validaciones de modelo"""
    models = await get_models()
    Animal = models.get("Animal")
    
    with pytest.raises(ValueError):
        await Animal.create(
            explotacio="Invalid",
            nom="Test",
            genere="INVALID",
            estado=Estat.OK
        )

@pytest.mark.asyncio
async def test_crear_animal_simple(clean_db):
    """Test crear animal con datos mínimos"""
    models = await get_models()
    Animal = models.get("Animal")
    
    animal = await Animal.create(
        explotacio="Gurans",
        nom="VACA 1",  # Nombres simples y claros
        genere=Genere.FEMELLA,
        estado=Estat.OK
    )
    
    assert animal.id is not None
    assert len(animal.nom) > 0
    assert animal.estado == Estat.OK

@pytest.mark.asyncio
async def test_crear_vaca_con_cria(clean_db):
    """Test vaca amamantando"""
    models = await get_models()
    Animal = models.get("Animal")
    
    madre = await Animal.create(
        explotacio="Gurans",
        nom="VACA NODRIZA",
        genere=Genere.FEMELLA,
        estado=Estat.OK,
        alletar=True,  # Está amamantando
        quadra="CORRAL 1"  # Ubicación clara
    )
    
    assert madre.alletar is True
    assert madre.quadra == "CORRAL 1"

@pytest.mark.asyncio
async def test_registro_parto(clean_db):
    """Test registro simple de parto"""
    models = await get_models()
    Animal = models.get("Animal")
    Part = models.get("Part")
    
    madre = await Animal.create(
        explotacio="Gurans",
        nom="VACA 2",
        genere=Genere.FEMELLA,
        estado=Estat.OK
    )
    
    parto = await Part.create(
        animal=madre,
        data=date.today(),
        genere_fill=Genere.MASCLE,
        estat_fill=Estat.OK,
        numero_part=1
    )
    
    partos = await madre.parts.all()
    assert len(partos) == 1
    assert partos[0].estat_fill == Estat.OK  # Cría sana

@pytest.mark.asyncio
async def test_marcar_baja(clean_db):
    """Test marcar animal como baja"""
    models = await get_models()
    Animal = models.get("Animal")
    
    animal = await Animal.create(
        explotacio="Gurans",
        nom="TORO VIEJO",
        genere=Genere.MASCLE,
        estado=Estat.OK
    )
    
    animal.estado = Estat.DEF  # Marcar como baja
    await animal.save()
    
    assert animal.estado == Estat.DEF