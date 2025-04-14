#!/usr/bin/env python
"""
Script para limpiar completamente la base de datos.
Elimina todos los partos y animales.
"""
import asyncio
import sys
import os
import logging
from datetime import datetime
from tortoise import Tortoise

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Agregar la ruta al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# URL de la base de datos
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"

async def init_db():
    """Inicializar conexión a base de datos"""
    logger.info(f"Conectando a: {DB_URL}")
    
    await Tortoise.init(
        db_url=DB_URL,
        modules={"models": ["backend.app.models.animal", "backend.app.models.explotacio", "backend.app.models.import_model"]}
    )
    logger.info("Conexión a base de datos inicializada")

async def clean_database():
    """Borrar todos los datos de animales y partos"""
    try:
        # Importar aquí para evitar problemas
        from backend.app.models.animal import Animal, Part
        from backend.app.models.import_model import Import
        
        logger.info("=== BORRANDO DATOS DE LA BASE DE DATOS ===")
        
        # 1. Borrar partos
        partos_count = await Part.all().count()
        await Part.all().delete()
        logger.info(f"Borrados {partos_count} registros de partos")
        
        # 2. Borrar animales
        animales_count = await Animal.all().count()
        await Animal.all().delete()
        logger.info(f"Borrados {animales_count} registros de animales")
        
        # 3. Borrar importaciones
        imports_count = await Import.all().count()
        await Import.all().delete()
        logger.info(f"Borrados {imports_count} registros de importaciones")
        
        logger.info("Limpieza completada con éxito")
        
    except Exception as e:
        logger.error(f"Error al borrar datos: {str(e)}")
        raise

async def main():
    """Función principal"""
    try:
        await init_db()
        
        # Pedir confirmación
        confirmacion = input("⚠️ Este script borrará todos los animales, partos e importaciones. ¿Continuar? (s/N): ")
        if confirmacion.lower() != 's':
            logger.info("Operación cancelada por el usuario")
            return
        
        await clean_database()
    except Exception as e:
        logger.error(f"Error en la operación: {str(e)}")
    finally:
        # Siempre cerramos conexiones
        await Tortoise.close_connections()
        logger.info("Conexión a base de datos cerrada")

if __name__ == "__main__":
    asyncio.run(main())
