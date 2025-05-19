"""
Sistema de caché para endpoints de API
Proporciona decoradores y utilidades para cachear resultados de endpoints
frecuentemente consultados, reduciendo la carga en la base de datos.
"""
from functools import wraps
import time
import json
from typing import Any, Callable, Dict, Optional, Union, List
from fastapi import Request, Response
from app.core.config import settings
import logging

# Configurar el logger
logger = logging.getLogger("api_cache")

# Almacenamiento de caché en memoria
_CACHE: Dict[str, Dict[str, Any]] = {}

class CacheItem:
    """Representa un elemento en el caché con su TTL y metadatos."""
    def __init__(self, value: Any, ttl_seconds: int = 300):
        self.value = value
        self.expiry = time.time() + ttl_seconds
        self.created_at = time.time()

    def is_expired(self) -> bool:
        """Comprueba si el elemento de caché ha expirado."""
        return time.time() > self.expiry

# Función para limpiar elementos expirados automáticamente
def _cleanup_cache() -> None:
    """Elimina los elementos expirados del caché."""
    for cache_key in list(_CACHE.keys()):
        items_to_remove = []
        for item_key, item in _CACHE[cache_key].items():
            if item.is_expired():
                items_to_remove.append(item_key)
        
        for item_key in items_to_remove:
            del _CACHE[cache_key][item_key]
        
        # Si el caché de este endpoint está vacío, eliminar la entrada
        if not _CACHE[cache_key]:
            del _CACHE[cache_key]

def cached_endpoint(
    ttl_seconds: int = 300,
    include_query_params: bool = True,
    cache_key_prefix: Optional[str] = None,
    skip_cache_condition: Optional[Callable[[Request], bool]] = None,
):
    """
    Decorador para cachear respuestas de endpoints de API.
    
    Args:
        ttl_seconds: Tiempo de vida del caché en segundos (default: 300 = 5 minutos)
        include_query_params: Si se deben incluir los parámetros de consulta en la clave de caché
        cache_key_prefix: Prefijo opcional para la clave de caché
        skip_cache_condition: Función que recibe el Request y retorna True si se debe omitir el caché
    """
    def decorator(endpoint_func):
        @wraps(endpoint_func)
        async def wrapper(*args, **kwargs):
            # No usar caché en modo desarrollo o testing si la configuración lo indica
            if settings.environment in ("dev", "test") and not settings.enable_cache_in_dev:
                return await endpoint_func(*args, **kwargs)
            
            # Extraer request para generar clave de caché
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                for value in kwargs.values():
                    if isinstance(value, Request):
                        request = value
                        break
            
            # Si no podemos obtener el request, no podemos cachear
            if not request:
                logger.warning(f"No se pudo obtener Request para {endpoint_func.__name__}. No se usará caché.")
                return await endpoint_func(*args, **kwargs)
            
            # Comprobar si debemos omitir el caché según la condición
            if skip_cache_condition and skip_cache_condition(request):
                return await endpoint_func(*args, **kwargs)
            
            # Generar clave de caché
            endpoint_path = request.url.path
            if cache_key_prefix:
                endpoint_path = f"{cache_key_prefix}:{endpoint_path}"
            
            # Incluir parámetros de consulta si es necesario
            query_string = ""
            if include_query_params and request.query_params:
                query_string = str(request.query_params)
            
            # Crear clave de caché combinada
            cache_key = f"{endpoint_path}{query_string}"
            
            # Inicializar el caché para este endpoint si no existe
            if endpoint_path not in _CACHE:
                _CACHE[endpoint_path] = {}
            
            # Comprobar si tenemos el resultado en caché y no ha expirado
            if cache_key in _CACHE[endpoint_path] and not _CACHE[endpoint_path][cache_key].is_expired():
                cached_item = _CACHE[endpoint_path][cache_key]
                age = int(time.time() - cached_item.created_at)
                logger.debug(f"HIT: {cache_key} - Edad: {age}s")
                return cached_item.value
            
            # Si no está en caché o ha expirado, ejecutar el endpoint
            response = await endpoint_func(*args, **kwargs)
            
            # Cachear la respuesta
            _CACHE[endpoint_path][cache_key] = CacheItem(response, ttl_seconds)
            logger.debug(f"MISS: {cache_key} - Almacenado en caché por {ttl_seconds}s")
            
            # Limpiar caché expirado ocasionalmente (10% de probabilidad)
            if time.time() % 10 == 0:
                _cleanup_cache()
                
            return response
        return wrapper
    return decorator

# Función para limpiar el caché completo o de endpoints específicos
def clear_cache(endpoint_path: Optional[str] = None) -> int:
    """
    Limpia el caché para un endpoint específico o todo el caché.
    
    Args:
        endpoint_path: Ruta del endpoint para limpiar (None para limpiar todo)
        
    Returns:
        Número de elementos eliminados del caché
    """
    count = 0
    
    if endpoint_path:
        # Limpiar caché para un endpoint específico
        if endpoint_path in _CACHE:
            count = len(_CACHE[endpoint_path])
            del _CACHE[endpoint_path]
            logger.info(f"Caché limpiado para {endpoint_path}: {count} elementos")
    else:
        # Limpiar todo el caché
        for ep in _CACHE:
            count += len(_CACHE[ep])
        _CACHE.clear()
        logger.info(f"Caché completo limpiado: {count} elementos")
    
    return count

# Función para obtener estadísticas de uso del caché
def get_cache_stats() -> Dict[str, Any]:
    """
    Obtiene estadísticas del sistema de caché.
    
    Returns:
        Diccionario con estadísticas del caché
    """
    total_items = 0
    expired_items = 0
    endpoints = len(_CACHE)
    
    # Calcular elementos totales y expirados
    for endpoint_path in _CACHE:
        for _, item in _CACHE[endpoint_path].items():
            total_items += 1
            if item.is_expired():
                expired_items += 1
    
    stats = {
        "total_endpoints": endpoints,
        "total_items": total_items,
        "expired_items": expired_items,
        "active_items": total_items - expired_items,
        "memory_usage_kb": _estimate_memory_usage() / 1024,
        "endpoints": [],
    }
    
    # Añadir detalles por endpoint
    for endpoint_path, items in _CACHE.items():
        endpoint_stats = {
            "path": endpoint_path,
            "items": len(items),
            "oldest_item_age": 0,
            "newest_item_age": float("inf")
        }
        
        now = time.time()
        for _, item in items.items():
            age = now - item.created_at
            endpoint_stats["oldest_item_age"] = max(endpoint_stats["oldest_item_age"], age)
            endpoint_stats["newest_item_age"] = min(endpoint_stats["newest_item_age"], age)
        
        stats["endpoints"].append(endpoint_stats)
    
    return stats

def _estimate_memory_usage() -> int:
    """
    Estima la memoria utilizada por el caché (en bytes).
    Este es un cálculo aproximado.
    """
    usage = 0
    
    for endpoint_path, items in _CACHE.items():
        # Estimar tamaño de la clave del endpoint
        usage += len(endpoint_path)
        
        for item_key, item in items.items():
            # Estimar tamaño de la clave del item
            usage += len(item_key)
            
            # Estimar tamaño de los metadatos del item
            usage += 24  # Aproximadamente el tamaño de los timestamps
            
            # Estimar tamaño del valor (serializado a JSON para aproximar)
            try:
                # Intentar serializar el valor para estimar su tamaño
                serialized = json.dumps(item.value)
                usage += len(serialized)
            except (TypeError, OverflowError):
                # Si no se puede serializar, usar una estimación conservadora
                usage += 1024  # 1KB por objeto que no se puede serializar
    
    return usage
