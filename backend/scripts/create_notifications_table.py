"""
Script para crear la tabla de notificaciones directamente en la base de datos.
Esto es una solución temporal para evitar problemas con las migraciones.
"""
import os
import sys
import logging
from dotenv import load_dotenv
import asyncio
import asyncpg
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
def load_env_vars():
    # Buscar archivos .env en diferentes ubicaciones
    potential_env_files = [
        os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docker', '.env'),
    ]
    
    for env_file in potential_env_files:
        if os.path.exists(env_file):
            logger.info(f"Archivo .env encontrado: {env_file}")
            load_dotenv(env_file)
            # Mostrar valores importantes (sin credenciales sensibles)
            if 'DB_PORT' in os.environ:
                logger.info(f"  - DB_PORT={os.environ['DB_PORT']}")
            
    # Usar el archivo .env principal
    main_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(main_env):
        logger.info(f"Usando archivo .env: {main_env}")
        load_dotenv(main_env, override=True)

def get_database_url():
    # Obtener URL de conexión a la base de datos
    db_port = os.getenv('DB_PORT', '5432')
    logger.info(f"DB_PORT cargado: {db_port}")
    
    # Construir URL de la base de datos
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        db_url = f"postgres://postgres:1234@localhost:{db_port}/masclet_imperi"
    
    logger.info(f"DATABASE_URL generada: {db_url}")
    return db_url

async def create_notifications_table(conn):
    """Crear la tabla de notificaciones si no existe."""
    # Verificar si la tabla ya existe
    table_exists = await conn.fetchval(
        "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications')"
    )
    
    if table_exists:
        logger.info("La tabla 'notifications' ya existe en la base de datos.")
        return False
    
    # Crear la tabla de notificaciones
    logger.info("Creando tabla 'notifications'...")
    await conn.execute("""
    CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        icon VARCHAR(10) DEFAULT '🔔',
        related_entity_id INTEGER NULL,
        related_entity_type VARCHAR(50) NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP WITH TIME ZONE NULL
    );
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_notifications_type ON notifications(type);
    CREATE INDEX idx_notifications_read ON notifications(read);
    """)
    
    logger.info("Tabla 'notifications' creada exitosamente.")
    return True

async def main():
    # Cargar variables de entorno
    load_env_vars()
    
    # Obtener URL de la base de datos
    db_url = get_database_url()
    
    try:
        # Conectar a la base de datos
        logger.info("Conectando a la base de datos...")
        conn = await asyncpg.connect(db_url)
        logger.info("Conexión establecida")
        
        # Crear tabla de notificaciones
        created = await create_notifications_table(conn)
        
        # Cerrar conexión
        await conn.close()
        logger.info("Conexión cerrada")
        
        if created:
            logger.info("Tabla de notificaciones creada correctamente")
        else:
            logger.info("No se requirieron cambios en la base de datos")
        
        return 0
        
    except Exception as e:
        logger.error(f"Error durante la ejecución: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
