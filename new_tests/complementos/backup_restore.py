#!/usr/bin/env python3
"""
Script para hacer un respaldo completo de la base de datos local y restaurarlo en el contenedor Docker.
"""
import asyncio
import sys
import os
import logging
import tempfile
import subprocess

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_command(cmd, cwd=None):
    """Ejecuta un comando de shell y devuelve la salida"""
    logger.info(f"Ejecutando: {cmd}")
    process = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=cwd
    )
    stdout, stderr = await process.communicate()
    if process.returncode != 0:
        logger.error(f"Error ejecutando comando: {stderr.decode()}")
        return None
    return stdout.decode()

async def backup_and_restore():
    """Hace un respaldo de la base de datos local y lo restaura en el contenedor"""
    # Comprobamos si pg_dump y psql están en PATH
    try:
        await run_command("where pg_dump")
        await run_command("where psql")
        logger.info("Herramientas de PostgreSQL encontradas en PATH")
    except Exception as e:
        logger.error(f"Error: No se encuentran las herramientas de PostgreSQL en PATH: {e}")
        logger.info("Intentando usar las herramientas desde el contenedor Docker...")
        
    # Crear archivo temporal para el respaldo
    temp_file = os.path.join(tempfile.gettempdir(), "masclet_backup.sql")
    logger.info(f"Creando respaldo temporal en: {temp_file}")
    
    try:
        # Generar script SQL de estructura (solo el esquema, sin datos)
        schema_file = os.path.join(tempfile.gettempdir(), "schema.sql")
        await run_command(f"docker exec masclet-db-new pg_dump -U postgres -d masclet_imperi --schema-only > {schema_file}")
        
        # Verificar si el archivo se creó correctamente
        if os.path.exists(schema_file) and os.path.getsize(schema_file) > 0:
            logger.info(f"Schema creado correctamente: {os.path.getsize(schema_file)} bytes")
        else:
            logger.error(f"Error al crear schema: archivo no existe o está vacío")
            
        # Restaurar estructura en el nuevo contenedor
        await run_command(f"type {schema_file} | docker exec -i masclet-db-new psql -U postgres -d masclet_imperi")
        logger.info("Estructura restaurada en el contenedor")
        
        # Exportar solo los datos (sin estructura) desde la base de datos local
        await run_command(f"pg_dump -h localhost -U postgres -d masclet_imperi --data-only > {temp_file}")
        
        # Verificar si el archivo se creó correctamente
        if os.path.exists(temp_file) and os.path.getsize(temp_file) > 0:
            logger.info(f"Backup creado correctamente: {os.path.getsize(temp_file)} bytes")
        else:
            logger.error(f"Error al crear backup: archivo no existe o está vacío")
        
        # Restaurar los datos en el contenedor
        await run_command(f"type {temp_file} | docker exec -i masclet-db-new psql -U postgres -d masclet_imperi")
        logger.info("Datos restaurados en el contenedor")
        
        # Verificar que la restauración fue exitosa
        result = await run_command("docker exec masclet-db-new psql -U postgres -d masclet_imperi -c \"SELECT COUNT(*) FROM animals;\"")
        logger.info(f"Resultado de verificación: {result}")
        
    except Exception as e:
        logger.error(f"Error durante el proceso de backup/restore: {e}")
        import traceback
        logger.error(traceback.format_exc())
    finally:
        # Limpiar archivos temporales
        if os.path.exists(temp_file):
            os.remove(temp_file)
        if os.path.exists(schema_file):
            os.remove(schema_file)
        logger.info("Archivos temporales eliminados")

async def main():
    await backup_and_restore()

if __name__ == "__main__":
    asyncio.run(main())
