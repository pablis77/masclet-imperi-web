"""
Tests para el servicio de backup
"""
import pytest
import os
import json
from unittest.mock import patch, AsyncMock, mock_open, MagicMock, call
from datetime import datetime

from app.services.backup_service import BackupService
from app.models.animal import Animal
from tortoise.exceptions import OperationalError


@pytest.fixture
def mock_animals():
    """Fixture para crear animales mock"""
    animal1 = AsyncMock()
    animal1.to_dict = AsyncMock(return_value={"id": 1, "nom": "Animal 1", "genere": "F"})
    
    animal2 = AsyncMock()
    animal2.to_dict = AsyncMock(return_value={"id": 2, "nom": "Animal 2", "genere": "M"})
    
    return [animal1, animal2]


@pytest.fixture
def mock_datetime():
    """Fixture para mockear datetime"""
    dt = MagicMock()
    dt.now.return_value.strftime.return_value = "20250312_123456"
    return dt


@pytest.mark.asyncio
async def test_create_backup(mock_animals, mock_datetime):
    """Test para crear un backup"""
    with patch('app.services.backup_service.datetime', mock_datetime), \
         patch('app.services.backup_service.open', mock_open()) as mock_file, \
         patch('app.services.backup_service.json.dump') as mock_json_dump, \
         patch.object(Animal, 'all', return_value=AsyncMock()) as mock_all, \
         patch.object(BackupService, 'rotate_backups', new_callable=AsyncMock) as mock_rotate:
        
        # Configurar mocks
        mock_all.return_value.prefetch_related.return_value = mock_animals
        
        # Ejecutar función
        filename = await BackupService.create_backup()
        
        # Verificar resultado
        assert filename == "backup_20250312_123456.json"
        
        # Verificar que se obtuvo la lista de animales
        mock_all.assert_called_once()
        mock_all.return_value.prefetch_related.assert_called_once_with('partos')
        
        # Verificar que se guardó el archivo
        mock_file.assert_called_once_with(os.path.join('backups', 'backup_20250312_123456.json'), 'w')
        
        # Verificar que se escribieron los datos correctos
        expected_data = [
            {"id": 1, "nom": "Animal 1", "genere": "F"},
            {"id": 2, "nom": "Animal 2", "genere": "M"}
        ]
        mock_json_dump.assert_called_once()
        args, _ = mock_json_dump.call_args
        assert args[0] == expected_data
        
        # Verificar que se llamó a rotate_backups
        mock_rotate.assert_called_once()


@pytest.mark.asyncio
async def test_rotate_backups_no_deletion():
    """Test para rotar backups cuando hay menos del máximo"""
    with patch('app.services.backup_service.os.listdir') as mock_listdir, \
         patch('app.services.backup_service.os.remove') as mock_remove:
        
        # Configurar mock para devolver 3 backups (menos que MAX_BACKUPS=4)
        mock_listdir.return_value = [
            'backup_20250310_123456.json',
            'backup_20250311_123456.json',
            'backup_20250312_123456.json'
        ]
        
        # Ejecutar función
        await BackupService.rotate_backups()
        
        # Verificar que no se eliminó ningún backup
        mock_remove.assert_not_called()


@pytest.mark.asyncio
async def test_rotate_backups_with_deletion():
    """Test para rotar backups cuando hay más del máximo"""
    with patch('app.services.backup_service.os.listdir') as mock_listdir, \
         patch('app.services.backup_service.os.remove') as mock_remove:
        
        # Configurar mock para devolver 6 backups (más que MAX_BACKUPS=4)
        mock_listdir.return_value = [
            'backup_20250308_123456.json',  # Este debe eliminarse
            'backup_20250309_123456.json',  # Este debe eliminarse
            'backup_20250310_123456.json',
            'backup_20250311_123456.json',
            'backup_20250312_123456.json',
            'backup_20250313_123456.json'
        ]
        
        # Ejecutar función
        await BackupService.rotate_backups()
        
        # Verificar que se eliminaron los backups más antiguos
        assert mock_remove.call_count == 2
        mock_remove.assert_any_call(os.path.join('backups', 'backup_20250308_123456.json'))
        mock_remove.assert_any_call(os.path.join('backups', 'backup_20250309_123456.json'))


@pytest.mark.asyncio
async def test_rotate_backups_ignores_non_backup_files():
    """Test para verificar que rotate_backups ignora archivos que no son backups"""
    with patch('app.services.backup_service.os.listdir') as mock_listdir, \
         patch('app.services.backup_service.os.remove') as mock_remove:
        
        # Configurar mock para devolver archivos de backup y otros archivos
        mock_listdir.return_value = [
            'backup_20250310_123456.json',
            'backup_20250311_123456.json',
            'backup_20250312_123456.json',
            'other_file.txt',
            'another_file.json'
        ]
        
        # Ejecutar función
        await BackupService.rotate_backups()
        
        # Verificar que no se eliminó ningún backup (solo hay 3 backups, menos que MAX_BACKUPS=4)
        # y que se ignoraron los archivos que no son backups
        mock_remove.assert_not_called()


@pytest.mark.asyncio
async def test_max_backups_constant():
    """Test para verificar que MAX_BACKUPS tiene el valor correcto"""
    assert BackupService.MAX_BACKUPS == 4


