#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para verificar el conteo correcto de crías por género (GenereT)
comparando el conteo directo con lo que devuelve el dashboard.
"""

import sys
import os
import json
import asyncio
import logging
import asyncpg
from collections import defaultdict
from datetime import datetime, date
from typing import Dict, List, Any

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)8s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Configuración de la base de datos
DB_HOST = "localhost"
DB_PORT = 5433
DB_USER = "postgres"
DB_PASS = "1234"
DB_NAME = "masclet_imperi"

async def test_count_genere_cria():
    """
    Test para verificar el conteo correcto de crías por género (GenereT)
    comparando diferentes consultas directas a la base de datos.
    """
    logger.info("=== INICIO TEST: CONTEO DE GÉNEROS DE CRÍAS ===")
    
    try:
        # Conectar a PostgreSQL
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        
        logger.info("Conexión a PostgreSQL establecida correctamente")
        
        # 1. Conteo directo de todos los géneros de crías
        query_generos = """
        SELECT "GenereT", COUNT(*) as total
        FROM part
        WHERE "GenereT" IS NOT NULL
        GROUP BY "GenereT"
        ORDER BY "GenereT"
        """
        
        results_generos = await conn.fetch(query_generos)
        
        # Formatear resultados de la consulta directa
        generos_count = {row['GenereT']: row['total'] for row in results_generos}
        total_partos_con_genero = sum(generos_count.values())
        
        logger.info(f"CONTEO DIRECTO SQL DE GÉNEROS:")
        logger.info(f"Machos (M): {generos_count.get('M', 0)}")
        logger.info(f"Hembras (F): {generos_count.get('F', 0)}")
        logger.info(f"Esforrada: {generos_count.get('esforrada', 0)}")
        logger.info(f"TOTAL PARTOS CON GÉNERO: {total_partos_con_genero}")
        
        # 2. Conteo total de partos en la base de datos
        query_total = "SELECT COUNT(*) as total FROM part"
        total_partos_all = await conn.fetchval(query_total)
        
        logger.info(f"TOTAL PARTOS EN BASE DE DATOS: {total_partos_all}")
        
        # 3. Contar partos sin género definido
        query_nulls = "SELECT COUNT(*) as total FROM part WHERE \"GenereT\" IS NULL"
        partos_sin_genero = await conn.fetchval(query_nulls)
        
        logger.info(f"PARTOS SIN GÉNERO DEFINIDO: {partos_sin_genero}")
        logger.info(f"VERIFICACIÓN: {total_partos_con_genero} + {partos_sin_genero} = {total_partos_con_genero + partos_sin_genero}")
        logger.info(f"DEBE SER IGUAL A: {total_partos_all}")
        
        # 4. Verificar partos por año para ver si hay filtrado por fecha
        query_by_year = """
        SELECT EXTRACT(YEAR FROM part) as year, COUNT(*) as total
        FROM part
        WHERE part IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM part)
        ORDER BY year
        """
        results_by_year = await conn.fetch(query_by_year)
        
        logger.info(f"\nPARTOS POR AÑO:")
        total_todos_años = 0
        total_desde_2010 = 0
        
        for row in results_by_year:
            year = int(row['year'])
            count = row['total']
            logger.info(f"Año {year}: {count} partos")
            total_todos_años += count
            if year >= 2010:
                total_desde_2010 += count
        
        logger.info(f"\nTotal partos todos los años: {total_todos_años}")
        logger.info(f"Total partos desde 2010: {total_desde_2010}")
        logger.info(f"Diferencia (partos antes de 2010): {total_todos_años - total_desde_2010}")
        
        # 5. Contar géneros solo para partos desde 2010
        query_generos_desde_2010 = """
        SELECT "GenereT", COUNT(*) as total
        FROM part
        WHERE "GenereT" IS NOT NULL AND EXTRACT(YEAR FROM part) >= 2010
        GROUP BY "GenereT"
        ORDER BY "GenereT"
        """
        
        results_generos_2010 = await conn.fetch(query_generos_desde_2010)
        generos_count_2010 = {row['GenereT']: row['total'] for row in results_generos_2010}
        total_generos_2010 = sum(generos_count_2010.values())
        
        logger.info(f"\nCONTEO DE GÉNEROS DESDE 2010:")
        logger.info(f"Machos (M): {generos_count_2010.get('M', 0)}")
        logger.info(f"Hembras (F): {generos_count_2010.get('F', 0)}")
        logger.info(f"Esforrada: {generos_count_2010.get('esforrada', 0)}")
        logger.info(f"TOTAL PARTOS CON GÉNERO DESDE 2010: {total_generos_2010}")
        
        # 6. Contar géneros solo para partos antes de 2010
        query_generos_antes_2010 = """
        SELECT "GenereT", COUNT(*) as total
        FROM part
        WHERE "GenereT" IS NOT NULL AND EXTRACT(YEAR FROM part) < 2010
        GROUP BY "GenereT"
        ORDER BY "GenereT"
        """
        
        results_generos_antes_2010 = await conn.fetch(query_generos_antes_2010)
        generos_count_antes_2010 = {row['GenereT']: row['total'] for row in results_generos_antes_2010}
        total_generos_antes_2010 = sum(generos_count_antes_2010.values())
        
        logger.info(f"\nCONTEO DE GÉNEROS ANTES DE 2010:")
        logger.info(f"Machos (M): {generos_count_antes_2010.get('M', 0)}")
        logger.info(f"Hembras (F): {generos_count_antes_2010.get('F', 0)}")
        logger.info(f"Esforrada: {generos_count_antes_2010.get('esforrada', 0)}")
        logger.info(f"TOTAL PARTOS CON GÉNERO ANTES DE 2010: {total_generos_antes_2010}")
        
        # 7. Verificación final de sumas
        logger.info(f"\nVERIFICACIÓN FINAL:")
        logger.info(f"Total géneros desde 2010 + antes de 2010: {total_generos_2010} + {total_generos_antes_2010} = {total_generos_2010 + total_generos_antes_2010}")
        logger.info(f"Debe ser igual a total con género: {total_partos_con_genero}")
        
        logger.info("=== FIN TEST: CONTEO DE GÉNEROS DE CRÍAS ===")
        
    except Exception as e:
        logger.error(f"Error al ejecutar el test: {e}")
        logger.exception("Detalles del error:")
    finally:
        # Cerrar conexión
        if 'conn' in locals():
            await conn.close()
            logger.info("Conexión cerrada")


# Ejecutar el test
if __name__ == "__main__":
    asyncio.run(test_count_genere_cria())
