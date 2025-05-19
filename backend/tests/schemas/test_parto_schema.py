"""
Tests para schemas de Parto
"""
import pytest
from pydantic import ValidationError
from datetime import datetime, date

from app.schemas.parto import (
    PartoBase, PartoCreate, PartoUpdate, PartoData,
    PartosListData, PartoResponse, PartosListResponse
)
from app.models.animal import Animal, Genere, Estado
from app.models.animal import Part
from app.models.explotacio import Explotacio
from app.core.date_utils import DateConverter


def test_parto_base_schema():
    """Test de validación de PartoBase schema."""
    # Caso válido con campos mínimos
    data = {
        "data": "01/01/2022",
        "genere_fill": "M"
    }
    schema = PartoBase(**data)
    assert schema.data == "2022-01-01"  # Convertido por el validador
    assert schema.genere_fill == Genere.MASCLE
    assert schema.estat_fill == Estado.OK  # Valor por defecto
    
    # Caso válido con todos los campos
    data_completo = {
        "data": "15/03/2022",
        "genere_fill": "F",
        "estat_fill": "DEF"
    }
    schema_completo = PartoBase(**data_completo)
    assert schema_completo.data == "2022-03-15"  # Convertido por el validador
    assert schema_completo.genere_fill == Genere.FEMELLA
    assert schema_completo.estat_fill == Estado.DEF
    
    # Caso inválido: data requerida
    with pytest.raises(ValidationError):
        PartoBase(genere_fill="M")
    
    # Caso inválido: genere_fill requerido
    with pytest.raises(ValidationError):
        PartoBase(data="01/01/2022")
    
    # Caso inválido: formato de fecha incorrecto (mes 13 no existe)
    with pytest.raises(ValidationError):
        PartoBase(data="13/01/2022", genere_fill="M")  

def test_parto_create_schema():
    """Test de schema PartoCreate."""
    # PartoCreate hereda de PartoBase, probamos que funciona igual
    data = {
        "data": "01/01/2022",
        "genere_fill": "M"
    }
    schema = PartoCreate(**data)
    assert schema.data == "2022-01-01"
    assert schema.genere_fill == Genere.MASCLE
    assert schema.estat_fill == Estado.OK


def test_parto_update_schema():
    """Test de schema PartoUpdate."""
    # Todos los campos son opcionales
    update = PartoUpdate()
    assert update.dict(exclude_unset=True) == {}
    
    # Actualización parcial
    update_parcial = PartoUpdate(data="01/01/2022")
    data = update_parcial.dict(exclude_unset=True)
    assert data["data"] == "2022-01-01"
    assert "genere_fill" not in data
    
    # Actualización con todos los campos
    update_completo = PartoUpdate(
        data="15/03/2022",
        genere_fill="F",
        estat_fill="DEF"
    )
    data_completo = update_completo.dict(exclude_unset=True)
    assert data_completo["data"] == "2022-03-15"
    assert data_completo["genere_fill"] == Genere.FEMELLA
    assert data_completo["estat_fill"] == Estado.DEF
    
    # Caso inválido: formato de fecha incorrecto
    with pytest.raises(ValidationError):
        PartoUpdate(data="2022/01/01")


def test_parto_data_schema():
    """Test de schema PartoData."""
    # Datos mínimos requeridos
    data = {
        "id": 1,
        "animal_id": 2,
        "data": "2022-01-01",  # Formato DB
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1,
        "created_at": "2022-01-02T10:00:00"
    }
    schema = PartoData(**data)
    assert schema.id == 1
    assert schema.animal_id == 2
    assert schema.data == "01/01/2022"  # Convertido por el validador
    assert schema.genere_fill == Genere.MASCLE
    assert schema.estat_fill == Estado.OK
    assert schema.numero_part == 1
    assert schema.created_at == "02/01/2022"  # Convertido por el validador
    assert schema.observacions is None  # Campo opcional
    
    # Con observaciones
    data_con_obs = data.copy()
    data_con_obs["observacions"] = "Observación de prueba"
    schema_con_obs = PartoData(**data_con_obs)
    assert schema_con_obs.observacions == "Observación de prueba"
    
    # Test de formato de fechas
    # Caso 1: created_at como string ISO
    data_iso = data.copy()
    data_iso["created_at"] = "2022-01-02T10:00:00Z"
    schema_iso = PartoData(**data_iso)
    assert schema_iso.created_at == "02/01/2022"
    
    # Caso 2: created_at como objeto datetime
    data_dt = data.copy()
    data_dt["created_at"] = datetime(2022, 1, 2, 10, 0, 0)
    schema_dt = PartoData(**data_dt)
    assert schema_dt.created_at == "02/01/2022"


def test_partos_list_data_schema():
    """Test de schema PartosListData."""
    # Lista vacía
    list_empty = PartosListData(total=0, offset=0, limit=10, items=[])
    assert list_empty.total == 0
    assert list_empty.offset == 0
    assert list_empty.limit == 10
    assert list_empty.items == []
    
    # Lista con items
    parto_item = {
        "id": 1,
        "animal_id": 2,
        "data": "2022-01-01",
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1,
        "created_at": "2022-01-02T10:00:00"
    }
    
    list_data = PartosListData(
        total=1,
        offset=0,
        limit=10,
        items=[parto_item]
    )
    
    assert list_data.total == 1
    assert len(list_data.items) == 1
    assert list_data.items[0].id == 1
    assert list_data.items[0].data == "01/01/2022"  # Convertido


def test_response_schemas():
    """Test de schemas de respuesta."""
    # Datos para un parto
    parto_data = {
        "id": 1,
        "animal_id": 2,
        "data": "2022-01-01",
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1,
        "created_at": "2022-01-02T10:00:00"
    }
    
    # PartoResponse (respuesta individual)
    parto_response = PartoResponse(data=PartoData(**parto_data))
    assert parto_response.status == "success"
    assert parto_response.data.id == 1
    assert parto_response.data.data == "01/01/2022"
    
    # PartosListResponse (respuesta de lista)
    list_data = PartosListData(
        total=1,
        offset=0,
        limit=10,
        items=[parto_data]
    )
    
    list_response = PartosListResponse(data=list_data)
    assert list_response.status == "success"
    assert list_response.data.total == 1
    assert len(list_response.data.items) == 1
    assert list_response.data.items[0].id == 1


@pytest.mark.asyncio
async def test_parto_model_to_schema_conversion():
    """Test de conversión de modelo a schema."""
    # Crear un animal y un parto en la base de datos
    explotacio = await Explotacio.create(nom="Test Explotacio")
    
    animal = await Animal.create(
        explotacio=explotacio,
        nom="Mare Test",
        genere=Genere.FEMELLA,
        estado=Estado.OK
    )
    
    parto = await Part.create(
        animal=animal,
        data=date(2022, 1, 1),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.OK,
        numero_part=1
    )
    
    # Convertir a diccionario para el schema
    parto_dict = await parto.to_dict()
    
    # Crear response data
    response_data = PartoData(**parto_dict)
    assert response_data.id == parto.id
    assert response_data.animal_id == animal.id
    assert response_data.data == "01/01/2022"  # Formato para display
    assert response_data.genere_fill == Genere.MASCLE
    
    # Crear response completa
    response = PartoResponse(data=response_data)
    assert response.status == "success"
    assert response.data.id == parto.id
    assert response.data.data == "01/01/2022"
