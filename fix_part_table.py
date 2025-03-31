#!/usr/bin/env python
"""
Script para corregir los nombres de columnas en la tabla part.
"""
import asyncio
from tortoise import Tortoise
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_part_table():
    # Inicializar la conexión a la base de datos
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models.user", "app.models.animal", "app.models.explotacio"]}
    )
    
    try:
        conn = Tortoise.get_connection("default")
        
        # Verificar si la tabla 'part' existe
        result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='part');")
        table_exists = result[1][0]["exists"]
        
        if not table_exists:
            logger.error("La tabla 'part' no existe en la base de datos.")
            return
        
        # Mostrar la estructura actual
        logger.info("Estructura actual de la tabla part:")
        result = await conn.execute_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'part';")
        for row in result[1]:
            logger.info(f"{row['column_name']} - {row['data_type']}")
        
        # Renombrar columnas para que coincidan con los campos del CSV
        logger.info("Renombrando columnas para que coincidan con los campos del CSV...")
        
        # 1. Renombrar 'data' a 'part'
        logger.info("Renombrando 'data' a 'part'...")
        try:
            await conn.execute_query("ALTER TABLE part RENAME COLUMN data TO part;")
            logger.info("Columna 'data' renombrada a 'part' correctamente.")
        except Exception as e:
            logger.error(f"Error al renombrar 'data' a 'part': {e}")
        
        # 2. Renombrar 'genere_fill' a 'GenereT'
        logger.info("Renombrando 'genere_fill' a 'GenereT'...")
        try:
            await conn.execute_query("ALTER TABLE part RENAME COLUMN genere_fill TO \"GenereT\";")
            logger.info("Columna 'genere_fill' renombrada a 'GenereT' correctamente.")
        except Exception as e:
            logger.error(f"Error al renombrar 'genere_fill' a 'GenereT': {e}")
        
        # 3. Renombrar 'estat_fill' a 'EstadoT'
        logger.info("Renombrando 'estat_fill' a 'EstadoT'...")
        try:
            await conn.execute_query("ALTER TABLE part RENAME COLUMN estat_fill TO \"EstadoT\";")
            logger.info("Columna 'estat_fill' renombrada a 'EstadoT' correctamente.")
        except Exception as e:
            logger.error(f"Error al renombrar 'estat_fill' a 'EstadoT': {e}")
        
        # Mostrar la estructura actualizada
        logger.info("Estructura actualizada de la tabla part:")
        result = await conn.execute_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'part';")
        for row in result[1]:
            logger.info(f"{row['column_name']} - {row['data_type']}")
        
        logger.info("Corrección de la tabla part completada.")
    
    except Exception as e:
        logger.error(f"Error al corregir la tabla: {e}")
    
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(fix_part_table())
