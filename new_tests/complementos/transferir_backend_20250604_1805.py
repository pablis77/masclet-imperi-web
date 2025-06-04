#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para transferir backend al servidor AWS EC2
Fecha: 04/06/2025 - 18:05

Este script:
1. Comprime la carpeta backend en un archivo zip
2. Transfiere el archivo al servidor
3. Extrae el contenido en el directorio correcto 
4. Configura los permisos necesarios
"""
import os
import zipfile
import subprocess
import shutil
import time
import sys
from datetime import datetime

# Configuración
EC2_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_HOST = "ec2-user@108.129.139.119"
LOCAL_BACKEND_DIR = r"C:\Proyectos\claude\masclet-imperi-web\backend"
TEMP_ZIP_NAME = "backend_transfer.zip"
REMOTE_BASE_DIR = "/home/ec2-user/masclet-imperi"

# Función para ejecutar comandos SSH y obtener salida
def ejecutar_comando_ssh(comando, mostrar_salida=True):
    cmd = f'ssh -i "{EC2_KEY_PATH}" {EC2_HOST} "{comando}"'
    print(f"Ejecutando: {cmd}")
    
    resultado = subprocess.run(
        cmd, 
        shell=True, 
        text=True,
        capture_output=True
    )
    
    if mostrar_salida:
        print(f"SALIDA: {resultado.stdout}")
        if resultado.stderr:
            print(f"ERROR: {resultado.stderr}")
    
    if resultado.returncode != 0:
        print(f"ADVERTENCIA: El comando SSH terminó con código de error {resultado.returncode}")
    
    return resultado.stdout, resultado.stderr, resultado.returncode

# Función para transferir archivos con SCP
def transferir_archivo(origen, destino):
    cmd = f'scp -i "{EC2_KEY_PATH}" "{origen}" {EC2_HOST}:{destino}'
    print(f"Transfiriendo: {cmd}")
    
    resultado = subprocess.run(
        cmd, 
        shell=True, 
        text=True,
        capture_output=True
    )
    
    print(f"SALIDA: {resultado.stdout}")
    if resultado.stderr:
        print(f"ERROR: {resultado.stderr}")
    
    return resultado.returncode

# Registrar inicio
print(f"== Iniciando transferencia de backend a AWS - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ==")

# Paso 1: Comprimir carpeta backend
print("Comprimiendo carpeta backend...")
zip_path = os.path.join(os.path.dirname(LOCAL_BACKEND_DIR), TEMP_ZIP_NAME)

try:
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(LOCAL_BACKEND_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(LOCAL_BACKEND_DIR))
                zipf.write(file_path, arcname)
    print(f"Compresión completada: {zip_path}")
except Exception as e:
    print(f"Error al comprimir: {e}")
    sys.exit(1)

# Paso 2: Transferir archivo comprimido
print("Transfiriendo archivo comprimido...")
if transferir_archivo(zip_path, REMOTE_BASE_DIR) != 0:
    print("Error al transferir el archivo. Abortando.")
    sys.exit(1)

# Paso 3: Eliminar directorio backend existente en el servidor
print("Eliminando carpeta backend existente en el servidor...")
ejecutar_comando_ssh(f"rm -rf {REMOTE_BASE_DIR}/backend")

# Paso 4: Extraer archivo en el servidor
print("Extrayendo archivo en el servidor...")
stdout, stderr, rc = ejecutar_comando_ssh(
    f"cd {REMOTE_BASE_DIR} && unzip -o {TEMP_ZIP_NAME} && rm {TEMP_ZIP_NAME}"
)
if rc != 0:
    print(f"Error al extraer el archivo en el servidor: {stderr}")
    sys.exit(1)

# Paso 5: Configurar permisos
print("Configurando permisos...")
ejecutar_comando_ssh(f"chmod -R 755 {REMOTE_BASE_DIR}/backend")
ejecutar_comando_ssh(f"mkdir -p {REMOTE_BASE_DIR}/backend/logs {REMOTE_BASE_DIR}/backend/backups {REMOTE_BASE_DIR}/backend/imports")
ejecutar_comando_ssh(f"chmod -R 777 {REMOTE_BASE_DIR}/backend/logs {REMOTE_BASE_DIR}/backend/backups {REMOTE_BASE_DIR}/backend/imports")

# Paso 6: Mover requirements.txt a la carpeta raíz del backend
print("Preparando archivo requirements.txt...")
ejecutar_comando_ssh(f"cp {REMOTE_BASE_DIR}/backend/requirements.txt {REMOTE_BASE_DIR}/")

# Paso 7: Limpiar archivo zip local
print("Limpiando archivos temporales...")
if os.path.exists(zip_path):
    os.remove(zip_path)

print(f"== Transferencia completada exitosamente - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ==")
print("\nPróximos pasos:")
print("1. Construir la imagen Docker del backend")
print("2. Iniciar el contenedor del backend")
print("3. Verificar el correcto funcionamiento con 'curl http://108.129.139.119:8000/api/v1/health'")
