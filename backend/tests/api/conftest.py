"""
Configuración para pruebas de API.
Este archivo configura la inicialización de la base de datos y otros fixtures necesarios
para las pruebas de API.
"""
import pytest
import os
import logging
import importlib
import inspect
import sys
from pathlib import Path
from datetime import datetime
from tortoise import Tortoise, Model
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from tests.api.test_helpers import hide_problematic_modules  # Importar el helper

# Configurar logging con más detalle para debugging
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Configuración para pytest-asyncio
pytest_plugins = ["pytest_asyncio"]

# Cliente para las pruebas de API
@pytest.fixture(scope="session")
def client():
    """Fixture para el cliente de pruebas de FastAPI."""
    return TestClient(app)

# Configurar un event_loop mejorado para toda la sesión de pruebas
@pytest.fixture(scope="session")
def event_loop():
    """
    Crear un event loop para toda la sesión de pruebas.
    Este fixture garantiza que se use un único event loop durante toda la sesión,
    evitando el error 'This event loop is already running'.
    """
    import asyncio
    # Crear un nuevo event loop
    loop = asyncio.get_event_loop_policy().new_event_loop()
    asyncio.set_event_loop(loop)
    logger.info("Event loop creado para la sesión de pruebas")
    
    # Proporcionar el loop
    yield loop
    
    # Limpiar y cerrar el loop al finalizar
    pending = asyncio.all_tasks(loop)
    if pending:
        logger.info(f"Cancelando {len(pending)} tareas pendientes")
        for task in pending:
            task.cancel()
    
    loop.run_until_complete(loop.shutdown_asyncgens())
    loop.close()
    logger.info("Event loop cerrado correctamente")

# Función para descubrir automáticamente todos los modelos Tortoise
def discover_tortoise_models():
    """
    Descubre automáticamente todos los módulos que contienen modelos Tortoise ORM.
    
    Returns:
        List[str]: Lista de rutas de módulos con modelos
    """
    models_modules = []
    base_path = Path(__file__).parent.parent.parent / "app" / "models"
    logger.info(f"Buscando modelos en: {base_path}")
    
    # Añadir módulos explícitamente mencionados en settings
    if hasattr(settings, 'MODELS'):
        for module in settings.MODELS:
            if module.endswith(('.base', '.parto')):
                logger.warning(f"Excluyendo módulo sin modelos activos: {module}")
            else:
                models_modules.append(module)
    
    # Buscar módulos de modelos adicionales
    if base_path.exists():
        for file_path in base_path.glob('**/*.py'):
            if file_path.name == '__init__.py':
                continue
                
            # Excluir explícitamente los módulos problemáticos
            if file_path.name in ['base.py', 'parto.py']:
                logger.warning(f"Excluyendo módulo sin modelos activos: {file_path}")
                continue
                
            # Convertir ruta a formato de módulo
            relative_path = file_path.relative_to(Path(__file__).parent.parent.parent)
            module_path = str(relative_path).replace('\\', '.').replace('/', '.').replace('.py', '')
            
            # Evitar duplicados y módulos problemáticos explícitamente
            if (module_path not in models_modules and 
                not module_path.endswith('.base') and 
                not module_path.endswith('.parto')):
                models_modules.append(module_path)
                logger.info(f"Descubierto módulo de modelos: {module_path}")
    
    # Asegurar que los módulos principales estén incluidos
    # NOTA: NO incluimos app.models.parto porque el modelo está duplicado (usamos Part de animal.py)
    # NOTA: NO incluimos app.models.base porque es un modelo abstracto
    essential_modules = ["app.models.animal", "app.models.explotacio", "app.models.user"]
    
    # Lista de módulos que deben excluirse explícitamente
    excluded_modules = [
        "app.models.parto", 
        "app.models.base",
        "app.models.enums",    # No contiene modelos
        "app.models.estat",    # No contiene modelos
        "app.models.icons",    # No contiene modelos
        "app.models.schemas"   # No contiene modelos
    ]
    
    for module in essential_modules:
        if module not in models_modules:
            models_modules.append(module)
            logger.info(f"Añadido módulo esencial: {module}")
    
    # Eliminar cualquier módulo excluido que haya sido añadido automáticamente
    for module in excluded_modules:
        if module in models_modules:
            models_modules.remove(module)
            logger.info(f"Eliminado módulo sin modelos: {module}")
            
    # Asegurar que el modelo Part esté registrado (está en animal.py)
    try:
        from app.models.animal import Part
        logger.info("Modelo Part registrado correctamente")
    except ImportError as e:
        logger.error(f"Error al importar el modelo Part: {e}")
    
    return models_modules

