"""
Endpoint de salud para monitoreo y health checks.
Proporciona informacion basica sobre el estado del servidor.
"""
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
    """
    Endpoint de verificacion de salud (health check) basico.
    Verifica la disponibilidad del servicio para load balancers y herramientas de monitoreo.
    
    Returns:
        Informacion basica sobre el estado del servicio.
    """
    try:
        # Informacion basica sobre el servicio
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
    """
    Endpoint de verificacion de salud detallado.
    Proporciona informacion basica sobre el estado del servicio.
    
    Returns:
        Informacion detallada del estado del servicio.
    """
    # No mostrar informacion detallada en produccion por seguridad
    if getattr(settings, 'environment', 'production') == "production":
        return {
            "status": "ok",
            "message": "Informacion detallada no disponible en produccion"
        }
        
    hostname = socket.gethostname()
    
    try:
        # Informacion del sistema
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
        
        # Verificar base de datos y otros servicios criticos si es necesario
        # Esta parte se puede extender para verificar mas servicios
        
        return {
            "status": "ok",
            "system": system_info,
            # Anadir mas informacion de otros servicios si es necesario
        }
    except Exception as e:
        logger.error(f"Error en detailed health check: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al verificar estado detallado del servicio"
        )

# Variable global para calcular el uptime
process_start_time = time.time()
