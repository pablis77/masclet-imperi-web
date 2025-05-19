import pytest
import logging
from datetime import date, timedelta
from app.models.animal import Animal, Genere, Estado, EstadoAlletar
from app.models.explotacio import Explotacio
from app.models.animal import Part

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_create_animal_required_fields():
    """Test de creación de animal con campos requeridos."""
    # Crear explotación
    explotacio = await Explotacio.create(nom="Explotación Test")
    
    # Crear animal con campos obligatorios
    animal = await Animal.create(
        explotacio=explotacio,
        nom="Animal Test",
        genere=Genere.MASCLE,
        estado=Estado.OK
    )
    
    # Verificar creación exitosa
    assert animal.id is not None
    assert animal.nom == "Animal Test"
    assert animal.genere == Genere.MASCLE
    assert animal.estado == Estado.OK
    assert animal.explotacio_id == explotacio.id
    
    # Verificar valores por defecto
    assert animal.alletar == EstadoAlletar.NO_ALLETAR
    assert animal.dob is None
    assert animal.cod is None
    assert animal.num_serie is None
    assert animal.pare is None
    assert animal.mare is None
    
@pytest.mark.asyncio
async def test_create_animal_all_fields():
    """Test de creación de animal con todos los campos."""
    # Crear explotación
    explotacio = await Explotacio.create(nom="Explotación Completa")
    
    # Crear padres para el animal
    padre = await Animal.create(
        explotacio=explotacio,
        nom="Padre",
        genere=Genere.MASCLE,
        estado=Estado.OK
    )
    
    madre = await Animal.create(
        explotacio=explotacio,
        nom="Madre",
        genere=Genere.FEMELLA,
        estado=Estado.OK
    )
    
    # Fecha de nacimiento
    dob = date.today() - timedelta(days=365)  # 1 año atrás
    
    # Crear animal con todos los campos
    animal = await Animal.create(
        explotacio=explotacio,
        nom="Animal Completo",
        genere=Genere.FEMELLA,
        estado=Estado.OK,
        alletar=EstadoAlletar.UN_TERNERO,
        dob=dob,
        cod="ABC123",
        num_serie="SN12345",
        pare=padre.nom,  
        mare=madre.nom,  
        quadra="Q1"
    )
    
    # Verificar todos los campos
    assert animal.nom == "Animal Completo"
    assert animal.genere == Genere.FEMELLA
    assert animal.estado == Estado.OK
    assert animal.alletar == EstadoAlletar.UN_TERNERO
    assert animal.dob == dob
    assert animal.cod == "ABC123"
    assert animal.num_serie == "SN12345"
    assert animal.pare == padre.nom  
    assert animal.mare == madre.nom  
    assert animal.quadra == "Q1"

@pytest.mark.asyncio
async def test_animal_to_dict_method():
    """Test del método to_dict del modelo Animal."""
    # Crear explotación
    explotacio = await Explotacio.create(nom="Dict")
    
    # Fecha de nacimiento
    dob = date.today() - timedelta(days=180)  # 6 meses atrás
    
    # Crear animal
    animal = await Animal.create(
        explotacio=explotacio,
        nom="Animal Dict",
        genere=Genere.MASCLE,
        estado=Estado.OK,
        dob=dob,
        alletar=EstadoAlletar.NO_ALLETAR
    )
    
    # Obtener diccionario
    animal_dict = await animal.to_dict()
    
    # Verificar campos en el diccionario
    assert animal_dict["id"] == animal.id
    assert animal_dict["nom"] == "Animal Dict"
    assert animal_dict["genere"] == Genere.MASCLE
    assert animal_dict["estado"] == Estado.OK
    assert animal_dict["dob"] == dob.strftime("%d/%m/%Y")
    assert animal_dict["alletar"] == EstadoAlletar.NO_ALLETAR.value
    assert "partos" not in animal_dict  # No incluir partos

@pytest.mark.asyncio
async def test_animal_female_with_partos():
    """Test de animal hembra con partos."""
    # Crear explotación
    explotacio = await Explotacio.create(nom="Explotación Partos")
    
    # Crear vaca madre
    madre = await Animal.create(
        explotacio=explotacio,
        nom="Vaca Madre",
        genere=Genere.FEMELLA,
        estado=Estado.OK
    )
    
    # Crear dos partos para la madre
    parto1 = await Part.create(
        animal=madre,
        data=date(2023, 3, 15),
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    parto2 = await Part.create(
        animal=madre,
        data=date(2024, 4, 20),
        genere_fill="F",
        estat_fill="OK",
        numero_part=2
    )
    
    # Recargar el animal desde la BD para asegurar que se actualizan las relaciones
    await madre.refresh_from_db()
    
    # Obtener diccionario incluyendo partos
    madre_dict = await madre.to_dict(include_partos=True)
    
    # Verificar que los partos están incluidos y ordenados por fecha descendente
    assert "partos" in madre_dict
    assert madre_dict["partos"]["total"] == 2
    assert len(madre_dict["partos"]["items"]) == 2
    
    # Verificar ordenación (más reciente primero)
    partos_items = madre_dict["partos"]["items"]
    assert partos_items[0]["data"] > partos_items[1]["data"]
    
    # Verificar fechas primera y última
    assert madre_dict["partos"]["first_date"] == "15/03/2023"
    assert madre_dict["partos"]["last_date"] == "20/04/2024"

@pytest.mark.asyncio
async def test_animal_validate_date():
    """Test del método validate_date del modelo Animal."""
    # Probar conversión de diferentes formatos de fecha
    assert Animal.validate_date("31/12/2023") == date(2023, 12, 31)
    assert Animal.validate_date("2023-12-31") == date(2023, 12, 31)
    assert Animal.validate_date("31-12-2023") == date(2023, 12, 31)
    
    # Verificar manejo de valores nulos
    assert Animal.validate_date(None) is None
    assert Animal.validate_date("") is None
    
    # Verificar fecha inválida (debería lanzar excepción)
    with pytest.raises(ValueError):
        Animal.validate_date("fecha-invalida")
        
    with pytest.raises(ValueError):
        Animal.validate_date("32/13/2023")

@pytest.mark.asyncio
async def test_animal_state_transitions():
    """Test de transiciones de estado del animal."""
    # Crear explotación
    explotacio = await Explotacio.create(nom="Estados")
    
    # Crear animal en estado OK
    animal = await Animal.create(
        explotacio=explotacio,
        nom="Animal Estados",
        genere=Genere.MASCLE,
        estado=Estado.OK
    )
    
    # Verificar estado inicial
    assert animal.estado == Estado.OK
    
    # Cambiar a defunción
    animal.estado = Estado.DEF
    await animal.save()
    
    # Recargar desde la BD
    await animal.refresh_from_db()
    
    # Verificar nuevo estado
    assert animal.estado == Estado.DEF
    
    # Verificar que el estado se refleja en el diccionario
    animal_dict = await animal.to_dict()
    assert animal_dict["estado"] == Estado.DEF