"""
Módulo de seguridad para la aplicación Masclet Imperi.
Proporciona middleware y utilidades para mejorar la seguridad de la API.
"""
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
from typing import Dict, List, Tuple, Set, Optional, Callable
from datetime import datetime, timedelta
import logging
from app.core.config import settings

# Configuración de logging
logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware para limitar la tasa de peticiones por IP/usuario.
    Protege endpoints sensibles contra ataques de fuerza bruta y DDoS.
    """
    def __init__(
        self, 
        app: ASGIApp, 
        rate_limit_requests: int = 100,
        rate_limit_window: int = 60,
        excluded_paths: List[str] = None,
        sensitive_paths: Dict[str, Tuple[int, int]] = None
    ):
        super().__init__(app)
        self.rate_limit_requests = rate_limit_requests  # Peticiones por ventana
        self.rate_limit_window = rate_limit_window  # Ventana en segundos
        self.request_records: Dict[str, List[float]] = {}  # Historial por IP
        self.last_cleanup = time.time()
        self.excluded_paths = excluded_paths or []
        # Límites específicos por ruta: {path: (requests, window)}
        # Valores predeterminados para producción
        default_limits = {
            "/api/v1/auth/login": (10, 60),  # 10 intentos por minuto
            "/api/v1/auth/register": (5, 60),  # 5 registros por minuto
            "/api/v1/admin/": (30, 60),  # 30 peticiones admin por minuto
            "/api/v1/imports/": (5, 60),  # 5 importaciones por minuto
        }
        
        # Valores más permisivos para desarrollo
        dev_limits = {
            "/api/v1/auth/login": (100, 60),  # 100 intentos por minuto
            "/api/v1/auth/register": (50, 60),  # 50 registros por minuto
            "/api/v1/admin/": (300, 60),  # 300 peticiones admin por minuto
            "/api/v1/imports/": (100, 60),  # 100 importaciones por minuto
        }
        
        # Usar límites según el entorno
        self.sensitive_paths = sensitive_paths or (dev_limits if settings.environment in ("dev", "test") else default_limits)
    
    async def dispatch(self, request: Request, call_next):
        # No aplicar límites en modo desarrollo si está configurado así
        if settings.environment in ("dev", "test") and not settings.enable_rate_limit:
            return await call_next(request)
        
        # Lista de IPs confiables (localhost, etc.) que nunca tendrán rate limiting
        trusted_ips = ["127.0.0.1", "::1", "localhost"]
        
        # Obtener la IP del cliente o un identificador único
        client_ip = self._get_client_ip(request)
        path = request.url.path
        
        # Nunca aplicar rate limiting a IPs confiables en desarrollo
        if settings.environment in ("dev", "test") and client_ip in trusted_ips:
            return await call_next(request)
        
        # Comprobar si la ruta está excluida
        if any(path.startswith(excluded) for excluded in self.excluded_paths):
            return await call_next(request)
        
        # Determinar límites según la ruta
        request_limit, window_seconds = self._get_limits_for_path(path)
        
        # Aplicar rate limiting
        is_rate_limited, wait_time = self._is_rate_limited(
            client_ip, request_limit, window_seconds
        )
        
        if is_rate_limited:
            # Registrar intento de exceso de tasa
            logger.warning(
                f"Rate limit excedido para IP {client_ip} en {path}. "
                f"Debe esperar {wait_time:.1f} segundos."
            )
            # Devolver error 429 (Too Many Requests)
            response = Response(
                content=f"Demasiadas peticiones. Inténtelo de nuevo en {wait_time:.1f} segundos.",
                status_code=429
            )
            response.headers["Retry-After"] = str(int(wait_time))
            return response
        
        # Limpiar registros antiguos ocasionalmente
        current_time = time.time()
        if current_time - self.last_cleanup > 300:  # Cada 5 minutos
            self._cleanup_old_records()
            self.last_cleanup = current_time
        
        # Continuar con la petición normalmente
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Obtiene la IP del cliente teniendo en cuenta proxies."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Tomar la primera IP de la cadena X-Forwarded-For
            client_ip = forwarded.split(",")[0].strip()
        else:
            # Usar la IP del cliente directo
            client_ip = request.client.host if request.client else "unknown"
        
        return client_ip
    
    def _get_limits_for_path(self, path: str) -> Tuple[int, int]:
        """Determina los límites específicos para la ruta."""
        # Buscar coincidencias en rutas sensibles
        for sensitive_path, limits in self.sensitive_paths.items():
            if path.startswith(sensitive_path):
                return limits
        
        # Usar límites generales por defecto
        return self.rate_limit_requests, self.rate_limit_window
    
    def _is_rate_limited(self, client_id: str, request_limit: int, window_seconds: int) -> Tuple[bool, float]:
        """
        Comprueba si el cliente ha excedido el límite de peticiones.
        
        Args:
            client_id: Identificador del cliente (IP u otro)
            request_limit: Número máximo de peticiones permitidas
            window_seconds: Ventana de tiempo en segundos
            
        Returns:
            Tupla (está_limitado, tiempo_espera_segundos)
        """
        current_time = time.time()
        
        # Inicializar registro si no existe
        if client_id not in self.request_records:
            self.request_records[client_id] = []
        
        # Añadir tiempo de petición actual
        self.request_records[client_id].append(current_time)
        
        # Filtrar solo peticiones dentro de la ventana de tiempo
        window_start = current_time - window_seconds
        recent_requests = [
            t for t in self.request_records[client_id] if t > window_start
        ]
        self.request_records[client_id] = recent_requests
        
        # Comprobar si excede el límite
        if len(recent_requests) > request_limit:
            # Calcular tiempo de espera (cuando expira la petición más antigua)
            wait_time = window_seconds - (current_time - recent_requests[0])
            return True, max(0, wait_time)
        
        return False, 0
    
    def _cleanup_old_records(self) -> None:
        """Elimina registros antiguos para liberar memoria."""
        current_time = time.time()
        max_window = max(
            window for _, (_, window) in self.sensitive_paths.items()
        )
        cutoff_time = current_time - max(max_window, self.rate_limit_window)
        
        for client_id in list(self.request_records.keys()):
            # Filtrar solo peticiones recientes
            recent_requests = [
                t for t in self.request_records[client_id] if t > cutoff_time
            ]
            
            if recent_requests:
                self.request_records[client_id] = recent_requests
            else:
                # Si no hay peticiones recientes, eliminar el registro completo
                del self.request_records[client_id]
        
        logger.debug(
            f"Limpieza de registros de rate limiting completada. "
            f"{len(self.request_records)} clientes registrados."
        )

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware para añadir cabeceras de seguridad a las respuestas.
    Mejora la seguridad contra XSS, clickjacking y otros ataques.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Cabeceras de seguridad estándar
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy (CSP)
        # Permitir recursos solo del mismo origen por defecto
        if settings.environment == "prod":
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "connect-src 'self'; "
                "font-src 'self'; "
                "object-src 'none'; "
                "frame-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
        
        # HTTP Strict Transport Security (HSTS)
        # Solo en producción y con HTTPS
        if settings.environment == "prod" and request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Política de permisos para APIs
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=()"
        )
        
        return response

def setup_security(app: FastAPI) -> None:
    """
    Configura todas las medidas de seguridad para la aplicación.
    
    Args:
        app: Instancia de FastAPI
    """
    # Añadir middleware de límite de tasa
    if settings.enable_rate_limit:
        logger.info("Configurando Rate Limit Middleware")
        app.add_middleware(
            RateLimitMiddleware,
            rate_limit_requests=settings.rate_limit_requests,
            rate_limit_window=settings.rate_limit_window,
            excluded_paths=["/api/v1/docs", "/api/v1/redoc", "/api/v1/openapi.json"]
        )
    
    # Añadir middleware de cabeceras de seguridad
    logger.info("Configurando Security Headers Middleware")
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Configurar hosts permitidos (solo en producción)
    if settings.environment == "prod":
        logger.info("Configurando Trusted Host Middleware")
        allowed_hosts = [settings.domain, settings.api_domain]
        if "localhost" not in allowed_hosts:
            allowed_hosts.append("localhost")
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=allowed_hosts
        )
    
    logger.info("Configuración de seguridad completada")

# Función para sanitizar datos de entrada
def sanitize_input(input_data: str) -> str:
    """
    Sanitiza input para prevenir inyección de código.
    
    Args:
        input_data: Datos de entrada a sanitizar
        
    Returns:
        Datos sanitizados
    """
    if not input_data:
        return input_data
    
    # Caracteres especiales a escapar
    chars_to_escape = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
        '/': '&#x2F;',
        '\\': '&#x5C;',
        '`': '&#x60;'
    }
    
    # Reemplazar caracteres especiales
    for char, replacement in chars_to_escape.items():
        input_data = input_data.replace(char, replacement)
    
    return input_data
