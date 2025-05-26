#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para restaurar la base de datos desde un backup
"""
import os
import sys
import argparse
import subprocess
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def parse_arguments():
    """Parsear los argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(description='Restaurar la base de datos desde un backup')
    parser.add_argument('--list', action='store_true', help='Listar los backups disponibles')
    parser.add_argument('--latest', action='store_true', help='Restaurar el backup más reciente')
    parser.add_argument('--file', help='Archivo de backup específico a restaurar')
    parser.add_argument('--recreate', action='store_true', help='Recrear completamente la base de datos (¡PELIGROSO!)')
    parser.add_argument('--container', default='masclet-db-new', help='Nombre del contenedor PostgreSQL (por defecto: masclet-db-new)')
    parser.add_argument('--user', default='postgres', help='Usuario de PostgreSQL (por defecto: postgres)')
    parser.add_argument('--db', default='masclet_imperi', help='Nombre de la base de datos (por defecto: masclet_imperi)')
    return parser.parse_args()

def find_backup_files(backup_dir=None):
    """Encontrar todos los archivos de backup disponibles"""
    # Si no se proporciona un directorio, usar el directorio predeterminado
    if not backup_dir:
        # Obtener la ruta base del proyecto
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        backup_dir = os.path.join(project_root, "backend", "backups")
    
    if not os.path.exists(backup_dir):
        logger.error(f"Error: El directorio de backups {backup_dir} no existe")
        return []
    
    # Buscar todos los archivos .sql en el directorio de backups
    backup_files = []
    for root, _, files in os.walk(backup_dir):
        for file in files:
            if file.endswith(".sql"):
                backup_files.append(os.path.join(root, file))
    
    # Ordenar por fecha de modificación (más reciente primero)
    backup_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    return backup_files

def print_backup_list(backup_files):
    """Imprimir la lista de archivos de backup disponibles"""
    if not backup_files:
        logger.error("No se encontraron archivos de backup")
        return
    
    print("\n===== ARCHIVOS DE BACKUP DISPONIBLES =====")
    print("Nº | Fecha               | Tamaño   | Nombre")
    print("-" * 70)
    
    for i, backup_file in enumerate(backup_files, 1):
        # Obtener fecha de modificación
        mod_time = os.path.getmtime(backup_file)
        mod_date = datetime.fromtimestamp(mod_time).strftime('%d/%m/%Y %H:%M:%S')
        
        # Obtener tamaño
        file_size = os.path.getsize(backup_file)
        file_size_mb = file_size / (1024 * 1024)
        
        # Obtener nombre del archivo
        file_name = os.path.basename(backup_file)
        
        print(f"{i:2d} | {mod_date} | {file_size_mb:6.2f} MB | {file_name}")

