#!/usr/bin/env python3
"""
Script para transferir un Dockerfile robusto al servidor AWS EC2
Creado: 04/06/2025
Masclet Imperi Web - Despliegue Profesional
"""

import os
import sys
import subprocess
import tempfile

# Configuración
SSH_KEY_PATH = r"C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
EC2_USER = "ec2-user"
EC2_HOST = "108.129.139.119"
REMOTE_PATH = "/home/ec2-user/masclet-imperi"

# Dockerfile robusto con multi-etapa y optimizaciones
DOCKERFILE_CONTENT = """# Dockerfile optimizado para Masclet Imperi API
# Versión de producción - 04/06/2025

# Stage 1: Compilación y dependencias
FROM python:3.11.11-slim as builder

# Configuración de pip
ENV PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalación de dependencias de compilación
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
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
ENV PYTHONPATH=/app \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PATH="/opt/venv/bin:$PATH"

# Instalación de dependencias runtime
RUN apt-get update && apt-get install -y --no-install-recommends \\
    libpq5 \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copiado de virtualenv y código
COPY --from=builder /opt/venv /opt/venv
COPY ./backend /app

# Crear directorios necesarios con permisos adecuados
RUN mkdir -p /app/logs /app/uploads /app/backups /app/imports && chmod -R 777 /app/logs /app/uploads /app/backups /app/imports

# Usuario no privilegiado
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Healthcheck usando curl
HEALTHCHECK --interval=30s --timeout=30s --retries=3 \\
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Comando de arranque
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

def main():
    """Función principal para transferir el Dockerfile al servidor AWS"""
    print("=== Transferencia de Dockerfile robusto para Masclet Imperi API ===")
    
    # Crear archivo temporal local
    with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.dockerfile') as temp_file:
        temp_file_path = temp_file.name
        temp_file.write(DOCKERFILE_CONTENT)
        print(f"Archivo temporal creado: {temp_file_path}")
    
    try:
        # Transferir archivo al servidor
        print("Transfiriendo Dockerfile al servidor AWS EC2...")
        scp_command = f'scp -i "{SSH_KEY_PATH}" "{temp_file_path}" {EC2_USER}@{EC2_HOST}:{REMOTE_PATH}/Dockerfile'
        subprocess.run(scp_command, shell=True, check=True)
        
        # Verificar que el archivo se transfirió correctamente
        print("Verificando transferencia...")
        verify_command = f'ssh -i "{SSH_KEY_PATH}" {EC2_USER}@{EC2_HOST} "ls -la {REMOTE_PATH}/Dockerfile"'
        subprocess.run(verify_command, shell=True, check=True)
        
        print("Dockerfile transferido correctamente.")
        
        # Construir la imagen Docker
        print("Construyendo imagen Docker...")
        build_command = f'ssh -i "{SSH_KEY_PATH}" {EC2_USER}@{EC2_HOST} "cd {REMOTE_PATH} && docker build -t masclet-imperi-api:production ."'
        subprocess.run(build_command, shell=True, check=True)
        
        print("=== Proceso completado con éxito ===")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {e}")
        return 1
    finally:
        # Eliminar archivo temporal
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
            print(f"Archivo temporal eliminado: {temp_file_path}")

if __name__ == "__main__":
    sys.exit(main())
