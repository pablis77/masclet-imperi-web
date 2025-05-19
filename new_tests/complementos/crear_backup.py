#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para crear backups de la base de datos manualmente
"""

import os
import subprocess
import datetime
import sys
import logging
from pathlib import Path

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Configuración del backup
POSTGRES_CONTAINER = "masclet-db-new"
MAX_BACKUPS = 7
BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", "backups")

def crear_backup():
    """Crear un backup de la base de datos PostgreSQL"""
    
    # Verificar que el directorio de backups existe
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        logger.info(f"Directorio de backups creado: {BACKUP_DIR}")
    
    # Crear timestamp y nombre de archivo
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_masclet_imperi_{timestamp}.sql"
    
    # Ruta completa del archivo de backup
    backup_path = os.path.join(BACKUP_DIR, filename)
    
    # Verificar que el contenedor Docker está en ejecución
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", f"name={POSTGRES_CONTAINER}", "--format", "{{.Names}}"],
            capture_output=True,
            text=True,
            check=True
        )
        
        if POSTGRES_CONTAINER not in result.stdout:
            logger.error(f"El contenedor {POSTGRES_CONTAINER} no está en ejecución")
            subprocess.run(["docker", "start", POSTGRES_CONTAINER], check=True)
            logger.info(f"Contenedor {POSTGRES_CONTAINER} iniciado")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error al verificar estado del contenedor Docker: {e}")
        return None
    
    # Crear el backup
    try:
        logger.info(f"Creando backup en {backup_path}")
        
        # Obtener usuario y nombre de la base de datos
        user = "postgres"
        db_name = "masclet_imperi"
        
        # Ejecutar pg_dump en el contenedor
        process = subprocess.run(
            ["docker", "exec", POSTGRES_CONTAINER, "pg_dump", "-U", user, db_name],
            stdout=open(backup_path, "w", encoding="utf-8"),
            stderr=subprocess.PIPE,
            text=True
        )
        
        if process.returncode != 0:
            logger.error(f"Error al crear backup: {process.stderr}")
            return None
        
        # Obtener tamaño del archivo
        size_bytes = os.path.getsize(backup_path)
        size = format_size(size_bytes)
        
        logger.info(f"Backup creado correctamente: {filename} ({size})")
        
        # Limpiar backups antiguos
        limpiar_backups_antiguos()
        
        return {
            "filename": filename,
            "path": backup_path,
            "size": size,
            "size_bytes": size_bytes,
            "date": datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        }
    
    except Exception as e:
        logger.error(f"Error al crear backup: {e}")
        return None

def format_size(size_bytes):
    """
    Formatea el tamaño en bytes a un formato legible
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024 or unit == 'GB':
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024

def limpiar_backups_antiguos():
    """
    Elimina backups antiguos dejando solo los MAX_BACKUPS más recientes
    """
    try:
        # Obtener todos los archivos de backup
        backups = []
        for file in os.listdir(BACKUP_DIR):
            if file.startswith("backup_masclet_imperi_") and file.endswith(".sql"):
                file_path = os.path.join(BACKUP_DIR, file)
                backups.append((file_path, os.path.getmtime(file_path)))
        
        # Ordenar por fecha de modificación (más reciente primero)
        backups.sort(key=lambda x: x[1], reverse=True)
        
        # Eliminar backups antiguos
        if len(backups) > MAX_BACKUPS:
            for file_path, _ in backups[MAX_BACKUPS:]:
                try:
                    os.remove(file_path)
                    logger.info(f"Backup antiguo eliminado: {os.path.basename(file_path)}")
                except OSError as e:
                    logger.error(f"Error al eliminar backup antiguo {file_path}: {e}")
    
    except Exception as e:
        logger.error(f"Error al limpiar backups antiguos: {e}")

def listar_backups():
    """
    Lista todos los backups disponibles
    """
    backups = []
    
    try:
        for file in os.listdir(BACKUP_DIR):
            if file.startswith("backup_masclet_imperi_") and file.endswith(".sql"):
                file_path = os.path.join(BACKUP_DIR, file)
                size_bytes = os.path.getsize(file_path)
                mtime = os.path.getmtime(file_path)
                date = datetime.datetime.fromtimestamp(mtime).strftime("%d/%m/%Y %H:%M:%S")
                
                backups.append({
                    "filename": file,
                    "path": file_path,
                    "size": format_size(size_bytes),
                    "size_bytes": size_bytes,
                    "date": date
                })
        
        # Ordenar por fecha (más reciente primero)
        backups.sort(key=lambda x: x["filename"], reverse=True)
        
    except Exception as e:
        logger.error(f"Error al listar backups: {e}")
    
    return backups

if __name__ == "__main__":
    try:
        # Mostrar lista de backups actuales
        print("\n=== BACKUPS DISPONIBLES ===")
        backups = listar_backups()
        
        if not backups:
            print("No hay backups disponibles.")
        else:
            for i, backup in enumerate(backups):
                print(f"{i+1}. {backup['filename']} - {backup['date']} - {backup['size']}")
        
        # Crear nuevo backup
        print("\n=== CREAR NUEVO BACKUP ===")
        respuesta = input("¿Desea crear un nuevo backup? (s/n): ")
        
        if respuesta.lower() == "s":
            print("Creando backup...")
            result = crear_backup()
            
            if result:
                print(f"\nBackup creado correctamente:")
                print(f"Nombre: {result['filename']}")
                print(f"Tamaño: {result['size']}")
                print(f"Fecha: {result['date']}")
                print(f"Ruta: {result['path']}")
            else:
                print("\nError al crear el backup. Revise los logs para más información.")
    
    except KeyboardInterrupt:
        print("\nOperación cancelada por el usuario.")
        sys.exit(0)
