"""
Tests para schemas de Explotacio
"""
import pytest
from pydantic import ValidationError
from datetime import datetime

from app.schemas.explotacio import (
    ExplotacioBase, ExplotacioCreate, ExplotacioUpdate, ExplotacioResponse
)
from app.models.explotacio import Explotacio


def test_explotacio_base_schema():
    """Test de validación de ExplotacioBase schema."""
    # Caso válido con campos mínimos
    data = {
        "nom": "Granja Test"
    }
    schema = ExplotacioBase(**data)
    assert schema.nom == "Granja Test"
    assert schema.ubicacio is None  # Valor por defecto
    assert schema.activa is True  # Valor por defecto
    
    # Caso válido con todos los campos
    data_completo = {
        "nom": "Granja Completa",
        "ubicacio": "Calle Test 123",
        "activa": False
    }
    schema_completo = ExplotacioBase(**data_completo)
    assert schema_completo.nom == "Granja Completa"
    assert schema_completo.ubicacio == "Calle Test 123"
    assert schema_completo.activa is False
    
    # Caso inválido: nom requerido
    with pytest.raises(ValidationError):
        ExplotacioBase()
    
    # Caso inválido: nom debe ser string
    with pytest.raises(ValidationError):
        ExplotacioBase(nom=123)


def test_explotacio_create_schema():
    """Test de schema ExplotacioCreate."""
    # ExplotacioCreate hereda de ExplotacioBase, probamos que funciona igual
    data = {
        "nom": "Granja Create"
    }
    schema = ExplotacioCreate(**data)
    assert schema.nom == "Granja Create"
    assert schema.ubicacio is None
    assert schema.activa is True
    
    # Caso completo
    data_completo = {
        "nom": "Granja Create Completa",
        "ubicacio": "Calle Create 123",
        "activa": False
    }
    schema_completo = ExplotacioCreate(**data_completo)
    assert schema_completo.nom == "Granja Create Completa"
    assert schema_completo.ubicacio == "Calle Create 123"
    assert schema_completo.activa is False


def test_explotacio_update_schema():
    """Test de schema ExplotacioUpdate."""
    # Todos los campos son opcionales
    data_vacio = {}
    schema_vacio = ExplotacioUpdate(**data_vacio)
    assert schema_vacio.nom is None
    assert schema_vacio.ubicacio is None
    assert schema_vacio.activa is None
    
    # Actualización con todos los campos
    data_completo = {
        "nom": "Granja Update",
        "ubicacio": "Calle Update 123",
        "activa": False
    }
    schema_completo = ExplotacioUpdate(**data_completo)
    assert schema_completo.nom == "Granja Update"
    assert schema_completo.ubicacio == "Calle Update 123"
    assert schema_completo.activa is False
    
    # Actualización parcial
    data_parcial = {
        "nom": "Granja Parcial"
    }
    schema_parcial = ExplotacioUpdate(**data_parcial)
    assert schema_parcial.nom == "Granja Parcial"
    assert schema_parcial.ubicacio is None
    assert schema_parcial.activa is None


def test_explotacio_response_schema():
    """Test de schema ExplotacioResponse."""
    # Creamos un objeto Explotacio para simular la respuesta de la BD
    explotacio_dict = {
        "id": 1,
        "nom": "Granja Response",
        "ubicacio": "Calle Response 123",
        "activa": True,
        "created_at": datetime(2022, 1, 1, 12, 0, 0),
        "updated_at": datetime(2022, 1, 2, 12, 0, 0)
    }
    
    # Validamos el schema
    schema = ExplotacioResponse(**explotacio_dict)
    assert schema.id == 1
    assert schema.nom == "Granja Response"
    assert schema.ubicacio == "Calle Response 123"
    assert schema.activa is True
    assert schema.created_at == datetime(2022, 1, 1, 12, 0, 0)
    assert schema.updated_at == datetime(2022, 1, 2, 12, 0, 0)
    
    # Caso con campos mínimos
    explotacio_min_dict = {
        "id": 2,
        "nom": "Granja Mínima",
        "created_at": datetime(2022, 1, 1, 12, 0, 0),
        "updated_at": datetime(2022, 1, 2, 12, 0, 0)
    }
    
    schema_min = ExplotacioResponse(**explotacio_min_dict)
    assert schema_min.id == 2
    assert schema_min.nom == "Granja Mínima"
    assert schema_min.ubicacio is None
    assert schema_min.activa is True
    assert schema_min.created_at == datetime(2022, 1, 1, 12, 0, 0)
    assert schema_min.updated_at == datetime(2022, 1, 2, 12, 0, 0)
