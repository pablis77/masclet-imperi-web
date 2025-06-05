#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Validador de configuración para despliegue de Masclet Imperi
Fecha: 04/06/2025
Versión: 1.0

Este script valida y comprueba configuraciones antes de generar archivos
de despliegue robustos para cada componente: BD, Backend, Frontend.
"""

import os
import sys
import json
import re
import getpass
from pathlib import Path
from datetime import datetime

# Colores para la terminal
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

# Función para imprimir mensajes con formato
def print_header(text):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'=' * 70}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD} {text}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'=' * 70}{Colors.END}")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text):
    print(f" ℹ {text}")

# Obtener rutas absolutas principales
BASE_DIR = Path(__file__).parent.parent.parent.absolute()
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
DEPLOYMENT_DIR = BASE_DIR / "deployment"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

# Crear directorio para archivos de configuración validados
VALIDATED_CONFIG_DIR = DEPLOYMENT_DIR / f"config_validada_{TIMESTAMP}"
os.makedirs(VALIDATED_CONFIG_DIR, exist_ok=True)

print_header(f"VALIDADOR DE CONFIGURACIÓN PARA DESPLIEGUE - {TIMESTAMP}")
print_info(f"Directorio base: {BASE_DIR}")
print_info(f"Directorio de configuración validada: {VALIDATED_CONFIG_DIR}")

# 1. Comprobar configuración de la base de datos
def check_database_config():
    print_header("1. VALIDACIÓN DE CONFIGURACIÓN DE BASE DE DATOS")
    
    # Variables por defecto
    db_defaults = {
        'DB_HOST': 'db',  # Nombre del servicio en docker-compose
        'DB_PORT': '5432',
        'DB_NAME': 'masclet_imperi',
        'DB_USER': 'postgres',
        'DB_PASSWORD': '1234',
    }
    
    # Buscar archivos .env que puedan contener configuración de BD
    env_files = [
        BACKEND_DIR / ".env",
        BACKEND_DIR / ".env.production",
        BASE_DIR / ".env",
        DEPLOYMENT_DIR / ".env",
    ]
    
    db_config = db_defaults.copy()
    
    for env_file in env_files:
        if env_file.exists():
            print_info(f"Analizando {env_file}...")
            try:
                with open(env_file, 'r') as f:
                    for line in f:
                        if '=' in line and not line.strip().startswith('#'):
                            key, value = line.strip().split('=', 1)
                            if key in db_config and value:
                                db_config[key] = value
                                print_info(f"  Encontrado {key}={value}")
            except Exception as e:
                print_error(f"Error al leer {env_file}: {e}")
    
    # Mostrar configuración detectada
    print_info("\nConfiguración de base de datos detectada:")
    for key, value in db_config.items():
        # Ocultar contraseña parcialmente
        if key == 'DB_PASSWORD':
            masked_value = value[0] + '*' * (len(value) - 2) + value[-1] if len(value) > 2 else '***'
            print(f"  {key} = {masked_value}")
        else:
            print(f"  {key} = {value}")
    
    # Generar archivo de configuración para docker-compose
    db_env_content = "\n".join([f"{k}={v}" for k, v in db_config.items()])
    
    db_env_file = VALIDATED_CONFIG_DIR / f"db.env.{TIMESTAMP}"
    with open(db_env_file, 'w') as f:
        f.write(f"# Configuración de base de datos validada\n")
        f.write(f"# Generada por validar_config_despliegue.py el {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write(db_env_content)
    
    print_success(f"Archivo de configuración de BD generado: {db_env_file}")
    
    # Validar conexión a la base de datos existente
    print_info("\nComprobando la base de datos existente en AWS...")
    
    # Para validar la DB en AWS necesitamos SSH + psql
    print_info("Para verificar la base de datos en AWS, ejecutaremos comandos remotos")
    print_info("a través de SSH para consultar la estructura y datos de la DB")
    
    # Crear script de consulta SQL para comprobar tablas y conteos
    sql_check = [
        "\\echo '=== TABLAS DE LA BASE DE DATOS ===';",
        "\\dt;",
        "\\echo '\n=== CONTEO DE REGISTROS ===';",
        "SELECT 'animales' as tabla, COUNT(*) FROM animal;",
        "SELECT 'partos' as tabla, COUNT(*) FROM parto;",
        "SELECT 'usuarios' as tabla, COUNT(*) FROM usuario;",
        "SELECT 'explotaciones' as tabla, COUNT(*) FROM explotacio;",
        "\\echo '\n=== USUARIOS DEL SISTEMA ===';",
        "SELECT id, username, email, is_active, is_superuser FROM usuario LIMIT 5;"
    ]
    
    # Guardar el script SQL en un archivo temporal
    sql_file = VALIDATED_CONFIG_DIR / "check_db.sql"
    with open(sql_file, 'w') as f:
        f.write('\n'.join(sql_check))
    
    print_info(f"Script SQL de comprobación guardado en {sql_file}")
    print_warning("Este script debe ejecutarse manualmente en AWS para verificar la DB")
    print_info("Comando para ejecutar remotamente (desde local):")
    print(f"""    ssh -i "C:\\Proyectos\\primeros proyectos\\AWS\\masclet-imperi-key.pem" ec2-user@108.129.139.119 \
    "docker exec -i masclet-db psql -U postgres -d masclet_imperi -f -" < {sql_file}
    """)
    
    print_info("Al ejecutar el comando anterior, podrás verificar si la base de datos")
    print_info("está en buen estado y contiene datos que quieras preservar.")
    
    # Guardar comando para reiniciar y verificar el contenedor DB
    db_commands_file = VALIDATED_CONFIG_DIR / "verificar_db_aws.sh"
    with open(db_commands_file, 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("# Comandos para verificar el estado de la base de datos en AWS\n")
        f.write("echo '=== ESTADO DEL CONTENEDOR DE LA BASE DE DATOS ==='\n")
        f.write("docker ps -a | grep masclet-db\n\n")
        f.write("echo '=== LOGS RECIENTES DE LA BASE DE DATOS ==='\n")
        f.write("docker logs --tail 20 masclet-db\n\n")
        f.write("echo '=== REINICIAR BASE DE DATOS SI ESTÁ DETENIDA ==='\n")
        f.write("docker start masclet-db\n\n")
        f.write("echo '=== COMPROBAR CONECTIVIDAD ==='\n")
        f.write("docker exec -it masclet-db pg_isready -U postgres\n")
    
    print_info(f"\nScript de verificación de DB guardado en {db_commands_file}")
    print_info("Este script se puede copiar a AWS para diagnosticar problemas")
    
    # Retorna la configuración detectada
    return db_config

# 2. Comprobar configuración del backend
def check_backend_config():
    print_header("2. VALIDACIÓN DE CONFIGURACIÓN DEL BACKEND")
    
    # Verificar archivos .env del backend
    backend_env_files = [
        BACKEND_DIR / ".env",
        BACKEND_DIR / ".env.production",
        BASE_DIR / ".env",
    ]
    
    backend_config = {
        'SECRET_KEY': None,
        'JWT_SECRET': None,
        'ACCESS_TOKEN_EXPIRE_MINUTES': '60',
        'ALGORITHM': 'HS256',
        'CORS_ORIGINS': 'http://localhost,http://localhost:3000',
        'DB_CONNECTION_STRING': None,  # Se construirá desde la config de BD
        'DOMAIN': None,
        'API_DOMAIN': None,
        'BACKUP_RETENTION_DAYS': '14',
        'BACKUP_DIR': '/var/backups/masclet-imperi',
        'ENV': 'production',
        'APP_NAME': 'Masclet Imperi API',
        'ADMIN_EMAIL': None,
        'LOG_LEVEL': 'WARNING',
        'ENABLE_RATE_LIMIT': 'True',
        'RATE_LIMIT_REQUESTS': '50',
        'RATE_LIMIT_WINDOW': '60',
    }
    
    # Leer configuración de archivos .env
    for env_file in backend_env_files:
        if env_file.exists():
            print_info(f"Analizando {env_file}...")
            try:
                with open(env_file, 'r') as f:
                    for line in f:
                        if '=' in line and not line.strip().startswith('#'):
                            try:
                                key, value = line.strip().split('=', 1)
                                if key in backend_config and value:
                                    backend_config[key] = value
                                    # No mostrar claves secretas
                                    if 'SECRET' in key or 'KEY' in key:
                                        print_info(f"  Encontrado {key}=******")
                                    else:
                                        print_info(f"  Encontrado {key}={value}")
                            except ValueError:
                                continue
            except Exception as e:
                print_error(f"Error al leer {env_file}: {e}")
    
    # Validar configuración del backend
    missing_keys = [k for k, v in backend_config.items() if v is None]
    if missing_keys:
        print_warning(f"Faltan valores para las siguientes claves: {', '.join(missing_keys)}")
    
    # Generar archivo de configuración para el backend
    backend_env_content = "# Configuración del backend validada\n"
    backend_env_content += f"# Generada por validar_config_despliegue.py el {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n"
    
    # Añadir variables de entorno
    for k, v in backend_config.items():
        if v is not None:
            backend_env_content += f"{k}={v}\n"
    
    # Guardar archivo de configuración
    backend_env_file = VALIDATED_CONFIG_DIR / f"backend.env.{TIMESTAMP}"
    with open(backend_env_file, 'w') as f:
        f.write(backend_env_content)
    
    print_success(f"Archivo de configuración de backend generado: {backend_env_file}")
    
    # Generar Dockerfile optimizado para el backend
    generate_backend_dockerfile(backend_config)
    
    return backend_config

# Generar Dockerfile para el backend
def generate_backend_dockerfile(backend_config):
    print_info("Generando Dockerfile optimizado para el backend...")
    
    dockerfile_content = """# Dockerfile optimizado para Masclet Imperi API
