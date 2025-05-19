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
    
    # Caso inválido: formato de fecha completamente incorrecto
    with pytest.raises(ValidationError):
        PartoBase(data="fecha-invalida", genere_fill="M")  # Texto que no es una fecha


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
    data_vacio = {}
    schema_vacio = PartoUpdate(**data_vacio)
    assert schema_vacio.data is None
    assert schema_vacio.genere_fill is None
    assert schema_vacio.estat_fill is None
    
    # Actualización con todos los campos
    data_completo = {
        "data": "15/03/2022",
        "genere_fill": "F",
        "estat_fill": "DEF"
    }
    schema_completo = PartoUpdate(**data_completo)
    assert schema_completo.data == "2022-03-15"
    assert schema_completo.genere_fill == Genere.FEMELLA
    assert schema_completo.estat_fill == Estado.DEF


def test_parto_data_schema():
    """Test de schema PartoData."""
    # Creamos un objeto Part para simular la respuesta de la BD
    part = Part(
        id=1,
        animal_id=2,
        data=date(2022, 1, 1),
        genere_fill=Genere.MASCLE,
        estat_fill=Estado.OK
    )
    
    # Convertimos a dict para simular lo que haría Tortoise
    part_dict = {
        "id": 1,
        "animal_id": 2,
        "data": date(2022, 1, 1),
        "genere_fill": Genere.MASCLE,
        "estat_fill": Estado.OK,
        "numero_part": 1,  # Campo requerido
        "created_at": datetime(2022, 1, 1, 12, 0, 0)  # Campo requerido
    }
    
    # Validamos el schema
    schema = PartoData(**part_dict)
    assert schema.id == 1
    assert schema.animal_id == 2
    assert schema.data == "01/01/2022"  # Convertido al formato de visualización
    assert schema.genere_fill == Genere.MASCLE
    assert schema.estat_fill == Estado.OK
    assert schema.numero_part == 1
    assert schema.created_at == "01/01/2022"  # También convertido al formato de visualización


def test_partos_list_data_schema():
    """Test de schema PartosListData."""
    # Creamos una lista de partos para simular la respuesta de la BD
    partos_dict = [
        {
            "id": 1,
            "animal_id": 2,
            "data": date(2022, 1, 1),
            "genere_fill": Genere.MASCLE,
            "estat_fill": Estado.OK,
            "numero_part": 1,
            "created_at": datetime(2022, 1, 1, 12, 0, 0)
        },
        {
            "id": 2,
            "animal_id": 3,
            "data": date(2022, 3, 15),
            "genere_fill": Genere.FEMELLA,
            "estat_fill": Estado.DEF,
            "numero_part": 2,
            "created_at": datetime(2022, 3, 15, 12, 0, 0)
        }
    ]
    
    # Validamos el schema con los campos requeridos para paginación
    schema = PartosListData(
        total=2,       # Total de registros
        offset=0,      # Desplazamiento desde el inicio
        limit=10,      # Límite de registros por página
        items=partos_dict  # Lista de partos (nombre correcto: items, no partos)
    )
    
    assert schema.total == 2
    assert schema.offset == 0
    assert schema.limit == 10
    assert len(schema.items) == 2
    assert schema.items[0].id == 1
    assert schema.items[0].data == "01/01/2022"
    assert schema.items[1].id == 2
    assert schema.items[1].data == "15/03/2022"
    assert schema.items[1].estat_fill == Estado.DEF


def test_parto_response_schema():
    """Test de schema PartoResponse."""
    # Creamos un objeto Part para simular la respuesta de la BD
    part_dict = {
        "id": 1,
        "animal_id": 2,
        "data": date(2022, 1, 1),
        "genere_fill": Genere.MASCLE,
        "estat_fill": Estado.OK,
        "numero_part": 1,
        "created_at": datetime(2022, 1, 1, 12, 0, 0)
    }
    
    # Validamos el schema
    schema = PartoResponse(
        status="success",
        data=part_dict
    )
    assert schema.status == "success"
    assert schema.data.id == 1
    assert schema.data.data == "01/01/2022"


def test_partos_list_response_schema():
    """Test de schema PartosListResponse."""
    # Creamos una lista de partos para simular la respuesta de la BD
    partos_dict = [
        {
            "id": 1,
            "animal_id": 2,
            "data": date(2022, 1, 1),
            "genere_fill": Genere.MASCLE,
            "estat_fill": Estado.OK,
            "numero_part": 1,
            "created_at": datetime(2022, 1, 1, 12, 0, 0)
        },
        {
            "id": 2,
            "animal_id": 3,
            "data": date(2022, 3, 15),
            "genere_fill": Genere.FEMELLA,
            "estat_fill": Estado.DEF,
            "numero_part": 2,
            "created_at": datetime(2022, 3, 15, 12, 0, 0)
        }
    ]
    
    # Validamos el schema con la estructura correcta para PartosListData
    schema = PartosListResponse(
        status="success",
        data={
            "total": 2,
            "offset": 0,
            "limit": 10,
            "items": partos_dict
        }
    )
    assert schema.status == "success"
    assert schema.data.total == 2
    assert len(schema.data.items) == 2
    assert schema.data.items[0].id == 1
    assert schema.data.items[1].genere_fill == Genere.FEMELLA