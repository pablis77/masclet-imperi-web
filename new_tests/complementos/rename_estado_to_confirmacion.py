#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para renombrar la columna 'estado' a 'confirmacion' en la tabla listado_animal
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
    
    logger.info(f"DB_PORT cargado: {db_port}")
    
    # Construir la URL de conexión
    database_url = f"postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    logger.info(f"DATABASE_URL generada: {database_url}")
    
    return database_url

# Verificar si una columna existe en una tabla
async def check_column_exists(conn, table, column):
    """Verifica si una columna existe en una tabla específica"""
    query = """
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    );
    """
    return await conn.fetchval(query, table, column)

# Mostrar la estructura completa de una tabla
async def show_table_structure(conn, table_name):
    """Muestra la estructura completa de una tabla"""
    # Obtener información de las columnas
    columns_query = """
    SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
    FROM 
        information_schema.columns
    WHERE 
        table_name = $1
    ORDER BY 
        ordinal_position;
    """
    
    columns = await conn.fetch(columns_query, table_name)
    
    if not columns:
        print(f"\nNo se encontraron columnas para la tabla {table_name}.")
        return
    
    print(f"\n=== ESTRUCTURA DE LA TABLA: {table_name} ===\n")
    print("+----------------+--------------------+-------------+------------------+")
    print("| Columna        | Tipo de dato       | Permite NULL| Valor por defecto|")
    print("+================+====================+=============+==================+")
    
    for col in columns:
        col_name = col['column_name']
        data_type = col['data_type']
        nullable = "SI" if col['is_nullable'] == 'YES' else "NO"
        default = col['column_default'] if col['column_default'] else "NULL"
        
        print(f"| {col_name:<14} | {data_type:<18} | {nullable:<11}| {default:<16} |")
    
    print("+----------------+--------------------+-------------+------------------+\n")

# Función principal para renombrar la columna
async def rename_estado_to_confirmacion():
    """Renombra la columna 'estado' a 'confirmacion' en la tabla listado_animal"""
    # Cargar variables de entorno
    load_env_files()
    
    # Obtener la URL de la base de datos
    database_url = get_database_url()
    
    # Conectar a la base de datos
    try:
        conn = await asyncpg.connect(database_url)
        print("\n\n=== CONEXIÓN ESTABLECIDA CON LA BASE DE DATOS ===\n")
        
        # Mostrar estructura antes de los cambios
        print("\n=== ESTRUCTURA ANTES DE LOS CAMBIOS ===\n")
        await show_table_structure(conn, 'listado_animal')
        
        # Verificar si la columna 'estado' existe
        estado_exists = await check_column_exists(conn, 'listado_animal', 'estado')
        confirmacion_exists = await check_column_exists(conn, 'listado_animal', 'confirmacion')
        
        print("\n=== APLICANDO CAMBIOS A LA BASE DE DATOS ===\n")
        
        if estado_exists and not confirmacion_exists:
            # Renombrar la columna 'estado' a 'confirmacion'
            await conn.execute("""
            ALTER TABLE listado_animal 
            RENAME COLUMN estado TO confirmacion;
            """)
            print("  > Columna 'estado' renombrada a 'confirmacion' en la tabla listado_animal")
        elif estado_exists and confirmacion_exists:
            # Si ambas columnas existen, copiar datos y eliminar 'estado'
            await conn.execute("""
            UPDATE listado_animal 
            SET confirmacion = estado 
            WHERE confirmacion IS NULL;
            """)
            await conn.execute("""
            ALTER TABLE listado_animal 
            DROP COLUMN estado;
            """)
            print("  > Datos copiados de 'estado' a 'confirmacion' y columna 'estado' eliminada")
        elif not estado_exists and not confirmacion_exists:
            # Si ninguna columna existe, crear 'confirmacion'
            await conn.execute("""
            ALTER TABLE listado_animal 
            ADD COLUMN confirmacion character varying(10) DEFAULT 'NO';
            """)
            print("  > Columna 'confirmacion' creada en la tabla listado_animal")
        else:
            print("  > La columna 'confirmacion' ya existe y 'estado' no existe. No se requieren cambios.")
        
        # Mostrar estructura después de los cambios
        print("\n=== ESTRUCTURA DESPUÉS DE LOS CAMBIOS ===\n")
        await show_table_structure(conn, 'listado_animal')
        
        # Cerrar la conexión
        await conn.close()
        print("\n=== CONEXIÓN CERRADA ===")
        
        return True
    
    except Exception as e:
        logger.error(f"Error al renombrar la columna: {str(e)}")
        return False

if __name__ == "__main__":
    # Ejecutar la función principal
    success = asyncio.run(rename_estado_to_confirmacion())
    
    if success:
        print("\n✅ La operación se completó con éxito.")
        sys.exit(0)
    else:
        print("\n❌ Hubo un error al realizar la operación.")
        sys.exit(1)
