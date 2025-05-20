#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para corregir el dashboard_service y eliminar el filtro de 2010 en las consultas de partos.
Este script modifica el archivo dashboard_service.py para eliminar esa restricción.
"""

import sys
import os
import asyncio
import logging
import asyncpg
import re
from datetime import date

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)8s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Configuración de la base de datos
DB_HOST = "localhost"
DB_PORT = 5433
DB_USER = "postgres"
DB_PASS = "1234"
DB_NAME = "masclet_imperi"

# Ruta del archivo a modificar
DASHBOARD_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'app', 'services', 'dashboard_service.py'))

async def verificar_partos_por_genero():
    """Verificar la distribución de partos por género directamente en la base de datos"""
    logger.info("Conectando a PostgreSQL...")
    
    try:
        # Conectar a PostgreSQL
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        
        logger.info("Conexión establecida")
        
        # Contar todos los partos por género
        query = """
        SELECT "GenereT", COUNT(*) as total
        FROM part
        WHERE "GenereT" IS NOT NULL
        GROUP BY "GenereT"
        ORDER BY "GenereT"
        """
        
        results = await conn.fetch(query)
        
        logger.info("Distribución de partos por género:")
        total = 0
        for row in results:
            genero = row['GenereT']
            count = row['total']
            total += count
            logger.info(f"{genero}: {count} partos")
        
        logger.info(f"Total de partos con género: {total}")
        
        # Verificar si hay partos antes de 2010
        query_pre_2010 = """
        SELECT COUNT(*) as total
        FROM part
        WHERE EXTRACT(YEAR FROM part) < 2010
        """
        
        total_pre_2010 = await conn.fetchval(query_pre_2010)
        
        logger.info(f"Partos antes de 2010: {total_pre_2010}")
        
        if total_pre_2010 > 0:
            logger.info("¡ATENCIÓN! Hay partos anteriores a 2010 que podrían no estar siendo incluidos en el dashboard")
        
        await conn.close()
        logger.info("Conexión cerrada")
        
        return total_pre_2010 > 0  # Devuelve True si hay partos previos a 2010
        
    except Exception as e:
        logger.error(f"Error al verificar partos: {e}")
        return False

def corregir_dashboard_service():
    """Corregir el archivo dashboard_service.py para eliminar el filtro de 2010"""
    
    try:
        # Leer el archivo
        with open(DASHBOARD_PATH, 'r', encoding='utf-8') as f:
            contenido = f.read()
        
        # Contar ocurrencias de '2010'
        ocurrencias = contenido.count('2010')
        logger.info(f"Ocurrencias de '2010' encontradas: {ocurrencias}")
        
        # Reemplazar todos los casos donde se usa 2010 como fecha de inicio
        contenido_modificado = re.sub(
            r'start_date = date\(2010, 1, 1\)',
            'start_date = date(1900, 1, 1)  # Modificado para incluir TODOS los partos históricos',
            contenido
        )
        
        # Reemplazar comentarios que mencionan 2010
        contenido_modificado = re.sub(
            r'# Usar 2010 como fecha de inicio para todos los datos históricos',
            '# Usar una fecha muy antigua (1900) para incluir TODOS los datos históricos',
            contenido_modificado
        )
        
        # Reemplazar otras referencias a 2010
        contenido_modificado = re.sub(
            r'# Si no se especifican fechas, usar desde 2010 hasta hoy',
            '# Si no se especifican fechas, usar desde 1900 hasta hoy (para incluir TODOS los datos)',
            contenido_modificado
        )
        
        # Contar nuevas ocurrencias
        nuevas_ocurrencias = contenido_modificado.count('2010')
        ocurrencias_reemplazadas = ocurrencias - nuevas_ocurrencias
        
        logger.info(f"Ocurrencias de '2010' reemplazadas: {ocurrencias_reemplazadas}")
        
        # Guardar el archivo modificado
        with open(DASHBOARD_PATH, 'w', encoding='utf-8') as f:
            f.write(contenido_modificado)
        
        logger.info(f"Archivo guardado: {DASHBOARD_PATH}")
        
        return True
    
    except Exception as e:
        logger.error(f"Error al corregir el dashboard_service: {e}")
        return False

async def main():
    """Función principal que ejecuta la verificación y corrección"""
    logger.info("=== INICIANDO CORRECCIÓN DEL DASHBOARD SERVICE ===")
    
    # 1. Verificar si hay partos antes de 2010
    hay_partos_pre_2010 = await verificar_partos_por_genero()
    
    # 2. Si hay partos pre-2010, corregir el dashboard_service
    if hay_partos_pre_2010:
        logger.info("Corrigiendo dashboard_service.py para eliminar la restricción de 2010...")
        if corregir_dashboard_service():
            logger.info("¡CORRECCIÓN EXITOSA! Ahora el dashboard incluirá todos los partos históricos")
        else:
            logger.error("Error al corregir el dashboard_service.py")
    else:
        logger.info("No se detectaron partos anteriores a 2010, no es necesario corregir el dashboard_service.py")
    
    logger.info("=== FINALIZADA LA CORRECCIÓN DEL DASHBOARD ===")

if __name__ == "__main__":
    asyncio.run(main())
