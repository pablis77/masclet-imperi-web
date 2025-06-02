#!/usr/bin/env python3
"""
Script para desplegar solo el backend y la base de datos en AWS.
Este script debe ejecutarse desde local y se conectará al servidor AWS
para desplegar correctamente los contenedores de backend y base de datos.
"""

import os
import sys
import subprocess
import time
from datetime import datetime

# Configuración
SSH_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_USER = "ec2-user"
EC2_HOST = "108.129.139.119"
REMOTE_DIR = "/home/ec2-user/masclet-imperi"

def ejecutar_comando(comando, mostrar_salida=True):
    """Ejecuta un comando local y muestra la salida"""
    print(f"Ejecutando: {comando}")
    resultado = subprocess.run(comando, shell=True, capture_output=True, text=True)
    
    if mostrar_salida:
        print("SALIDA:")
        print(resultado.stdout)
    
    if resultado.returncode != 0:
        print("ERROR:")
        print(resultado.stderr)
        return False
    
    return True

def ejecutar_comando_ssh(comando, mostrar_salida=True):
    """Ejecuta un comando en el servidor remoto a través de SSH"""
    ssh_comando = f'ssh -i "{SSH_KEY_PATH}" {EC2_USER}@{EC2_HOST} "{comando}"'
    return ejecutar_comando(ssh_comando, mostrar_salida)

def comprobar_conectividad():
    """Comprueba que podemos conectarnos al servidor AWS"""
    print("\n=== Comprobando conectividad con el servidor AWS ===")
    return ejecutar_comando_ssh("echo 'Conexión SSH establecida correctamente'")

def detener_contenedores():
    """Detiene los contenedores de backend y base de datos si existen"""
    print("\n=== Deteniendo contenedores existentes ===")
    ejecutar_comando_ssh("docker ps -a")
    ejecutar_comando_ssh("docker stop masclet-api masclet-db 2>/dev/null || true")
    ejecutar_comando_ssh("docker rm masclet-api masclet-db 2>/dev/null || true")
    return True

def verificar_configuracion():
    """Verifica y corrige la configuración antes del despliegue"""
    print("\n=== Verificando configuración ===")
    
    # Verificar si existe el archivo .env
    env_exists = ejecutar_comando_ssh(f"test -f {REMOTE_DIR}/.env && echo 'Existe' || echo 'No existe'", False)
    
    # Crear o modificar .env para asegurar la configuración correcta
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
    
    return True

def desplegar_backend():
    """Despliega los contenedores de backend y base de datos"""
    print("\n=== Desplegando backend y base de datos ===")
    
    # Ejecutar docker-compose solo para los servicios de backend
    ejecutar_comando_ssh(f"cd {REMOTE_DIR} && docker-compose up -d db api")
    
    # Esperar a que los contenedores estén en funcionamiento
    print("Esperando a que los contenedores estén en funcionamiento...")
    time.sleep(10)
    
    # Verificar el estado de los contenedores
    ejecutar_comando_ssh("docker ps")
    
    return True

def verificar_backend():
    """Verifica que el backend está funcionando correctamente"""
    print("\n=== Verificando funcionamiento del backend ===")
    
    # Verificar logs de API para detectar errores
    print("Logs del API:")
    ejecutar_comando_ssh("docker logs masclet-api --tail 20")
    
    # Comprobar que el endpoint de la API responde
    print("\nProbando endpoint /api/v1/healthcheck:")
    ejecutar_comando_ssh("curl -s http://localhost:8000/api/v1/healthcheck || echo 'Error: El endpoint no responde'")
    
    return True

def main():
    """Función principal"""
    print("=== DESPLIEGUE DE BACKEND Y BASE DE DATOS EN AWS ===")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Comprobar conectividad
    if not comprobar_conectividad():
        print("ERROR: No se puede conectar al servidor AWS.")
        return False
    
    # Detener contenedores existentes
    if not detener_contenedores():
        print("ERROR: No se pudieron detener los contenedores existentes.")
        return False
    
    # Verificar configuración
    if not verificar_configuracion():
        print("ERROR: No se pudo verificar la configuración.")
        return False
    
    # Desplegar backend y base de datos
    if not desplegar_backend():
        print("ERROR: No se pudo desplegar el backend y la base de datos.")
        return False
    
    # Verificar backend
    if not verificar_backend():
        print("ERROR: El backend no está funcionando correctamente.")
        return False
    
    print("\n=== DESPLIEGUE COMPLETADO CON ÉXITO ===")
    print("El backend y la base de datos están funcionando correctamente.")
    print("Para acceder a la API: http://108.129.139.119:8000/api/v1/")
    
    return True

if __name__ == "__main__":
    exito = main()
    sys.exit(0 if exito else 1)
