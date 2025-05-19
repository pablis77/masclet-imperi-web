#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import re
import asyncio
import logging
from pathlib import Path
import json
from datetime import datetime
import asyncpg

# Añadir directorio base al path para poder importar módulos
base_dir = str(Path(__file__).parent.parent.parent)
if base_dir not in sys.path:
    sys.path.append(base_dir)

# Configuración de logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)8s] %(message)s', 
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

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
            logger.info(f"Archivo .env encontrado: {env_file}")
            with open(env_file, 'r') as f:
                content = f.read()
                match = re.search(r'DB_PORT\s*=\s*(\d+)', content)
                if match:
                    db_port = match.group(1)
                    logger.info(f"  - DB_PORT={db_port}")
            
            if db_port:
                env_file_usado = env_file
                break
    
    # Si no se encontró en ninguno, usar valor predeterminado
    if not db_port:
        db_port = "5433"  # Valor predeterminado
        logger.warning(f"No se encontró DB_PORT en ninguno de los archivos .env. Usando valor predeterminado: {db_port}")
    else:
        logger.info(f"Usando archivo .env: {env_file_usado}")
        logger.info(f"DB_PORT cargado: {db_port}")
    
    # Construir DATABASE_URL
    database_url = f"postgres://postgres:1234@localhost:{db_port}/masclet_imperi"
    logger.info(f"DATABASE_URL generada: {database_url}")
    
    return database_url

async def column_exists(conn, table_name, column_name):
    """Verifica si una columna existe en una tabla"""
    query = """
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    );
    """
    return await conn.fetchval(query, table_name, column_name)

async def transferir_datos_quadra_a_origen():
    """Transfiere todos los datos de 'quadra' a 'origen' que aún no se hayan transferido"""
    database_url = get_database_url()

    # Conectar a la base de datos
    logger.info(f"Conectando a la base de datos: {database_url}")
    conn = await asyncpg.connect(database_url)
    
    try:
        # Verificar que existan ambas columnas
        existe_quadra = await column_exists(conn, 'animals', 'quadra')
        existe_origen = await column_exists(conn, 'animals', 'origen')
        
        if not existe_quadra or not existe_origen:
            logger.error(f"Error: No existen ambas columnas. quadra: {existe_quadra}, origen: {existe_origen}")
            return False
        
        # Contar registros con quadra pero sin origen
        count_query = """
        SELECT COUNT(*) FROM animals 
        WHERE quadra IS NOT NULL AND origen IS NULL
        """
        count = await conn.fetchval(count_query)
        logger.info(f"Se encontraron {count} registros con 'quadra' pero sin 'origen'")
        
        if count > 0:
            # Actualizar registros donde quadra tiene valor pero origen es NULL
            update_query = """
            UPDATE animals 
            SET origen = quadra 
            WHERE quadra IS NOT NULL AND origen IS NULL
            """
            await conn.execute(update_query)
            logger.info(f"Se actualizaron {count} registros, copiando 'quadra' a 'origen'")
        
        # Verificar si hay diferencias entre quadra y origen
        diff_query = """
        SELECT COUNT(*) FROM animals 
        WHERE quadra IS DISTINCT FROM origen 
        AND (quadra IS NOT NULL OR origen IS NOT NULL)
        """
        diff_count = await conn.fetchval(diff_query)
        
        if diff_count > 0:
            logger.warning(f"¡Alerta! Hay {diff_count} registros donde 'quadra' y 'origen' tienen valores diferentes")
            
            # Mostrar los registros con diferencias para verificación
            records_query = """
            SELECT id, nom, quadra, origen FROM animals 
            WHERE quadra IS DISTINCT FROM origen 
            AND (quadra IS NOT NULL OR origen IS NOT NULL)
            LIMIT 10
            """
            records = await conn.fetch(records_query)
            logger.info("Registros con diferencias (primeros 10):")
            for record in records:
                logger.info(f"  - ID: {record['id']}, Nombre: {record['nom']}, quadra: '{record['quadra']}', origen: '{record['origen']}'")
        else:
            logger.info("Todos los registros tienen los mismos valores en 'quadra' y 'origen'")
        
        return True
    
    finally:
        await conn.close()

async def main():
    logger.info("=== INICIANDO TRANSFERENCIA DE DATOS QUADRA->ORIGEN ===")
    
    success = await transferir_datos_quadra_a_origen()
    
    if success:
        logger.info("=== TRANSFERENCIA COMPLETADA EXITOSAMENTE ===")
        logger.info("Ahora todos los valores de 'quadra' han sido copiados a 'origen'")
        logger.info("Próximos pasos:")
        logger.info("1. Reiniciar el servidor para aplicar los cambios")
        logger.info("2. Verificar que 'origen' funcione correctamente en el frontend")
        logger.info("3. Ejecutar el script 'ocultar_campo_quadra.py' para eliminar completamente la columna 'quadra'")
    else:
        logger.error("=== ERROR EN LA TRANSFERENCIA ===")
        logger.error("Revise los mensajes de error anteriores para solucionar el problema")

if __name__ == "__main__":
    asyncio.run(main())