# Generado por validar_config_despliegue.py el {timestamp}

# Stage 1: Compilación y dependencias
FROM python:3.11.11-slim as builder

# Configuración de pip
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalación de dependencias de compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Creación de virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copiado e instalación de dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Stage 2: Imagen final
FROM python:3.11.11-slim

# Variables de entorno
ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Instalación de dependencias runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copiado de virtualenv y código
COPY --from=builder /opt/venv /opt/venv
COPY ./app /app/app

# Directorio para backups
RUN mkdir -p {backup_dir} && chmod 777 {backup_dir}

# Usuario no privilegiado
RUN useradd -m appuser && chown -R appuser /app {backup_dir}
USER appuser

# Healthcheck - usando netcat
HEALTHCHECK --interval=30s --timeout=30s --retries=3 \
    CMD ["bash", "-c", "exec 3<>/dev/tcp/localhost/8000 && echo -e 'GET /api/v1/health HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3 && cat <&3 | grep -q 'ok'"]

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
""".format(
        timestamp=datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
        backup_dir=backend_config.get('BACKUP_DIR', '/var/backups/masclet-imperi')
    )
    
    # Guardar Dockerfile
    dockerfile_file = VALIDATED_CONFIG_DIR / f"Dockerfile.backend.{TIMESTAMP}"
    with open(dockerfile_file, 'w') as f:
        f.write(dockerfile_content)
    
    print_success(f"Dockerfile de backend generado: {dockerfile_file}")
    
    # Generar script para construir y desplegar backend
    deploy_script = """#!/bin/bash
