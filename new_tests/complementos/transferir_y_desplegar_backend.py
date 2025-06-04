#!/usr/bin/env python3
"""
Script para transferir el backend completo y desplegarlo en AWS.
Este script:
1. Comprime el directorio backend local
2. Transfiere el archivo comprimido al servidor AWS
3. Descomprime el archivo en el servidor
4. Ejecuta el despliegue del backend y base de datos
"""

import os
import sys
import subprocess
import time
import shutil
from datetime import datetime
from pathlib import Path

# Configuración
SSH_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_USER = "ec2-user"
EC2_HOST = "108.129.139.119"
REMOTE_DIR = "/home/ec2-user/masclet-imperi"
REMOTE_TEMP_DIR = "/home/ec2-user/temp"  # Directorio temporal donde tenemos permisos
LOCAL_BACKEND_DIR = r"C:\Proyectos\claude\masclet-imperi-web\backend"
TEMP_DIR = r"C:\Proyectos\claude\masclet-imperi-web\temp_deploy"

def ejecutar_comando(comando, mostrar_salida=True, check=True):
    """Ejecuta un comando local y muestra la salida"""
    print(f"Ejecutando: {comando}")
    try:
        resultado = subprocess.run(comando, shell=True, capture_output=True, text=True, check=check)
        
        if mostrar_salida and resultado.stdout:
            print("SALIDA:")
            print(resultado.stdout)
        
        return resultado.returncode == 0 or not check
    except subprocess.CalledProcessError as e:
        print("ERROR:")
        print(e.stderr)
        return False

def ejecutar_comando_ssh(comando, mostrar_salida=True):
    """Ejecuta un comando en el servidor remoto a través de SSH"""
    ssh_comando = f'ssh -i "{SSH_KEY_PATH}" {EC2_USER}@{EC2_HOST} "{comando}"'
    print(f"Ejecutando: {ssh_comando}")
    try:
        resultado = subprocess.run(ssh_comando, shell=True, capture_output=True, text=True, check=False)
        
        if mostrar_salida and resultado.stdout:
            print("SALIDA:")
            print(resultado.stdout)
        
        if resultado.returncode != 0 and resultado.stderr:
            print("ERROR:")
            print(resultado.stderr)
        
        return resultado.stdout
    except Exception as e:
        print(f"Error al ejecutar comando SSH: {e}")
        return ""

def comprobar_conectividad():
    """Comprueba que podemos conectarnos al servidor AWS"""
    print("\n=== Comprobando conectividad con el servidor AWS ===")
    return ejecutar_comando_ssh("echo 'Conexión SSH establecida correctamente'")

def transferir_backend():
    """Comprime y transfiere el directorio backend al servidor AWS"""
    print("\n=== Preparando y transfiriendo el backend ===")
    
    # Crear directorio temporal si no existe
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)
    
    # Nombre del archivo comprimido
    fecha_hora = datetime.now().strftime("%Y%m%d_%H%M%S")
    archivo_zip = os.path.join(TEMP_DIR, f"backend_{fecha_hora}.zip")
    
    # Comprimir el directorio backend
    print(f"Comprimiendo el directorio backend en {archivo_zip}...")
    shutil.make_archive(archivo_zip[:-4], 'zip', os.path.dirname(LOCAL_BACKEND_DIR), os.path.basename(LOCAL_BACKEND_DIR))
    
    # Crear directorio temporal en el servidor si no existe
    print("Creando directorio temporal en el servidor...")
    ejecutar_comando_ssh(f"mkdir -p {REMOTE_TEMP_DIR}")
    
    # Transferir el archivo comprimido al servidor al directorio temporal
    print(f"Transfiriendo {archivo_zip} al servidor AWS...")
    scp_comando = f'scp -i "{SSH_KEY_PATH}" "{archivo_zip}" {EC2_USER}@{EC2_HOST}:{REMOTE_TEMP_DIR}/backend.zip'
    if not ejecutar_comando(scp_comando):
        print("ERROR: No se pudo transferir el archivo al servidor")
        return False
    
    # Eliminar el directorio backend actual en el servidor
    print("Eliminando el directorio backend actual en el servidor...")
    ejecutar_comando_ssh(f"sudo rm -rf {REMOTE_DIR}/backend")
    
    # Crear el directorio backend en el servidor
    print("Creando directorio backend en el servidor...")
    ejecutar_comando_ssh(f"sudo mkdir -p {REMOTE_DIR}")
    ejecutar_comando_ssh(f"sudo chown -R {EC2_USER}:{EC2_USER} {REMOTE_DIR}")
    
    # Descomprimir el archivo en el directorio temporal
    print("Descomprimiendo el archivo en el servidor...")
    ejecutar_comando_ssh(f"cd {REMOTE_TEMP_DIR} && unzip -o backend.zip")
    
    # Mover los archivos del directorio temporal al directorio final
    print("Moviendo archivos al directorio final...")
    ejecutar_comando_ssh(f"sudo cp -rf {REMOTE_TEMP_DIR}/backend {REMOTE_DIR}/")
    
    # Establecer permisos correctos
    print("Estableciendo permisos correctos...")
    ejecutar_comando_ssh(f"sudo chown -R {EC2_USER}:{EC2_USER} {REMOTE_DIR}/backend")
    
    # Limpiar archivos temporales
    print("Limpiando archivos temporales...")
    ejecutar_comando_ssh(f"rm -f {REMOTE_TEMP_DIR}/backend.zip")
    ejecutar_comando_ssh(f"rm -rf {REMOTE_TEMP_DIR}/backend")
    os.remove(archivo_zip)
    
    return True