@pytest.mark.asyncio
async def test_create_backup_directory_not_exists():
    """Test para verificar que se crea el directorio de backups si no existe"""
    with patch('app.services.backup_service.datetime') as mock_datetime, \
         patch('app.services.backup_service.open', mock_open()) as mock_file, \
         patch('app.services.backup_service.json.dump') as mock_json_dump, \
         patch.object(Animal, 'all', return_value=AsyncMock()) as mock_all, \
         patch.object(BackupService, 'rotate_backups', new_callable=AsyncMock) as mock_rotate, \
         patch('app.services.backup_service.os.path.exists') as mock_exists, \
         patch('app.services.backup_service.os.makedirs') as mock_makedirs:
        
        # Configurar mocks
        mock_datetime.now.return_value.strftime.return_value = "20250312_123456"
        mock_all.return_value.prefetch_related.return_value = []
        mock_exists.return_value = False  # El directorio no existe
        
        # Ejecutar función
        filename = await BackupService.create_backup()
        
        # Verificar que se intentó crear el directorio
        mock_makedirs.assert_called_once_with('backups', exist_ok=True)
        
        # Verificar resultado
        assert filename == "backup_20250312_123456.json"


@pytest.mark.asyncio
async def test_create_backup_file_permission_error():
    """Test para verificar el manejo de errores de permisos al crear el backup"""
    with patch('app.services.backup_service.datetime') as mock_datetime, \
         patch('app.services.backup_service.open') as mock_open_func, \
         patch.object(Animal, 'all', return_value=AsyncMock()) as mock_all, \
         patch('app.services.backup_service.os.path.exists') as mock_exists:
        
        # Configurar mocks
        mock_datetime.now.return_value.strftime.return_value = "20250312_123456"
        mock_all.return_value.prefetch_related.return_value = []
        mock_exists.return_value = True
        mock_open_func.side_effect = PermissionError("Permission denied")
        
        # Ejecutar función y verificar que lanza la excepción correcta
        with pytest.raises(PermissionError, match="Permission denied"):
            await BackupService.create_backup()


@pytest.mark.asyncio
async def test_create_backup_json_error():
    """Test para verificar el manejo de errores al serializar a JSON"""
    with patch('app.services.backup_service.datetime') as mock_datetime, \
         patch('app.services.backup_service.open', mock_open()) as mock_file, \
         patch('app.services.backup_service.json.dump') as mock_json_dump, \
         patch.object(Animal, 'all', return_value=AsyncMock()) as mock_all, \
         patch('app.services.backup_service.os.path.exists') as mock_exists:
        
        # Configurar mocks
        mock_datetime.now.return_value.strftime.return_value = "20250312_123456"
        
        # Crear un objeto que no se puede serializar a JSON
        class UnserializableObject:
            pass
        
        animal_mock = AsyncMock()
        animal_mock.to_dict = AsyncMock(return_value={"id": 1, "data": UnserializableObject()})
        mock_all.return_value.prefetch_related.return_value = [animal_mock]
        mock_exists.return_value = True
        mock_json_dump.side_effect = TypeError("Object of type UnserializableObject is not JSON serializable")
        
        # Ejecutar función y verificar que lanza la excepción correcta
        with pytest.raises(TypeError, match="not JSON serializable"):
            await BackupService.create_backup()


@pytest.mark.asyncio
async def test_rotate_backups_listdir_error():
    """Test para verificar el manejo de errores al listar el directorio de backups"""
    with patch('app.services.backup_service.os.listdir') as mock_listdir:
        
        # Configurar mock para lanzar una excepción
        mock_listdir.side_effect = FileNotFoundError("Directory not found")
        
        # Ejecutar función y verificar que lanza la excepción correcta
        with pytest.raises(FileNotFoundError, match="Directory not found"):
            await BackupService.rotate_backups()


@pytest.mark.asyncio
async def test_rotate_backups_remove_error():
    """Test para verificar el manejo de errores al eliminar backups antiguos"""
    with patch('app.services.backup_service.os.listdir') as mock_listdir, \
         patch('app.services.backup_service.os.remove') as mock_remove:
        
        # Configurar mock para devolver 5 backups (más que MAX_BACKUPS=4)
        mock_listdir.return_value = [
            'backup_20250308_123456.json',  # Este debe eliminarse
            'backup_20250309_123456.json',
            'backup_20250310_123456.json',
            'backup_20250311_123456.json',
            'backup_20250312_123456.json'
        ]
        
        # Configurar mock para lanzar una excepción al eliminar
        mock_remove.side_effect = PermissionError("Permission denied")
        
        # Ejecutar función y verificar que lanza la excepción correcta
        with pytest.raises(PermissionError, match="Permission denied"):
            await BackupService.rotate_backups()


@pytest.mark.asyncio
async def test_rotate_backups_with_unsorted_files():
    """Test para verificar que los backups se ordenan correctamente antes de eliminar"""
    with patch('app.services.backup_service.os.listdir') as mock_listdir, \
         patch('app.services.backup_service.os.remove') as mock_remove:
        
        # Configurar mock para devolver 5 backups en orden aleatorio
        mock_listdir.return_value = [
            'backup_20250311_123456.json',
            'backup_20250308_123456.json',  # Este debe eliminarse
            'backup_20250312_123456.json',
            'backup_20250310_123456.json',
            'backup_20250309_123456.json'
        ]
        
        # Ejecutar función
        await BackupService.rotate_backups()
        
        # Verificar que se eliminó el backup más antiguo
        mock_remove.assert_called_once_with(os.path.join('backups', 'backup_20250308_123456.json'))
