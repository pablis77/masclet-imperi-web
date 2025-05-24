#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para ejecutar un backup automático
Autor: Cascade AI
Fecha: 24/05/2025
"""

import os
import sys
import subprocess
import logging
import datetime
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Obtener la ruta base del proyecto
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
BACKUP_DIR = BASE_DIR / "backend" / "backups"
SCRIPT_DIR = BASE_DIR / "new_tests" / "complementos"
AUTO_BACKUP_SCRIPT = SCRIPT_DIR / "auto_backup.py"

def ejecutar_backup_automatico():
    """Ejecuta un backup automático utilizando el script auto_backup.py"""
    logger.info("Iniciando backup automático...")
    
    # Verificar que el script existe
    if not AUTO_BACKUP_SCRIPT.exists():
        logger.error(f"El script {AUTO_BACKUP_SCRIPT} no existe")
        return False
    
    # Verificar que el directorio de backups existe
    if not BACKUP_DIR.exists():
        logger.info(f"Creando directorio de backups: {BACKUP_DIR}")
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Ejecutar el script de backup
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        cmd = [
            sys.executable,
            str(AUTO_BACKUP_SCRIPT),
            "--after-change",
            "--description", f"Backup automático ejecutado manualmente el {timestamp}"
        ]
        
        logger.info(f"Ejecutando comando: {' '.join(cmd)}")
        
        # Ejecutar el comando
        process = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Verificar si el comando se ejecutó correctamente
        if process.returncode != 0:
            logger.error(f"Error durante el backup: {process.stderr}")
            return False
        
        logger.info(f"Salida del comando: {process.stdout}")
        logger.info("Backup automático completado exitosamente")
        
        # Listar los backups existentes
        listar_backups()
        
        return True
    
    except Exception as e:
        logger.error(f"Error durante el backup: {str(e)}")
        return False

def listar_backups():
    """Lista los backups existentes en el directorio de backups"""
    logger.info(f"Listando backups en {BACKUP_DIR}...")
    
    if not BACKUP_DIR.exists():
        logger.error(f"El directorio {BACKUP_DIR} no existe")
        return
    
    # Listar los archivos de backup
    backups = list(BACKUP_DIR.glob("*.sql"))
    
    if not backups:
        logger.info("No se encontraron backups")
        return
    
    logger.info(f"Se encontraron {len(backups)} backups:")
    
    # Ordenar los backups por fecha de modificación (más reciente primero)
    backups.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    
    # Mostrar los backups
    for i, backup in enumerate(backups[:10], 1):  # Mostrar solo los 10 más recientes
        size_mb = backup.stat().st_size / (1024 * 1024)
        mod_time = datetime.datetime.fromtimestamp(backup.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"{i}. {backup.name} - {size_mb:.2f} MB - {mod_time}")
    
    if len(backups) > 10:
        logger.info(f"... y {len(backups) - 10} más")

if __name__ == "__main__":
    logger.info("=== EJECUTAR BACKUP AUTOMÁTICO ===")
    
    # Ejecutar backup automático
    resultado = ejecutar_backup_automatico()
    
    if resultado:
        logger.info("✅ Backup automático completado exitosamente")
        sys.exit(0)
    else:
        logger.error("❌ Error al ejecutar el backup automático")
        sys.exit(1)
