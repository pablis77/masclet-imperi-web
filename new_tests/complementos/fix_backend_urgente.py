#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para arreglar DEFINITIVAMENTE el backend - Solución directa
"""

import os
import sys
import time
import paramiko
import getpass
import tarfile
import tempfile
import shutil
from datetime import datetime

# Configuración
SERVER_HOST = "108.129.139.119"
SERVER_USER = "ec2-user"
LOCAL_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
LOCAL_BACKEND_PATH = os.path.join(LOCAL_ROOT, "backend")
LOCAL_DEPLOYMENT_PATH = os.path.join(LOCAL_ROOT, "deployment")

def log(msg, level="INFO"):
    """Registrar mensaje con timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{level}] {timestamp} - {msg}")

def ejecutar_comando(ssh, comando, mostrar_salida=True):
    """Ejecuta comando SSH y muestra salida"""
    log(f"Ejecutando: {comando}")
    stdin, stdout, stderr = ssh.exec_command(comando)
    exit_code = stdout.channel.recv_exit_status()
    
    salida = stdout.read().decode('utf-8').strip()
    error = stderr.read().decode('utf-8').strip()
    
    if salida and mostrar_salida:
        log(f"SALIDA:\n{salida}")
    if error:
        log(f"ERROR:\n{error}", "ERROR")
    
    return exit_code, salida, error

