"""
Tests para el modelo Parto.
"""
import pytest
import logging
from datetime import date, datetime, timedelta
from app.models.animal import Animal, Genere, Estado
from app.models.animal import Part
from app.models.explotacio import Explotacio

logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_create_parto():
    """Test creación de un parto básico."""
    try:
        # Crear explotación
        explotacio = await Explotacio.create(nom="Gurans", activa=True)
        
        # Crear vaca madre
        madre = await Animal.create(
            nom="Madre-01",
            explotacio=explotacio,
            genere="F",
            estado="OK"
        )
        
        # Fecha de parto
        fecha_parto = datetime.strptime("15/03/2025", "%d/%m/%Y").date()
        
        # Crear parto
        parto = await Part.create(
            animal=madre,
            data=fecha_parto,
            genere_fill="M",
            estat_fill="OK",
            numero_part=1
        )
        
        # Verificaciones
        assert parto.animal.id == madre.id
        assert parto.genere_fill == "M"
        assert parto.estat_fill == "OK"
        assert parto.numero_part == 1
        
        # Verificar fecha formateada
        assert parto.data.strftime("%d/%m/%Y") == "15/03/2025"
        
        logger.info(f"Parto creado correctamente: ID={parto.id}")
        
    except Exception as e:
        logger.error(f"Error en test_create_parto: {str(e)}")
        raise e

@pytest.mark.asyncio
async def test_parto_validation():
    """Verificar validaciones al crear un parto."""
    explotacio = await Explotacio.create(nom="Test")
    
    # Crear macho
    macho = await Animal.create(
        nom="Macho-Test",
        explotacio=explotacio,
        genere="M",
        estado="OK"
    )
    
    # Crear hembra
    hembra = await Animal.create(
        nom="Hembra-Test",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Un macho no puede tener partos - debería dar error
    with pytest.raises(Exception):
        await Part.create(
            animal=macho,
            data=date.today(),
            genere_fill="M",
            estat_fill="OK",
            numero_part=1
        )
    
    # Una hembra puede tener partos
    parto = await Part.create(
        animal=hembra,
        data=date.today(),
        genere_fill="F",
        estat_fill="OK",
        numero_part=1
    )
    
    assert parto.id is not None
    assert parto.animal.id == hembra.id

@pytest.mark.asyncio
async def test_multiple_partos():
    """Test para crear múltiples partos para una misma vaca."""
    explotacio = await Explotacio.create(nom="Multiples")
    
    # Crear vaca
    vaca = await Animal.create(
        nom="Vaca-Multiple",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Fechas de parto separadas
    fecha1 = date.today() - timedelta(days=365)  # Hace un año
    fecha2 = date.today() - timedelta(days=180)  # Hace 6 meses
    fecha3 = date.today() - timedelta(days=30)   # Hace 1 mes
    
    # Crear partos en diferentes fechas
    parto1 = await Part.create(
        animal=vaca,
        data=fecha1,
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    parto2 = await Part.create(
        animal=vaca,
        data=fecha2,
        genere_fill="F",
        estat_fill="OK",
        numero_part=2
    )
    
    parto3 = await Part.create(
        animal=vaca,
        data=fecha3,
        genere_fill="M",
        estat_fill="DEF",  # Cría muerta
        numero_part=3
    )
    
    # Verificar que se crearon todos los partos
    partos = await Part.filter(animal=vaca).all()
    assert len(partos) == 3
    
    # Verificar orden cronológico
    partos_ordenados = sorted(partos, key=lambda p: p.data)
    assert partos_ordenados[0].id == parto1.id
    assert partos_ordenados[1].id == parto2.id
    assert partos_ordenados[2].id == parto3.id
    
    # Verificar número de parto
    assert partos_ordenados[0].numero_part == 1
    assert partos_ordenados[1].numero_part == 2
    assert partos_ordenados[2].numero_part == 3

@pytest.mark.asyncio
async def test_parto_to_dict():
    """Test del método to_dict del parto."""
    explotacio = await Explotacio.create(nom="Dict")
    
    # Crear vaca
    vaca = await Animal.create(
        nom="Vaca-Dict",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Fecha actual
    fecha_parto = date.today()
    
    # Crear parto
    parto = await Part.create(
        animal=vaca,
        data=fecha_parto,
        genere_fill="F",
        estat_fill="OK",
        numero_part=1,
        observacions="Parto sin complicaciones"
    )
    
    # Asegurar que la relación con el animal esté cargada
    await parto.fetch_related("animal")
    
    # Obtener diccionario
    parto_dict = await parto.to_dict()
    
    # Verificar campos en el diccionario
    assert parto_dict["id"] == parto.id
    assert parto_dict["animal_id"] == vaca.id
    assert parto_dict["data"] == fecha_parto.strftime("%d/%m/%Y")
    assert parto_dict["genere_fill"] == "F"
    assert parto_dict["estat_fill"] == "OK"
    assert parto_dict["numero_part"] == 1
    assert parto_dict["observacions"] == "Parto sin complicaciones"
    assert "animal_nom" in parto_dict

@pytest.mark.asyncio
async def test_parto_fechas_especiales():
    """Test de partos con fechas especiales (año bisiesto, límites)."""
    explotacio = await Explotacio.create(nom="Fechas")
    
    # Crear vaca
    vaca = await Animal.create(
        nom="Vaca-Fechas",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Fecha bisiesto (29 de febrero)
    fecha_bisiesto = date(2024, 2, 29)
    
    # Crear parto en fecha bisiesto
    parto = await Part.create(
        animal=vaca,
        data=fecha_bisiesto,
        genere_fill="F",
        estat_fill="OK",
        numero_part=1
    )
    
    # Verificar fecha correcta
    assert parto.data == fecha_bisiesto
    assert parto.data.day == 29
    assert parto.data.month == 2
    assert parto.data.year == 2024
    
    # Verificar formato de fecha
    assert parto.data.strftime("%d/%m/%Y") == "29/02/2024"