# Script para construir y desplegar backend de Masclet Imperi
# Generado por validar_config_despliegue.py el {timestamp}

# Construir imagen de backend
echo "=== Construyendo imagen de backend ==="
docker build -t masclet-imperi-api:latest -f Dockerfile.backend .

# Detener contenedor existente si está en ejecución
echo "=== Deteniendo contenedor existente ==="
docker stop masclet-backend || true
docker rm masclet-backend || true

# Iniciar nuevo contenedor
echo "=== Iniciando nuevo contenedor ==="
docker run -d --name masclet-backend \
  --env-file backend.env \
  --network masclet-network \
  -p 8000:8000 \
  --restart unless-stopped \
  masclet-imperi-api:latest

# Verificar estado
echo "=== Estado del contenedor ==="
docker ps -a | grep masclet-backend

# Ver logs
echo "=== Logs del contenedor ==="
docker logs --tail 10 masclet-backend
""".format(
        timestamp=datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    )
    
    # Guardar script
    deploy_script_file = VALIDATED_CONFIG_DIR / f"deploy_backend.sh.{TIMESTAMP}"
    with open(deploy_script_file, 'w') as f:
        f.write(deploy_script)
    
    print_success(f"Script de despliegue de backend generado: {deploy_script_file}")

# Función principal
def main():
    print_header("INICIANDO VALIDACIÓN DE CONFIGURACIÓN")
    
    # Paso 1: Validar configuración de base de datos
    db_config = check_database_config()
    
    # Paso 2: Validar configuración del backend
    backend_config = check_backend_config()
    
    print_header("RESUMEN DE VALIDACIÓN")
    print_success("✅ Análisis inicial completado")
    print_info("Para validar más componentes, ejecute la fase 2 de este script")
    print_info(f"Los archivos de configuración validados se encuentran en {VALIDATED_CONFIG_DIR}")

if __name__ == "__main__":
    main()
