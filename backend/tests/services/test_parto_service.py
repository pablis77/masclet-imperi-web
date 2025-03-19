"""
Tests para el servicio de partos
"""
import pytest
from datetime import datetime, date, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
from tortoise.exceptions import DoesNotExist

from app.services import parto_service
from app.models.animal import Animal, Part, Genere, Estado, EstadoAlletar
from app.core.date_utils import DateConverter

# Fixtures para los tests
@pytest.fixture
def mock_animal():
    """Fixture para simular un animal hembra"""
    animal = MagicMock()
    animal.id = 1
    animal.genere = Genere.FEMELLA
    animal.estado = Estado.OK
    animal.data_naixement = date(2020, 1, 1)
    animal.alletar = EstadoAlletar.NO_ALLETAR
    animal.update_from_dict = AsyncMock()
    animal.save = AsyncMock()
    return animal

@pytest.fixture
def mock_parto():
    """Fixture para simular un parto"""
    parto = MagicMock()
    parto.id = 1
    parto.animal_id = 1
    parto.data = date(2022, 1, 1)
    parto.genere_fill = Genere.FEMELLA
    parto.estat_fill = Estado.OK
    parto.numero_part = 1
    parto.observacions = "Test parto"
    parto.update_from_dict = AsyncMock()
    parto.save = AsyncMock()
    
    async def mock_to_dict():
        return {
            "id": parto.id,
            "animal_id": parto.animal_id,
            "data": "01/01/2022",
            "genere_fill": parto.genere_fill,
            "estat_fill": parto.estat_fill,
            "numero_part": parto.numero_part,
            "observacions": parto.observacions
        }
    parto.to_dict = mock_to_dict
    return parto

# Tests para get_partos
@pytest.mark.asyncio
async def test_get_partos_sin_filtros():
    """Test para obtener partos sin filtros"""
    # Mock para Part.all() y métodos encadenados
    mock_query = MagicMock()
    mock_query.count = AsyncMock(return_value=1)
    mock_query.offset = MagicMock(return_value=mock_query)
    mock_query.limit = MagicMock(return_value=mock_query)
    mock_query.order_by = MagicMock(return_value=mock_query)
    mock_query.filter = MagicMock(return_value=mock_query)
    
    # Mock para el resultado de la consulta
    mock_parto = MagicMock()
    async def mock_to_dict():
        return {
            "id": 1,
            "animal_id": 1,
            "data": "01/01/2022",
            "genere_fill": "F",
            "estat_fill": "OK",
            "numero_part": 1,
            "observacions": "Test"
        }
    mock_parto.to_dict = mock_to_dict
    
    # Configurar el método __await__ para que sea awaitable
    async def mock_awaitable():
        return [mock_parto]
    mock_query.__await__ = lambda: mock_awaitable().__await__()
    
    # Patch para Part.all()
    with patch('app.services.parto_service.Part.all', return_value=mock_query):
        result = await parto_service.get_partos()
        
        # Verificar resultado
        assert result["total"] == 1
        assert len(result["items"]) == 1
        assert result["items"][0]["id"] == 1
        assert result["limit"] == 100
        assert result["offset"] == 0

@pytest.mark.asyncio
async def test_get_partos_con_filtros():
    """Test para obtener partos con filtros"""
    # Mock para Part.all() y métodos encadenados
    mock_query = MagicMock()
    mock_query.count = AsyncMock(return_value=1)
    mock_query.offset = MagicMock(return_value=mock_query)
    mock_query.limit = MagicMock(return_value=mock_query)
    mock_query.order_by = MagicMock(return_value=mock_query)
    mock_query.filter = MagicMock(return_value=mock_query)
    
    # Mock para el resultado de la consulta
    mock_parto = MagicMock()
    async def mock_to_dict():
        return {
            "id": 1,
            "animal_id": 2,
            "data": "15/02/2022",
            "genere_fill": "M",
            "estat_fill": "OK",
            "numero_part": 1,
            "observacions": "Test con filtros"
        }
    mock_parto.to_dict = mock_to_dict
    
    # Configurar el método __await__ para que sea awaitable
    async def mock_awaitable():
        return [mock_parto]
    mock_query.__await__ = lambda: mock_awaitable().__await__()
    
    # Patch para Part.all()
    with patch('app.services.parto_service.Part.all', return_value=mock_query):
        result = await parto_service.get_partos(
            animal_id=2,
            desde="01/01/2022",
            hasta="28/02/2022",
            limit=10,
            offset=0
        )
        
        # Verificar resultado
        assert result["total"] == 1
        assert len(result["items"]) == 1
        assert result["items"][0]["animal_id"] == 2
        assert result["limit"] == 10
        assert result["offset"] == 0
        
        # Verificar que se aplicaron los filtros
        mock_query.filter.assert_any_call(animal_id=2)

