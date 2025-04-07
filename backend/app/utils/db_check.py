"""
Script temporal para verificar datos en la base de datos.
"""
import asyncio
import sys
import os
import logging
from tortoise import Tortoise

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Añadir directorio raíz al path para poder importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importar modelos y configuración
from app.core.config import settings
from app.models.animal import Animal

async def init_db():
    """Inicializar conexión a la base de datos"""
    # Corregir URL si es necesario (cambiar postgresql:// a postgres://)
    db_url = settings.DATABASE_URL
    if db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', 'postgres://')
    
    logger.info(f"URL original de base de datos: {settings.DATABASE_URL}")
    logger.info(f"URL corregida de base de datos: {db_url}")
    
    await Tortoise.init(
        db_url=db_url,
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.import_model', 'aerich.models']}
    )
    logger.info("Base de datos conectada")

async def check_animals():
    """Verificar datos de animales en la DB"""
    # Total de animales
    total = await Animal.all().count()
    logger.info(f"Total de animales en la base de datos: {total}")
    
    # Buscar animales con nombre "Marta"
    marta = await Animal.filter(nom__icontains="marta").all()
    logger.info(f"Animales con nombre 'Marta': {len(marta)}")
    
    if marta:
        logger.info("Detalles de los animales encontrados:")
        for animal in marta:
            logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}")
    else:
        logger.info("No se encontraron animales con nombre 'Marta'")
    
    # Buscar animales que contengan 'mart' (por si hay variaciones)
    mart = await Animal.filter(nom__icontains="mart").all()
    logger.info(f"Animales con nombre que contiene 'mart': {len(mart)}")
    
    if mart:
        logger.info("Detalles de los animales encontrados:")
        for animal in mart:
            logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}")
    
    # Listar algunos nombres para ver qué hay
    animals = await Animal.all().limit(20)
    logger.info("Primeros 20 animales en la base de datos:")
    for animal in animals:
        logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}")

async def main():
    """Función principal"""
    await init_db()
    try:
        await check_animals()
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
