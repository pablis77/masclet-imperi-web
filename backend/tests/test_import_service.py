import pytest
from datetime import date
from app.services.import_service import import_animal_with_partos
from app.models.animal import Animal, Genere
from app.models.enums import Estat
from app.models.animal import Part

@pytest.mark.asyncio
async def test_import_toro(test_db):
    """Test importación de un toro"""
    data = {
        "nom": "Toro1",
        "explotacio": "Granja1",
        "genere": "M",
        "num_serie": "TEST001",
        "estado": "activo"
    }
    
    animal = await import_animal_with_partos(data)
    assert animal.nom == "Toro1"
    assert animal.genere == "M"
    assert animal.alletar is False  # Uso de is False en vez de == False
    # Filtramos partos del animal usando el campo 'animal'
    partos = await Part.filter(animal=animal)
    assert len(partos) == 0

@pytest.mark.asyncio
async def test_import_toro_fallecido(test_db):
    """Test importación de un toro fallecido"""
    data = {
        "nom": "Toro2",
        "explotacio": "Granja1",
        "genere": "M",
        "num_serie": "TEST003",
        "estado": "fallecido"
    }
    
    animal = await import_animal_with_partos(data)
    # Se asume que en el modelo el estado se guarda en un campo que se compara con "fallecido"
    assert animal.estado == "fallecido"

@pytest.mark.asyncio
async def test_import_vaca_con_partos(test_db):
    """Test importación de una vaca con un parto"""
    # Primer registro - Vaca sin partos
    data1 = {
        "nom": "Vaca1",
        "explotacio": "Granja1",
        "genere": "F",
        "num_serie": "TEST002",
        "estado": "activo"
    }
    
    vaca = await import_animal_with_partos(data1)
    assert vaca.nom == "Vaca1"
    assert vaca.genere == "F"
    
    # Segundo registro - Primer parto
    data2 = {
        **data1,
        "part": date(2023, 1, 1),
        "genereT": "M",
        "estadoT": "activo"
    }
    
    await import_animal_with_partos(data2)
    
    # Filtramos partos del animal usando el campo 'animal'
    partos = await Part.filter(animal=vaca).order_by("numero_part")
    assert len(partos) == 1
    assert partos[0].numero_part == 1

@pytest.mark.asyncio
async def test_import_vaca_multiple_partos(test_db):
    data1 = {
        "nom": "Vaca2",
        "explotacio": "Granja1",
        "genere": "F",
        "num_serie": "TEST004",
        "estado": "activo",
        "alletar": True
    }
    
    vaca = await import_animal_with_partos(data1)
    
    # Primer parto
    data2 = {
        **data1,
        "part": date(2023, 1, 1),
        "genereT": "M",
        "estadoT": "activo"
    }
    await import_animal_with_partos(data2)
    
    # Segundo parto
    data3 = {
        **data1,
        "part": date(2024, 1, 1),
        "genereT": "F",
        "estadoT": "activo"
    }
    await import_animal_with_partos(data3)
    
    partos = await Part.filter(animal=vaca).order_by("numero_part")
    assert len(partos) == 2
    assert partos[0].numero_part == 1
    assert partos[1].numero_part == 2