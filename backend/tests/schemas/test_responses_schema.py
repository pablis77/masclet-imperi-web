"""
Tests para schemas de respuestas genéricas
"""
import pytest
from pydantic import ValidationError
from typing import List

from app.schemas.responses import ListResponse, StandardResponse


def test_list_response_schema():
    """Test de validación de ListResponse schema."""
    # Caso válido con lista de strings
    data = {
        "items": ["item1", "item2", "item3"],
        "total": 3,
        "offset": 0,
        "limit": 10
    }
    schema = ListResponse[str](**data)
    assert schema.items == ["item1", "item2", "item3"]
    assert schema.total == 3
    assert schema.offset == 0
    assert schema.limit == 10
    
    # Caso válido con lista de diccionarios
    data_dict = {
        "items": [{"id": 1, "name": "Test1"}, {"id": 2, "name": "Test2"}],
        "total": 2,
        "offset": 0,
        "limit": 10
    }
    schema_dict = ListResponse[dict](**data_dict)
    assert schema_dict.items[0]["id"] == 1
    assert schema_dict.items[1]["name"] == "Test2"
    assert schema_dict.total == 2
    
    # Caso inválido: items requerido
    with pytest.raises(ValidationError):
        ListResponse[str](total=3, offset=0, limit=10)
    
    # Caso inválido: total requerido
    with pytest.raises(ValidationError):
        ListResponse[str](items=["item1"], offset=0, limit=10)
    
    # Caso inválido: offset requerido
    with pytest.raises(ValidationError):
        ListResponse[str](items=["item1"], total=1, limit=10)
    
    # Caso inválido: limit requerido
    with pytest.raises(ValidationError):
        ListResponse[str](items=["item1"], total=1, offset=0)


def test_standard_response_schema():
    """Test de validación de StandardResponse schema."""
    # Caso válido con datos
    data = {
        "success": True,
        "message": "Operación exitosa",
        "data": {"id": 1, "name": "Test"}
    }
    schema = StandardResponse[dict](**data)
    assert schema.success is True
    assert schema.message == "Operación exitosa"
    assert schema.data["id"] == 1
    assert schema.data["name"] == "Test"
    
    # Caso válido sin datos (data es opcional)
    data_no_data = {
        "success": False,
        "message": "Error en la operación"
    }
    schema_no_data = StandardResponse[dict](**data_no_data)
    assert schema_no_data.success is False
    assert schema_no_data.message == "Error en la operación"
    assert schema_no_data.data is None
    
    # Caso inválido: success requerido
    with pytest.raises(ValidationError):
        StandardResponse[dict](message="Test")
    
    # Caso inválido: message requerido
    with pytest.raises(ValidationError):
        StandardResponse[dict](success=True)
    
    # Caso con diferentes tipos de datos
    # String
    data_str = {
        "success": True,
        "message": "Operación exitosa",
        "data": "Test string"
    }
    schema_str = StandardResponse[str](**data_str)
    assert schema_str.data == "Test string"
    
    # Lista
    data_list = {
        "success": True,
        "message": "Operación exitosa",
        "data": [1, 2, 3]
    }
    schema_list = StandardResponse[List[int]](**data_list)
    assert schema_list.data == [1, 2, 3]
    
    # Caso de respuesta de error (success=False)
    error_response = {
        "success": False,
        "message": "No se encontró el recurso solicitado"
    }
    schema_error = StandardResponse[dict](**error_response)
    assert schema_error.success is False
    assert schema_error.message == "No se encontró el recurso solicitado"
    assert schema_error.data is None
