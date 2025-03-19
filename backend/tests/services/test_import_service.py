import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from app.services.import_service import get_or_create_animal, add_parto, import_animal_with_partos
from app.models.animal import Animal
from app.models.animal import Part
from datetime import date

@pytest.mark.asyncio
async def test_get_or_create_animal_existing_by_num_serie():
    """Test para obtener un animal existente por número de serie"""
    with patch('app.services.import_service.Animal.filter') as mock_filter:
        # Configurar mock para simular que existe un animal con ese num_serie
        mock_filter_result = MagicMock()
        mock_animal = AsyncMock()
        mock_filter_result.first = AsyncMock(return_value=mock_animal)
        mock_filter.return_value = mock_filter_result
        
        # Datos para buscar
        data = {
            "num_serie": "123456",
            "nom": "New Name",
            "genere": "F"
        }
        
        # Ejecutar función
        result = await get_or_create_animal(data)
        
        # Verificar que se encontró y actualizó el animal
        assert result == mock_animal
        assert mock_animal.nom == "New Name"
        mock_animal.save.assert_called_once()


@pytest.mark.asyncio
async def test_get_or_create_animal_existing_by_nom():
    """Test para obtener un animal existente por nombre"""
    # Datos para buscar/crear (sin num_serie para que busque por nombre)
    data = {
        "nom": "Existing Name",
        "genere": "F",
        "explotacio_id": 1
    }
    
    # En este test, verificamos que si encontramos un animal por nombre,
    # no se crea uno nuevo y se actualiza el existente
    with patch('app.services.import_service.Animal.filter') as mock_filter, \
         patch('app.services.import_service.Animal.create') as mock_create:
        
        # Configurar el comportamiento del filter (por nombre)
        filter_result = MagicMock()
        mock_animal = AsyncMock()
        filter_result.first = AsyncMock(return_value=mock_animal)
        mock_filter.return_value = filter_result
        
        # Ejecutar la función
        result = await get_or_create_animal(data)
        
        # Verificaciones
        # 1. Se debe haber llamado a filter una vez (solo por nombre ya que no hay num_serie)
        assert mock_filter.call_count == 1
        mock_filter.assert_called_once_with(nom=data['nom'])
        
        # 2. No se debe haber llamado a create
        mock_create.assert_not_called()
        
        # 3. Se debe haber llamado a save en el animal encontrado
        mock_animal.save.assert_called_once()
        
        # 4. El resultado debe ser el animal encontrado
        assert result == mock_animal


@pytest.mark.asyncio
async def test_get_or_create_animal_new():
    """Test para crear un nuevo animal"""
    with patch('app.services.import_service.Animal.filter') as mock_filter, \
         patch('app.services.import_service.Animal.create') as mock_create:
        # Configurar mocks para simular que no existe el animal
        mock_filter_result = MagicMock()
        mock_filter_result.first = AsyncMock(return_value=None)
        mock_filter.return_value = mock_filter_result
        
        # Configurar mock para crear animal
        mock_animal = AsyncMock()
        mock_create.return_value = mock_animal
        
        # Datos para crear
        data = {
            "nom": "New Animal",
            "genere": "M",
            "explotacio_id": 1
        }
        
        # Ejecutar función
        result = await get_or_create_animal(data)
        
        # Verificar que se creó un nuevo animal
        assert result == mock_animal
        mock_create.assert_called_once_with(**data)


@pytest.mark.asyncio
async def test_add_parto():
    """Test para añadir un parto a un animal"""
    with patch('app.services.import_service.Part.filter') as mock_filter, \
         patch('app.services.import_service.Part.create') as mock_create:
        # Configurar mock para contar partos existentes
        mock_filter_result = MagicMock()
        mock_filter_result.count = AsyncMock(return_value=2)
        mock_filter.return_value = mock_filter_result
        
        # Configurar mock para crear parto
        mock_parto = AsyncMock()
        mock_create.return_value = mock_parto
        
        # Animal y datos del parto
        animal = AsyncMock()
        parto_data = {
            'fecha': '01/01/2023',
            'genere_cria': 'F',
            'estado_cria': 'OK'
        }
        
        # Ejecutar función
        result = await add_parto(animal, parto_data)
        
        # Verificar que se creó el parto correctamente
        assert result == mock_parto
        mock_create.assert_called_once()
        # Verificar que se pasó el animal y número de parto correcto
        call_kwargs = mock_create.call_args.kwargs
        assert call_kwargs['animal'] == animal
        assert call_kwargs['num'] == 3  # Debería ser el siguiente número (2+1)