# Tests para get_parto
@pytest.mark.asyncio
async def test_get_parto_existente(mock_parto):
    """Test para obtener un parto existente"""
    # Patch para Part.get()
    with patch('app.services.parto_service.Part.get', AsyncMock(return_value=mock_parto)):
        result = await parto_service.get_parto(1)
        
        # Verificar resultado
        assert result["id"] == 1
        assert result["animal_id"] == 1
        assert result["data"] == "01/01/2022"

@pytest.mark.asyncio
async def test_get_parto_no_existente():
    """Test para obtener un parto que no existe"""
    # Patch para Part.get() que lanza DoesNotExist
    with patch('app.services.parto_service.Part.get', AsyncMock(side_effect=DoesNotExist(model=Part))):
        with pytest.raises(DoesNotExist):
            await parto_service.get_parto(999)

# Tests para create_parto
@pytest.mark.asyncio
async def test_create_parto_exitoso(mock_animal, mock_parto):
    """Test para crear un parto exitosamente"""
    # Datos para el parto
    parto_data = {
        "data": "01/01/2022",
        "genere_fill": "F",
        "estat_fill": "OK",
        "observacions": "Test parto"
    }
    
    # Patch para Animal.get() y Part.filter().count()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)), \
         patch('app.services.parto_service.Part.filter', MagicMock()) as mock_filter, \
         patch('app.services.parto_service.Part.create', AsyncMock(return_value=mock_parto)):
        
        # Configurar el mock para Part.filter().count()
        mock_count = AsyncMock(return_value=0)
        mock_filter.return_value.count = mock_count
        
        result = await parto_service.create_parto(1, parto_data)
        
        # Verificar resultado
        assert result["id"] == 1
        assert result["animal_id"] == 1
        assert result["data"] == "01/01/2022"
        
        # Verificar que se actualizó el estado de amamantar del animal
        mock_animal.update_from_dict.assert_called_once_with({"alletar": EstadoAlletar.UN_TERNERO})
        mock_animal.save.assert_called_once()

@pytest.mark.asyncio
async def test_create_parto_animal_no_existente():
    """Test para crear un parto con un animal que no existe"""
    # Datos para el parto
    parto_data = {
        "data": "01/01/2022",
        "genere_fill": "F",
        "estat_fill": "OK",
        "observacions": "Test parto"
    }
    
    # Patch para Animal.get() que lanza DoesNotExist
    with patch('app.services.parto_service.Animal.get', AsyncMock(side_effect=DoesNotExist(model=Animal))):
        with pytest.raises(DoesNotExist):
            await parto_service.create_parto(999, parto_data)

@pytest.mark.asyncio
async def test_create_parto_animal_macho():
    """Test para crear un parto con un animal macho (debe fallar)"""
    # Mock para un animal macho
    mock_animal_macho = MagicMock()
    mock_animal_macho.id = 2
    mock_animal_macho.genere = Genere.MASCLE
    mock_animal_macho.estado = Estado.OK
    mock_animal_macho.data_naixement = date(2020, 1, 1)
    
    # Datos para el parto
    parto_data = {
        "data": "01/01/2022",
        "genere_fill": "F",
        "estat_fill": "OK",
        "observacions": "Test parto"
    }
    
    # Patch para Animal.get()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal_macho)):
        with pytest.raises(ValueError, match="Solo las hembras pueden tener partos"):
            await parto_service.create_parto(2, parto_data)

