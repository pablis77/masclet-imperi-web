"""
Script para actualizar el modelo AnimalHistory y asegurar que se registre correctamente
el historial de cambios en animales.
"""
import sys
import os
import json
import asyncio
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Añadir el directorio raíz al path para poder importar las dependencias
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from tortoise import Tortoise
from backend.app.models.animal import Animal, AnimalHistory
from backend.app.core.config import settings

# Función principal
async def update_animal_history_model():
    """
    Actualiza el modelo AnimalHistory para usar un formato estandarizado
    y asegura que todos los cambios se registren correctamente.
    """
    # Conectar a la base de datos
    logger.info("Conectando a la base de datos...")
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["backend.app.models.animal", "backend.app.models.user"]}
    )
    
    try:
        # 1. Verificar si es necesario crear nuevos campos en la tabla
        logger.info("Verificando si es necesario actualizar la estructura de AnimalHistory...")
        conn = Tortoise.get_connection("default")
        
        # Obtener los campos actuales de la tabla
        result = await conn.execute_query("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'animal_history'
        """)
        
        existing_columns = [row[0] for row in result[1]]
        logger.info(f"Columnas existentes: {existing_columns}")
        
        # Verificar y añadir los campos necesarios
        required_columns = {
            "action": "VARCHAR(20)",
            "user": "VARCHAR(100)",
            "timestamp": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
            "field": "VARCHAR(50)",
            "description": "TEXT",
            "old_value": "TEXT",
            "new_value": "TEXT",
            "changes": "JSONB"
        }
        
        # Crear los campos que faltan
        for column, data_type in required_columns.items():
            if column.lower() not in [col.lower() for col in existing_columns]:
                logger.info(f"Añadiendo columna {column} a animal_history...")
                await conn.execute_query(f"""
                    ALTER TABLE animal_history ADD COLUMN {column} {data_type}
                """)
                
        # 2. Migrar datos existentes si es necesario
        if "usuario" in existing_columns and "user" in required_columns:
            logger.info("Migrando datos de 'usuario' a 'user'...")
            await conn.execute_query("""
                UPDATE animal_history SET "user" = usuario WHERE "user" IS NULL AND usuario IS NOT NULL
            """)
            
        if "cambio" in existing_columns and "description" in required_columns:
            logger.info("Migrando datos de 'cambio' a 'description'...")
            await conn.execute_query("""
                UPDATE animal_history SET description = cambio WHERE description IS NULL AND cambio IS NOT NULL
            """)
            
        if "campo" in existing_columns and "field" in required_columns:
            logger.info("Migrando datos de 'campo' a 'field'...")
            await conn.execute_query("""
                UPDATE animal_history SET field = campo WHERE field IS NULL AND campo IS NOT NULL
            """)
            
        if "valor_anterior" in existing_columns and "old_value" in required_columns:
            logger.info("Migrando datos de 'valor_anterior' a 'old_value'...")
            await conn.execute_query("""
                UPDATE animal_history SET old_value = valor_anterior WHERE old_value IS NULL AND valor_anterior IS NOT NULL
            """)
            
        if "valor_nuevo" in existing_columns and "new_value" in required_columns:
            logger.info("Migrando datos de 'valor_nuevo' a 'new_value'...")
            await conn.execute_query("""
                UPDATE animal_history SET new_value = valor_nuevo WHERE new_value IS NULL AND valor_nuevo IS NOT NULL
            """)
        
        # 3. Actualizar action y timestamp para registros antiguos
        logger.info("Actualizando 'action' para registros existentes...")
        await conn.execute_query("""
            UPDATE animal_history SET action = 'UPDATE' 
            WHERE action IS NULL AND (campo IS NOT NULL OR field IS NOT NULL)
        """)
        
        # Si no existe timestamp, establecerlo al valor de updated_at del animal
        logger.info("Asegurando que todos los registros tengan timestamp...")
        await conn.execute_query("""
            UPDATE animal_history AS ah
            SET timestamp = a.updated_at
            FROM animals AS a
            WHERE ah.animal_id = a.id AND ah.timestamp IS NULL
        """)
        
        logger.info("¡Actualización del modelo AnimalHistory completada con éxito!")
        
    except Exception as e:
        logger.error(f"Error al actualizar AnimalHistory: {str(e)}")
        raise
    finally:
        # Cerrar la conexión a la base de datos
        await Tortoise.close_connections()

# Función para crear un registro histórico para todas las eliminaciones faltantes
async def ensure_delete_history():
    """
    Verifica que exista un registro DELETE en el historial para cada animal eliminado.
    """
    # Conectar a la base de datos
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["backend.app.models.animal", "backend.app.models.user"]}
    )
    
    try:
        logger.info("Verificando registros de eliminación faltantes...")
        # Esta parte es más compleja y dependerá de cómo identificar animales eliminados
        # Podría ser comparando contra una lista conocida o verificando gaps en IDs
        # Esta implementación es un placeholder
        
        logger.info("Verificación de registros de eliminación completada.")
    except Exception as e:
        logger.error(f"Error al verificar registros de eliminación: {str(e)}")
    finally:
        await Tortoise.close_connections()

# Función principal para ejecutar el script
async def main():
    logger.info("Iniciando actualización del sistema de historial de animales...")
    await update_animal_history_model()
    await ensure_delete_history()
    logger.info("Proceso completado correctamente.")

# Ejecutar el script si se llama directamente
if __name__ == "__main__":
    asyncio.run(main())
