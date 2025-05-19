"""
Script de migración para extender la tabla animal_history con nuevos campos para mejorar el sistema de historial.

Este script:
1. Verifica la estructura actual de la tabla animal_history
2. Añade las nuevas columnas necesarias para el historial mejorado
3. Migra datos existentes a las nuevas columnas para mantener compatibilidad
"""

import os
import sys
import json
import logging
import datetime
import asyncio
import asyncpg
import re
from pathlib import Path

# Añadir directorio base al path para poder importar módulos
base_dir = str(Path(__file__).parent.parent.parent)
if base_dir not in sys.path:
    sys.path.append(base_dir)

def get_database_url():
    """
    Obtiene la URL de la base de datos a partir de los archivos .env
    """
    # Rutas de archivos .env a verificar
    env_files = [
        os.path.join(base_dir, '.env'),
        os.path.join(base_dir, 'backend', '.env'),
        os.path.join(base_dir, 'backend', 'docker', '.env')
    ]
    
    db_port = None
    env_file_usado = None
    
    # Buscar DB_PORT en los archivos .env
    for env_file in env_files:
        if os.path.exists(env_file):
            logging.info(f"Archivo .env encontrado: {env_file}")
            with open(env_file, 'r') as f:
                content = f.read()
                match = re.search(r'DB_PORT\s*=\s*(\d+)', content)
                if match:
                    db_port = match.group(1)
                    logging.info(f"  - DB_PORT={db_port}")
            
            if db_port:
                env_file_usado = env_file
                break
    
    # Si no se encontró en ninguno, usar valor predeterminado
    if not db_port:
        db_port = "5433"  # Valor predeterminado
        logging.warning(f"No se encontró DB_PORT en ninguno de los archivos .env. Usando valor predeterminado: {db_port}")
    else:
        logging.info(f"Usando archivo .env: {env_file_usado}")
        logging.info(f"DB_PORT cargado: {db_port}")
    
    # Construir DATABASE_URL
    database_url = f"postgres://postgres:1234@localhost:{db_port}/masclet_imperi"
    logging.info(f"DATABASE_URL generada: {database_url}")
    
    return database_url

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

