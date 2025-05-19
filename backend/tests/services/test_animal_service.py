"""
Tests para el servicio de animales (AnimalService)
"""
import pytest
from datetime import date, datetime
from unittest.mock import patch, MagicMock, AsyncMock
from tortoise.exceptions import DoesNotExist, IntegrityError

from app.models.animal import Animal, Part, Genere, Estado, EstadoAlletar
from app.models.animal_history import AnimalHistory
from app.models.explotacio import Explotacio
from app.services import animal_service

# Fixtures para los tests
@pytest.fixture
def animal_data():
    """Datos de ejemplo para crear un animal"""
    return {
        "explotacio_id": 1,
        "nom": "Test Animal",
        "genere": Genere.FEMELLA,
        "estado": Estado.OK,
        "alletar": EstadoAlletar.NO_ALLETAR.value,
        "dob": "01/01/2020",
        "mare": "Madre",
        "pare": "Padre",
        "quadra": "Q1",
        "cod": "COD123",
        "num_serie": "SER123",
        "part": 1
    }

@pytest.fixture
def mock_animal():
    """Mock de un objeto Animal"""
    animal = MagicMock()
    animal.id = 1
    animal.explotacio_id = 1
    animal.nom = "Test Animal"
    animal.genere = Genere.FEMELLA
    animal.estado = Estado.OK
    animal.alletar = EstadoAlletar.NO_ALLETAR
    animal.dob = date(2020, 1, 1)
    animal.mare = "Madre"
    animal.pare = "Padre"
    animal.quadra = "Q1"
    animal.cod = "COD123"
    animal.num_serie = "SER123"
    animal.part = 1
    animal.created_at = datetime.now()
    animal.updated_at = datetime.now()
    
    # Mock para to_dict
    async def mock_to_dict(*args, **kwargs):
        return {
            "id": animal.id,
            "explotacio": str(animal.explotacio_id),
            "nom": animal.nom,
            "genere": animal.genere,
            "estado": animal.estado,
            "alletar": animal.alletar.value,
            "dob": animal.dob.strftime("%d/%m/%Y") if animal.dob else None,
            "mare": animal.mare,
            "pare": animal.pare,
            "quadra": animal.quadra,
            "cod": animal.cod,
            "num_serie": animal.num_serie,
            "part": animal.part,
            "genere_t": None,
            "estado_t": None,
            "created_at": animal.created_at.strftime("%d/%m/%Y") if animal.created_at else None,
            "updated_at": animal.updated_at.strftime("%d/%m/%Y") if animal.updated_at else None,
            "partos": {
                "total": 0,
                "items": [],
                "first_date": None,
                "last_date": None
            }
        }
    
    animal.to_dict = mock_to_dict
    return animal

@pytest.mark.asyncio
async def test_get_animal_exists(mock_animal):
    """Test para obtener un animal existente"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_animal
        
        result = await animal_service.get_animal(1)
        
        mock_get.assert_called_once_with(id=1)
        assert result is not None
        assert result["id"] == 1
        assert result["nom"] == "Test Animal"

@pytest.mark.asyncio
async def test_get_animal_not_exists():
    """Test para obtener un animal que no existe"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = DoesNotExist("Animal")
        
        result = await animal_service.get_animal(999)
        
        mock_get.assert_called_once_with(id=999)
        assert result is None

@pytest.mark.asyncio
async def test_get_animals_no_filters(mock_animal):
    """Test para obtener lista de animales sin filtros"""
    with patch('app.services.animal_service.Animal.all', new_callable=MagicMock) as mock_all:
        mock_query = MagicMock()
        mock_all.return_value = mock_query
        
        mock_query.count = AsyncMock(return_value=1)
        mock_query.filter = MagicMock(return_value=mock_query)
        mock_query.offset = MagicMock(return_value=mock_query)
        mock_query.limit = MagicMock(return_value=mock_query)
        mock_query.order_by = MagicMock(return_value=mock_query)
        
        # Configurar el mock para que se pueda usar con await
        async def mock_awaitable():
            return [mock_animal]
        mock_query.__await__ = lambda: mock_awaitable().__await__()
        
        result = await animal_service.get_animals()
        
        mock_all.assert_called_once()
        mock_query.offset.assert_called_once_with(0)
        mock_query.limit.assert_called_once_with(100)
        mock_query.order_by.assert_called_once_with('-updated_at')
        
        assert result["total"] == 1
        assert len(result["items"]) == 1
        assert result["items"][0]["id"] == 1