def conectar_ssh():
    """Conecta al servidor por SSH con contraseña"""
    log("Conectando al servidor...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    # Pedir contraseña
    password = getpass.getpass(f"Contraseña para {SERVER_USER}@{SERVER_HOST}: ")
    
    try:
        client.connect(
            hostname=SERVER_HOST,
            username=SERVER_USER,
            password=password
        )
        log(f"Conectado a {SERVER_USER}@{SERVER_HOST}")
        return client
    except Exception as e:
        log(f"Error de conexión SSH: {str(e)}", "ERROR")
        sys.exit(1)

def preparar_paquete():
    """Prepara paquete con Dockerfile y backend"""
    log("Preparando paquete del backend...")
    temp_dir = tempfile.mkdtemp(prefix="masclet_backend_fix_")
    log(f"Directorio temporal: {temp_dir}")
    
    # Crear estructura
    os.makedirs(os.path.join(temp_dir, "backend", "app"), exist_ok=True)
    os.makedirs(os.path.join(temp_dir, "backend", "scripts"), exist_ok=True)
    
    # 1. Copiar código del backend
    shutil.copytree(
        os.path.join(LOCAL_BACKEND_PATH, "app"),
        os.path.join(temp_dir, "backend", "app"),
        dirs_exist_ok=True
    )
    
    # 2. Copiar scripts
    if os.path.exists(os.path.join(LOCAL_BACKEND_PATH, "scripts")):
        shutil.copytree(
            os.path.join(LOCAL_BACKEND_PATH, "scripts"),
            os.path.join(temp_dir, "backend", "scripts"),
            dirs_exist_ok=True
        )
    
    # 3. Copiar requirements.txt
    shutil.copy(
        os.path.join(LOCAL_BACKEND_PATH, "requirements.txt"),
        os.path.join(temp_dir, "backend", "requirements.txt")
    )
    
    # 4. Añadir schedule explícitamente a requirements
    with open(os.path.join(temp_dir, "backend", "requirements.txt"), "r") as f:
        req_content = f.read()
    
    if "schedule" not in req_content:
        with open(os.path.join(temp_dir, "backend", "requirements.txt"), "a") as f:
            f.write("\n# Añadido explícitamente para resolver problemas de dependencias\nschedule>=1.2.0\n")
            log("Añadido 'schedule>=1.2.0' a requirements.txt")
    
    # 5. Copiar Dockerfile con modificación para incluir schedule
    dockerfile_path = os.path.join(temp_dir, "Dockerfile")
    with open(os.path.join(LOCAL_DEPLOYMENT_PATH, "Dockerfile.backend"), "r") as src:
        dockerfile_content = src.read()
    
    # 5.1 Asegurarnos que schedule está incluido explícitamente
    if "RUN pip install --no-cache-dir schedule" not in dockerfile_content:
        # Buscar patrón después de copiar requirements.txt
        if "COPY backend/requirements.txt ." in dockerfile_content:
            dockerfile_content = dockerfile_content.replace(
                "COPY backend/requirements.txt .",
                "COPY backend/requirements.txt .\nRUN pip install --no-cache-dir schedule>=1.2.0"
            )
            log("Modificado Dockerfile para instalar schedule explícitamente")
    
    with open(dockerfile_path, "w") as dest:
        dest.write(dockerfile_content)
    
    # 6. Crear archivo .env correcto
    with open(os.path.join(temp_dir, ".env"), "w") as f:
        f.write("""# Configuración del entorno para Masclet Imperi Backend
DATABASE_URL=postgresql://postgres:postgres@masclet-db:5432/masclet
DB_HOST=masclet-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=masclet
SECRET_KEY=73a8a29a52e305a86741bb5e369f582f7531b54e76bd0bec0e0b8306cb95824c
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=["*"]
""")
    
    # 7. Comprimir
    archive_path = os.path.join(temp_dir, "masclet_backend_fix.tar.gz")
    with tarfile.open(archive_path, "w:gz") as tar:
        for item in os.listdir(temp_dir):
            if item != "masclet_backend_fix.tar.gz":
                tar.add(os.path.join(temp_dir, item), arcname=item)
    
    log(f"Paquete creado: {archive_path}")
    return temp_dir, archive_path

def transferir_paquete(ssh_client, temp_dir, archive_path):
    """Transfiere paquete al servidor usando SFTP"""
    log("Transfiriendo paquete al servidor...")
    
    try:
        # Crear SFTP y directorio remoto
        sftp = ssh_client.open_sftp()
        remote_path = "/home/ec2-user/masclet-imperi"
        
        # Verificar si existe el directorio remoto
        try:
            sftp.stat(remote_path)
        except:
            ejecutar_comando(ssh_client, f"mkdir -p {remote_path}")
        
        # Transferir archivo
        remote_file = f"{remote_path}/masclet_backend_fix.tar.gz"
        log(f"Transfiriendo a {remote_file}...")
        sftp.put(archive_path, remote_file)
        sftp.close()
        
        log("Transferencia completada")
        return remote_path
    except Exception as e:
        log(f"Error en transferencia: {str(e)}", "ERROR")
        sys.exit(1)

def desplegar_backend(ssh_client, remote_path):
    """Despliega el backend en el servidor"""
    log("=== DESPLEGANDO BACKEND ===")
    
    # 1. Extraer archivo
    ejecutar_comando(ssh_client, f"cd {remote_path} && tar -xzf masclet_backend_fix.tar.gz")
    
    # 2. Crear directorios para volúmenes si no existen
    ejecutar_comando(ssh_client, f"mkdir -p {remote_path}/logs {remote_path}/uploads {remote_path}/imports {remote_path}/backups")
    ejecutar_comando(ssh_client, f"chmod -R 777 {remote_path}/logs {remote_path}/uploads {remote_path}/imports {remote_path}/backups")
    
    # 3. SOLUCIÓN DIRECTA: Añadir schedule al requirements.txt del servidor
    ejecutar_comando(ssh_client, f"echo 'schedule>=1.2.0' >> {remote_path}/backend/requirements.txt")
    
    # 4. Detener y eliminar contenedor anterior si existe
    ejecutar_comando(ssh_client, "sudo docker stop masclet-backend 2>/dev/null || true")
    ejecutar_comando(ssh_client, "sudo docker rm masclet-backend 2>/dev/null || true")
    
    # 5. Construir imagen Docker SIN CACHE
    log("Construyendo imagen Docker (sin cache)...")
    ejecutar_comando(ssh_client, f"cd {remote_path} && sudo docker build --no-cache -t masclet-imperi-api:latest .")
    
    # 6. Verificar red Docker
    ejecutar_comando(ssh_client, "sudo docker network inspect masclet-network >/dev/null 2>&1 || sudo docker network create masclet-network")
    
    # 7. Verificar que la base de datos esté corriendo
    _, salida, _ = ejecutar_comando(ssh_client, "sudo docker ps -a | grep masclet-db || true")
    
    if not salida or "Up " not in salida:
        log("¡ATENCIÓN! Contenedor de base de datos no encontrado o no está corriendo")
        log("Intentando iniciar contenedor PostgreSQL...")
        ejecutar_comando(ssh_client, "sudo docker run -d --name masclet-db --network masclet-network -v pg_data:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=masclet postgres:17")
    
    # 8. Ejecutar contenedor backend
    log("Iniciando contenedor backend...")
    cmd_run = f"sudo docker run -d --name masclet-backend --network masclet-network "\
              f"-v {remote_path}/logs:/app/logs "\
              f"-v {remote_path}/uploads:/app/uploads "\
              f"-v {remote_path}/imports:/app/imports "\
              f"-v {remote_path}/backups:/app/backups "\
              f"-v {remote_path}/.env:/app/.env "\
              f"-p 8000:8000 masclet-imperi-api:latest"
    ejecutar_comando(ssh_client, cmd_run)
    
    # 9. Verificar estado
    log("Verificando estado del contenedor...")
    ejecutar_comando(ssh_client, "sudo docker ps | grep masclet-backend")
    
    # 10. Ver logs completos para diagnosticar
    log("\n=== LOGS DEL BACKEND ===")
    time.sleep(5)  # Esperar a que inicie el contenedor
    ejecutar_comando(ssh_client, "sudo docker logs masclet-backend")

def verificar_despliegue(ssh_client):
    """Verifica el estado del despliegue"""
    log("=== VERIFICANDO DESPLIEGUE ===")
    
    # 1. Ver estado del contenedor
    ejecutar_comando(ssh_client, "sudo docker ps -a | grep masclet")
    
    # 2. Esperar un poco más para asegurar que está listo
    log("Esperando 10 segundos para que el servicio esté disponible...")
    time.sleep(10)
    
    # 3. Verificar logs después de esperar
    ejecutar_comando(ssh_client, "sudo docker logs masclet-backend --tail 20")
    
    # 4. Probar endpoint de salud
    log("Verificando endpoint de salud...")
    ejecutar_comando(ssh_client, "curl -s http://localhost:8000/api/v1/health || echo 'Error de conexión'")

def main():
    try:
        log("=== INICIANDO SOLUCIÓN URGENTE BACKEND MASCLET IMPERI ===")
        log(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 1. Preparar paquete con correcciones
        temp_dir, archive_path = preparar_paquete()
        
        # 2. Conectar por SSH
        ssh_client = conectar_ssh()
        
        try:
            # 3. Transferir paquete
            remote_path = transferir_paquete(ssh_client, temp_dir, archive_path)
            
            # 4. Desplegar backend
            desplegar_backend(ssh_client, remote_path)
            
            # 5. Verificar despliegue
            verificar_despliegue(ssh_client)
            
            log("=== PROCESO COMPLETADO ===")
            log("Si el endpoint de salud responde correctamente, el backend está funcionando")
            log("Si no responde, revisa los logs para identificar el error específico")
        finally:
            ssh_client.close()
        
        # Limpiar
        shutil.rmtree(temp_dir)
        
    except Exception as e:
        log(f"Error general: {str(e)}", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main()
