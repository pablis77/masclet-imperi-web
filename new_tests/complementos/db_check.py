"""
Script para verificar el contenido de la base de datos.
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
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

# Importar modelos y configuración
from app.core.config import settings
from app.models.animal import Animal, Part

async def init_db():
    """Inicializar conexión a la base de datos"""
    # Corregir URL si es necesario (cambiar postgresql:// a postgres://)
    db_url = settings.DATABASE_URL
    if db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', 'postgres://')
    
    logger.info(f"URL de base de datos: {db_url}")
    
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
    
    # Verificar distribución por explotación
    explotacions = {}
    animals = await Animal.all()
    
    for animal in animals:
        if animal.explotacio in explotacions:
            explotacions[animal.explotacio] += 1
        else:
            explotacions[animal.explotacio] = 1
    
    logger.info("Distribución de animales por explotación:")
    for expl, count in explotacions.items():
        logger.info(f"  - {expl}: {count} animales")
    
    # Verificar distribución por género
    machos = await Animal.filter(genere="M").count()
    hembras = await Animal.filter(genere="F").count()
    logger.info(f"Distribución por género: {machos} machos, {hembras} hembras")
    
    # Verificar distribución por estado
    activos = await Animal.filter(estado="OK").count()
    fallecidos = await Animal.filter(estado="DEF").count()
    logger.info(f"Distribución por estado: {activos} activos, {fallecidos} fallecidos")
    
    # Verificar animales específicos
    buscar_nombres = ["Marta", "Pablo", "Elena", "Marcos"]
    for nombre in buscar_nombres:
        resultados = await Animal.filter(nom__icontains=nombre).all()
        if resultados:
            logger.info(f"Animales con nombre '{nombre}': {len(resultados)}")
            for a in resultados:
                logger.info(f"  - ID: {a.id}, Nombre: {a.nom}, Explotación: {a.explotacio}, Género: {a.genere}")
        else:
            logger.info(f"No se encontraron animales con nombre '{nombre}'")
    
    # Verificar partos
    partos = await Part.all().count()
    logger.info(f"Total de partos registrados: {partos}")
    
    if partos > 0:
        logger.info("Ultimos 5 partos registrados:")
        ultimos_partos = await Part.all().order_by("-id").limit(5)
        for p in ultimos_partos:
            animal = await Animal.get(id=p.animal_id)
            logger.info(f"  - Animal: {animal.nom}, Fecha: {p.part}, Género cría: {p.generet}, Estado cría: {p.estadot}")

async def main():
    """Función principal"""
    await init_db()
    try:
        await check_animals()
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
