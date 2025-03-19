"""
Middleware para rate limiting
"""
from fastapi import Request, HTTPException
from typing import Dict, Tuple, Callable
from datetime import datetime, timedelta
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class RateLimiter:
    """
    Rate limiter basado en ventana deslizante
    """
    def __init__(self, requests_per_minute: int = None):
        self.requests_per_minute = requests_per_minute or settings.rate_limit_per_minute
        self.window_size = 60  # segundos
        self.requests: Dict[str, list] = {}

    def _cleanup_old_requests(self, client_id: str) -> None:
        """Limpia peticiones antiguas"""
        if client_id not in self.requests:
            return

        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_size)
        self.requests[client_id] = [
            ts for ts in self.requests[client_id] if ts > cutoff
        ]

    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Comprueba si se permite una nueva petición
        
        Returns:
            Tuple[bool, int]: (permitido, segundos restantes)
        """
        # Si el rate limiting está desactivado, siempre permitir
        if not settings.should_rate_limit:
            return True, 0

        now = datetime.now()
        self._cleanup_old_requests(client_id)

        # Inicializar si es nuevo cliente
        if client_id not in self.requests:
            self.requests[client_id] = []

        # Contar peticiones en la ventana actual
        requests = self.requests[client_id]
        
        if len(requests) >= self.requests_per_minute:
            oldest = min(requests)
            wait_time = int((oldest + timedelta(seconds=self.window_size) - now).total_seconds())
            return False, wait_time

        # Registrar nueva petición
        self.requests[client_id].append(now)
        return True, 0

class RateLimitMiddleware:
    """Middleware para aplicar rate limiting"""
    
    def __init__(self, app: Callable):
        """
        Inicializa el middleware
        
        Args:
            app: La aplicación ASGI
        """
        self.app = app
        self.limiter = RateLimiter()

    async def __call__(self, scope, receive, send):
        """Procesa la petición aplicando rate limiting"""
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
            
        if not settings.should_rate_limit:
            return await self.app(scope, receive, send)

        # Crear request para acceder a headers
        request = Request(scope, receive=receive)
        
        # Obtener identificador de cliente (IP + user agent)
        client_id = f"{request.client.host}:{request.headers.get('user-agent', 'unknown')}"

        # Verificar límite
        allowed, wait_time = self.limiter.is_allowed(client_id)
        
        if not allowed:
            logger.warning(f"Rate limit exceeded for {client_id}")
            
            # Crear respuesta de error
            error_response = {
                "detail": {
                    "message": "Demasiadas peticiones",
                    "wait_seconds": wait_time
                }
            }
            
            # Enviar respuesta 429
            await send({
                "type": "http.response.start",
                "status": 429,
                "headers": [
                    (b"content-type", b"application/json"),
                ]
            })
            
            import json
            await send({
                "type": "http.response.body",
                "body": json.dumps(error_response).encode()
            })
            return

        # Procesar petición
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # Añadir headers de rate limit
                headers = message.get("headers", [])
                headers.extend([
                    (b"X-RateLimit-Limit", str(self.limiter.requests_per_minute).encode()),
                    (b"X-RateLimit-Remaining", str(
                        self.limiter.requests_per_minute - 
                        len(self.limiter.requests.get(client_id, []))
                    ).encode()),
                ])
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)