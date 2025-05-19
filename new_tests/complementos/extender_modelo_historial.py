"""
Script para extender el modelo AnimalHistory sin romper la compatibilidad existente.
Añade nuevos campos sin eliminar los antiguos para mantener compatibilidad.
"""
import sys
import os
import json
import asyncio
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Añadir el directorio raíz al path para poder importar las dependencias
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from tortoise import Tortoise
from backend.app.core.config import settings

# Función principal para extender el modelo
async def extender_modelo_animal_history():
    """
    Extiende el modelo AnimalHistory añadiendo nuevos campos
    sin eliminar los existentes para mantener compatibilidad.
    """
    # Conectar a la base de datos
    logger.info("Conectando a la base de datos...")
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["backend.app.models.animal", "backend.app.models.user"]}
    )
    
    try:
        # Verificar si es necesario crear nuevos campos en la tabla
        logger.info("Verificando la estructura actual de AnimalHistory...")
        conn = Tortoise.get_connection("default")
        
        # Obtener los campos actuales de la tabla
        result = await conn.execute_query("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'animal_history'
        """)
        
        existing_columns = [row[0] for row in result[1]]
        logger.info(f"Columnas existentes: {existing_columns}")
        
        # Backup de la estructura actual (por seguridad)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        backup_file = f"animal_history_structure_backup_{timestamp}.json"
        backup_path = os.path.join(os.path.dirname(__file__), backup_file)
        
        with open(backup_path, 'w') as f:
            json.dump(existing_columns, f)
        logger.info(f"Backup de la estructura guardado en: {backup_path}")
        
        # Verificar y añadir solo los campos nuevos que faltan
        campos_nuevos = {
            "action": "VARCHAR(20)",
            "user": "VARCHAR(100)",
            "timestamp": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
            "field": "VARCHAR(50) NULL",
            "description": "TEXT",
            "old_value": "TEXT NULL",
            "new_value": "TEXT NULL",
            "changes": "JSONB NULL"
        }
        
        # Añadir solo los campos que no existen
        for campo, tipo in campos_nuevos.items():
            if campo.lower() not in [col.lower() for col in existing_columns]:
                logger.info(f"Añadiendo nuevo campo '{campo}' a animal_history...")
                await conn.execute_query(f"""
                    ALTER TABLE animal_history ADD COLUMN {campo} {tipo}
                """)
                logger.info(f"Campo '{campo}' añadido correctamente.")
            else:
                logger.info(f"El campo '{campo}' ya existe, no es necesario crearlo.")
        
        # Añadir índice para búsquedas rápidas por timestamp
        try:
            await conn.execute_query("""
                CREATE INDEX IF NOT EXISTS idx_animal_history_timestamp ON animal_history (timestamp DESC)
            """)
            logger.info("Índice por timestamp creado/verificado.")
        except Exception as e:
            logger.warning(f"No se pudo crear el índice: {str(e)}")
        
        # Migrar datos existentes cuando sea posible
        if "usuario" in [col.lower() for col in existing_columns] and "user" in campos_nuevos:
            logger.info("Migrando datos de 'usuario' a 'user'...")
            await conn.execute_query("""
                UPDATE animal_history SET "user" = usuario 
                WHERE "user" IS NULL AND usuario IS NOT NULL
            """)
            
        if "cambio" in [col.lower() for col in existing_columns] and "description" in campos_nuevos:
            logger.info("Migrando datos de 'cambio' a 'description'...")
            await conn.execute_query("""
                UPDATE animal_history SET description = cambio 
                WHERE description IS NULL AND cambio IS NOT NULL
            """)
            
        if "campo" in [col.lower() for col in existing_columns] and "field" in campos_nuevos:
            logger.info("Migrando datos de 'campo' a 'field'...")
            await conn.execute_query("""
                UPDATE animal_history SET field = campo 
                WHERE field IS NULL AND campo IS NOT NULL
            """)
            
        if "valor_anterior" in [col.lower() for col in existing_columns] and "old_value" in campos_nuevos:
            logger.info("Migrando datos de 'valor_anterior' a 'old_value'...")
            await conn.execute_query("""
                UPDATE animal_history SET old_value = valor_anterior 
                WHERE old_value IS NULL AND valor_anterior IS NOT NULL
            """)
            
        if "valor_nuevo" in [col.lower() for col in existing_columns] and "new_value" in campos_nuevos:
            logger.info("Migrando datos de 'valor_nuevo' a 'new_value'...")
            await conn.execute_query("""
                UPDATE animal_history SET new_value = valor_nuevo 
                WHERE new_value IS NULL AND valor_nuevo IS NOT NULL
            """)
        
        # Establecer valor predeterminado para action
        if "action" in campos_nuevos:
            logger.info("Estableciendo valor predeterminado para 'action'...")
            await conn.execute_query("""
                UPDATE animal_history SET action = 'UPDATE' 
                WHERE action IS NULL AND (campo IS NOT NULL OR field IS NOT NULL)
            """)
        
        # Si no existe timestamp, establecerlo al valor actual
        if "timestamp" in campos_nuevos:
            logger.info("Estableciendo timestamp para registros sin fecha...")
            await conn.execute_query("""
                UPDATE animal_history 
                SET timestamp = NOW() 
                WHERE timestamp IS NULL
            """)
        
        logger.info("¡Extensión del modelo AnimalHistory completada con éxito!")
        return True
        
    except Exception as e:
        logger.error(f"Error al extender AnimalHistory: {str(e)}")
        return False
    finally:
        # Cerrar la conexión a la base de datos
        await Tortoise.close_connections()

async def main():
    logger.info("=== INICIANDO EXTENSIÓN DEL MODELO ANIMAL HISTORY ===")
    resultado = await extender_modelo_animal_history()
    if resultado:
        logger.info("✅ Modelo extendido correctamente!")
        logger.info("Ahora puede usar tanto los campos antiguos como los nuevos.")
        logger.info("El sistema mantendrá la compatibilidad con ambas versiones.")
    else:
        logger.error("❌ Se produjeron errores durante la extensión del modelo.")
    logger.info("=== PROCESO FINALIZADO ===")

if __name__ == "__main__":
    asyncio.run(main())