@pytest.mark.asyncio
async def test_create_parto_animal_baja():
    """Test para crear un parto con un animal dado de baja (debe fallar)"""
    # Mock para un animal dado de baja
    mock_animal_baja = MagicMock()
    mock_animal_baja.id = 3
    mock_animal_baja.genere = Genere.FEMELLA
    mock_animal_baja.estado = Estado.DEF
    mock_animal_baja.data_naixement = date(2020, 1, 1)
    
    # Datos para el parto
    parto_data = {
        "data": "01/01/2022",
        "genere_fill": "F",
        "estat_fill": "OK",
        "observacions": "Test parto"
    }
    
    # Patch para Animal.get()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal_baja)):
        with pytest.raises(ValueError, match="No se pueden registrar partos de un animal dado de baja"):
            await parto_service.create_parto(3, parto_data)

@pytest.mark.asyncio
async def test_create_parto_fecha_futura(mock_animal):
    """Test para crear un parto con fecha futura (debe fallar)"""
    # Fecha futura
    fecha_futura = (datetime.now() + timedelta(days=10)).strftime("%d/%m/%Y")
    
    # Datos para el parto
    parto_data = {
        "data": fecha_futura,
        "genere_fill": "F",
        "estat_fill": "OK",
        "observacions": "Test parto"
    }
    
    # Patch para Animal.get()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)):
        with pytest.raises(ValueError, match="La fecha del parto no puede ser futura"):
            await parto_service.create_parto(1, parto_data)

@pytest.mark.asyncio
async def test_create_parto_fecha_anterior_nacimiento(mock_animal):
    """Test para crear un parto con fecha anterior al nacimiento (debe fallar)"""
    # Fecha anterior al nacimiento
    fecha_anterior = (mock_animal.data_naixement - timedelta(days=10)).strftime("%d/%m/%Y")
    
    # Datos para el parto
    parto_data = {
        "data": fecha_anterior,
        "genere_fill": "F",
        "estat_fill": "OK",
        "observacions": "Test parto"
    }
    
    # Patch para Animal.get()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)):
        with pytest.raises(ValueError, match="La fecha del parto no puede ser anterior a la fecha de nacimiento del animal"):
            await parto_service.create_parto(1, parto_data)

# Tests para update_parto
@pytest.mark.asyncio
async def test_update_parto_exitoso(mock_animal, mock_parto):
    """Test para actualizar un parto exitosamente"""
    # Datos para actualizar el parto
    parto_data = {
        "data": "02/02/2022",
        "genere_fill": "M",
        "estat_fill": "DEF",
        "observacions": "Test parto actualizado"
    }
    
    # Patch para Part.get() y Animal.get()
    with patch('app.services.parto_service.Part.get', AsyncMock(return_value=mock_parto)), \
         patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)):
        
        result = await parto_service.update_parto(1, parto_data)
        
        # Verificar resultado
        mock_parto.update_from_dict.assert_called_once()
        mock_parto.save.assert_called_once()
        
        # El resultado debe ser el parto actualizado
        assert result["id"] == 1
        assert result["animal_id"] == 1

@pytest.mark.asyncio
async def test_update_parto_no_existente():
    """Test para actualizar un parto que no existe"""
    # Datos para actualizar el parto
    parto_data = {
        "data": "02/02/2022",
        "genere_fill": "M",
        "estat_fill": "DEF",
        "observacions": "Test parto actualizado"
    }
    
    # Patch para Part.get() que lanza DoesNotExist
    with patch('app.services.parto_service.Part.get', AsyncMock(side_effect=DoesNotExist(model=Part))):
        with pytest.raises(DoesNotExist):
            await parto_service.update_parto(999, parto_data)

@pytest.mark.asyncio
async def test_update_parto_fecha_futura(mock_animal, mock_parto):
    """Test para actualizar un parto con fecha futura (debe fallar)"""
    # Fecha futura
    fecha_futura = (datetime.now() + timedelta(days=10)).strftime("%d/%m/%Y")
    
    # Datos para actualizar el parto
    parto_data = {
        "data": fecha_futura,
        "genere_fill": "M",
        "estat_fill": "DEF",
        "observacions": "Test parto actualizado"
    }
    
    # Patch para Part.get() y Animal.get()
    with patch('app.services.parto_service.Part.get', AsyncMock(return_value=mock_parto)), \
         patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)):
        
        with pytest.raises(ValueError, match="La fecha del parto no puede ser futura"):
            await parto_service.update_parto(1, parto_data)