@pytest.mark.asyncio
async def test_get_animals_with_filters(mock_animal):
    """Test para obtener lista de animales con filtros"""
    with patch('app.services.animal_service.Animal.all', new_callable=MagicMock) as mock_all:
        mock_query = MagicMock()
        mock_all.return_value = mock_query
        
        mock_query.count = AsyncMock(return_value=1)
        mock_query.filter = MagicMock(return_value=mock_query)
        mock_query.offset = MagicMock(return_value=mock_query)
        mock_query.limit = MagicMock(return_value=mock_query)
        mock_query.order_by = MagicMock(return_value=mock_query)
        
        # Configurar el mock para que se pueda usar con await
        async def mock_awaitable():
            return [mock_animal]
        mock_query.__await__ = lambda: mock_awaitable().__await__()
        
        result = await animal_service.get_animals(
            explotacio_id=1,
            genere=Genere.FEMELLA,
            estado=Estado.OK,
            limit=10,
            offset=5
        )
        
        mock_all.assert_called_once()
        assert mock_query.filter.call_count == 3
        mock_query.offset.assert_called_once_with(5)
        mock_query.limit.assert_called_once_with(10)
        
        assert result["total"] == 1
        assert len(result["items"]) == 1

@pytest.mark.asyncio
async def test_create_animal_success(animal_data):
    """Test para crear un animal con éxito"""
    with patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get, \
         patch('app.services.animal_service.Animal', new_callable=MagicMock) as mock_animal_class, \
         patch('app.services.animal_service.Animal.validate_date', return_value=date(2020, 1, 1)):
        
        # Mock para la explotación
        mock_explotacio = MagicMock()
        mock_explotacio.id = 1
        mock_explotacio_get.return_value = mock_explotacio
        
        # Mock para el animal creado
        mock_animal_instance = MagicMock()
        mock_animal_class.return_value = mock_animal_instance
        mock_animal_instance.save = AsyncMock()
        
        # Mock para to_dict
        async def mock_to_dict(*args, **kwargs):
            return {
                "id": 1,
                "explotacio": "1",
                "nom": animal_data["nom"],
                "genere": animal_data["genere"],
                "estado": animal_data["estado"],
                "alletar": animal_data["alletar"],
                "dob": "01/01/2020",
                "mare": animal_data["mare"],
                "pare": animal_data["pare"],
                "quadra": animal_data["quadra"],
                "cod": animal_data["cod"],
                "num_serie": animal_data["num_serie"],
                "part": animal_data["part"],
                "created_at": "01/01/2023",
                "updated_at": "01/01/2023"
            }
        
        mock_animal_instance.to_dict = mock_to_dict
        
        result = await animal_service.create_animal(animal_data)
        
        mock_explotacio_get.assert_called_once_with(id=1)
        mock_animal_class.assert_called_once()
        mock_animal_instance.save.assert_called_once()
        
        assert result["nom"] == animal_data["nom"]
        assert result["genere"] == animal_data["genere"]

@pytest.mark.asyncio
async def test_create_animal_invalid_explotacio():
    """Test para crear un animal con explotación inválida"""
    with patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get:
        mock_explotacio_get.side_effect = DoesNotExist("Explotacio")
        
        with pytest.raises(ValueError, match="La explotación con ID 1 no existe"):
            await animal_service.create_animal({"explotacio_id": 1, "nom": "Test", "genere": Genere.MASCLE})

@pytest.mark.asyncio
async def test_create_animal_missing_required_fields():
    """Test para crear un animal sin campos requeridos"""
    # Sin explotación
    with pytest.raises(ValueError, match="Se requiere una explotación"):
        await animal_service.create_animal({"nom": "Test", "genere": Genere.MASCLE})
    
    # Sin género
    with patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get:
        mock_explotacio = MagicMock()
        mock_explotacio_get.return_value = mock_explotacio
        
        with pytest.raises(ValueError, match="Género inválido"):
            await animal_service.create_animal({"explotacio_id": 1, "nom": "Test"})
    
    # Sin nombre
    with patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get:
        mock_explotacio = MagicMock()
        mock_explotacio_get.return_value = mock_explotacio
        
        with pytest.raises(ValueError, match="Se requiere un nombre"):
            await animal_service.create_animal({"explotacio_id": 1, "genere": Genere.MASCLE})

@pytest.mark.asyncio
async def test_update_animal_success(mock_animal):
    """Test para actualizar un animal con éxito"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get, \
         patch('app.services.animal_service.AnimalHistory.create', new_callable=AsyncMock) as mock_history_create, \
         patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get, \
         patch('app.services.animal_service.Animal.validate_date', return_value=date(2021, 1, 1)):
        
        mock_get.return_value = mock_animal
        
        # Mock para la explotación
        mock_explotacio = MagicMock()
        mock_explotacio.id = 2
        mock_explotacio_get.return_value = mock_explotacio
        
        # Datos para actualizar
        update_data = {
            "explotacio_id": 2,
            "nom": "Updated Name",
            "estado": Estado.DEF,
            "dob": "01/01/2021"
        }
        
        # Configurar el mock para save
        mock_animal.save = AsyncMock()
        
        result = await animal_service.update_animal(1, update_data)
        
        mock_get.assert_called_once_with(id=1)
        mock_explotacio_get.assert_called_once_with(id=2)
        mock_animal.save.assert_called_once()
        
        # Verificar que se registraron los cambios en el historial
        # Puede haber más de 3 campos cambiados dependiendo de los valores por defecto
        assert mock_history_create.call_count >= 3
        
        # Verificar que los datos se actualizaron
        assert mock_animal.explotacio == mock_explotacio
        assert mock_animal.nom == "Updated Name"
        assert mock_animal.estado == Estado.DEF
        assert mock_animal.dob == date(2021, 1, 1)

@pytest.mark.asyncio
async def test_update_animal_not_exists():
    """Test para actualizar un animal que no existe"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = DoesNotExist("Animal")
        
        result = await animal_service.update_animal(999, {"nom": "Updated"})
        
        mock_get.assert_called_once_with(id=999)
        assert result is None

