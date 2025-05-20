#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para listar todas las tablas existentes en la base de datos.
"""

import asyncio
import logging
import asyncpg

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)8s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Configuración de la base de datos
DB_HOST = "localhost"
DB_PORT = 5433
DB_USER = "postgres"
DB_PASS = "1234"
DB_NAME = "masclet_imperi"

async def list_tables():
    """Lista todas las tablas existentes en la base de datos"""
    
    logger.info(f"Conectando a la base de datos: {DB_NAME} en {DB_HOST}:{DB_PORT}")
    
    try:
        # Conectar a PostgreSQL
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        
        logger.info("Conexión establecida correctamente")
        
        # Consulta para obtener todas las tablas
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
        """
        
        logger.info("Ejecutando consulta para listar tablas...")
        tables = await conn.fetch(query)
        
        # Mostrar la lista de tablas
        print("\n======= TABLAS EXISTENTES =======")
        for table in tables:
            print(f"- {table['table_name']}")
        print("================================\n")
        
        # Para cada tabla, obtener sus columnas
        print("\n======= ESTRUCTURA DE TABLAS =======")
        for table in tables:
            table_name = table['table_name']
            
            # Consulta para obtener las columnas de la tabla
            columns_query = f"""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '{table_name}'
            ORDER BY ordinal_position;
            """
            
            columns = await conn.fetch(columns_query)
            
            print(f"\nTabla: {table_name}")
            print("-" * (len(table_name) + 7))
            for column in columns:
                nullable = "NULL" if column['is_nullable'] == 'YES' else "NOT NULL"
                print(f"  {column['column_name']} ({column['data_type']}) {nullable}")
        print("================================\n")
        
        # Cerrar conexión
        await conn.close()
        
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {str(e)}")
        print(f"\n❌ Error: {str(e)}")

async def main():
    """Función principal del script"""
    print("\n🔍 Listando tablas de la base de datos...\n")
    await list_tables()

if __name__ == "__main__":
    asyncio.run(main())
