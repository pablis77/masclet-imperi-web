"""
Tests para el campo DateField
"""
import pytest
from datetime import datetime, date
from tortoise import Tortoise, connections

@pytest.fixture(scope="function")
async def init_test_db():
    """Inicializar la conexión a la BD para pruebas"""
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={
            "test_models": ["tests.test_models"],
            "models": ["app.models.animal"]
        }
    )
    
    # Drop y recrear todas las tablas
    conn = connections.get("default")
    await conn.execute_script("""
        DROP TABLE IF EXISTS test_dates CASCADE;
        DROP TABLE IF EXISTS test_custom_dates CASCADE;
    """)
    
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()

# Test básicos con DateField estándar
@pytest.mark.asyncio
async def test_standard_date_field(init_test_db):
    """Test del campo DateField estándar"""
    from .test_models import TestModel
    
    # Formato ISO
    model = await TestModel.create(date=date(2023, 12, 31))
    assert model.date == date(2023, 12, 31)
    
    # Objeto date
    model = await TestModel.create(date=date(2024, 1, 1))
    assert model.date == date(2024, 1, 1)

# Test con nuestro DateField personalizado
@pytest.mark.asyncio
async def test_custom_date_field_es_format(init_test_db):
    """Test del campo DateField con formato español"""
    from .test_models import TestDateFieldModel
    
    model = await TestDateFieldModel.create(date="31/12/2023")
    assert model.date == date(2023, 12, 31)
    assert isinstance(model.created_at, datetime)
    assert isinstance(model.updated_at, datetime)

@pytest.mark.asyncio
async def test_custom_date_field_db_format(init_test_db):
    """Test del campo DateField con formato BD"""
    from .test_models import TestDateFieldModel
    
    model = await TestDateFieldModel.create(date="2024-01-01")
    assert model.date == date(2024, 1, 1)
    assert isinstance(model.created_at, datetime)
    assert isinstance(model.updated_at, datetime)

@pytest.mark.asyncio
async def test_custom_date_field_objects(init_test_db):
    """Test del campo DateField con objetos datetime/date"""
    from .test_models import TestDateFieldModel
    
    model = await TestDateFieldModel.create(date=datetime(2024, 2, 29))
    assert model.date == date(2024, 2, 29)
    
    model = await TestDateFieldModel.create(date=date(2024, 3, 1))
    assert model.date == date(2024, 3, 1)

@pytest.mark.asyncio
async def test_custom_date_field_invalid(init_test_db):
    """Test que fechas inválidas lanzan error"""
    from .test_models import TestDateFieldModel
    
    with pytest.raises(ValueError):
        await TestDateFieldModel.create(date="invalid")
        
    with pytest.raises(ValueError):
        await TestDateFieldModel.create(date="32/12/2023")
        
    with pytest.raises(ValueError):
        await TestDateFieldModel.create(date="2023-13-31")

# Test de integración con modelos
@pytest.mark.asyncio
async def test_animal_model_dates(init_test_db):
    """Test de integración con el modelo Animal"""
    from app.models.animal import Animal
    
    # Crear animal con fecha en formato español
    animal = await Animal.create(
        explotacio="Test",
        nom="Test Animal",
        genere="M",
        estado="OK",
        dob="31/12/2023"
    )
    assert animal.dob == date(2023, 12, 31)
    assert isinstance(animal.created_at, datetime)
    assert isinstance(animal.updated_at, datetime)
    
    # Crear animal con objeto datetime
    animal = await Animal.create(
        explotacio="Test",
        nom="Test Animal 2",
        genere="M",
        estado="OK",
        dob=datetime(2024, 1, 1)
    )
    assert animal.dob == date(2024, 1, 1)

@pytest.mark.asyncio
async def test_part_model_dates(init_test_db):
    """Test de integración con el modelo Part"""
    from app.models.animal import Animal, Part
    
    animal = await Animal.create(
        explotacio="Test",
        nom="Test Animal",
        genere="F",
        estado="OK"
    )
    
    # Crear parto con fecha en formato español
    part = await Part.create(
        animal=animal,
        data="31/12/2023",
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    assert part.data == date(2023, 12, 31)
    assert isinstance(part.created_at, datetime)
    
    # Crear parto con objeto date
    part = await Part.create(
        animal=animal,
        data=date(2024, 1, 1),
        genere_fill="F",
        estat_fill="OK",
        numero_part=2
    )
    assert part.data == date(2024, 1, 1)