#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para realizar backups automáticos de la base de datos
Autor: Cascade AI
Fecha: 24/05/2025
"""

import os
import sys
import json
import time
import logging
import subprocess
import datetime
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Configuración
BACKUP_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))) / "backend" / "backups"
BACKUP_LOG_FILE = BACKUP_DIR / "backup_log.json"
DB_CONTAINER = "masclet-db-new"
DB_NAME = "masclet_imperi"
DB_USER = "postgres"

def ensure_backup_dir():
    """Asegura que el directorio de backups exista"""
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir(parents=True)
        logger.info(f"Directorio de backups creado: {BACKUP_DIR}")
    return BACKUP_DIR

def create_backup(description="Backup automático", history_id=None, after_change=False):
    """Crea un backup de la base de datos"""
    logger.info("Iniciando backup de la base de datos...")
    
    # Asegurar que el directorio de backups exista
    ensure_backup_dir()
    
    # Generar nombre de archivo con timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backup_masclet_imperi_{timestamp}.sql"
    backup_filepath = BACKUP_DIR / backup_filename
    
    try:
        # Ejecutar pg_dump dentro del contenedor Docker para crear el backup
        cmd = [
            "docker", "exec", DB_CONTAINER, 
            "pg_dump", "-U", DB_USER, DB_NAME
        ]
        
        logger.info(f"Ejecutando comando: {' '.join(cmd)}")
        
        # Ejecutar el comando y guardar la salida en el archivo de backup
        with open(backup_filepath, "w", encoding="utf-8") as f:
            process = subprocess.run(
                cmd, 
                stdout=f,
                stderr=subprocess.PIPE,
                text=True
            )
        
        # Verificar si el comando se ejecutó correctamente
        if process.returncode != 0:
            logger.error(f"Error durante el backup: {process.stderr}")
            if os.path.exists(backup_filepath):
                os.unlink(backup_filepath)
            return False
        
        # Comprobar que el archivo de backup existe y tiene contenido
        if not os.path.exists(backup_filepath) or os.path.getsize(backup_filepath) == 0:
            logger.error("El archivo de backup está vacío o no se creó correctamente")
            return False
        
        # Registrar el backup en el archivo de log
        backup_info = {
            "filename": backup_filename,
            "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "size": f"{os.path.getsize(backup_filepath) / (1024 * 1024):.2f} MB",
            "size_bytes": os.path.getsize(backup_filepath),
            "description": description,
            "created_by": "sistema",
            "is_auto": True,
            "after_change": after_change
        }
        
        if history_id:
            backup_info["history_id"] = history_id
        
        # Añadir al registro de backups
        backup_log = []
        if os.path.exists(BACKUP_LOG_FILE):
            try:
                with open(BACKUP_LOG_FILE, "r", encoding="utf-8") as f:
                    backup_log = json.load(f)
            except json.JSONDecodeError:
                logger.error(f"Error al leer el archivo de log de backups: {BACKUP_LOG_FILE}")
                backup_log = []
        
        backup_log.append(backup_info)
        
        with open(BACKUP_LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(backup_log, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Backup completado exitosamente: {backup_filepath}")
        logger.info(f"Tamaño del backup: {backup_info['size']}")
        
        return True
    
    except Exception as e:
        logger.error(f"Error durante el backup: {str(e)}")
        if os.path.exists(backup_filepath):
            os.unlink(backup_filepath)
        return False

def cleanup_old_backups(retention_days=7):
    """Elimina backups antiguos basados en el período de retención"""
    logger.info(f"Limpiando backups anteriores a {retention_days} días...")
    
    count = 0
    now = datetime.datetime.now()
    
    for backup_file in BACKUP_DIR.glob("*.sql"):
        try:
            # Obtener la fecha de modificación del archivo
            mtime = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
            age_days = (now - mtime).days
            
            # Eliminar si es más antiguo que el período de retención
            if age_days > retention_days:
                backup_file.unlink()
                logger.info(f"Eliminado backup antiguo: {backup_file.name} (edad: {age_days} días)")
                count += 1
        except Exception as e:
            logger.error(f"Error al procesar archivo {backup_file}: {str(e)}")
    
    logger.info(f"Proceso de limpieza completado. {count} backups antiguos eliminados.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Script de backup automático para Masclet Imperi")
    parser.add_argument("--after-change", action="store_true", help="Indica que el backup se realiza tras un cambio")
    parser.add_argument("--history-id", type=str, help="ID del registro de historial asociado")
    parser.add_argument("--description", type=str, default="Backup automático", help="Descripción del backup")
    parser.add_argument("--retention", type=int, default=7, help="Días de retención para backups antiguos")
    
    args = parser.parse_args()
    
    # Crear backup
    if create_backup(
        description=args.description,
        history_id=args.history_id,
        after_change=args.after_change
    ):
        # Si el backup fue exitoso, limpiar backups antiguos
        cleanup_old_backups(args.retention)
        logger.info("Proceso de backup completado exitosamente")
        sys.exit(0)
    else:
        logger.error("El backup no se completó correctamente")
        sys.exit(1)