async def create_backup(pool):
    """Crear un backup de seguridad antes de modificar la estructura"""
    logger.info("Creando backup de seguridad...")
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    backup_filename = f"animal_history_backup_{timestamp}.sql"
    backup_path = os.path.join(base_dir, "backups", backup_filename)
    
    # Asegurar que existe el directorio de backups
    os.makedirs(os.path.join(base_dir, "backups"), exist_ok=True)
    
    async with pool.acquire() as conn:
        query = """
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'animal_history'
        """
        columns = await conn.fetch(query)
        
        if not columns:
            logger.error("No se encontró la tabla animal_history. No se puede crear backup.")
            return False
        
        # Obtener todos los datos actuales
        records = await conn.fetch("SELECT * FROM animal_history")
        
        # Guardar la estructura y datos en un archivo SQL
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write("-- Backup de la tabla animal_history generado automáticamente\n")
            f.write(f"-- Fecha: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # Generar estructura
            column_defs = []
            for col in columns:
                column_defs.append(f"{col['column_name']} {col['data_type']}")
            
            f.write("CREATE TABLE IF NOT EXISTS animal_history_backup (\n  ")
            f.write(",\n  ".join(column_defs))
            f.write("\n);\n\n")
            
            # Generar inserts
            for record in records:
                values = []
                for key, value in dict(record).items():
                    if value is None:
                        values.append("NULL")
                    elif isinstance(value, (int, float)):
                        values.append(str(value))
                    elif isinstance(value, (datetime.date, datetime.datetime)):
                        values.append(f"'{value}'")
                    else:
                        # Escapar comillas simples
                        escaped_value = str(value).replace("'", "''")
                        values.append(f"'{escaped_value}'")
                
                columns_str = ", ".join(dict(record).keys())
                values_str = ", ".join(values)
                
                f.write(f"INSERT INTO animal_history_backup ({columns_str}) VALUES ({values_str});\n")
    
    logger.info(f"Backup creado en: {backup_path}")
    return True

async def column_exists(conn, table, column):
    """Verificar si una columna existe en la tabla"""
    query = """
    SELECT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    );
    """
    exists = await conn.fetchval(query, table, column)
    return exists

async def add_columns(pool):
    """Añadir nuevas columnas a la tabla animal_history"""
    logger.info("Añadiendo nuevas columnas a la tabla animal_history...")
    
    # Definición de las nuevas columnas
    new_columns = [
        {"name": "action", "type": "VARCHAR(20)", "nullable": False, "default": "'UPDATE'"},
        {"name": "usuario_cambio", "type": "VARCHAR(100)", "nullable": True, "default": None},
        {"name": "timestamp", "type": "TIMESTAMP WITH TIME ZONE", "nullable": False, "default": "CURRENT_TIMESTAMP"},
        {"name": "field", "type": "VARCHAR(100)", "nullable": True, "default": None},
        {"name": "description", "type": "TEXT", "nullable": True, "default": None},
        {"name": "old_value", "type": "TEXT", "nullable": True, "default": None},
        {"name": "new_value", "type": "TEXT", "nullable": True, "default": None},
        {"name": "changes", "type": "JSONB", "nullable": True, "default": None}
    ]
    
    async with pool.acquire() as conn:
        # Verificar cada columna y añadirla si no existe
        added_columns = []
        for column in new_columns:
            exists = await column_exists(conn, 'animal_history', column['name'])
            
            if not exists:
                default_clause = f"DEFAULT {column['default']}" if column['default'] else ""
                nullable_clause = "NOT NULL" if not column['nullable'] else ""
                
                query = f"ALTER TABLE animal_history ADD COLUMN {column['name']} {column['type']} {default_clause} {nullable_clause}"
                await conn.execute(query)
                added_columns.append(column['name'])
                logger.info(f"Columna añadida: {column['name']} ({column['type']})")
            else:
                logger.info(f"La columna {column['name']} ya existe. No es necesario crearla.")
    
    if not added_columns:
        logger.info("No se añadieron nuevas columnas. La tabla ya tiene la estructura necesaria.")
    else:
        logger.info(f"Se añadieron {len(added_columns)} nuevas columnas: {', '.join(added_columns)}")
    
    return True

async def migrate_existing_data(pool):
    """Migrar datos existentes a las nuevas columnas para mantener compatibilidad"""
    logger.info("Migrando datos existentes a las nuevas columnas...")
    
    async with pool.acquire() as conn:
        # Verificar que existan las columnas necesarias
        required_columns = ["action", "usuario_cambio", "field", "old_value", "new_value", "changes"]
        for column in required_columns:
            exists = await column_exists(conn, 'animal_history', column)
            if not exists:
                logger.error(f"La columna {column} no existe. No se puede migrar los datos.")
                return False
        
        # Obtener registros que aún no han sido migrados (changes es NULL)
        query = """
        SELECT id, usuario, cambio, campo, valor_anterior, valor_nuevo 
        FROM animal_history 
        WHERE changes IS NULL
        """
        records = await conn.fetch(query)
        
        logger.info(f"Se encontraron {len(records)} registros para migrar")
        
        # Actualizar cada registro
        for record in records:
            # Crear JSON con los cambios
            cambios = {
                record['campo']: {
                    "anterior": record['valor_anterior'],
                    "nuevo": record['valor_nuevo']
                }
            }
            
            # Determinar la acción basada en el cambio
            action = "UPDATE"  # Por defecto
            if record['cambio'] and "Creación" in record['cambio']:
                action = "CREATE"
            elif record['cambio'] and "Eliminación" in record['cambio']:
                action = "DELETE"
            
            # Actualizar el registro
            update_query = """
            UPDATE animal_history 
            SET action = $1, 
                usuario_cambio = $2,
                field = $3, 
                description = $4,
                old_value = $5, 
                new_value = $6,
                changes = $7
            WHERE id = $8
            """
            
            await conn.execute(
                update_query,
                action,
                record['usuario'],
                record['campo'],
                record['cambio'],
                record['valor_anterior'],
                record['valor_nuevo'],
                json.dumps(cambios),
                record['id']
            )
        
        logger.info(f"Se migraron {len(records)} registros exitosamente")
    
    return True

async def rename_quadra_to_origen(pool):
    """Renombrar la columna 'quadra' a 'origen' en la tabla animals"""
    logger.info("Renombrando columna 'quadra' a 'origen' en la tabla animals...")
    
    async with pool.acquire() as conn:
        # Verificar si la columna origen ya existe
        exists = await column_exists(conn, 'animals', 'origen')
        
        if exists:
            logger.info("La columna 'origen' ya existe. No es necesario crearla.")
        else:
            # Añadir la nueva columna origen
            await conn.execute("ALTER TABLE animals ADD COLUMN origen VARCHAR")
            logger.info("Columna 'origen' añadida a la tabla animals")
            
            # Copiar datos de quadra a origen
            await conn.execute("UPDATE animals SET origen = quadra")
            logger.info("Datos copiados de 'quadra' a 'origen'")
    
    logger.info("Proceso de renombrado de columna completado.")
    return True

async def main():
    """Función principal que ejecuta la migración"""
    logger.info("Iniciando migración de la tabla animal_history y cambio de nombre de columna...")
    
    database_url = get_database_url()
    if not database_url:
        logger.error("No se pudo obtener la URL de la base de datos")
        return False
    
    logger.info(f"Conectando a la base de datos: {database_url}")
    
    try:
        # Conectar a la base de datos
        pool = await asyncpg.create_pool(database_url)
        
        # Crear backup de seguridad
        backup_created = await create_backup(pool)
        if not backup_created:
            logger.error("No se pudo crear el backup. Abortando migración.")
            await pool.close()
            return False
        
        # Añadir nuevas columnas al historial
        columns_added = await add_columns(pool)
        if not columns_added:
            logger.error("Error al añadir columnas. Abortando migración.")
            await pool.close()
            return False
        
        # Migrar datos existentes del historial
        data_migrated = await migrate_existing_data(pool)
        if not data_migrated:
            logger.error("Error al migrar datos existentes.")
        
        # Renombrar columna quadra a origen
        quadra_renamed = await rename_quadra_to_origen(pool)
        if not quadra_renamed:
            logger.error("Error al renombrar columna quadra a origen.")
        
        await pool.close()
        
        logger.info("Migración completada exitosamente")
        return True
    
    except Exception as e:
        logger.error(f"Error durante la migración: {str(e)}")
        return False

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    success = loop.run_until_complete(main())
    
    if success:
        logger.info("Migración realizada con éxito. La tabla animal_history ha sido extendida.")
    else:
        logger.error("La migración falló. Verifica los errores anteriores.")
