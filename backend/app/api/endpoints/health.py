"""
Endpoint de salud para monitoreo y health checks.
Proporciona información básica sobre el estado del servidor.
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
    Endpoint de verificación de salud (health check) básico.
    Verifica la disponibilidad del servicio para load balancers y herramientas de monitoreo.
    
    Returns:
        Información básica sobre el estado del servicio.
    """
    try:
        # Información básica sobre el servicio
        result = {
            "status": "ok",
            "environment": settings.environment,
            "version": settings.version,
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
    Endpoint de verificación de salud detallado.
    Proporciona información básica sobre el estado del servicio.
    
    Returns:
        Información detallada del estado del servicio.
    """
    # No mostrar información detallada en producción por seguridad
    if settings.environment == "prod":
        return await health_check()
    
    try:
        # Información básica sobre el sistema
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        
        # Obtener información sobre el entorno
        env_info = {
            key: value for key, value in os.environ.items()
            if not any(secret in key.lower() for secret in 
                      ['password', 'secret', 'key', 'token', 'auth'])
        }
        
        # Construir respuesta
        result = {
            "status": "ok",
            "environment": settings.environment,
            "version": settings.version,
            "hostname": hostname,
            "ip": ip_address,
            "timestamp": time.time(),
            "python_version": os.sys.version,
            "system": os.name
        }
        
        # Información sobre la base de datos
        try:
            # Intentar verificar conexión a la base de datos
            from tortoise import Tortoise
            if Tortoise._connections:
                result["database"] = {"status": "connected"}
            else:
                result["database"] = {"status": "not_connected"}
        except Exception as db_error:
            result["database"] = {"status": "error", "message": str(db_error)}
        
        return result
    except Exception as e:
        logger.error(f"Error en health check detallado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al verificar estado del servicio"
        )
