#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script profesional para transferir el backend de Masclet Imperi
al servidor AWS EC2 y desplegarlo con Docker
Fecha: 4 de junio de 2025
Versión: 1.0
"""

import os
import sys
import time
import datetime
import tempfile
import shutil
import paramiko
import subprocess
import tarfile
from pathlib import Path

# Constantes de configuración
EC2_HOST = "108.129.139.119"
EC2_USER = "ec2-user"
KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
REMOTE_DIR = "/home/ec2-user/masclet-imperi"
LOCAL_BACKEND_PATH = r"c:\Proyectos\claude\masclet-imperi-web\backend"
LOCAL_DEPLOYMENT_PATH = r"c:\Proyectos\claude\masclet-imperi-web\deployment"
LOCAL_ENV_PATH = r"c:\Proyectos\claude\masclet-imperi-web\.env"

def log(message, level="INFO"):
    """Registra mensajes con formato de tiempo"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{level}] {timestamp} - {message}")

def create_ssh_client():
    """Crea y devuelve un cliente SSH configurado"""
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=EC2_HOST,
            username=EC2_USER,
            key_filename=KEY_PATH
        )
        log(f"Conexión SSH establecida con {EC2_USER}@{EC2_HOST}")
        return client
    except Exception as e:
        log(f"Error al establecer conexión SSH: {str(e)}", "ERROR")
        sys.exit(1)

def execute_remote_command(ssh_client, command):
    """Ejecuta un comando remoto y muestra su salida"""
    try:
        log(f"Ejecutando: {command}")
        stdin, stdout, stderr = ssh_client.exec_command(command)
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            output = stdout.read().decode('utf-8').strip()
            if output:
                for line in output.split('\n'):
                    log(f"SALIDA: {line}")
            log(f"Comando completado con éxito (status {exit_status})")
            return True, output
        else:
            error = stderr.read().decode('utf-8').strip()
            log(f"Error en comando (status {exit_status}): {error}", "ERROR")
            return False, error
    except Exception as e:
        log(f"Excepción al ejecutar comando: {str(e)}", "ERROR")
        return False, str(e)

def prepare_backend_package():
    """Prepara un paquete comprimido con el backend y Dockerfile"""
    try:
        temp_dir = tempfile.mkdtemp(prefix="masclet_backend_")
        log(f"Directorio temporal creado: {temp_dir}")
        
        # Crear estructura de directorios
        os.makedirs(os.path.join(temp_dir, "backend", "app"), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, "backend", "scripts"), exist_ok=True)
        
        # Copiar archivos del backend
        shutil.copytree(
            os.path.join(LOCAL_BACKEND_PATH, "app"),
            os.path.join(temp_dir, "backend", "app"),
            dirs_exist_ok=True
        )
        
        if os.path.exists(os.path.join(LOCAL_BACKEND_PATH, "scripts")):
            shutil.copytree(
                os.path.join(LOCAL_BACKEND_PATH, "scripts"),
                os.path.join(temp_dir, "backend", "scripts"),
                dirs_exist_ok=True
            )
        
        # Copiar requirements.txt
        shutil.copy(
            os.path.join(LOCAL_BACKEND_PATH, "requirements.txt"),
            os.path.join(temp_dir, "backend", "requirements.txt")
        )
        
        # Copiar Dockerfile
        shutil.copy(
            os.path.join(LOCAL_DEPLOYMENT_PATH, "Dockerfile.backend"),
            os.path.join(temp_dir, "Dockerfile")
        )
        
        # Crear archivo .env si existe
        if os.path.exists(LOCAL_ENV_PATH):
            shutil.copy(LOCAL_ENV_PATH, os.path.join(temp_dir, ".env"))
        else:
            log("Archivo .env no encontrado, se usará configuración predeterminada", "WARNING")
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
        
        # Comprimir todo el contenido
        archive_path = os.path.join(temp_dir, "masclet_backend.tar.gz")
        with tarfile.open(archive_path, "w:gz") as tar:
            for item in os.listdir(temp_dir):
                if item != "masclet_backend.tar.gz":
                    tar.add(os.path.join(temp_dir, item), arcname=item)
        
        log(f"Paquete backend creado: {archive_path}")
        return temp_dir, archive_path
    except Exception as e:
        log(f"Error al preparar paquete backend: {str(e)}", "ERROR")
        sys.exit(1)

