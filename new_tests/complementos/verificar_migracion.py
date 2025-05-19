#!/usr/bin/env python3
"""
Script para verificar que la migración de datos entre bases de datos se realizó correctamente.
Comprueba que no hay duplicados y que los recuentos coinciden entre ambas bases de datos.
"""
import os
import sys
import asyncio
import logging
import asyncpg
from dotenv import load_dotenv
from tabulate import tabulate

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

async def verificar_recuentos(source_conn, dest_conn, tablas):
    """Verifica que los recuentos de registros coincidan entre las bases de datos."""
    resultados = []
    
    for tabla in tablas:
        # Contar registros en la fuente
        source_count = await source_conn.fetchval(f"SELECT COUNT(*) FROM {tabla};")
        
        # Contar registros en el destino
        dest_count = await dest_conn.fetchval(f"SELECT COUNT(*) FROM {tabla};")
        
        # Verificar registros duplicados en el destino (por nombre en animals)
        if tabla == 'animals':
            source_uniq = await source_conn.fetchval(
                "SELECT COUNT(DISTINCT nom) FROM animals;"
            )
            dest_uniq = await dest_conn.fetchval(
                "SELECT COUNT(DISTINCT nom) FROM animals;"
            )
            
            # Contar duplicados por nombre y explotación
            source_dups = await source_conn.fetch(
                """
                SELECT nom, explotacio, COUNT(*) as count
                FROM animals
                GROUP BY nom, explotacio
                HAVING COUNT(*) > 1
                ORDER BY count DESC
                """
            )
            
            dest_dups = await dest_conn.fetch(
                """
                SELECT nom, explotacio, COUNT(*) as count 
                FROM animals
                GROUP BY nom, explotacio
                HAVING COUNT(*) > 1
                ORDER BY count DESC
                """
            )
            
            resultados.append([
                tabla, 
                source_count, 
                dest_count, 
                source_count == dest_count,
                f"Nombres únicos: {source_uniq} (local) vs {dest_uniq} (contenedor)"
            ])
            
            if source_dups:
                logger.warning(f"Encontrados {len(source_dups)} grupos de animales duplicados en la DB local:")
                for dup in source_dups:
                    logger.warning(f"  - Nombre: {dup['nom']}, Explotación: {dup['explotacio']}, Duplicados: {dup['count']}")
            
            if dest_dups:
                logger.warning(f"Encontrados {len(dest_dups)} grupos de animales duplicados en la DB del contenedor:")
                for dup in dest_dups:
                    logger.warning(f"  - Nombre: {dup['nom']}, Explotación: {dup['explotacio']}, Duplicados: {dup['count']}")
        
        # Verificar registros duplicados en la tabla partos (por animal_id y fecha)
        elif tabla == 'part':
            source_dups = await source_conn.fetch(
                """
                SELECT animal_id, part, COUNT(*) as count
                FROM part
                GROUP BY animal_id, part
                HAVING COUNT(*) > 1
                ORDER BY count DESC
                """
            )
            
            dest_dups = await dest_conn.fetch(
                """
                SELECT animal_id, part, COUNT(*) as count
                FROM part
                GROUP BY animal_id, part
                HAVING COUNT(*) > 1
                ORDER BY count DESC
                """
            )
            
            resultados.append([
                tabla, 
                source_count, 
                dest_count, 
                source_count == dest_count,
                ""
            ])
            
            if source_dups:
                logger.warning(f"Encontrados {len(source_dups)} grupos de partos duplicados en la DB local:")
                for dup in source_dups:
                    animal_name = await source_conn.fetchval(
                        "SELECT nom FROM animals WHERE id = $1", dup['animal_id']
                    )
                    logger.warning(f"  - Animal ID: {dup['animal_id']} (Nombre: {animal_name}), Fecha: {dup['part']}, Duplicados: {dup['count']}")
            
            if dest_dups:
                logger.warning(f"Encontrados {len(dest_dups)} grupos de partos duplicados en la DB del contenedor:")
                for dup in dest_dups:
                    animal_name = await dest_conn.fetchval(
                        "SELECT nom FROM animals WHERE id = $1", dup['animal_id']
                    )
                    logger.warning(f"  - Animal ID: {dup['animal_id']} (Nombre: {animal_name}), Fecha: {dup['part']}, Duplicados: {dup['count']}")
        
        # Para el resto de tablas, solo verificamos recuentos
        else:
            resultados.append([
                tabla, 
                source_count, 
                dest_count, 
                source_count == dest_count,
                ""
            ])
    
    # Mostrar resultados en formato de tabla
    headers = ["Tabla", "Registros Local", "Registros Contenedor", "Coincide", "Notas"]
    print("\n" + tabulate(resultados, headers=headers, tablefmt="grid"))
    
    # Verificar si todos los recuentos coinciden
    if all(resultado[3] for resultado in resultados):
        logger.info("✅ Todos los recuentos coinciden. La migración parece correcta.")
    else:
        logger.error("❌ Hay diferencias en los recuentos. Verifica la migración.")

async def verificar_migracion():
    """Función principal para verificar la migración entre bases de datos."""
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
    
    logger.info(f"Conectando a la base de datos local: {source_host}:{source_port}/{db_name}")
    source_conn = await get_connection(source_host, source_port, db_user, db_pass, db_name)
    
    logger.info(f"Conectando a la base de datos contenedor: {dest_host}:{dest_port}/{db_name}")
    dest_conn = await get_connection(dest_host, dest_port, db_user, db_pass, db_name)
    
    try:
        # Verificar versiones de PostgreSQL
        source_version = await source_conn.fetchval("SELECT version();")
        dest_version = await dest_conn.fetchval("SELECT version();")
        
        logger.info(f"PostgreSQL local: {source_version}")
        logger.info(f"PostgreSQL contenedor: {dest_version}")
        
        # Verificar tablas comunes a ambas bases de datos
        tablas_fuente = await source_conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        )
        
        tablas_destino = await dest_conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        )
        
        tablas_fuente_set = {t['table_name'] for t in tablas_fuente}
        tablas_destino_set = {t['table_name'] for t in tablas_destino}
        
        logger.info(f"Tablas en local: {tablas_fuente_set}")
        logger.info(f"Tablas en contenedor: {tablas_destino_set}")
        
        # Tablas comunes a ambas bases de datos
        tablas_comunes = tablas_fuente_set.intersection(tablas_destino_set)
        logger.info(f"Tablas comunes: {tablas_comunes}")
        
        # Tablas que no están en ambas bases de datos
        solo_fuente = tablas_fuente_set - tablas_destino_set
        solo_destino = tablas_destino_set - tablas_fuente_set
        
        if solo_fuente:
            logger.warning(f"Tablas solo en local: {solo_fuente}")
        
        if solo_destino:
            logger.warning(f"Tablas solo en contenedor: {solo_destino}")
        
        # Verificar recuentos
        print("\n" + "="*80)
        print(" VERIFICACIÓN DE MIGRACIÓN DE DATOS ".center(80, "="))
        print("="*80)
        
        # Lista de tablas principales a verificar
        tablas_principales = ['users', 'animals', 'part', 'imports']
        tablas_a_verificar = [t for t in tablas_principales if t in tablas_comunes]
        
        await verificar_recuentos(source_conn, dest_conn, tablas_a_verificar)
        
        print("\n" + "="*80)
    
    finally:
        # Cerrar conexiones
        await source_conn.close()
        await dest_conn.close()
        logger.info("Conexiones cerradas.")

async def main():
    try:
        await verificar_migracion()
    except Exception as e:
        logger.error(f"Error en la verificación: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
