#!/usr/bin/env python
"""
Script para corregir el endpoint de salud en el servidor de producción.
"""
import sys
import os
import argparse
import subprocess
import tempfile

def main():
    # Configurar el parser de argumentos
    parser = argparse.ArgumentParser(description='Corregir endpoint de salud en producción')
    parser.add_argument('--ec2-ip', required=True, help='Dirección IP del servidor EC2')
    parser.add_argument('--pem-path', required=True, help='Ruta al archivo .pem para SSH')
    args = parser.parse_args()
    
    # Crear el archivo de corrección
    health_py_fix = """
\"\"\"
Endpoint de salud para monitoreo y health checks.
Proporciona información básica sobre el estado del servidor.
\"\"\"
from fastapi import APIRouter, Depends, HTTPException, status
from tortoise.exceptions import OperationalError
from app.core.config import settings
import time
import logging
import socket
import os
from typing import Dict, Any

router = APIRouter(prefix="/health", tags=["health"])
logger = logging.getLogger(__name__)

@router.get("", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, Any]:
    \"\"\"
    Endpoint de verificación de salud (health check) básico.
    Verifica la disponibilidad del servicio para load balancers y herramientas de monitoreo.
    
    Returns:
        Información básica sobre el estado del servicio.
    \"\"\"
    try:
        # Información básica sobre el servicio
        result = {
            "status": "ok",
            "environment": getattr(settings, 'environment', 'production'),
            "version": getattr(settings, 'version', '1.0.0'),
            "timestamp": time.time()
        }
        return result
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al verificar estado del servicio"
        )

@router.get("/detailed", status_code=status.HTTP_200_OK)
async def detailed_health_check() -> Dict[str, Any]:
    \"\"\"
    Endpoint de verificación de salud detallado.
    Proporciona información básica sobre el estado del servicio.
    
    Returns:
        Información detallada del estado del servicio.
    \"\"\"
    # No mostrar información detallada en producción por seguridad
    if getattr(settings, 'environment', 'production') == "production":
        return {
            "status": "ok",
            "message": "Información detallada no disponible en producción"
        }
        
    hostname = socket.gethostname()
    
    try:
        # Información del sistema
        system_info = {
            "hostname": hostname,
            "ip": socket.gethostbyname(hostname),
            "python_version": sys.version,
            "environment": getattr(settings, 'environment', 'production'),
            "version": getattr(settings, 'version', '1.0.0'),
            "timestamp": time.time(),
            "process_id": os.getpid(),
            "uptime_seconds": time.time() - process_start_time
        }
        
        # Verificar base de datos y otros servicios críticos si es necesario
        # Esta parte se puede extender para verificar más servicios
        
        return {
            "status": "ok",
            "system": system_info,
            # Añadir más información de otros servicios si es necesario
        }
    except Exception as e:
        logger.error(f"Error en detailed health check: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al verificar estado detallado del servicio"
        )

# Variable global para calcular el uptime
process_start_time = time.time()
"""
    
    print("🔧 Generando archivo de corrección...")
    
    # Crear archivo temporal con la corrección
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp:
        temp.write(health_py_fix)
        temp_file = temp.name
    
    try:
        print(f"📤 Copiando archivo al servidor {args.ec2_ip}...")
        # Copiar el archivo al servidor
        subprocess.run([
            'scp', 
            '-i', args.pem_path, 
            temp_file, 
            f'ec2-user@{args.ec2_ip}:/home/ec2-user/health.py'
        ], check=True)
        
        print("🔄 Aplicando corrección al contenedor masclet-api...")
        # Copiar el archivo dentro del contenedor
        subprocess.run([
            'ssh',
            '-i', args.pem_path,
            f'ec2-user@{args.ec2_ip}',
            'docker cp /home/ec2-user/health.py masclet-api:/app/app/api/endpoints/health.py'
        ], check=True)
        
        print("🔄 Reiniciando el contenedor masclet-api...")
        # Reiniciar el contenedor
        subprocess.run([
            'ssh',
            '-i', args.pem_path,
            f'ec2-user@{args.ec2_ip}',
            'docker restart masclet-api'
        ], check=True)
        
        print("✅ Corrección aplicada correctamente. El servicio debería estar funcionando en unos segundos.")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al aplicar la corrección: {e}")
        return 1
    finally:
        # Limpiar el archivo temporal
        os.unlink(temp_file)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
