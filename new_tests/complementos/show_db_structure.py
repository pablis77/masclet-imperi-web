#!/usr/bin/env python3
"""
Script para mostrar la estructura actual de la base de datos.
Muestra las tablas, columnas, restricciones y relaciones.

Uso:
    python show_db_structure.py [opciones]

Opciones:
    -h, --help          Muestra esta ayuda
    -v, --verbose       Muestra información detallada
    -p, --port PUERTO   Especifica el puerto de la base de datos (5432 para local, 5433 para contenedor)
    --container         Usa configuración para el contenedor (puerto 5433)
    --local             Usa configuración para la base de datos local (puerto 5432, por defecto)
"""
import asyncio
import sys
import os
import logging
import argparse
from tortoise import Tortoise
from tabulate import tabulate
from dotenv import load_dotenv

# Agregar el directorio raíz al path para poder importar desde app
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

# Cargar variables de entorno
env_path = os.path.join(root_path, 'backend', '.env')
load_dotenv(env_path)

# Importar configuración (pero no la usaremos directamente)
from backend.app.core.config import settings

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db(db_port=None):
    """Inicializar conexión a base de datos"""
    # Obtener valores de las variables de entorno directamente
    db_user = os.getenv("POSTGRES_USER", settings.postgres_user)
    db_password = os.getenv("POSTGRES_PASSWORD", settings.postgres_password)
    db_name = os.getenv("POSTGRES_DB", settings.postgres_db)
    db_host = os.getenv("DB_HOST", "localhost")
    
    # Usar el puerto especificado o el de la configuración
    if db_port is None:
        db_port = os.getenv("DB_PORT", settings.db_port)
    
    db_url = f"postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["backend.app.models.animal", "backend.app.models.user", "backend.app.models.explotacio"]}
    )
    logger.info(f"Conexión establecida con la base de datos en {db_host}:{db_port}")

async def close_db():
    """Cerrar conexión a base de datos"""
    await Tortoise.close_connections()
    logger.info("Conexión cerrada")

async def execute_query(query, params=None):
    """Ejecuta una consulta SQL y devuelve los resultados"""
    conn = Tortoise.get_connection("default")
    try:
        results = await conn.execute_query(query, params)
        return results[1]  # Resultados de la consulta
    except Exception as e:
        logger.error(f"Error al ejecutar consulta: {str(e)}")
        return []

