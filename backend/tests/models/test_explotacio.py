"""
Tests para el modelo Explotació.
"""
import pytest
from datetime import date, timedelta
from app.models.explotacio import Explotacio
from app.models.animal import Animal, Genere, Estado, EstadoAlletar
import asyncio

@pytest.mark.asyncio
async def test_create_explotacio():
    """Test de creación de explotación básica."""
    # Crear explotación
    explotacio = await Explotacio.create(
        nom="Explotació Test",
        activa=True
    )
    
    # Verificar campos
    assert explotacio.id is not None
    assert explotacio.nom == "Explotació Test"
    assert explotacio.activa is True
    assert explotacio.created_at is not None
    assert explotacio.updated_at is not None

@pytest.mark.asyncio
async def test_update_explotacio():
    """Test de actualización de explotación."""
    # Crear explotación
    explotacio = await Explotacio.create(
        nom="Explotació Inicial"
    )
    
    # Registrar timestamp inicial
    created_timestamp = explotacio.created_at
    updated_timestamp = explotacio.updated_at
    
    # Esperar un momento para que cambie el timestamp
    await asyncio.sleep(0.1)  # Pequeña pausa para asegurar diferencia en timestamps
    
    # Actualizar usando el objeto directamente para garantizar que se active auto_now
    explotacio.nom = "Explotació Actualizada"
    await explotacio.save()

    # Recargar desde la base de datos
    await explotacio.refresh_from_db()
    
    # Verificar cambios
    assert explotacio.nom == "Explotació Actualizada"
    assert explotacio.created_at == created_timestamp
    assert explotacio.updated_at > updated_timestamp  # Debe actualizarse

@pytest.mark.asyncio
async def test_explotacio_inactive():
    """Test de explotación inactiva."""
    # Crear explotación inactiva
    explotacio = await Explotacio.create(
        nom="Explotació Inactiva",
        activa=False
    )
    
    # Verificar inactividad
    assert explotacio.activa is False

@pytest.mark.asyncio
async def test_explotacio_with_animals():
    """Test de explotación con animales."""
    # Crear explotación
    explotacio = await Explotacio.create(
        nom="Explotació con Animales"
    )
    
    # Crear varios animales en la explotación
    animal1 = await Animal.create(
        explotacio=explotacio,
        nom="Animal 1",
        genere=Genere.MASCLE,
        estado=Estado.OK
    )
    
    animal2 = await Animal.create(
        explotacio=explotacio,
        nom="Animal 2",
        genere=Genere.FEMELLA,
        estado=Estado.OK
    )
    
    animal3 = await Animal.create(
        explotacio=explotacio,
        nom="Animal 3",
        genere=Genere.MASCLE,
        estado=Estado.DEF  # Animal defunción
    )
    
    # Obtener todos los animales de la explotación
    animals = await explotacio.animals.all()
    
    # Verificar que hay 3 animales
    assert len(animals) == 3
    
    # Verificar que podemos filtrar por genere
    machos = await explotacio.animals.filter(genere=Genere.MASCLE).all()
    assert len(machos) == 2
    
    hembras = await explotacio.animals.filter(genere=Genere.FEMELLA).all()
    assert len(hembras) == 1
    
    # Verificar que podemos filtrar por estado
    activos = await explotacio.animals.filter(estado=Estado.OK).all()
    assert len(activos) == 2
    
    defunciones = await explotacio.animals.filter(estado=Estado.DEF).all()
    assert len(defunciones) == 1

@pytest.mark.asyncio
async def test_multiple_explotacions():
    """Test de múltiples explotaciones con animales."""
    # Crear dos explotaciones
    explotacio1 = await Explotacio.create(nom="Explotació 1")
    explotacio2 = await Explotacio.create(nom="Explotació 2")
    
    # Crear animales en explotación 1
    for i in range(5):
        await Animal.create(
            explotacio=explotacio1,
            nom=f"Animal E1-{i+1}",
            genere=Genere.MASCLE if i % 2 == 0 else Genere.FEMELLA,
            estado=Estado.OK
        )
    
    # Crear animales en explotación 2
    for i in range(3):
        await Animal.create(
            explotacio=explotacio2,
            nom=f"Animal E2-{i+1}",
            genere=Genere.FEMELLA,
            estado=Estado.OK
        )
    
    # Verificar cantidad de animales por explotación
    animals_e1 = await explotacio1.animals.all()
    assert len(animals_e1) == 5
    
    animals_e2 = await explotacio2.animals.all()
    assert len(animals_e2) == 3
    
    # Verificar total de animales en la base de datos
    total_animals = await Animal.all().count()
    assert total_animals == 8  # 5 + 3
    
    # Verificar que los animales están en la explotación correcta
    for animal in animals_e1:
        assert animal.explotacio_id == explotacio1.id
    
    for animal in animals_e2:
        assert animal.explotacio_id == explotacio2.id