# Fixture para inicializar la base de datos
@pytest.fixture(scope="session")
async def initialize_tortoise_test_db():
    """
    Inicializar Tortoise ORM para pruebas.
    Asegura que todos los modelos necesarios estén disponibles.
    """
    # Configurar Tortoise con la base de datos en memoria para tests
    db_url = "sqlite://:memory:"
    
    # Descubrir automáticamente los modelos, excluyendo los problemáticos
    models = discover_tortoise_models()
    logger.info(f"Modelos descubiertos para tests: {models}")
    
    # Importar explícitamente el modelo Part antes de inicializar (asegura que Tortoise lo encuentre)
    try:
        from app.models.animal import Part
        logger.info("Modelo Part importado explícitamente desde app.models.animal")
    except ImportError as e:
        logger.error(f"Error al importar Part: {e}")
        
    # Bloquear completamente cualquier intento de cargar el módulo problemático
    sys.modules['app.models.parto'] = None
    
    # Configuración de Tortoise que garantiza no cargar módulos problemáticos
    config = {
        "connections": {
            "default": db_url,
            "models": db_url  # Añadir 'models' como alias para la misma conexión
        },
        "apps": {
            "models": {
                "models": models,
                "default_connection": "default",
            },
        },
        "use_tz": False,
        "timezone": "UTC"
    }
    
    # Inicializar Tortoise
    await Tortoise.init(config=config)
    
    # Generar esquema
    await Tortoise.generate_schemas()
    logger.info("Esquema generado correctamente para tests")
    
    yield
    
    # Cerrar conexiones
    await Tortoise.close_connections()
    logger.info("Tortoise cerrado correctamente")

# Función para determinar el orden de eliminación basado en dependencias
async def delete_in_correct_order():
    """
    Elimina los registros de las tablas en el orden correcto basado en dependencias.
    Primero elimina las tablas dependientes y luego las principales.
    """
    from tortoise.exceptions import OperationalError
    
    # Importar modelos con manejo de errores
    try:
        from app.models.animal import Part, Animal
        from app.models.explotacio import Explotacio
        
        # Orden de eliminación basado en dependencias (de más dependiente a menos)
        models_to_delete = [
            (Part, "Partos"),
            (Animal, "Animales"),
            (Explotacio, "Explotaciones")
        ]
        
        # Intentar eliminar registros de cada modelo en orden
        for model, name in models_to_delete:
            try:
                count = await model.all().count()
                if count > 0:
                    await model.all().delete()
                    logger.info(f"Eliminados {count} registros de {name}")
                else:
                    logger.info(f"No hay registros que eliminar en {name}")
            except OperationalError as e:
                logger.warning(f"Error al eliminar {name}: {e}")
        
        # Intentar limpiar otras tablas si existen
        try:
            from app.models.user import User
            count = await User.all().count()
            if count > 0:
                await User.all().delete()
                logger.info(f"Eliminados {count} registros de Usuarios")
        except (OperationalError, ImportError) as e:
            logger.info(f"Tabla 'users' no disponible o vacía: {e}")
            
    except Exception as e:
        logger.error(f"Error durante la limpieza de tablas: {e}")
        # No propagamos el error para permitir que los tests continúen

# Fixture para limpiar la base de datos entre pruebas
@pytest.fixture(scope="function")
async def clean_db(initialize_tortoise_test_db):
    """
    Limpia la base de datos entre pruebas.
    Este fixture elimina todos los registros de las tablas en el orden correcto
    para evitar problemas de integridad referencial.
    """
    # Limpiar la base de datos antes del test
    await delete_in_correct_order()
    logger.info(f"Base de datos limpiada antes del test: {datetime.now().strftime('%H:%M:%S.%f')}")
    
    yield
    
    # Opcionalmente, limpiar después del test también
    # await delete_in_correct_order()
    # logger.info(f"Base de datos limpiada después del test: {datetime.now().strftime('%H:%M:%S.%f')}")
