"""
Script para depurar el servicio de backups
Este script intentará replicar la funcionalidad de BackupService.list_backups()
pero con más logging para identificar dónde está fallando
"""

import os
import re
import json
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def format_size(size_bytes):
    """Formatea el tamaño en bytes a una representación legible"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0 or unit == 'GB':
            break
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} {unit}"

def list_backups(backup_dir):
    """Versión simplificada de BackupService.list_backups() con más logging"""
    logger.info(f"Intentando listar backups desde directorio: {backup_dir}")
    
    # Verificar si el directorio existe
    if not os.path.exists(backup_dir):
        logger.warning(f"El directorio de backups no existe: {backup_dir}")
        logger.info("Creando directorio de backups")
        try:
            os.makedirs(backup_dir, exist_ok=True)
            logger.info(f"Directorio de backups creado: {backup_dir}")
        except Exception as e:
            logger.error(f"Error al crear el directorio de backups: {str(e)}")
            raise e
        return []
    
    backup_files = []
    
    # Patrón para extraer la fecha del nombre del archivo
    pattern = re.compile(r'backup_masclet_imperi_(\d{8}_\d{6})\.sql')
    
    # Cargar el historial de backups para obtener la información adicional
    history_path = os.path.join(backup_dir, "backup_log.json")
    history = []
    
    if os.path.exists(history_path):
        try:
            logger.info(f"Leyendo archivo de historial: {history_path}")
            with open(history_path, "r", encoding="utf-8") as f:
                history = json.load(f)
            logger.info(f"Historial cargado correctamente. Entradas: {len(history)}")
        except Exception as e:
            logger.error(f"Error al cargar historial de backups: {str(e)}")
            # Continuar sin historial
    else:
        logger.info(f"No existe archivo de historial: {history_path}")
    
    # Crear un diccionario con la información del historial para búsqueda rápida
    history_dict = {entry.get("filename"): entry for entry in history} if history else {}
    
    # Listar archivos en el directorio
    try:
        logger.info(f"Listando archivos en: {backup_dir}")
        all_files = os.listdir(backup_dir)
        logger.info(f"Total de archivos encontrados: {len(all_files)}")
        
        for filename in all_files:
            try:
                if filename.startswith("backup_masclet_imperi_") and filename.endswith(".sql"):
                    file_path = os.path.join(backup_dir, filename)
                    logger.info(f"Procesando archivo de backup: {filename}")
                    
                    # Extraer fecha del nombre
                    match = pattern.match(filename)
                    if match:
                        date_str = match.group(1)
                        try:
                            # Convertir YYYYMMDD_HHMMSS a dd/mm/yyyy HH:MM
                            date_obj = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                            formatted_date = date_obj.strftime("%d/%m/%Y %H:%M")
                        except ValueError as e:
                            logger.error(f"Error al formatear fecha de {filename}: {str(e)}")
                            formatted_date = "Fecha desconocida"
                    else:
                        formatted_date = "Fecha desconocida"
                    
                    # Obtener tamaño del archivo
                    try:
                        size_bytes = os.path.getsize(file_path)
                        size = format_size(size_bytes)
                    except Exception as e:
                        logger.error(f"Error al obtener tamaño del archivo {filename}: {str(e)}")
                        size_bytes = 0
                        size = "Desconocido"
                    
                    # Obtener información adicional del historial si existe
                    history_entry = history_dict.get(filename, {})
                    
                    backup_info = {
                        "filename": filename,
                        "date": formatted_date,
                        "size": size,
                        "size_bytes": size_bytes,
                        "created_by": history_entry.get("created_by", "sistema"),
                        "is_complete": True,
                        "content_type": "SQL",
                        "can_restore": True,
                        "backup_type": history_entry.get("backup_type", "manual"),
                        "description": history_entry.get("description", "")
                    }
                    
                    backup_files.append(backup_info)
            except Exception as e:
                logger.error(f"Error al procesar archivo {filename}: {str(e)}")
                # Continuar con el siguiente archivo
        
        logger.info(f"Total de backups encontrados: {len(backup_files)}")
        
        # Ordenar por fecha (más reciente primero)
        backup_files = sorted(backup_files, key=lambda x: x["filename"], reverse=True)
        return backup_files
    
    except Exception as e:
        logger.error(f"Error inesperado al listar backups: {str(e)}")
        raise e

def main():
    # Ruta del directorio de backups en el proyecto
    current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    backup_dir = os.path.join(current_dir, "backend", "backups")
    
    logger.info(f"Directorio actual: {current_dir}")
    logger.info(f"Directorio de backups a verificar: {backup_dir}")
    
    try:
        backups = list_backups(backup_dir)
        logger.info(f"Backups encontrados: {len(backups)}")
        
        # Mostrar información de los backups
        for i, backup in enumerate(backups):
            logger.info(f"Backup {i+1}: {backup['filename']} - {backup['date']} - {backup['size']}")
        
    except Exception as e:
        logger.error(f"Error al ejecutar el script: {str(e)}")

if __name__ == "__main__":
    main()
