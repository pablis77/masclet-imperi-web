#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para añadir columnas a la tabla listado_animal usando SQL directo
"""

import os
import sys
import subprocess
import logging
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
def load_env_files():
    """Carga las variables de entorno desde múltiples archivos .env"""
    env_files = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'backend', '.env'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'backend', 'docker', '.env')
    ]
    
    for env_file in env_files:
        if os.path.exists(env_file):
            load_dotenv(env_file)
            logger.info(f"Archivo .env encontrado: {env_file}")
            # Mostrar DB_PORT para diagnóstico
            if 'DB_PORT' in os.environ:
                logger.info(f"  - DB_PORT={os.environ['DB_PORT']}")
    
    # Determinar qué archivo .env usar para las variables finales
    backend_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'backend', '.env')
    if os.path.exists(backend_env):
        logger.info(f"Usando archivo .env: {backend_env}")
        load_dotenv(backend_env, override=True)

def get_database_params():
    """Obtiene los parámetros de conexión a la base de datos desde las variables de entorno"""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5433')  # Puerto por defecto para PostgreSQL en Docker
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '1234')
    db_name = os.getenv('DB_NAME', 'masclet_imperi')
    
    # Registrar el puerto cargado para diagnóstico
    logger.info(f"DB_PORT cargado: {db_port}")
    
    return {
        'host': db_host,
        'port': db_port,
        'user': db_user,
        'password': db_password,
        'dbname': db_name
    }

def execute_sql(sql_command, db_params):
    """Ejecuta un comando SQL usando psql"""
    # Crear un archivo SQL temporal
    temp_sql_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_sql_command.sql')
    with open(temp_sql_file, 'w') as f:
        f.write(sql_command)
    
    # Construir el comando psql
    psql_command = [
        'psql',
        f"-h {db_params['host']}",
        f"-p {db_params['port']}",
        f"-U {db_params['user']}",
        f"-d {db_params['dbname']}",
        '-f', temp_sql_file
    ]
    
    # Ejecutar el comando
    logger.info(f"Ejecutando comando SQL: {sql_command}")
    
    # Configurar la variable de entorno PGPASSWORD
    env = os.environ.copy()
    env['PGPASSWORD'] = db_params['password']
    
    try:
        result = subprocess.run(' '.join(psql_command), shell=True, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("Comando SQL ejecutado correctamente")
            logger.info(f"Salida: {result.stdout}")
        else:
            logger.error(f"Error al ejecutar el comando SQL: {result.stderr}")
        
        return result.returncode == 0
    except Exception as e:
        logger.error(f"Error al ejecutar el comando: {str(e)}")
        return False
    finally:
        # Eliminar el archivo temporal
        if os.path.exists(temp_sql_file):
            os.remove(temp_sql_file)

def add_columns_to_listado_animal():
    """Añade las columnas estado y observaciones a la tabla listado_animal"""
    # Cargar variables de entorno
    load_env_files()
    
    # Obtener parámetros de la base de datos
    db_params = get_database_params()
    
    # SQL para verificar si las columnas existen
    check_columns_sql = """
    SELECT 
        column_name 
    FROM 
        information_schema.columns 
    WHERE 
        table_name = 'listado_animal' 
        AND column_name IN ('estado', 'observaciones');
    """
    
    # SQL para añadir las columnas
    add_columns_sql = """
    DO $$
    BEGIN
        -- Verificar si la columna 'estado' existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'listado_animal' AND column_name = 'estado'
        ) THEN
            -- Añadir la columna 'estado'
            ALTER TABLE listado_animal ADD COLUMN estado VARCHAR(10) DEFAULT 'NO';
            RAISE NOTICE 'Columna estado añadida';
        ELSE
            RAISE NOTICE 'La columna estado ya existe';
        END IF;
        
        -- Verificar si la columna 'observaciones' existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'listado_animal' AND column_name = 'observaciones'
        ) THEN
            -- Añadir la columna 'observaciones'
            ALTER TABLE listado_animal ADD COLUMN observaciones TEXT NULL;
            RAISE NOTICE 'Columna observaciones añadida';
        ELSE
            RAISE NOTICE 'La columna observaciones ya existe';
        END IF;
    END
    $$;
    
    -- Mostrar la estructura actualizada
    SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
    FROM 
        information_schema.columns 
    WHERE 
        table_name = 'listado_animal'
    ORDER BY 
        ordinal_position;
    """
    
    # Ejecutar el SQL
    success = execute_sql(add_columns_sql, db_params)
    
    return success

if __name__ == "__main__":
    # Ejecutar la función principal
    success = add_columns_to_listado_animal()
    
    # Salir con código de estado apropiado
    sys.exit(0 if success else 1)