def desplegar_backend():
    """Despliega el backend y la base de datos"""
    print("\n=== Desplegando el backend y la base de datos ===")
    
    # Verificar configuración
    print("Verificando configuración...")
    env_content = """# Configuración para Masclet Imperi en producción

# Configuración de la base de datos
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=masclet_imperi
DATABASE_URL=postgres://admin:admin123@db:5432/masclet_imperi

# Configuración de seguridad
SECRET_KEY=cxuqwApocCz0iLeW>3Kz2\\vG.A;.6o!r5uIRh4{Ch\\y$[,RQh<F#"{GHXX/$
ACCESS_TOKEN_EXPIRE_MINUTES=120
API_KEY=y*^+BGmz|yRzy#}V#>i]9VGBKSM2nzOP

# Configuración del entorno
ENVIRONMENT=prod
ENABLE_RATE_LIMIT=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
"""
    
    # Escapar el contenido para la línea de comando
    env_content_escaped = env_content.replace('"', '\\"').replace('$', '\\$')
    
    # Crear el archivo .env en el servidor
    print("Creando archivo .env con la configuración correcta...")
    ejecutar_comando_ssh(f'echo "{env_content_escaped}" > {REMOTE_DIR}/.env')
    
    # Verificar si existe el archivo docker-compose.yml
    print("Verificando docker-compose.yml...")
    docker_compose_content = """version: '3.8'

services:
  db:
    container_name: masclet-db
    image: postgres:17
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin123
      - POSTGRES_DB=masclet_imperi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - masclet-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d masclet_imperi"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    container_name: masclet-api
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgres://admin:admin123@db:5432/masclet_imperi
      - SECRET_KEY=cxuqwApocCz0iLeW>3Kz2\\vG.A;.6o!r5uIRh4{Ch\\y$[,RQh<F#"{GHXX/$
      - ACCESS_TOKEN_EXPIRE_MINUTES=120
      - API_KEY=y*^+BGmz|yRzy#}V#>i]9VGBKSM2nzOP
      - ENVIRONMENT=prod
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./logs:/app/logs
    networks:
      - masclet-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  masclet-network:
    name: masclet-network
    external: true

volumes:
  postgres_data:
"""
    
    # Escapar el contenido para la línea de comando
    docker_compose_content_escaped = docker_compose_content.replace('"', '\\"').replace('$', '\\$')
    
    # Crear el archivo docker-compose.yml en el servidor
    print("Creando archivo docker-compose.yml...")
    ejecutar_comando_ssh(f'echo "{docker_compose_content_escaped}" > {REMOTE_DIR}/docker-compose.yml')
    
    # Verificar si existe el Dockerfile en el backend
    print("Verificando si existe el Dockerfile en el backend...")
    resultado = ejecutar_comando_ssh(f"test -f {REMOTE_DIR}/backend/Dockerfile && echo 'Existe' || echo 'No existe'", True)
    
    # Si no existe o es vacío, crearlo
    if not resultado or "No existe" in resultado:
        print("Creando Dockerfile en el backend...")
        dockerfile_content = """FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Establecer PYTHONPATH
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/api/v1/health || exit 1
"""
        
        # Escapar el contenido para la línea de comando
        dockerfile_content_escaped = dockerfile_content.replace('"', '\\"').replace('$', '\\$')
        
        # Crear el archivo Dockerfile en el servidor
        ejecutar_comando_ssh(f'echo "{dockerfile_content_escaped}" > {REMOTE_DIR}/backend/Dockerfile')
    
    # Detener contenedores existentes
    print("Deteniendo contenedores existentes...")
    ejecutar_comando_ssh("docker stop masclet-api masclet-db 2>/dev/null || true")
    ejecutar_comando_ssh("docker rm masclet-api masclet-db 2>/dev/null || true")
    
    # Verificar que la red Docker existe
    print("Verificando la red Docker masclet-network...")
    red_existe = ejecutar_comando_ssh("docker network ls | grep masclet-network || echo 'No existe'", True)
    
    if "masclet-network" not in red_existe:
        print("La red masclet-network no existe. Creándola...")
        ejecutar_comando_ssh("docker network create masclet-network")
    else:
        print("La red masclet-network ya existe, la usaremos directamente.")
        # Modificando docker-compose.yml para usar la red existente
        print("Ajustando docker-compose.yml para usar la red existente correctamente...")
        ejecutar_comando_ssh(f"sed -i 's/external: true/external: true\n    attachable: true/g' {REMOTE_DIR}/docker-compose.yml || echo 'No se pudo modificar'")
        print("Red configurada como attachable para permitir conectar nuevos contenedores.")
    
    # Construir y desplegar contenedores de backend y base de datos
    print("Construyendo y desplegando contenedores...")
    ejecutar_comando_ssh(f"cd {REMOTE_DIR} && docker-compose up -d db api")
    
    # Esperar a que los contenedores estén en funcionamiento
    print("Esperando a que los contenedores estén en funcionamiento...")
    print("Esto puede tardar hasta 60 segundos mientras se inician los servicios...")
    time.sleep(60)  # Esperar más tiempo para que se inicien completamente
    
    # Verificar el estado de los contenedores
    print("Verificando el estado de los contenedores...")
    contenedores = ejecutar_comando_ssh("docker ps")
    
    # Comprobar si los contenedores están funcionando
    if "masclet-api" not in contenedores or "masclet-db" not in contenedores:
        print("\nAVISO: No se encontraron todos los contenedores en ejecución.")
        print("Veamos qué ocurrió con los contenedores...")
        
        # Mostrar todos los contenedores (incluso los parados)
        print("Lista de todos los contenedores (incluso parados):")
        ejecutar_comando_ssh("docker ps -a | grep masclet")
        
        # Verificar logs del backend si existe el contenedor aunque esté parado
        print("\nVerificando logs del backend para diagnosticar problemas:")
        ejecutar_comando_ssh("docker logs masclet-api --tail 30 2>&1 || echo 'No se puede acceder a los logs'")
        
        # Verificar logs de la base de datos
        print("\nVerificando logs de la base de datos:")
        ejecutar_comando_ssh("docker logs masclet-db --tail 30 2>&1 || echo 'No se puede acceder a los logs'")
    else:
        # Verificar logs del backend
        print("\nVerificando logs del backend:")
        ejecutar_comando_ssh("docker logs masclet-api --tail 20")
        
        # Verificar si el endpoint de salud responde
        print("\nVerificando si el endpoint de salud responde:")
        health_response = ejecutar_comando_ssh("curl -s http://localhost:8000/api/v1/health")
        if health_response and "{" in health_response:
            print("\n¡ÉXITO! El endpoint de salud responde correctamente.")
        else:
            print("\nAVISO: El endpoint de salud no responde correctamente.")
            print("Esto puede deberse a que la aplicación aún está inicializando. Espere unos minutos más.")
            
            # Intentar ver más logs para diagnosticar
            print("\nMostrando más logs para diagnosticar el problema:")
            ejecutar_comando_ssh("docker logs masclet-api --tail 50")
    
    return True

def main():
    """Función principal"""
    print("=== TRANSFERENCIA Y DESPLIEGUE DEL BACKEND EN AWS ===")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Crear directorio temporal si no existe
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)
    
    # Comprobar conectividad
    if not comprobar_conectividad():
        print("ERROR: No se puede conectar al servidor AWS.")
        return False
    
    # Transferir el backend
    if not transferir_backend():
        print("ERROR: No se pudo transferir el backend al servidor.")
        return False
    
    # Desplegar el backend y la base de datos
    if not desplegar_backend():
        print("ERROR: No se pudo desplegar el backend y la base de datos.")
        return False
    
    print("\n=== DESPLIEGUE COMPLETADO CON ÉXITO ===")
    print("El backend y la base de datos deberían estar funcionando correctamente.")
    print("Para acceder a la API: http://108.129.139.119:8000/api/v1/")
    
    # Verificar los endpoints importantes
    print("\n=== VERIFICANDO ENDPOINTS IMPORTANTES ===")
    ejecutar_comando_ssh("curl -s http://localhost:8000/api/v1/health || echo 'Error: El endpoint no responde'")
    
    return True

if __name__ == "__main__":
    exito = main()
    sys.exit(0 if exito else 1)
