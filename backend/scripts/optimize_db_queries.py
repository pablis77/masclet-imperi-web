#!/usr/bin/env python
"""
Script para optimizar las consultas SQL críticas mediante la creación
de índices en las tablas principales del sistema Masclet Imperi.

Este script mejora el rendimiento de las consultas más utilizadas en
la aplicación, especialmente las del dashboard.
"""
import asyncio
import os
import sys
from datetime import datetime

# Añadir el directorio raíz al path para importaciones
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings
from tortoise import Tortoise, connections
from app.core.logging import setup_logging

# Configurar el logging
logger = setup_logging('optimize_db')

# SQL para crear los índices necesarios
INDEXES = [
    # Índices para la tabla animals (vacas y toros)
    """
    CREATE INDEX IF NOT EXISTS idx_animals_explotacio ON animals (explotacio);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_animals_nom ON animals (nom);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_animals_genere ON animals (genere);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_animals_estado ON animals (estado);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_animals_dob ON animals (dob);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_animals_alletar ON animals (alletar);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_animals_quadra ON animals (quadra);
    """,
    # Índice compuesto para búsquedas frecuentes en el dashboard
    """
    CREATE INDEX IF NOT EXISTS idx_animals_compound_dashboard ON animals (explotacio, genere, estado);
    """,
    
    # Índices para la tabla part (partos)
    """
    CREATE INDEX IF NOT EXISTS idx_part_animal_id ON part (animal_id);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_part_part ON part (part);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_part_generet ON part (GenereT);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_part_estadot ON part (EstadoT);
    """,
    # Índice compuesto para estadísticas de partos
    """
    CREATE INDEX IF NOT EXISTS idx_part_compound_stats ON part (animal_id, part, GenereT, EstadoT);
    """,
    
    # Índices para la tabla imports (historial de importaciones)
    """
    CREATE INDEX IF NOT EXISTS idx_imports_status ON imports (status);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_imports_created_at ON imports (created_at);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_imports_user_id ON imports (user_id);
    """,
    
    # Índices para las búsquedas por texto en animales
    """
    CREATE INDEX IF NOT EXISTS idx_animals_name_pattern ON animals (LOWER(nom));
    """,
]

# Comprobar y añadir índices específicos para PostgreSQL
POSTGRES_SPECIFIC_INDEXES = [
    # Índice de texto para búsqueda de animales por nombre (solo PostgreSQL)
    """
    CREATE INDEX IF NOT EXISTS idx_animals_name_trigram ON animals 
    USING gin (nom gin_trgm_ops);
    """,
    
    # Índice GIN para búsqueda de texto completo (en campos múltiples)
    """
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    """,
]

async def optimize_database():
    """Ejecuta las optimizaciones en la base de datos."""
    await Tortoise.init(
        db_url=settings.database_url(),
        modules={"models": settings.MODELS}
    )
    
    time_started = datetime.now()
    logger.info(f"Comenzando optimizaciones de base de datos a las {time_started}")
    
    # Obtener conexión directa para ejecutar SQL personalizado
    conn = connections.get("default")
    
    created_indexes_count = 0
    
    # Crear los índices estándar
    for index_sql in INDEXES:
        try:
            await conn.execute_query(index_sql)
            created_indexes_count += 1
            logger.info(f"✅ Índice creado correctamente: {index_sql.strip()}")
        except Exception as e:
            logger.error(f"❌ Error al crear índice: {str(e)}")
            logger.error(f"SQL: {index_sql.strip()}")
    
    # Verificar si estamos en PostgreSQL para los índices específicos
    if "postgres" in settings.database_url().lower():
        logger.info("Detectado PostgreSQL: Añadiendo índices específicos para Postgres")
        
        for pg_index_sql in POSTGRES_SPECIFIC_INDEXES:
            try:
                await conn.execute_query(pg_index_sql)
                created_indexes_count += 1
                logger.info(f"✅ Índice específico de PostgreSQL creado: {pg_index_sql.strip()}")
            except Exception as e:
                logger.error(f"❌ Error al crear índice PostgreSQL: {str(e)}")
                logger.error(f"SQL: {pg_index_sql.strip()}")
    
    time_finished = datetime.now()
    duration = (time_finished - time_started).total_seconds()
    
    logger.info(f"Optimización finalizada a las {time_finished}")
    logger.info(f"Tiempo total: {duration:.2f} segundos")
    logger.info(f"Índices creados/verificados: {created_indexes_count}")
    
    # Analizar las tablas para optimizar el planificador (solo PostgreSQL)
    if "postgres" in settings.database_url().lower():
        try:
            logger.info("Ejecutando ANALYZE para actualizar estadísticas...")
            await conn.execute_query("ANALYZE;")
            logger.info("✅ ANALYZE completado correctamente")
        except Exception as e:
            logger.error(f"❌ Error al ejecutar ANALYZE: {str(e)}")
    
    await Tortoise.close_connections()
    logger.info("Conexiones cerradas")

if __name__ == "__main__":
    try:
        print("Iniciando optimización de la base de datos...")
        asyncio.run(optimize_database())
        print("✅ Optimización completada con éxito!")
    except KeyboardInterrupt:
        print("\n⚠️ Proceso cancelado por el usuario")
    except Exception as e:
        print(f"❌ Error durante la optimización: {str(e)}")
        sys.exit(1)
