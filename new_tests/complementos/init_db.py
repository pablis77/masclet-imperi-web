#!/usr/bin/env python3
"""
Script para inicializar la estructura de la base de datos en el nuevo contenedor Docker.
"""
import os
import sys
import asyncio
import logging
from tortoise import Tortoise

# Agregar directorio raíz al path para poder importar desde backend
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    """Inicializa la estructura de la base de datos en el contenedor"""
    # Usamos dotenv para cargar las variables de entorno
    from dotenv import load_dotenv
    
    # Cargar variables de entorno del archivo .env de backend
    env_path = os.path.join(root_path, 'backend', '.env')
    load_dotenv(env_path)
    
    # Obtener variables de conexión pero sobrescribir el puerto
    postgres_user = os.getenv("POSTGRES_USER", "postgres")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "1234")
    postgres_db = os.getenv("POSTGRES_DB", "masclet_imperi")
    db_host = "localhost"  # Aseguramos que sea localhost
    db_port = "5433"  # Sobrescribimos para usar el puerto 5433 del nuevo contenedor
    
    db_url = f"postgres://{postgres_user}:{postgres_password}@{db_host}:{db_port}/{postgres_db}"
    logger.info(f"Conectando a: {db_url}")
    
    # Inicializar Tortoise ORM con los modelos de la aplicación
    await Tortoise.init(
        db_url=db_url,
        modules={"models": [
            "backend.app.models.animal",
            "backend.app.models.user",
            "backend.app.models.import_model",
            "aerich.models"
        ]}
    )
    
    # Generar el esquema (crear tablas)
    logger.info("Creando esquema (tablas) en la base de datos...")
    await Tortoise.generate_schemas()
    
    logger.info("Esquema creado correctamente")
    
    # Verificar que las tablas se hayan creado
    conn = Tortoise.get_connection("default")
    
    # Comprobar tabla animals
    result = await conn.execute_query("SELECT COUNT(*) FROM animals")
    logger.info(f"Tabla animals creada, contiene {result[1][0]['count']} registros")
    
    # Comprobar tabla part
    result = await conn.execute_query("SELECT COUNT(*) FROM part")
    logger.info(f"Tabla part creada, contiene {result[1][0]['count']} registros")
    
    # Comprobar tabla users
    result = await conn.execute_query("SELECT COUNT(*) FROM users")
    logger.info(f"Tabla users creada, contiene {result[1][0]['count']} registros")
    
    # Cerrar conexiones
    await Tortoise.close_connections()

async def main():
    try:
        await init_db()
        logger.info("Base de datos inicializada correctamente")
    except Exception as e:
        logger.error(f"Error inicializando la base de datos: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
