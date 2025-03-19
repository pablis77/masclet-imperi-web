#!/usr/bin/env python
"""
Script para corregir la base de datos y solucionar los errores de columnas.
"""
import asyncio
import sys
from tortoise import Tortoise
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    # Configuración de la base de datos
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models.user", "app.models.animal", "app.models.explotacio"]}
    )

async def fix_database():
    try:
        # Inicializar la base de datos
        await init_db()
        conn = Tortoise.get_connection("default")
        
        # Verificar si la columna 'provincia' existe en la tabla 'explotacions'
        result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='explotacions' AND column_name='provincia');")
        provincia_exists = result[1][0]["exists"]
        
        if provincia_exists:
            logger.info("Renombrando columna 'provincia' a 'ubicacio' en la tabla 'explotacions'")
            await conn.execute_query("ALTER TABLE explotacions RENAME COLUMN provincia TO ubicacio;")
            logger.info("Columna renombrada exitosamente")
        else:
            logger.info("La columna 'provincia' no existe en la tabla 'explotacions', no es necesario renombrarla")
        
        # Verificar si la columna 'part' existe en la tabla 'animals'
        result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='animals' AND column_name='part');")
        part_exists = result[1][0]["exists"]
        
        if part_exists:
            logger.info("Renombrando columna 'part' a 'num_part' en la tabla 'animals'")
            await conn.execute_query("ALTER TABLE animals RENAME COLUMN part TO num_part;")
            logger.info("Columna renombrada exitosamente")
        else:
            logger.info("La columna 'part' no existe en la tabla 'animals', no es necesario renombrarla")
        
        logger.info("Correcciones de base de datos completadas")
            
    except Exception as e:
        logger.error(f"Error al corregir la base de datos: {e}")
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(fix_database())
