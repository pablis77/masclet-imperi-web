"""
Utilidad para gestionar entornos y controlar funcionalidades según el entorno.
Permite habilitar/deshabilitar endpoints y funciones según estemos en desarrollo o producción.
"""
from fastapi import HTTPException, Request
from functools import wraps
from typing import Callable, List, Optional, TypeVar, cast
from app.core.config import settings
import logging

# Configurar logger
logger = logging.getLogger("environment")

# Tipo genérico para la función decorada
F = TypeVar('F', bound=Callable)

def development_only(endpoint_func: F) -> F:
    """
    Decorador para marcar un endpoint como disponible solo en entorno de desarrollo.
    En producción, devolverá un error 404 Not Found.
    
    Ejemplo:
        @app.get("/api/v1/debug/status")
        @development_only
        async def debug_status():
            return {"status": "ok", "environment": "development"}
    """
    @wraps(endpoint_func)
    async def wrapper(*args, **kwargs):
        # Verificar si estamos en entorno de desarrollo
        if settings.environment not in ("dev", "test"):
            # En producción, simular que el endpoint no existe devolviendo 404
            raise HTTPException(
                status_code=404,
                detail="Endpoint not found"
            )
        
        # En desarrollo, ejecutar el endpoint normalmente
        return await endpoint_func(*args, **kwargs)
    
    return cast(F, wrapper)

def testing_only(endpoint_func: F) -> F:
    """
    Decorador para marcar un endpoint como disponible solo en entorno de pruebas.
    En desarrollo o producción, devolverá un error 404 Not Found.
    
    Ejemplo:
        @app.post("/api/v1/test/reset-database")
        @testing_only
        async def reset_test_database():
            # Código para resetear base de datos de pruebas
            return {"status": "database_reset"}
    """
    @wraps(endpoint_func)
    async def wrapper(*args, **kwargs):
        # Verificar si estamos en entorno de pruebas
        if not settings.testing:
            # Si no estamos en testing, simular que el endpoint no existe
            raise HTTPException(
                status_code=404,
                detail="Endpoint not found"
            )
        
        # En entorno de pruebas, ejecutar el endpoint normalmente
        return await endpoint_func(*args, **kwargs)
    
    return cast(F, wrapper)

def debug_only(include_test: bool = True) -> Callable[[F], F]:
    """
    Decorador para marcar un endpoint como disponible solo en modo debug.
    Si debug=False en la configuración, devolverá un error 404 Not Found.
    
    Args:
        include_test: Si True, también permitirá el acceso en entorno de pruebas
        
    Ejemplo:
        @app.get("/api/v1/debug/logs")
        @debug_only()
        async def get_debug_logs():
            return {"logs": get_recent_logs()}
    """
    def decorator(endpoint_func: F) -> F:
        @wraps(endpoint_func)
        async def wrapper(*args, **kwargs):
            # Verificar si el modo debug está habilitado
            if not settings.debug and not (include_test and settings.testing):
                # Si debug está desactivado, simular que el endpoint no existe
                raise HTTPException(
                    status_code=404,
                    detail="Endpoint not found"
                )
            
            # En modo debug, ejecutar el endpoint normalmente
            return await endpoint_func(*args, **kwargs)
        
        return cast(F, wrapper)
    
    return decorator

def production_only(endpoint_func: F) -> F:
    """
    Decorador para marcar un endpoint como disponible solo en entorno de producción.
    En desarrollo, devolverá un error 404 Not Found.
    
    Ejemplo:
        @app.get("/api/v1/metrics")
        @production_only
        async def get_production_metrics():
            return {"metrics": get_system_metrics()}
    """
    @wraps(endpoint_func)
    async def wrapper(*args, **kwargs):
        # Verificar si estamos en entorno de producción
        if settings.environment != "prod":
            # Si no estamos en producción, simular que el endpoint no existe
            raise HTTPException(
                status_code=404,
                detail="Endpoint not found"
            )
        
        # En producción, ejecutar el endpoint normalmente
        return await endpoint_func(*args, **kwargs)
    
    return cast(F, wrapper)

def check_environment() -> dict:
    """
    Devuelve información sobre el entorno actual.
    Útil para diagnóstico y verificación de configuración.
    """
    env_info = {
        "environment": settings.environment,
        "debug": settings.debug,
        "testing": settings.testing,
        "is_development": settings.environment == "dev",
        "is_production": settings.environment == "prod",
        "is_test": settings.environment == "test" or settings.testing,
    }
    
    return env_info
