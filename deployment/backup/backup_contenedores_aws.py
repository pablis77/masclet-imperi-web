#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para crear respaldos de contenedores Docker en AWS EC2
Guarda imágenes de los contenedores actualmente en ejecución

Uso:
    python backup_contenedores_aws.py [--all] [--upload]
    
Opciones:
    --all       : Respaldar todos los contenedores (por defecto solo masclet-*)
    --upload    : Subir respaldos a S3 (requiere configuración previa de AWS CLI)
"""

import os
import sys
import argparse
import datetime
import subprocess
import json
import logging
from pathlib import Path

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('backup_contenedores.log')
    ]
)
logger = logging.getLogger('backup_contenedores')

# Configuración
BACKUP_DIR = Path("backups/docker")
AWS_HOSTNAME = "108.129.139.119"
SSH_KEY_PATH = "C:\\Proyectos\\primeros proyectos\\AWS\\masclet-imperi-key.pem"
SSH_USER = "ec2-user"
S3_BUCKET = "masclet-imperi-backups"  # Asegurarse de que este bucket exista si se usa --upload

def ensure_backup_dir():
    """Crear directorio de backup si no existe"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    logger.info(f"Directorio de backups: {BACKUP_DIR}")

def run_ssh_command(command):
    """Ejecutar comando SSH en el servidor remoto"""
    ssh_command = [
        'ssh',
        '-i', SSH_KEY_PATH,
        f'{SSH_USER}@{AWS_HOSTNAME}',
        command
    ]
    
    logger.debug(f"Ejecutando comando SSH: {' '.join(ssh_command)}")
    
    try:
        result = subprocess.run(
            ssh_command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        logger.error(f"Error al ejecutar comando SSH: {e}")
        logger.error(f"Salida de error: {e.stderr}")
        return None

def get_running_containers(only_masclet=True):
    """Obtener lista de contenedores en ejecución"""
    command = "docker ps --format '{{.Names}}'"
    
    containers = run_ssh_command(command)
    if containers is None:
        return []
    
    container_list = containers.strip().split('\n')
    
    # Filtrar contenedores que comienzan con 'masclet-' si only_masclet=True
    if only_masclet:
        container_list = [c for c in container_list if c.startswith('masclet-')]
    
    logger.info(f"Contenedores encontrados: {container_list}")
    return container_list

def backup_container(container_name, timestamp):
    """Crear respaldo de un contenedor"""
    backup_filename = f"{container_name}_{timestamp}.tar"
    backup_path = BACKUP_DIR / backup_filename
    
    # 1. Crear un snapshot de la imagen actual del contenedor
    image_name = f"{container_name}_backup_{timestamp}"
    commit_command = f"docker commit {container_name} {image_name}"
    
    logger.info(f"Creando snapshot de {container_name}...")
    run_ssh_command(commit_command)
    
    # 2. Guardar la imagen en un archivo tar
    save_command = f"docker save -o /tmp/{backup_filename} {image_name}"
    
    logger.info(f"Guardando imagen {image_name} en archivo tar...")
    run_ssh_command(save_command)
    
    # 3. Descargar el archivo tar
    scp_command = [
        'scp',
        '-i', SSH_KEY_PATH,
        f'{SSH_USER}@{AWS_HOSTNAME}:/tmp/{backup_filename}',
        str(backup_path)
    ]
    
    logger.info(f"Descargando respaldo a {backup_path}...")
    try:
        subprocess.run(scp_command, check=True)
        logger.info(f"Respaldo de {container_name} completado exitosamente")
        
        # 4. Eliminar archivos temporales en el servidor
        cleanup_command = f"rm /tmp/{backup_filename} && docker rmi {image_name}"
        run_ssh_command(cleanup_command)
        
        return str(backup_path)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error al descargar respaldo: {e}")
        return None

def upload_to_s3(backup_file):
    """Subir archivo de respaldo a S3"""
    try:
        filename = os.path.basename(backup_file)
        s3_path = f"s3://{S3_BUCKET}/{filename}"
        
        logger.info(f"Subiendo {backup_file} a {s3_path}...")
        
        command = f"aws s3 cp {backup_file} {s3_path}"
        subprocess.run(command, shell=True, check=True)
        
        logger.info(f"Archivo subido exitosamente a S3")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error al subir a S3: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Crear respaldos de contenedores Docker en AWS EC2')
    parser.add_argument('--all', action='store_true', help='Respaldar todos los contenedores')
    parser.add_argument('--upload', action='store_true', help='Subir respaldos a S3')
    parser.add_argument('--verbose', '-v', action='store_true', help='Mostrar información detallada')
    
    args = parser.parse_args()
    
    # Configurar nivel de log
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Crear directorio de backups
    ensure_backup_dir()
    
    # Obtener timestamp actual
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Obtener lista de contenedores en ejecución
    containers = get_running_containers(only_masclet=not args.all)
    
    if not containers:
        logger.warning("No se encontraron contenedores para respaldar")
        return
    
    backup_files = []
    
    # Crear respaldo de cada contenedor
    for container in containers:
        backup_file = backup_container(container, timestamp)
        if backup_file:
            backup_files.append(backup_file)
            
            # Subir a S3 si se especifica
            if args.upload:
                upload_to_s3(backup_file)
    
    # Mostrar resumen
    logger.info("===== RESUMEN DE RESPALDOS =====")
    logger.info(f"Total de contenedores respaldados: {len(backup_files)}/{len(containers)}")
    for bf in backup_files:
        logger.info(f"  - {bf}")
    
    if args.upload:
        logger.info(f"Los respaldos fueron subidos a S3: s3://{S3_BUCKET}/")

if __name__ == "__main__":
    main()
