#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para corregir problemas en el despliegue del backend
Fecha: 4 de junio de 2025
Versión: 1.0
"""

import os
import sys
import time
import datetime
import paramiko
import tempfile

# Constantes de configuración
EC2_HOST = "108.129.139.119"
EC2_USER = "ec2-user"
KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
REMOTE_DIR = "/home/ec2-user/masclet-imperi"

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

def create_correct_env_file(ssh_client):
    """Crea un archivo .env correcto en el servidor"""
    try:
        env_content = """
# Configuración del entorno para Masclet Imperi Backend
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
"""
        # Escapar comillas para evitar problemas en la línea de comandos
        env_content = env_content.replace('"', '\\"')
        
        # Crear archivo .env usando echo
        cmd = f'echo "{env_content}" > {REMOTE_DIR}/.env'
        success, _ = execute_remote_command(ssh_client, cmd)
        
        if success:
            log("Archivo .env creado correctamente")
            
            # Verificar el contenido
            verify_cmd = f"cat {REMOTE_DIR}/.env"
            success, output = execute_remote_command(ssh_client, verify_cmd)
            
            if success:
                log("Contenido del archivo .env verificado")
            
        return success
    except Exception as e:
        log(f"Error al crear archivo .env: {str(e)}", "ERROR")
        return False

def update_dependencies_and_restart(ssh_client):
    """Actualiza las dependencias y reinicia el contenedor backend"""
    try:
        # Detener el contenedor actual
        stop_cmd = "sudo docker stop masclet-backend"
        execute_remote_command(ssh_client, stop_cmd)
        
        # Eliminar el contenedor actual
        rm_cmd = "sudo docker rm masclet-backend"
        execute_remote_command(ssh_client, rm_cmd)
        
        # Actualizar el Dockerfile para incluir la dependencia faltante
        update_dockerfile_cmd = f'sed -i "/uvicorn/a RUN pip install schedule>=1.2.0" {REMOTE_DIR}/Dockerfile'
        success, _ = execute_remote_command(ssh_client, update_dockerfile_cmd)
        
        if not success:
            log("No se pudo actualizar el Dockerfile", "ERROR")
            return False
        
        # Reconstruir la imagen
        build_cmd = f"cd {REMOTE_DIR} && sudo docker build -t masclet-imperi-api:latest ."
        success, _ = execute_remote_command(ssh_client, build_cmd)
        
        if not success:
            log("Error al reconstruir la imagen Docker", "ERROR")
            return False
        
        # Iniciar nuevo contenedor con la imagen actualizada
        run_cmd = (
            "sudo docker run -d --name masclet-backend "
            "--network masclet-network "
            f"-v {REMOTE_DIR}/logs:/app/logs "
            f"-v {REMOTE_DIR}/uploads:/app/uploads "
            f"-v {REMOTE_DIR}/imports:/app/imports "
            f"-v {REMOTE_DIR}/backups:/app/backups "
            f"-v {REMOTE_DIR}/.env:/app/.env "
            "-p 8000:8000 "
            "masclet-imperi-api:latest"
        )
        success, _ = execute_remote_command(ssh_client, run_cmd)
        
        if not success:
            log("Error al iniciar el nuevo contenedor", "ERROR")
            return False
        
        # Esperar a que el contenedor arranque
        log("Esperando 10 segundos para que el backend se inicie...")
        time.sleep(10)
        
        return True
    except Exception as e:
        log(f"Error en actualización y reinicio: {str(e)}", "ERROR")
        return False

def verify_backend(ssh_client):
    """Verifica que el backend esté funcionando correctamente"""
    try:
        # Verificar estado del contenedor
        ps_cmd = "sudo docker ps | grep masclet-backend"
        success, output = execute_remote_command(ssh_client, ps_cmd)
        
        if not success or not output:
            log("El contenedor del backend no está en ejecución", "ERROR")
            return False
        
        # Verificar logs para asegurarnos que arrancó sin errores
        logs_cmd = "sudo docker logs masclet-backend --tail 20"
        success, logs = execute_remote_command(ssh_client, logs_cmd)
        
        # Verificar conectividad al endpoint de salud
        health_cmd = "curl -s http://localhost:8000/api/v1/health"
        success, health_output = execute_remote_command(ssh_client, health_cmd)
        
        if success and health_output:
            log(f"Endpoint de salud responde: {health_output}", "SUCCESS")
            return True
        else:
            log("El endpoint de salud no responde correctamente", "ERROR")
            
            # Obtener más información si algo falló
            inspect_cmd = "sudo docker inspect masclet-backend"
            execute_remote_command(ssh_client, inspect_cmd)
            
            return False
    except Exception as e:
        log(f"Error en verificación: {str(e)}", "ERROR")
        return False

def create_directories(ssh_client):
    """Crea los directorios necesarios con permisos correctos"""
    try:
        directories = ["logs", "uploads", "imports", "backups"]
        
        for directory in directories:
            mkdir_cmd = f"mkdir -p {REMOTE_DIR}/{directory}"
            execute_remote_command(ssh_client, mkdir_cmd)
            
            # Asignar permisos
            chmod_cmd = f"sudo chmod -R 777 {REMOTE_DIR}/{directory}"
            execute_remote_command(ssh_client, chmod_cmd)
        
        log("Directorios creados y con permisos asignados")
        return True
    except Exception as e:
        log(f"Error en creación de directorios: {str(e)}", "ERROR")
        return False

def main():
    """Función principal de ejecución"""
    log("=== INICIANDO CORRECCIÓN DE BACKEND MASCLET IMPERI ===")
    log(f"Fecha y hora: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    ssh_client = None
    
    try:
        # Crear cliente SSH
        ssh_client = create_ssh_client()
        
        # Crear directorios necesarios
        log("Creando directorios necesarios...")
        create_directories(ssh_client)
        
        # Crear archivo .env correcto
        log("Creando archivo .env correcto...")
        if not create_correct_env_file(ssh_client):
            log("Error al crear archivo .env", "ERROR")
            return
        
        # Actualizar dependencias y reiniciar
        log("Actualizando dependencias y reiniciando contenedor...")
        if not update_dependencies_and_restart(ssh_client):
            log("Error en actualización y reinicio", "ERROR")
            return
        
        # Verificar backend
        log("Verificando estado del backend...")
        if verify_backend(ssh_client):
            log("✅ CORRECCIÓN COMPLETADA CON ÉXITO", "SUCCESS")
        else:
            log("❌ BACKEND NO ESTÁ FUNCIONANDO CORRECTAMENTE", "ERROR")
    
    except KeyboardInterrupt:
        log("Proceso interrumpido por el usuario", "WARNING")
    except Exception as e:
        log(f"Error inesperado: {str(e)}", "ERROR")
        
    finally:
        # Cerrar conexión SSH
        if ssh_client:
            ssh_client.close()
            log("Conexión SSH cerrada")
        
        log("=== FIN DEL PROCESO DE CORRECCIÓN ===")

if __name__ == "__main__":
    main()