def create_pre_restore_backup(container, user, db):
    """Crear un backup de seguridad antes de restaurar"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pre_restore_backup_{timestamp}.sql"
    
    # Obtener la ruta base del proyecto
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    backup_dir = os.path.join(project_root, "backend", "backups")
    
    # Asegurar que existe el directorio
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir, exist_ok=True)
    
    backup_path = os.path.join(backup_dir, filename)
    
    logger.info(f"Creando backup de seguridad antes de restaurar: {filename}")
    
    # Ejecutar pg_dump dentro del contenedor
    try:
        process = subprocess.run(
            ["docker", "exec", container, "pg_dump", "-U", user, db],
            stdout=open(backup_path, "w", encoding="utf-8"),
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        logger.info(f"Backup de seguridad creado correctamente: {filename}")
        return backup_path
    except subprocess.CalledProcessError as e:
        logger.error(f"Error al crear backup de seguridad: {e.stderr}")
        return None

def restore_database(backup_file, container, user, db, recreate=False):
    """Restaurar la base de datos desde un backup"""
    if not os.path.exists(backup_file):
        logger.error(f"Error: El archivo {backup_file} no existe")
        return False
    
    # Crear backup de seguridad antes de restaurar
    safety_backup = create_pre_restore_backup(container, user, db)
    if not safety_backup and not recreate:
        logger.warning("No se pudo crear un backup de seguridad. Continuando de todos modos...")
    
    # Si se solicita recrear, eliminar y crear la base de datos
    if recreate:
        logger.warning(f"¡RECREANDO completamente la base de datos {db}!")
        
        # Eliminar conexiones activas
        try:
            subprocess.run(
                [
                    "docker", "exec", container, 
                    "psql", "-U", user, "-c", 
                    f"SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '{db}' AND pid <> pg_backend_pid();"
                ],
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al eliminar conexiones activas: {e.stderr}")
            return False
        
        # Eliminar la base de datos
        try:
            subprocess.run(
                ["docker", "exec", container, "dropdb", "-U", user, "--if-exists", db],
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al eliminar la base de datos: {e.stderr}")
            return False
        
        # Crear la base de datos
        try:
            subprocess.run(
                ["docker", "exec", container, "createdb", "-U", user, db],
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al crear la base de datos: {e.stderr}")
            return False
    
    # Restaurar la base de datos
    logger.info(f"Restaurando desde: {backup_file}")
    try:
        with open(backup_file, "r", encoding="utf-8") as f:
            process = subprocess.run(
                ["docker", "exec", "-i", container, "psql", "-U", user, "-d", db],
                stdin=f,
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
        logger.info("¡Restauración completada con éxito!")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error durante la restauración: {e.stderr}")
        return False

def main():
    """Función principal"""
    args = parse_arguments()
    
    # Encontrar archivos de backup disponibles
    backup_files = find_backup_files()
    
    if not backup_files:
        logger.error("No se encontraron archivos de backup")
        sys.exit(1)
    
    # Si se solicita listar los backups disponibles
    if args.list:
        print_backup_list(backup_files)
        sys.exit(0)
    
    # Seleccionar backup a restaurar
    if args.latest:
        selected_backup = backup_files[0]  # El primero es el más reciente
        logger.info(f"Seleccionando el backup más reciente: {os.path.basename(selected_backup)}")
    elif args.file:
        # Comprobar si el archivo existe
        if os.path.exists(args.file):
            selected_backup = args.file
        else:
            # Comprobar si es un índice o un nombre parcial
            try:
                # Intentar convertir a entero (1-based)
                index = int(args.file) - 1
                if 0 <= index < len(backup_files):
                    selected_backup = backup_files[index]
                else:
                    logger.error(f"Error: Índice {args.file} fuera de rango (1-{len(backup_files)})")
                    sys.exit(1)
            except ValueError:
                # Buscar por nombre parcial
                matching_backups = [f for f in backup_files if args.file.lower() in os.path.basename(f).lower()]
                if matching_backups:
                    if len(matching_backups) > 1:
                        logger.info(f"Se encontraron {len(matching_backups)} backups que coinciden con '{args.file}'")
                        print_backup_list(matching_backups)
                        logger.info("Seleccionando el más reciente de la lista.")
                    selected_backup = matching_backups[0]
                else:
                    logger.error(f"Error: No se encontró ningún backup que coincida con '{args.file}'")
                    sys.exit(1)
    else:
        # Si no se especificó ninguna opción, mostrar la lista y solicitar selección
        print_backup_list(backup_files)
        print("\nDebe especificar --latest para restaurar el backup más reciente")
        print("o --file <nombre> para restaurar un backup específico.")
        sys.exit(1)
    
    # Confirmar restauración
    logger.info(f"¿Está seguro de que desea restaurar desde {os.path.basename(selected_backup)}?")
    if args.recreate:
        logger.warning("¡ADVERTENCIA! Se recreará completamente la base de datos.")
    
    response = input("Escriba 'SI' para confirmar o cualquier otra cosa para cancelar: ")
    if response.upper() != "SI":
        logger.info("Restauración cancelada.")
        sys.exit(0)
    
    # Restaurar la base de datos
    success = restore_database(
        selected_backup, 
        args.container, 
        args.user, 
        args.db, 
        args.recreate
    )
    
    if success:
        logger.info("Restauración completada con éxito.")
    else:
        logger.error("La restauración falló.")
        sys.exit(1)

if __name__ == "__main__":
    main()