def transfer_package(ssh_client, temp_dir, archive_path):
    """Transfiere el paquete al servidor usando SCP"""
    try:
        # Crear directorio remoto si no existe
        execute_remote_command(ssh_client, f"mkdir -p {REMOTE_DIR}")
        
        # Transferir archivo
        remote_path = f"{REMOTE_DIR}/masclet_backend.tar.gz"
        log(f"Transfiriendo archivo a {remote_path}...")
        
        # Usar subprocess para ejecutar SCP
        scp_command = [
            "scp",
            "-i", KEY_PATH,
            archive_path,
            f"{EC2_USER}@{EC2_HOST}:{remote_path}"
        ]
        
        process = subprocess.run(
            scp_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if process.returncode != 0:
            log(f"Error en transferencia SCP: {process.stderr}", "ERROR")
            sys.exit(1)
        
        log("Transferencia completada correctamente")
        return remote_path
    except Exception as e:
        log(f"Error en transferencia: {str(e)}", "ERROR")
        sys.exit(1)

def deploy_backend(ssh_client, remote_path):
    """Despliega el backend en el servidor remoto"""
    try:
        # Extraer el archivo
        extract_cmd = f"cd {REMOTE_DIR} && tar -xzf masclet_backend.tar.gz"
        success, _ = execute_remote_command(ssh_client, extract_cmd)
        if not success:
            return False
        
        # Construir imagen Docker
        build_cmd = f"cd {REMOTE_DIR} && sudo docker build -t masclet-imperi-api:latest ."
        success, _ = execute_remote_command(ssh_client, build_cmd)
        if not success:
            return False
        
        # Crear red Docker si no existe
        network_cmd = "sudo docker network inspect masclet-network >/dev/null 2>&1 || sudo docker network create masclet-network"
        success, _ = execute_remote_command(ssh_client, network_cmd)
        if not success:
            return False
        
        # Iniciar PostgreSQL si no está funcionando
        db_check_cmd = "sudo docker ps -a | grep masclet-db || true"
        _, db_output = execute_remote_command(ssh_client, db_check_cmd)
        
        if "masclet-db" not in db_output:
            db_cmd = (
                "sudo docker run -d --name masclet-db "
                "--network masclet-network "
                "-v masclet-db-data:/var/lib/postgresql/data "
                "-e POSTGRES_USER=postgres "
                "-e POSTGRES_PASSWORD=postgres "
                "-e POSTGRES_DB=masclet "
                "-p 5432:5432 postgres:17"
            )
            success, _ = execute_remote_command(ssh_client, db_cmd)
            if not success:
                return False
            
            # Esperar a que la base de datos esté lista
            log("Esperando 10 segundos para que la base de datos se inicie...")
            time.sleep(10)
        
        # Detener contenedor backend si existe
        stop_cmd = "sudo docker stop masclet-backend 2>/dev/null || true"
        execute_remote_command(ssh_client, stop_cmd)
        
        rm_cmd = "sudo docker rm masclet-backend 2>/dev/null || true"
        execute_remote_command(ssh_client, rm_cmd)
        
        # Iniciar contenedor backend
        run_cmd = (
            "sudo docker run -d --name masclet-backend "
            "--network masclet-network "
            "-v /home/ec2-user/masclet-imperi/logs:/app/logs "
            "-v /home/ec2-user/masclet-imperi/uploads:/app/uploads "
            "-v /home/ec2-user/masclet-imperi/imports:/app/imports "
            "-v /home/ec2-user/masclet-imperi/backups:/app/backups "
            "-v /home/ec2-user/masclet-imperi/.env:/app/.env "
            "-p 8000:8000 "
            "masclet-imperi-api:latest"
        )
        success, _ = execute_remote_command(ssh_client, run_cmd)
        
        # Verificar que el contenedor esté funcionando
        if success:
            verify_cmd = "sudo docker ps | grep masclet-backend"
            success, _ = execute_remote_command(ssh_client, verify_cmd)
        
        return success
    except Exception as e:
        log(f"Error en despliegue: {str(e)}", "ERROR")
        return False

def cleanup(temp_dir):
    """Limpia archivos temporales"""
    try:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            log(f"Directorio temporal eliminado: {temp_dir}")
    except Exception as e:
        log(f"Error al limpiar archivos temporales: {str(e)}", "WARNING")

def verify_deployment(ssh_client):
    """Verifica el estado del despliegue"""
    try:
        # Verificar contenedores
        container_cmd = "sudo docker ps -a"
        _, output = execute_remote_command(ssh_client, container_cmd)
        log("Estado de contenedores Docker:")
        for line in output.split('\n'):
            log(f"  {line}")
        
        # Verificar logs del backend
        logs_cmd = "sudo docker logs masclet-backend --tail 20"
        success, logs = execute_remote_command(ssh_client, logs_cmd)
        if success:
            log("Últimas líneas del log del backend:")
            for line in logs.split('\n'):
                log(f"  {line}")
        else:
            log("No se pudieron obtener logs del backend", "WARNING")
        
        # Verificar conectividad
        curl_cmd = "curl -s http://localhost:8000/api/v1/health || echo 'Error de conexión'"
        success, health = execute_remote_command(ssh_client, curl_cmd)
        if success and "Error de conexión" not in health:
            log(f"Endpoint de salud responde: {health}")
            return True
        else:
            log("El endpoint de salud no responde correctamente", "ERROR")
            return False
    except Exception as e:
        log(f"Error en verificación: {str(e)}", "ERROR")
        return False

def main():
    """Función principal de ejecución"""
    log("=== INICIANDO DESPLIEGUE DE BACKEND MASCLET IMPERI ===")
    log(f"Fecha y hora: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    temp_dir = None
    ssh_client = None
    
    try:
        # Crear cliente SSH
        ssh_client = create_ssh_client()
        
        # Preparar paquete de backend
        temp_dir, archive_path = prepare_backend_package()
        
        # Transferir paquete
        remote_path = transfer_package(ssh_client, temp_dir, archive_path)
        
        # Desplegar backend
        log("=== INICIANDO DESPLIEGUE DEL BACKEND ===")
        success = deploy_backend(ssh_client, remote_path)
        
        if success:
            log("=== VERIFICANDO DESPLIEGUE ===")
            if verify_deployment(ssh_client):
                log("✅ DESPLIEGUE COMPLETADO CON ÉXITO", "SUCCESS")
            else:
                log("❌ DESPLIEGUE COMPLETO PERO CON ADVERTENCIAS", "WARNING")
        else:
            log("❌ ERROR EN EL DESPLIEGUE", "ERROR")
    
    except KeyboardInterrupt:
        log("Proceso interrumpido por el usuario", "WARNING")
    except Exception as e:
        log(f"Error inesperado: {str(e)}", "ERROR")
        
    finally:
        # Limpiar recursos
        cleanup(temp_dir)
        if ssh_client:
            ssh_client.close()
        log("=== FIN DEL PROCESO DE DESPLIEGUE ===")

if __name__ == "__main__":
    main()
