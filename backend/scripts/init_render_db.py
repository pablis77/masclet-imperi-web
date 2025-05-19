"""
Script para inicializar la base de datos en Render
"""
import asyncio
import logging
import os
import sys
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent))

# Importaciones
try:
    from tortoise import Tortoise
    from app.core.config import settings
    from app.models.animal import Animal, Part
    from app.models.user import User
    from app.core.auth import get_password_hash
    import csv
except ImportError as e:
    logger.error(f"Error al importar módulos: {e}")
    sys.exit(1)

# Datos de ejemplo mínimos para tener algo en la base de datos
SAMPLE_EXPLOTACIO = "Render Test"
SAMPLE_ANIMALS = [
    {"alletar": 0, "explotacio": SAMPLE_EXPLOTACIO, "nom": "Vaca Test 1", "genere": "F", "pare": "", "mare": "", "quadra": "", "cod": "RT001", "num_serie": "001", "dob": "2020-01-01", "estado": "OK"},
    {"alletar": 0, "explotacio": SAMPLE_EXPLOTACIO, "nom": "Vaca Test 2", "genere": "F", "pare": "", "mare": "", "quadra": "", "cod": "RT002", "num_serie": "002", "dob": "2020-02-01", "estado": "OK"},
    {"alletar": 0, "explotacio": SAMPLE_EXPLOTACIO, "nom": "Toro Test 1", "genere": "M", "pare": "", "mare": "", "quadra": "", "cod": "RT003", "num_serie": "003", "dob": "2019-01-01", "estado": "OK"},
]

SAMPLE_PARTOS = [
    {"animal_nom": "Vaca Test 1", "part": "2022-01-01", "GenereT": "F", "EstadoT": "OK"},
    {"animal_nom": "Vaca Test 1", "part": "2023-01-01", "GenereT": "M", "EstadoT": "OK"},
    {"animal_nom": "Vaca Test 2", "part": "2022-06-01", "GenereT": "F", "EstadoT": "OK"},
]

async def create_superuser():
    """Crear usuario administrador por defecto para producción"""
    try:
        # Importar el modelo User
        from app.models.user import User
        from app.core.auth import get_password_hash
        
        # Verificar si ya existe un superusuario
        admin = await User.filter(is_superuser=True).first()
        
        if not admin:
            # Crear nuevo superusuario con credenciales admin/admin123
            admin_username = "admin"
            admin_password = "admin123"
            
            admin = User(
                username=admin_username,
                email="admin@example.com",
                hashed_password=get_password_hash(admin_password),
                is_active=True,
                is_superuser=True,
                role="administrador",
                full_name="Administrador"
            )
            await admin.save()
            logger.info(f"Superusuario {admin_username} creado correctamente con contraseña {admin_password}")
        else:
            logger.info(f"Superusuario ya existe: {admin.username}")
            
    except Exception as e:
        logger.error(f"Error al crear superusuario: {str(e)}")
        raise

async def create_test_data():
    """Crear datos mínimos de prueba para tener algo en la base de datos"""
    logger.info(f"Creando {len(SAMPLE_ANIMALS)} animales de prueba...")
    
    # Crear animales
    for animal_data in SAMPLE_ANIMALS:
        # Comprobar si ya existe
        existing = await Animal.filter(nom=animal_data["nom"], explotacio=animal_data["explotacio"]).first()
        if existing:
            logger.info(f"Animal {animal_data['nom']} ya existe, saltando...")
            continue
            
        # Crear el animal
        animal = Animal(**animal_data)
        await animal.save()
        logger.info(f"Animal {animal_data['nom']} creado correctamente")
    
    # Crear partos
    logger.info(f"Creando {len(SAMPLE_PARTOS)} partos de prueba...")
    for parto_data in SAMPLE_PARTOS:
        animal_nom = parto_data.pop("animal_nom")
        
        # Buscar el animal
        animal = await Animal.filter(nom=animal_nom, explotacio=SAMPLE_EXPLOTACIO).first()
        if not animal:
            logger.warning(f"Animal {animal_nom} no encontrado, saltando parto...")
            continue
            
        # Comprobar si ya existe el parto
        existing = await Part.filter(animal_id=animal.id, part=parto_data["part"]).first()
        if existing:
            logger.info(f"Parto {parto_data['part']} para {animal_nom} ya existe, saltando...")
            continue
            
        # Crear el parto
        parto = Part(animal_id=animal.id, **parto_data)
        await parto.save()
        logger.info(f"Parto {parto_data['part']} para {animal_nom} creado correctamente")

async def init_db():
    """Inicializar la base de datos con datos mínimos"""
    try:
        # Conexión a la base de datos
        logger.info(f"Conectando a la base de datos: {settings.database_url}")
        await Tortoise.init(
            db_url=settings.database_url,
            modules={'models': settings.MODELS}
        )
        
        # Crear las tablas si no existen
        await Tortoise.generate_schemas()
        logger.info("Esquema de base de datos verificado/creado correctamente")
        
        # Crear usuario administrador
        await create_superuser()
        
        # Crear datos mínimos de prueba
        await create_test_data()
        
        logger.info("Inicialización de base de datos completada correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar la base de datos: {str(e)}")
        raise
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()

async def main():
    """Función principal"""
    try:
        logger.info("Iniciando inicialización de base de datos en Render...")
        await init_db()
        return 0
    except Exception as e:
        logger.error(f"Error en el proceso de inicialización: {str(e)}")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("Proceso interrumpido por el usuario")
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        sys.exit(1)