async def show_tables():
    """Muestra todas las tablas de la base de datos"""
    print("\n=== TABLAS EN LA BASE DE DATOS ===")
    
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
    """
    
    tables = await execute_query(query)
    
    if tables:
        # Convertir la lista de diccionarios a una lista de listas para tabulate
        table_data = [[table['table_name']] for table in tables]
        print(tabulate(table_data, headers=["Nombre de tabla"], tablefmt="grid"))
    else:
        print("No se encontraron tablas.")

async def show_table_structure(table_name):
    """Muestra la estructura de una tabla específica"""
    print(f"\n=== ESTRUCTURA DE LA TABLA: {table_name} ===")
    
    # 1. Mostrar columnas
    column_query = """
    SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
    FROM 
        information_schema.columns
    WHERE 
        table_schema = 'public' 
        AND table_name = $1
    ORDER BY 
        ordinal_position
    """
    
    columns = await execute_query(column_query, [table_name])
    
    if columns:
        print("\nCOLUMNAS:")
        # Convertir la lista de diccionarios a una lista de listas
        column_data = [[col['column_name'], col['data_type'], col['is_nullable'], col['column_default']] for col in columns]
        print(tabulate(column_data, headers=["Nombre", "Tipo de dato", "Permite NULL", "Valor por defecto"], tablefmt="grid"))
    else:
        print(f"No se encontraron columnas para la tabla {table_name}.")
    
    # 2. Mostrar restricciones (primary key, foreign keys, etc.)
    constraint_query = """
    SELECT
        c.conname AS constraint_name,
        CASE
            WHEN c.contype = 'c' THEN 'CHECK'
            WHEN c.contype = 'f' THEN 'FOREIGN KEY'
            WHEN c.contype = 'p' THEN 'PRIMARY KEY'
            WHEN c.contype = 'u' THEN 'UNIQUE'
            ELSE c.contype::text
        END AS constraint_type,
        pg_get_constraintdef(c.oid) AS definition,
        ccu.table_name AS referenced_table,
        array_to_string(array_agg(ccu.column_name), ', ') AS referenced_columns,
        array_to_string(array_agg(kcu.column_name), ', ') AS column_names
    FROM
        pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class cl ON cl.oid = c.conrelid
        LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = c.conname
        LEFT JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = c.conname
    WHERE
        n.nspname = 'public'
        AND cl.relname = $1
    GROUP BY
        c.conname, c.contype, c.oid, ccu.table_name
    ORDER BY
        c.contype, c.conname
    """
    
    constraints = await execute_query(constraint_query, [table_name])
    
    if constraints:
        print("\nRESTRICCIONES:")
        # Convertir la lista de diccionarios a una lista de listas
        constraint_data = [[c['constraint_name'], c['constraint_type'], c['column_names'], c.get('referenced_table', ''), c.get('referenced_columns', '')] for c in constraints]
        print(tabulate(constraint_data, 
                        headers=["Nombre", "Tipo", "Columnas", "Tabla referenciada", "Columnas referenciadas"], 
                        tablefmt="grid"))
    else:
        print(f"No se encontraron restricciones para la tabla {table_name}.")
    
    # 3. Mostrar índices
    index_query = """
    SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary
    FROM
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
    WHERE
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(ix.indkey)
        AND t.relkind = 'r'
        AND t.relname = $1
    ORDER BY
        i.relname, a.attnum
    """
    
    indices = await execute_query(index_query, [table_name])
    
    if indices:
        print("\nÍNDICES:")
        # Convertir la lista de diccionarios a una lista de listas
        index_data = [[idx['index_name'], idx['column_name'], idx['is_unique'], idx['is_primary']] for idx in indices]
        print(tabulate(index_data, headers=["Nombre", "Columna", "Es único", "Es PK"], tablefmt="grid"))
    else:
        print(f"No se encontraron índices para la tabla {table_name}.")

async def show_relationships():
    """Muestra las relaciones entre tablas (foreign keys)"""
    print("\n=== RELACIONES ENTRE TABLAS ===")
    
    query = """
    SELECT
        tc.table_name AS tabla_origen,
        kcu.column_name AS columna_origen,
        ccu.table_name AS tabla_destino,
        ccu.column_name AS columna_destino
    FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
    WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    ORDER BY
        tc.table_name, kcu.column_name
    """
    
    relationships = await execute_query(query)
    
    if relationships:
        # Convertir la lista de diccionarios a una lista de listas
        rel_data = [[r['tabla_origen'], r['columna_origen'], r['tabla_destino'], r['columna_destino']] for r in relationships]
        print(tabulate(rel_data, headers=["Tabla origen", "Columna origen", "Tabla destino", "Columna destino"], tablefmt="grid"))
    else:
        print("No se encontraron relaciones entre tablas.")

async def count_records(table_name):
    """Cuenta el número de registros en una tabla"""
    query = f"SELECT COUNT(*) FROM {table_name}"
    result = await execute_query(query)
    if result and len(result) > 0:
        return result[0][0]
    return 0

async def show_record_counts():
    """Muestra el conteo de registros en cada tabla"""
    print("\n=== CONTEO DE REGISTROS POR TABLA ===")
    
    tables_query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
    """
    
    tables = await execute_query(tables_query)
    
    results = []
    for table in tables:
        table_name = table['table_name']
        count = await count_records(table_name)
        results.append([table_name, count])
    
    print(tabulate(results, headers=["Tabla", "Número de registros"], tablefmt="grid"))

async def show_table_data(table_name, limit=5):
    """Mostrar los primeros registros de una tabla"""
    query = f"SELECT * FROM {table_name} LIMIT {limit}"
    rows = await execute_query(query)
    
    if not rows:
        print(f"No hay datos en la tabla {table_name}.")
        return
    
    print(f"\n=== DATOS DE LA TABLA {table_name} (primeros {limit} registros) ===\n")
    
    # Obtener los nombres de las columnas
    column_query = """
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    """
    columns = await execute_query(column_query, [table_name])
    column_names = [col['column_name'] for col in columns]
    
    # Preparar los datos para tabulate
    data = []
    for row in rows:
        data.append([row.get(col, None) for col in column_names])
    
    print(tabulate(data, headers=column_names, tablefmt="grid"))

async def main():
    # Configurar parser de argumentos
    parser = argparse.ArgumentParser(description="Muestra la estructura de la base de datos")
    parser.add_argument("-v", "--verbose", action="store_true", help="Muestra información detallada")
    parser.add_argument("-p", "--port", type=str, help="Puerto de la base de datos")
    
    # Opciones mutuamente excluyentes para local o contenedor
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--container", action="store_true", help="Usa el contenedor (puerto 5433)")
    group.add_argument("--local", action="store_true", help="Usa la base de datos local (puerto 5432)")
    
    args = parser.parse_args()
    
    # Determinar el puerto a usar
    db_port = None
    if args.port:
        db_port = args.port
    elif args.container:
        db_port = "5433"
    elif args.local:
        db_port = "5432"
    
    try:
        await init_db(db_port)
        
        # Mostrar todas las tablas
        await show_tables()
        
        # Mostrar estructura de tablas principales
        main_tables = ['animals', 'part', 'explotacions', 'users', 'listado_animal', 'listados']
        for table in main_tables:
            await show_table_structure(table)
        
        # Mostrar datos de las tablas listado_animal y listados
        await show_table_data('listado_animal')
        await show_table_data('listados')
        
        # Mostrar relaciones entre tablas
        await show_relationships()
        
        # Mostrar conteo de registros
        await show_record_counts()
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(main())
