#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para añadir columnas a la tabla listado_animal sin romper la aplicación
"""

import os
import sys
import logging
import asyncio
import asyncpg
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

# Obtener la URL de la base de datos
def get_database_url():
    """Obtiene la URL de conexión a la base de datos desde las variables de entorno"""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5433')  # Puerto por defecto para PostgreSQL en Docker
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '1234')
    db_name = os.getenv('DB_NAME', 'masclet_imperi')
    
    # Registrar el puerto cargado para diagnóstico
    logger.info(f"DB_PORT cargado: {db_port}")
    
    # Construir la URL de conexión
    database_url = f"postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    logger.info(f"DATABASE_URL generada: {database_url}")
    
    return database_url

async def check_column_exists(conn, table, column):
    """Verifica si una columna existe en una tabla"""
    query = """
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = $2;
    """
    result = await conn.fetch(query, table, column)
    return len(result) > 0

async def show_table_structure(conn, table_name):
    """Muestra la estructura completa de una tabla"""
    print(f"\n=== ESTRUCTURA DE LA TABLA: {table_name} ===\n")
    
    # Obtener información de las columnas
    columns = await conn.fetch("""
    SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        ordinal_position
    FROM 
        information_schema.columns 
    WHERE 
        table_name = $1
    ORDER BY 
        ordinal_position;
    """, table_name)
    
    if not columns:
        print(f"No se encontraron columnas para la tabla {table_name}.")
        return
    
    # Imprimir encabezado de la tabla
    print("+----------------+--------------------+-------------+------------------+")
    print("| Columna        | Tipo de dato       | Permite NULL| Valor por defecto|")
    print("+================+====================+=============+==================+")
    
    for col in columns:
        column_name = col['column_name'].ljust(14)
        data_type = col['data_type'].ljust(18)
        is_nullable = ('SI' if col['is_nullable'] == 'YES' else 'NO').ljust(11)
        default = str(col['column_default'] or 'NULL').ljust(16)
        
        print(f"| {column_name} | {data_type} | {is_nullable} | {default} |")
    
    print("+----------------+--------------------+-------------+------------------+\n")

async def add_columns_to_listado_animal():
    """Añade las columnas estado y observaciones a la tabla listado_animal si no existen"""
    # Cargar variables de entorno
    load_env_files()
    
    # Obtener URL de la base de datos
    database_url = get_database_url()
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(database_url)
        print(f"\n\n=== CONEXIÓN ESTABLECIDA CON LA BASE DE DATOS ===\n")
        
        # Mostrar la estructura actual de la tabla
        print("\n=== ESTRUCTURA ANTES DE LOS CAMBIOS ===\n")
        await show_table_structure(conn, 'listado_animal')
        
        # Verificar si las columnas ya existen
        estado_exists = await check_column_exists(conn, 'listado_animal', 'estado')
        observaciones_exists = await check_column_exists(conn, 'listado_animal', 'observaciones')
        
        print("\n=== APLICANDO CAMBIOS A LA BASE DE DATOS ===\n")
        
        # Añadir las columnas si no existen
        if not estado_exists:
            print("  > Añadiendo columna 'estado' a la tabla listado_animal...")
            await conn.execute("""
            ALTER TABLE listado_animal 
            ADD COLUMN estado VARCHAR(10) DEFAULT 'NO';
            """)
            print("  > Columna 'estado' añadida correctamente")
        else:
            print("  > La columna 'estado' ya existe en la tabla listado_animal")
        
        if not observaciones_exists:
            print("  > Añadiendo columna 'observaciones' a la tabla listado_animal...")
            await conn.execute("""
            ALTER TABLE listado_animal 
            ADD COLUMN observaciones TEXT NULL;
            """)
            print("  > Columna 'observaciones' añadida correctamente")
        else:
            print("  > La columna 'observaciones' ya existe en la tabla listado_animal")
            
        # Mostrar la estructura actualizada
        print("\n=== ESTRUCTURA DESPUÉS DE LOS CAMBIOS ===\n")
        await show_table_structure(conn, 'listado_animal')
        
        # Cerrar la conexión
        await conn.close()
        print("\n=== CONEXIÓN CERRADA ===\n")
        
        return True
    except Exception as e:
        print(f"\n\n!!! ERROR AL MODIFICAR LA TABLA: {str(e)} !!!\n\n")
        return False

if __name__ == "__main__":
    # Ejecutar la función principal
    success = asyncio.run(add_columns_to_listado_animal())
    
    # Salir con código de estado apropiado
    sys.exit(0 if success else 1)
