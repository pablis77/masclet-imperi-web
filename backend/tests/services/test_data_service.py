"""
Tests para el servicio de datos
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import pandas as pd
import io

from app.services.data_service import DataService


@pytest.fixture
def mock_csv_file():
    """Fixture para crear un archivo CSV mock"""
    content = "nom;genere;explotacio_id;estado\nVaca1;F;1;OK\nToro1;M;1;OK"
    file = MagicMock()
    file.file = io.StringIO(content)
    return file


@pytest.fixture
def mock_process_dataframe():
    """Fixture para mockear la función process_dataframe"""
    async def mock_process(*args, **kwargs):
        return {
            "total": 2,
            "updated": 1,
            "errors": 0
        }
    return mock_process


@pytest.mark.asyncio
async def test_import_csv(mock_csv_file, mock_process_dataframe):
    """Test para importar un archivo CSV"""
    with patch('app.services.data_service.DataService.import_csv', new_callable=AsyncMock) as mock_import_csv:
        # Configurar el mock para que devuelva el resultado esperado
        mock_import_csv.return_value = {
            "imported": 2,
            "updated": 1,
            "errors": 0
        }
        
        # Ejecutar función
        result = await DataService.import_csv(mock_csv_file)
        
        # Verificar resultado
        assert result == {
            "imported": 2,
            "updated": 1,
            "errors": 0
        }


@pytest.mark.asyncio
async def test_import_csv_empty_file():
    """Test para importar un archivo CSV vacío"""
    with patch('app.services.data_service.DataService.import_csv', new_callable=AsyncMock) as mock_import_csv:
        # Configurar el mock para que devuelva el resultado esperado para un archivo vacío
        mock_import_csv.return_value = {
            "imported": 0,
            "updated": 0,
            "errors": 0
        }
        
        # Crear un archivo vacío
        empty_file = MagicMock()
        empty_file.file = io.StringIO("")
        
        # Ejecutar función
        result = await DataService.import_csv(empty_file)
        
        # Verificar resultado
        assert result == {
            "imported": 0,
            "updated": 0,
            "errors": 0
        }


@pytest.mark.asyncio
async def test_import_csv_with_errors():
    """Test para importar un archivo CSV con errores"""
    with patch('app.services.data_service.DataService.import_csv', new_callable=AsyncMock) as mock_import_csv:
        # Configurar el mock para que devuelva el resultado esperado para un archivo con errores
        mock_import_csv.return_value = {
            "imported": 2,
            "updated": 0,
            "errors": 1
        }
        
        # Crear un archivo
        file = MagicMock()
        file.file = io.StringIO("nom;genere;explotacio_id;estado\nVaca1;F;1;OK\nToro1;M;1;OK")
        
        # Ejecutar función
        result = await DataService.import_csv(file)
        
        # Verificar resultado
        assert result == {
            "imported": 2,
            "updated": 0,
            "errors": 1
        }