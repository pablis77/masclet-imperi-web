#!/usr/bin/env python3
"""
Script simplificado para mostrar la estructura de la base de datos.
"""
import asyncio
import sys
import os
import logging
from tortoise import Tortoise

# Agregar el directorio raíz al path para poder importar desde app
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

# Importar configuración
from backend.app.core.config import settings

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    """Inicializar conexión a base de datos"""
    await Tortoise.init(
        db_url=f"postgres://{settings.postgres_user}:{settings.postgres_password}@{settings.db_host}:{settings.db_port}/{settings.postgres_db}",
        modules={"models": ["backend.app.models.animal", "backend.app.models.user", "backend.app.models.explotacio"]}
    )
    print("Conexión establecida con la base de datos")

async def close_db():
    """Cerrar conexión a base de datos"""
    await Tortoise.close_connections()
    print("Conexión cerrada")

async def execute_query(query, params=None):
    """Ejecuta una consulta SQL y devuelve los resultados"""
    conn = Tortoise.get_connection("default")
    try:
        results = await conn.execute_query(query, params)
        return results[1]  # Resultados de la consulta
    except Exception as e:
        print(f"Error al ejecutar consulta: {str(e)}")
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
        for table in tables:
            print(f"- {table[0]}")
    else:
        print("No se encontraron tablas.")

async def show_columns(table_name):
    """Muestra las columnas de una tabla específica"""
    print(f"\n=== COLUMNAS DE LA TABLA: {table_name} ===")
    
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
        print(f"{'COLUMNA':<20} {'TIPO':<25} {'PERMITE NULL':<15} {'VALOR DEFAULT':<20}")
        print("-" * 80)
        for col in columns:
            print(f"{col[0]:<20} {col[1]:<25} {col[2]:<15} {str(col[3] or ''):<20}")
    else:
        print(f"No se encontraron columnas para la tabla {table_name}.")

async def show_foreign_keys(table_name):
    """Muestra las llaves foráneas de una tabla"""
    print(f"\n=== RELACIONES DE LA TABLA: {table_name} ===")
    
    query = """
    SELECT
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
        AND tc.table_name = $1
    ORDER BY
        kcu.column_name
    """
    
    foreign_keys = await execute_query(query, [table_name])
    
    if foreign_keys:
        print(f"{'COLUMNA ORIGEN':<20} {'TABLA DESTINO':<20} {'COLUMNA DESTINO':<20}")
        print("-" * 60)
        for fk in foreign_keys:
            print(f"{fk[0]:<20} {fk[1]:<20} {fk[2]:<20}")
    else:
        print(f"No se encontraron relaciones para la tabla {table_name}.")

async def show_constraints(table_name):
    """Muestra las restricciones de una tabla"""
    print(f"\n=== RESTRICCIONES DE LA TABLA: {table_name} ===")
    
    query = """
    SELECT
        c.conname AS constraint_name,
        CASE
            WHEN c.contype = 'c' THEN 'CHECK'
            WHEN c.contype = 'f' THEN 'FOREIGN KEY'
            WHEN c.contype = 'p' THEN 'PRIMARY KEY'
            WHEN c.contype = 'u' THEN 'UNIQUE'
            ELSE c.contype::text
        END AS constraint_type,
        pg_get_constraintdef(c.oid) AS definition
    FROM
        pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        JOIN pg_class cl ON cl.oid = c.conrelid
    WHERE
        n.nspname = 'public'
        AND cl.relname = $1
    ORDER BY
        c.contype, c.conname
    """
    
    constraints = await execute_query(query, [table_name])
    
    if constraints:
        print(f"{'NOMBRE':<30} {'TIPO':<15} {'DEFINICIÓN':<40}")
        print("-" * 85)
        for constraint in constraints:
            print(f"{constraint[0]:<30} {constraint[1]:<15} {constraint[2]}")
    else:
        print(f"No se encontraron restricciones para la tabla {table_name}.")

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
    
    if tables:
        print(f"{'TABLA':<25} {'REGISTROS':<10}")
        print("-" * 35)
        for table in tables:
            table_name = table[0]
            count = await count_records(table_name)
            print(f"{table_name:<25} {count:<10}")
    else:
        print("No se encontraron tablas.")

async def main():
    try:
        await init_db()
        
        # 1. Mostrar todas las tablas
        await show_tables()
        
        # 2. Mostrar conteo de registros
        await show_record_counts()
        
        # 3. Mostrar estructura de tablas principales
        main_tables = ['animals', 'part', 'users', 'animal_history']
        for table in main_tables:
            await show_columns(table)
            await show_constraints(table)
            await show_foreign_keys(table)
        
        # 4. Mostrar estructura de tablas de prueba
        test_tables = ['test_custom_dates', 'test_dates']
        print("\n=== TABLAS DE PRUEBA ===")
        for table in test_tables:
            await show_columns(table)
        
    except Exception as e:
        print(f"Error general: {str(e)}")
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(main())