@pytest.mark.asyncio
async def test_update_parto_fecha_anterior_nacimiento(mock_animal, mock_parto):
    """Test para actualizar un parto con fecha anterior al nacimiento (debe fallar)"""
    # Fecha anterior al nacimiento
    fecha_anterior = (mock_animal.data_naixement - timedelta(days=10)).strftime("%d/%m/%Y")
    
    # Datos para actualizar el parto
    parto_data = {
        "data": fecha_anterior,
        "genere_fill": "M",
        "estat_fill": "DEF",
        "observacions": "Test parto actualizado"
    }
    
    # Patch para Part.get() y Animal.get()
    with patch('app.services.parto_service.Part.get', AsyncMock(return_value=mock_parto)), \
         patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)):
        
        with pytest.raises(ValueError, match="La fecha del parto no puede ser anterior a la fecha de nacimiento del animal"):
            await parto_service.update_parto(1, parto_data)

# Tests para get_animal_partos_history
@pytest.mark.asyncio
async def test_get_animal_partos_history_exitoso(mock_animal, mock_parto):
    """Test para obtener el historial de partos de un animal"""
    # Patch para Animal.get() y Part.filter()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)) as mock_get_animal, \
         patch('app.services.parto_service.Part.filter', MagicMock()) as mock_filter:
        
        # Configurar el mock para Part.filter()
        mock_query = MagicMock()
        mock_filter.return_value = mock_query
        mock_query.order_by = MagicMock(return_value=mock_query)
        
        # Configurar el método __await__ para que sea awaitable
        async def mock_awaitable():
            return [mock_parto]
        mock_query.__await__ = lambda: mock_awaitable().__await__()
        
        result = await parto_service.get_animal_partos_history(1)
        
        # Verificar resultado
        mock_get_animal.assert_called_once_with(id=1)
        mock_filter.assert_called_once_with(animal_id=1)
        mock_query.order_by.assert_called_once_with('-data')
        
        assert len(result) == 1
        assert result[0]["id"] == 1
        assert result[0]["animal_id"] == 1

@pytest.mark.asyncio
async def test_get_animal_partos_history_animal_no_existente():
    """Test para obtener el historial de partos de un animal que no existe"""
    # Patch para Animal.get() que lanza DoesNotExist
    with patch('app.services.parto_service.Animal.get', AsyncMock(side_effect=DoesNotExist(model=Animal))):
        with pytest.raises(DoesNotExist):
            await parto_service.get_animal_partos_history(999)

@pytest.mark.asyncio
async def test_get_animal_partos_history_sin_partos(mock_animal):
    """Test para obtener el historial de partos de un animal sin partos"""
    # Patch para Animal.get() y Part.filter()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)), \
         patch('app.services.parto_service.Part.filter', MagicMock()) as mock_filter:
        
        # Configurar el mock para Part.filter()
        mock_query = MagicMock()
        mock_filter.return_value = mock_query
        mock_query.order_by = MagicMock(return_value=mock_query)
        
        # Configurar el método __await__ para que sea awaitable
        async def mock_awaitable():
            return []
        mock_query.__await__ = lambda: mock_awaitable().__await__()
        
        result = await parto_service.get_animal_partos_history(1)
        
        # Verificar resultado
        assert len(result) == 0

@pytest.mark.asyncio
async def test_get_animal_partos_history_manejo_typeerror(mock_animal):
    """Test para verificar el manejo de TypeError en get_animal_partos_history"""
    # Patch para Animal.get() y Part.filter()
    with patch('app.services.parto_service.Animal.get', AsyncMock(return_value=mock_animal)), \
         patch('app.services.parto_service.Part.filter', MagicMock()) as mock_filter:
        
        # Configurar el mock para Part.filter()
        mock_query = MagicMock()
        mock_filter.return_value = mock_query
        mock_query.order_by = MagicMock(return_value=mock_query)
        
        # Configurar el mock para que lance TypeError al hacer await
        mock_query.__await__ = MagicMock(side_effect=TypeError("Cannot await MagicMock"))
        
        result = await parto_service.get_animal_partos_history(1)
        
        # Verificar resultado (debe manejar el TypeError y devolver una lista vacía)
        assert len(result) == 0
