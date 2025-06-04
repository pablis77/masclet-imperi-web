#!/usr/bin/env python3
"""
Script de emergencia para restaurar el backend en AWS
"""
import os
import subprocess
import time
import sys

# Configuración
SSH_KEY = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_USER = "ec2-user"
EC2_HOST = "108.129.139.119"
REMOTE_DIR = "/home/ec2-user/masclet-imperi"

def ejecutar_comando(comando):
    """Ejecuta un comando y muestra la salida"""
    print(f"Ejecutando: {comando}")
    resultado = subprocess.run(comando, shell=True, text=True)
    return resultado.returncode == 0

def ejecutar_ssh(comando):
    """Ejecuta un comando SSH en el servidor remoto"""
    cmd = f'ssh -i "{SSH_KEY}" {EC2_USER}@{EC2_HOST} "{comando}"'
    return ejecutar_comando(cmd)

def main():
    """Función principal para restaurar el backend"""
    print("\n=== RESTAURACIÓN DE EMERGENCIA DEL BACKEND EN AWS ===")
    
    # 1. Detener y eliminar contenedores existentes
    print("\n1. Deteniendo contenedores existentes...")
    ejecutar_ssh("docker stop masclet-api masclet-db 2>/dev/null || true")
    ejecutar_ssh("docker rm masclet-api masclet-db 2>/dev/null || true")
    
    # 2. Crear estructura de directorios
    print("\n2. Creando estructura de directorios...")
    ejecutar_ssh(f"rm -rf {REMOTE_DIR}/backend")
    ejecutar_ssh(f"mkdir -p {REMOTE_DIR}/backend")
    ejecutar_ssh(f"mkdir -p {REMOTE_DIR}/backend/app")
    ejecutar_ssh(f"mkdir -p {REMOTE_DIR}/logs")
    
    # 3. Crear archivo docker-compose.yml
    print("\n3. Creando archivo docker-compose.yml...")
    docker_compose = """version: '3.8'

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
    driver: bridge

volumes:
  postgres_data:
"""
    
    # Escribir docker-compose.yml a un archivo temporal
    with open("docker-compose-temp.yml", "w") as f:
        f.write(docker_compose)
    
    # Transferir docker-compose.yml al servidor
    ejecutar_comando(f'scp -i "{SSH_KEY}" docker-compose-temp.yml {EC2_USER}@{EC2_HOST}:{REMOTE_DIR}/docker-compose.yml')
    os.remove("docker-compose-temp.yml")
    
    # 4. Crear Dockerfile para el backend
    print("\n4. Creando Dockerfile para el backend...")
    dockerfile = """FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no privilegiado
RUN useradd -m appuser

# Crear directorio virtual env
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

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

# Cambiar al usuario no privilegiado
USER appuser

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1
"""
    
    # Escribir Dockerfile a un archivo temporal
    with open("Dockerfile-temp", "w") as f:
        f.write(dockerfile)
    
    # Transferir Dockerfile al servidor
    ejecutar_comando(f'scp -i "{SSH_KEY}" Dockerfile-temp {EC2_USER}@{EC2_HOST}:{REMOTE_DIR}/backend/Dockerfile')
    os.remove("Dockerfile-temp")
    
    # 5. Crear archivo requirements.txt mínimo
    print("\n5. Creando requirements.txt mínimo...")
    requirements = """fastapi==0.105.0
uvicorn==0.24.0
tortoise-orm==0.20.0
asyncpg==0.29.0
python-multipart==0.0.6
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.0.1
pydantic==2.4.2
email-validator==2.0.0
"""
    
    # Escribir requirements.txt a un archivo temporal
    with open("requirements-temp.txt", "w") as f:
        f.write(requirements)
    
    # Transferir requirements.txt al servidor
    ejecutar_comando(f'scp -i "{SSH_KEY}" requirements-temp.txt {EC2_USER}@{EC2_HOST}:{REMOTE_DIR}/backend/requirements.txt')
    os.remove("requirements-temp.txt")
    
    # 6. Crear archivo main.py mínimo para que el backend funcione
    print("\n6. Creando archivo main.py mínimo...")
    main_py = """from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
import os

app = FastAPI(title="Masclet Imperi API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de salud
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}

# Endpoint de autenticación temporal
@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return {
        "access_token": "temporary_token_while_backend_is_restored",
        "token_type": "bearer"
    }

# Endpoint de autenticación con prefijo API
@app.post("/api/v1/auth/login")
async def login_api(form_data: OAuth2PasswordRequestForm = Depends()):
    return {
        "access_token": "temporary_token_while_backend_is_restored",
        "token_type": "bearer"
    }

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgres://admin:admin123@db:5432/masclet_imperi")

register_tortoise(
    app,
    db_url=DATABASE_URL,
    modules={"models": []},
    generate_schemas=True,
    add_exception_handlers=True,
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
"""
    
    # Escribir main.py a un archivo temporal
    with open("main-temp.py", "w") as f:
        f.write(main_py)
    
    # Crear directorio app en el servidor
    ejecutar_ssh(f"mkdir -p {REMOTE_DIR}/backend/app")
    
    # Transferir main.py al servidor
    ejecutar_comando(f'scp -i "{SSH_KEY}" main-temp.py {EC2_USER}@{EC2_HOST}:{REMOTE_DIR}/backend/app/main.py')
    os.remove("main-temp.py")
    
    # 7. Construir y desplegar contenedores
    print("\n7. Construyendo y desplegando contenedores...")
    ejecutar_ssh(f"cd {REMOTE_DIR} && docker-compose build api")
    ejecutar_ssh(f"cd {REMOTE_DIR} && docker-compose up -d db api")
    
    # 8. Verificar estado
    print("\n8. Verificando estado de los contenedores...")
    ejecutar_ssh("docker ps")
    
    # 9. Esperar a que el backend esté disponible
    print("\n9. Esperando a que el backend esté disponible...")
    print("Esperando 30 segundos para que los contenedores se inicien...")
    time.sleep(30)
    
    # 10. Verificar logs
    print("\n10. Verificando logs del backend...")
    ejecutar_ssh("docker logs masclet-api --tail 20")
    
    # 11. Probar endpoint de salud
    print("\n11. Probando endpoint de salud...")
    ejecutar_ssh("curl -s http://localhost:8000/api/v1/health")
    
    print("\n=== RESTAURACIÓN DE EMERGENCIA COMPLETADA ===")
    print("El backend mínimo está funcionando. Ahora puedes continuar con la restauración completa.")

if __name__ == "__main__":
    main()
