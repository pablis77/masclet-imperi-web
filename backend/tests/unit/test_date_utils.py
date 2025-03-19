"""
Tests unitarios para las utilidades de fechas
"""
import pytest
from datetime import datetime, date
from app.core.date_utils import (
    DateConverter, 
    DateField,
    DATE_FORMAT_ES,
    DATE_FORMAT_DB,
    DATE_FORMAT_ISO,
    DATE_FORMAT_API,
    DATE_FORMAT_ALT1,
    DATE_FORMAT_ALT2
)

@pytest.mark.parametrize("date_str,expected", [
    ("31/12/2023", date(2023, 12, 31)),    # Formato español
    ("2023-12-31", date(2023, 12, 31)),    # Formato ISO
    ("31-12-2023", date(2023, 12, 31)),    # Formato alternativo con guiones
    ("2023/12/31", date(2023, 12, 31)),    # Formato alternativo con barras
    ("", None),                            # Cadena vacía
    (None, None),                          # None
    ("29/02/2024", date(2024, 2, 29)),     # Año bisiesto válido
])
def test_parse_date_valid(date_str, expected):
    """Test parsing de fechas con valores válidos"""
    assert DateConverter.parse_date(date_str) == expected

@pytest.mark.parametrize("date_str", [
    "32/12/2023",    # Día inválido
    "31/13/2023",    # Mes inválido
    "29/02/2023",    # Fecha inválida (no bisiesto)
    "invalid",       # Texto no fecha
    "20-20-2023",    # Formato con valores imposibles
])
def test_parse_date_invalid(date_str):
    """Test parsing de fechas con valores inválidos"""
    with pytest.raises(ValueError):
        DateConverter.parse_date(date_str)

@pytest.mark.parametrize("date_val,expected", [
    ("31/12/2023", "2023-12-31"),    # Formato español a DB
    ("2023-12-31", "2023-12-31"),    # Ya en formato DB
    ("31-12-2023", "2023-12-31"),    # Formato alternativo
    ("2023/12/31", "2023-12-31"),    # Formato alternativo
    (date(2023, 12, 31), "2023-12-31"),  # Objeto date
    (datetime(2023, 12, 31), "2023-12-31"),  # Objeto datetime
    (None, None),                    # None se mantiene None
])
def test_to_db_format(date_val, expected):
    """Test conversión a formato BD"""
    assert DateConverter.to_db_format(date_val) == expected

@pytest.mark.parametrize("date_val,expected", [
    ("31/12/2023", "31/12/2023"),    # Ya en formato español
    ("2023-12-31", "31/12/2023"),    # Formato DB a español
    ("31-12-2023", "31/12/2023"),    # Formato alternativo
    ("2023/12/31", "31/12/2023"),    # Formato alternativo
    (date(2023, 12, 31), "31/12/2023"),  # Objeto date
    (datetime(2023, 12, 31), "31/12/2023"),  # Objeto datetime
    (None, None),                    # None se mantiene None
])
def test_get_display_format(date_val, expected):
    """Test conversión a formato de visualización"""
    assert DateConverter.get_display_format(date_val) == expected

@pytest.mark.parametrize("date_val", [
    123,            # Entero
    True,           # Booleano
    {},             # Diccionario
    [],             # Lista
    object(),       # Objeto genérico
])
def test_format_invalid_types(date_val):
    """Test comportamiento con tipos no soportados"""
    with pytest.raises(ValueError):
        DateConverter.to_db_format(date_val)
    
    with pytest.raises(ValueError):
        DateConverter.get_display_format(date_val)

def test_date_format_constants():
    """Verifica que las constantes de formato sean correctas"""
    assert DATE_FORMAT_ES == "%d/%m/%Y"
    assert DATE_FORMAT_DB == "%Y-%m-%d"
    assert DATE_FORMAT_ISO == "%Y-%m-%d"
    assert DATE_FORMAT_API == DATE_FORMAT_ES
    assert DATE_FORMAT_ALT1 == "%d-%m-%Y"
    assert DATE_FORMAT_ALT2 == "%Y/%m/%d"

    # Verificar que los formatos funcionan correctamente
    test_date = date(2023, 12, 31)
    assert test_date.strftime(DATE_FORMAT_ES) == "31/12/2023"
    assert test_date.strftime(DATE_FORMAT_DB) == "2023-12-31"
    assert test_date.strftime(DATE_FORMAT_ISO) == "2023-12-31"

@pytest.mark.parametrize("value,expected", [
    (None, True),
    (date(2023, 12, 31), True),
    (datetime(2023, 12, 31), True),
    ("31/12/2023", True),         # Formato español
    ("2023-12-31", True),         # Formato ISO
    ("31-12-2023", True),         # Formato alternativo
    ("2023/12/31", True),         # Formato alternativo
    ("", False),                  # Cadena vacía
    ("31-13-2023", False),        # Mes inválido
    (123, False),                 # Entero
    (True, False),                # Booleano
    ({}, False),                  # Diccionario
    ([], False),                  # Lista
])
def test_date_field_validate(value, expected):
    """Test validación de DateField"""
    date_field = DateField()
    assert date_field.validate(value) == expected

@pytest.mark.parametrize("value,expected", [
    (None, None),
    (date(2023, 12, 31), date(2023, 12, 31)),        # Ya es date
    (datetime(2023, 12, 31), date(2023, 12, 31)),    # Datetime a date
    ("31/12/2023", date(2023, 12, 31)),              # Formato español
    ("2023-12-31", date(2023, 12, 31)),              # Formato ISO
    ("31-12-2023", date(2023, 12, 31)),              # Formato alternativo
    ("2023/12/31", date(2023, 12, 31)),              # Formato alternativo
    (123, None),                                      # Tipos no soportados devuelven None
    (True, None),
    ({}, None),
    ([], None),
])
def test_date_field_to_python_value(value, expected):
    """Test conversión a valor Python"""
    date_field = DateField()
    assert date_field.to_python_value(value) == expected

@pytest.mark.parametrize("value,expected", [
    (None, None),
    (date(2023, 12, 31), "2023-12-31"),              # Date a string DB
    (datetime(2023, 12, 31), "2023-12-31"),          # Datetime a string DB
    ("31/12/2023", "2023-12-31"),                    # Formato español a DB
    ("2023-12-31", "2023-12-31"),                    # Formato ISO (ya en formato DB)
    ("31-12-2023", "2023-12-31"),                    # Formato alternativo a DB
    ("2023/12/31", "2023-12-31"),                    # Formato alternativo a DB
])
def test_date_field_to_db_value(value, expected):
    """Test conversión a valor de BD"""
    date_field = DateField()
    assert date_field.to_db_value(value) == expected

def test_date_field_invalid_to_db_value():
    """Test error al convertir tipos inválidos a formato DB"""
    date_field = DateField()
    
    with pytest.raises(ValueError):
        date_field.to_db_value(123)
        
    with pytest.raises(ValueError):
        date_field.to_db_value(True)
        
    with pytest.raises(ValueError):
        date_field.to_db_value({})
        
    with pytest.raises(ValueError):
        date_field.to_db_value([])