@pytest.mark.asyncio
async def test_import_animal_with_partos_female_with_parto():
    """Test para importar una hembra con parto"""
    with patch('app.services.import_service.get_or_create_animal', new_callable=AsyncMock) as mock_get_or_create, \
         patch('app.services.import_service.add_parto', new_callable=AsyncMock) as mock_add_parto:
        # Configurar mocks
        mock_animal = AsyncMock()
        mock_get_or_create.return_value = mock_animal
        mock_parto = AsyncMock()
        mock_add_parto.return_value = mock_parto
        
        # Datos para importar
        data = {
            "nom": "Vaca Test",
            "genere": "F",
            "explotacio_id": 1,
            "part": "01/01/2023",
            "genereT": "M",
            "estadoT": "OK"
        }
        
        # Ejecutar función
        result = await import_animal_with_partos(data)
        
        # Verificar que se procesó correctamente
        assert result == mock_animal
        mock_get_or_create.assert_called_once()
        mock_add_parto.assert_called_once_with(mock_animal, {
            'fecha': '01/01/2023',
            'genere_cria': 'M',
            'estado_cria': 'OK'
        })


@pytest.mark.asyncio
async def test_import_animal_with_partos_male_with_parto():
    """Test para verificar que un macho no puede tener partos"""
    # Datos para importar
    data = {
        "nom": "Toro Test",
        "genere": "M",
        "explotacio_id": 1,
        "part": "01/01/2023",
        "genereT": "M",
        "estadoT": "OK"
    }
    
    # Verificar que se lanza una excepción HTTP
    with pytest.raises(HTTPException) as excinfo:
        await import_animal_with_partos(data)
    
    # Verificar el mensaje de error
    assert excinfo.value.status_code == 400
    assert "Los machos no pueden tener partos" in excinfo.value.detail


@pytest.mark.asyncio
async def test_import_animal_with_partos_male_with_alletar():
    """Test para verificar que un macho no puede amamantar"""
    # Datos para importar
    data = {
        "nom": "Toro Test",
        "genere": "M",
        "explotacio_id": 1,
        "alletar": 1
    }
    
    # Verificar que se lanza una excepción HTTP
    with pytest.raises(HTTPException) as excinfo:
        await import_animal_with_partos(data)
    
    # Verificar el mensaje de error
    assert excinfo.value.status_code == 400
    assert "Los machos no pueden tener partos ni amamantar" in excinfo.value.detail


@pytest.mark.asyncio
async def test_import_animal_with_partos_female_no_parto():
    """Test para importar una hembra sin parto"""
    with patch('app.services.import_service.get_or_create_animal', new_callable=AsyncMock) as mock_get_or_create:
        # Configurar mock
        mock_animal = AsyncMock()
        mock_get_or_create.return_value = mock_animal
        
        # Datos para importar
        data = {
            "nom": "Vaca Test",
            "genere": "F",
            "explotacio_id": 1
        }
        
        # Ejecutar función
        result = await import_animal_with_partos(data)
        
        # Verificar que se procesó correctamente
        assert result == mock_animal
        mock_get_or_create.assert_called_once()


@pytest.mark.asyncio
async def test_import_animal_with_partos_error_handling():
    """Test para verificar el manejo de errores generales"""
    with patch('app.services.import_service.get_or_create_animal', new_callable=AsyncMock) as mock_get_or_create:
        # Configurar mock para que lance una excepción
        mock_get_or_create.side_effect = Exception("Error de prueba")
        
        # Datos para importar
        data = {
            "nom": "Animal Test",
            "genere": "F",
            "explotacio_id": 1
        }
        
        # Verificar que se lanza una excepción HTTP
        with pytest.raises(HTTPException) as excinfo:
            await import_animal_with_partos(data)
        
        # Verificar el mensaje de error
        assert excinfo.value.status_code == 400
        assert "Error importando animal" in excinfo.value.detail