#!/usr/bin/env python3
"""
Script para migrar datos entre la base de datos local y el contenedor Docker.

Este script transfiere todos los datos de las tablas principales (animales, partos, usuarios)
desde la base de datos local (puerto 5432) a la base de datos del contenedor (puerto 5433).
"""
import os
import sys
import asyncio
import logging
import asyncpg
from dotenv import load_dotenv
from datetime import datetime

# Agregar directorio raíz al path para poder importar desde backend
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_connection(host, port, user, password, db_name):
    """Establece una conexión a la base de datos PostgreSQL."""
    try:
        conn = await asyncpg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=db_name
        )
        return conn
    except Exception as e:
        logger.error(f"Error conectando a {host}:{port}/{db_name}: {str(e)}")
        raise

async def migrar_tabla(source_conn, dest_conn, tabla, id_column='id'):
    """Migra los datos de una tabla desde la fuente al destino."""
    # Obtener los datos de la tabla fuente
    logger.info(f"Obteniendo datos de la tabla {tabla}...")
    try:
        datos = await source_conn.fetch(f"SELECT * FROM {tabla};")
        logger.info(f"Se encontraron {len(datos)} registros en la tabla {tabla}.")
        
        # Primero, eliminamos todos los registros de la tabla destino para evitar duplicados
        # Solo para tablas que no son críticas o que se pueden reconstruir completamente
        if tabla != 'users':  # No queremos eliminar usuarios por seguridad
            logger.info(f"Limpiando tabla {tabla} en el destino...")
            await dest_conn.execute(f"DELETE FROM {tabla};")
        
        # Reiniciar la secuencia del ID si es necesario
        if tabla != 'users':
            logger.info(f"Reiniciando secuencia en tabla {tabla}...")
            await dest_conn.execute(f"ALTER SEQUENCE {tabla}_{id_column}_seq RESTART WITH 1;")
        
        # Insertar los datos en la tabla destino
        count = 0
        for dato in datos:
            # Convertir el Record a un diccionario
            dato_dict = dict(dato)
            
            # Construir la consulta INSERT
            columns = list(dato_dict.keys())
            # Poner comillas dobles alrededor de los nombres de columnas que contienen mayúsculas
            quoted_columns = [
                f'"{col}"' if any(c.isupper() for c in col) else col 
                for col in columns
            ]
            placeholders = [f"${i+1}" for i in range(len(columns))]
            values = list(dato_dict.values())
            
            # Construir la parte SET preservando mayúsculas/minúsculas
            set_clauses = []
            for col, quoted_col in zip(columns, quoted_columns):
                if col != id_column:
                    set_clauses.append(f"{quoted_col} = EXCLUDED.{quoted_col}")
            
            query = f"""
            INSERT INTO {tabla} ({', '.join(quoted_columns)})
            VALUES ({', '.join(placeholders)})
            ON CONFLICT ({id_column}) DO UPDATE
            SET {', '.join(set_clauses)}
            """
            
            try:
                await dest_conn.execute(query, *values)
                count += 1
            except Exception as e:
                logger.error(f"Error insertando registro en {tabla}: {str(e)}")
                logger.error(f"Query: {query}")
                logger.error(f"Valores: {values}")
        
        logger.info(f"Se migraron {count} registros a la tabla {tabla}.")
    except Exception as e:
        logger.error(f"Error migrando tabla {tabla}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

async def migrar_datos():
    """Función principal para migrar datos entre bases de datos."""
    # Cargar variables de entorno
    env_path = os.path.join(root_path, 'backend', '.env')
    load_dotenv(env_path)
    
    # Configuración de conexión
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pass = os.getenv("POSTGRES_PASSWORD", "1234")
    db_name = os.getenv("POSTGRES_DB", "masclet_imperi")
    
    # Conexión a la base de datos local (fuente)
    source_host = "localhost"
    source_port = 5432
    
    # Conexión a la base de datos del contenedor (destino)
    dest_host = "localhost"
    dest_port = 5433
    
    logger.info(f"Conectando a la base de datos fuente: {source_host}:{source_port}/{db_name}")
    source_conn = await get_connection(source_host, source_port, db_user, db_pass, db_name)
    
    logger.info(f"Conectando a la base de datos destino: {dest_host}:{dest_port}/{db_name}")
    dest_conn = await get_connection(dest_host, dest_port, db_user, db_pass, db_name)
    
    try:
        # Verificar conexiones
        source_version = await source_conn.fetchval("SELECT version();")
        dest_version = await dest_conn.fetchval("SELECT version();")
        
        logger.info(f"Conexión a fuente exitosa. PostgreSQL versión: {source_version}")
        logger.info(f"Conexión a destino exitosa. PostgreSQL versión: {dest_version}")
        
        # Verificar tablas en la fuente
        tablas_fuente = await source_conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        )
        logger.info(f"Tablas en la fuente: {[t['table_name'] for t in tablas_fuente]}")
        
        # Verificar tablas en el destino
        tablas_destino = await dest_conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        )
        logger.info(f"Tablas en el destino: {[t['table_name'] for t in tablas_destino]}")
        
        # Lista de tablas a migrar en orden (para respetar las restricciones de clave foránea)
        tablas = ['users', 'animals', 'part', 'imports']
        
        # Migrar cada tabla
        for tabla in tablas:
            if tabla in [t['table_name'] for t in tablas_fuente] and tabla in [t['table_name'] for t in tablas_destino]:
                logger.info(f"Migrando tabla {tabla}...")
                await migrar_tabla(source_conn, dest_conn, tabla)
            else:
                logger.warning(f"La tabla {tabla} no existe en ambas bases de datos. Se omitirá.")
        
        # Verificar resultados después de la migración
        for tabla in tablas:
            if tabla in [t['table_name'] for t in tablas_destino]:
                count_source = await source_conn.fetchval(f"SELECT COUNT(*) FROM {tabla};")
                count_dest = await dest_conn.fetchval(f"SELECT COUNT(*) FROM {tabla};")
                logger.info(f"Tabla {tabla}: {count_source} registros en fuente, {count_dest} registros en destino")
    
    finally:
        # Cerrar conexiones
        await source_conn.close()
        await dest_conn.close()
        logger.info("Conexiones cerradas.")

async def main():
    try:
        await migrar_datos()
        logger.info("Migración completada con éxito.")
    except Exception as e:
        logger.error(f"Error en la migración: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
