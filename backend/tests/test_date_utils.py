"""
Tests para las utilidades de fechas y el campo DateField
"""
import pytest
from datetime import datetime, date
from app.core.date_utils import (
    DateConverter, 
    DateField,
    DATE_FORMAT_ES,
    DATE_FORMAT_DB,
    DATE_FORMAT_ISO
)

class TestDateConverter:
    """Tests para la clase DateConverter"""

    def test_parse_date_es_format(self):
        """Test parsing de fechas en formato español"""
        assert DateConverter.parse_date("31/12/2023") == date(2023, 12, 31)
        assert DateConverter.parse_date("01/01/2024") == date(2024, 1, 1)

    def test_parse_date_db_format(self):
        """Test parsing de fechas en formato BD"""
        assert DateConverter.parse_date("2023-12-31") == date(2023, 12, 31)
        assert DateConverter.parse_date("2024-01-01") == date(2024, 1, 1)

    def test_parse_date_iso_format(self):
        """Test parsing de fechas en formato ISO"""
        assert DateConverter.parse_date("2023-12-31T00:00:00.000Z") == date(2023, 12, 31)
        assert DateConverter.parse_date("2024-01-01T00:00:00.000Z") == date(2024, 1, 1)

    def test_parse_date_objects(self):
        """Test parsing de objetos datetime y date"""
        dt = datetime(2023, 12, 31)
        assert DateConverter.parse_date(dt) == date(2023, 12, 31)
        
        d = date(2024, 1, 1)
        assert DateConverter.parse_date(d) == d

    def test_parse_date_invalid(self):
        """Test parsing de fechas inválidas"""
        with pytest.raises(ValueError):
            DateConverter.parse_date("32/12/2023")
        with pytest.raises(ValueError):
            DateConverter.parse_date("31/13/2023")
        with pytest.raises(ValueError):
            DateConverter.parse_date("invalid")
        with pytest.raises(ValueError):
            DateConverter.parse_date(123)

    def test_to_db_format(self):
        """Test conversión a formato BD"""
        assert DateConverter.to_db_format("31/12/2023") == "2023-12-31"
        assert DateConverter.to_db_format("2023-12-31") == "2023-12-31"
        assert DateConverter.to_db_format("2023-12-31T00:00:00.000Z") == "2023-12-31"
        assert DateConverter.to_db_format(None) is None

    def test_to_es_format(self):
        """Test conversión a formato español"""
        assert DateConverter.to_es_format("2023-12-31") == "31/12/2023"
        assert DateConverter.to_es_format("31/12/2023") == "31/12/2023"
        assert DateConverter.to_es_format("2023-12-31T00:00:00.000Z") == "31/12/2023"
        assert DateConverter.to_es_format(None) is None

class TestDateField:
    """Tests para el campo DateField personalizado"""

    def test_to_python_valid_dates(self):
        """Test conversión a Python con fechas válidas"""
        field = DateField()
        assert field.to_python_value("31/12/2023") == date(2023, 12, 31)
        assert field.to_python_value("2023-12-31") == date(2023, 12, 31)
        assert field.to_python_value("2023-12-31T00:00:00.000Z") == date(2023, 12, 31)
        assert field.to_python_value(None) is None

    def test_to_python_objects(self):
        """Test conversión de objetos datetime y date"""
        field = DateField()
        dt = datetime(2023, 12, 31)
        assert field.to_python_value(dt) == date(2023, 12, 31)
        
        d = date(2024, 1, 1)
        assert field.to_python_value(d) == d

    def test_to_python_invalid(self):
        """Test conversión con valores inválidos"""
        field = DateField()
        with pytest.raises(ValueError):
            field.to_python_value("32/12/2023")
        with pytest.raises(ValueError):
            field.to_python_value("invalid")
        with pytest.raises(ValueError):
            field.to_python_value(123)

    def test_to_db_value(self):
        """Test serialización para BD"""
        field = DateField()
        assert field.to_db_value("31/12/2023", None) == "2023-12-31"
        assert field.to_db_value(datetime(2023, 12, 31), None) == "2023-12-31"
        assert field.to_db_value(date(2023, 12, 31), None) == "2023-12-31"
        assert field.to_db_value(None, None) is None

    def test_edge_cases(self):
        """Test casos límite"""
        field = DateField()
        
        # Años bisiestos
        assert field.to_db_value("29/02/2024", None) == "2024-02-29"
        with pytest.raises(ValueError):
            field.to_db_value("29/02/2023", None)
        
        # Fechas límite del mes
        assert field.to_db_value("31/01/2024", None) == "2024-01-31"
        with pytest.raises(ValueError):
            field.to_db_value("31/04/2024", None)

    def test_format_constants(self):
        """Test que los formatos de fecha son correctos"""
        assert DATE_FORMAT_ES == "%d/%m/%Y"
        assert DATE_FORMAT_DB == "%Y-%m-%d"
        assert DATE_FORMAT_ISO == "%Y-%m-%dT%H:%M:%S.%fZ"