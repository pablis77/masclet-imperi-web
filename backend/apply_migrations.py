#!/usr/bin/env python
"""
Script para aplicar migraciones manualmente a la base de datos.
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

async def apply_migrations():
    try:
        # Inicializar la base de datos
        await init_db()
        conn = Tortoise.get_connection("default")
        
        # Verificar si la tabla 'explotacions' existe
        result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='explotacions');")
        table_exists = result[1][0]["exists"]
        
        if table_exists:
            # Verificar si la columna 'explotaci' ya existe
            result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='explotacions' AND column_name='explotaci');")
            column_exists = result[1][0]["exists"]
            
            if not column_exists:
                logger.info("Añadiendo columna 'explotaci' a la tabla 'explotacions'")
                await conn.execute_query("ALTER TABLE explotacions ADD COLUMN explotaci VARCHAR(255);")
                logger.info("Columna añadida exitosamente")
            else:
                logger.info("La columna 'explotaci' ya existe en la tabla 'explotacions'")
        
        # Verificar si la tabla 'animals' existe
        result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='animals');")
        table_exists = result[1][0]["exists"]
        
        if table_exists:
            # Verificar si la columna 'part' ya existe
            result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='animals' AND column_name='part');")
            column_exists = result[1][0]["exists"]
            
            if not column_exists:
                logger.info("Añadiendo columna 'part' a la tabla 'animals'")
                await conn.execute_query("ALTER TABLE animals ADD COLUMN part VARCHAR(50);")
                logger.info("Columna añadida exitosamente")
            else:
                logger.info("La columna 'part' ya existe en la tabla 'animals'")
            
            # Verificar si la columna 'alletar' existe y su tipo
            result = await conn.execute_query("SELECT data_type FROM information_schema.columns WHERE table_name='animals' AND column_name='alletar';")
            if result[1]:
                data_type = result[1][0]["data_type"]
                logger.info(f"La columna 'alletar' existe con tipo: {data_type}")
                
                # Si es necesario, convertir el tipo para que sea compatible con el frontend
                if data_type == 'integer':
                    logger.info("Convirtiendo la columna 'alletar' de integer a varchar para compatibilidad con el frontend")
                    # Primero crear una columna temporal
                    await conn.execute_query("ALTER TABLE animals ADD COLUMN alletar_temp VARCHAR(10);")
                    # Convertir los valores
                    await conn.execute_query("UPDATE animals SET alletar_temp = CASE WHEN alletar = 0 THEN 'NO' WHEN alletar = 1 THEN '1' WHEN alletar = 2 THEN '2' ELSE 'NO' END;")
                    # Eliminar la columna original
                    await conn.execute_query("ALTER TABLE animals DROP COLUMN alletar;")
                    # Renombrar la columna temporal
                    await conn.execute_query("ALTER TABLE animals RENAME COLUMN alletar_temp TO alletar;")
                    logger.info("Conversión de columna 'alletar' completada")
            else:
                logger.info("La columna 'alletar' no existe en la tabla 'animals'")
        
        logger.info("Migraciones aplicadas correctamente")
            
    except Exception as e:
        logger.error(f"Error al aplicar migraciones: {e}")
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(apply_migrations())