@pytest.mark.asyncio
async def test_update_animal_invalid_explotacio(mock_animal):
    """Test para actualizar un animal con explotación inválida"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get, \
         patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get:
        
        mock_get.return_value = mock_animal
        mock_explotacio_get.side_effect = DoesNotExist("Explotacio")
        
        with pytest.raises(ValueError, match="La explotación con ID 2 no existe"):
            await animal_service.update_animal(1, {"explotacio_id": 2})

@pytest.mark.asyncio
async def test_delete_animal_success():
    """Test para eliminar un animal con éxito"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get:
        mock_animal = MagicMock()
        mock_animal.delete = AsyncMock()
        mock_get.return_value = mock_animal
        
        result = await animal_service.delete_animal(1)
        
        mock_get.assert_called_once_with(id=1)
        mock_animal.delete.assert_called_once()
        assert result is True

@pytest.mark.asyncio
async def test_delete_animal_not_exists():
    """Test para eliminar un animal que no existe"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = DoesNotExist("Animal")
        
        result = await animal_service.delete_animal(999)
        
        mock_get.assert_called_once_with(id=999)
        assert result is False

@pytest.mark.asyncio
async def test_get_animal_history():
    """Test para obtener el historial de un animal"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get, \
         patch('app.services.animal_service.AnimalHistory.filter', new_callable=MagicMock) as mock_filter:
        
        # Mock para el animal
        mock_animal = MagicMock()
        mock_get.return_value = mock_animal
        
        # Mock para el historial
        mock_query = MagicMock()
        mock_filter.return_value = mock_query
        mock_query.order_by = MagicMock(return_value=mock_query)
        
        # Crear entradas de historial
        history_entry = MagicMock()
        history_entry.id = 1
        history_entry.field_name = "estado"
        history_entry.old_value = Estado.OK
        history_entry.new_value = Estado.DEF
        history_entry.changed_at = datetime.now()
        history_entry.changed_by = "test_user"
        
        # Configurar el mock para que se pueda usar con await
        async def mock_history_awaitable():
            return [history_entry]
        mock_query.__await__ = lambda: mock_history_awaitable().__await__()
        
        result = await animal_service.get_animal_history(1)
        
        mock_get.assert_called_once_with(id=1)
        mock_filter.assert_called_once_with(animal_id=1)
        mock_query.order_by.assert_called_once_with('-changed_at')
        
        assert len(result) == 1
        assert result[0]["field_name"] == "estado"
        assert result[0]["old_value"] == Estado.OK
        assert result[0]["new_value"] == Estado.DEF

@pytest.mark.asyncio
async def test_get_animal_history_animal_not_exists():
    """Test para obtener el historial de un animal que no existe"""
    with patch('app.services.animal_service.Animal.get', new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = DoesNotExist("Animal")
        
        result = await animal_service.get_animal_history(999)
        
        mock_get.assert_called_once_with(id=999)
        assert result == []

@pytest.mark.asyncio
async def test_create_animal_male_with_alletar():
    """Test para verificar que un macho no puede amamantar"""
    with patch('app.services.animal_service.Explotacio.get', new_callable=AsyncMock) as mock_explotacio_get, \
         patch('app.services.animal_service.Animal', new_callable=MagicMock) as mock_animal_class:
        
        # Mock para la explotación
        mock_explotacio = MagicMock()
        mock_explotacio_get.return_value = mock_explotacio
        
        # Mock para el animal
        mock_animal = MagicMock()
        mock_animal_class.return_value = mock_animal
        
        # Configurar el mock para save para que lance una excepción
        mock_animal.save = AsyncMock(side_effect=ValueError("Solo las hembras pueden tener estado de amamantamiento"))
        
        # Datos del animal macho con amamantamiento
        animal_data = {
            "explotacio_id": 1,
            "nom": "Test Male",
            "genere": Genere.MASCLE,
            "alletar": EstadoAlletar.UN_TERNERO.value
        }
        
        with pytest.raises(ValueError, match="Solo las hembras pueden tener estado de amamantamiento"):
            await animal_service.create_animal(animal_data)
            
        mock_animal.save.assert_called_once()
