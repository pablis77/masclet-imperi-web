from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response
from starlette.middleware.base import _StreamingResponse
import json
import logging
from app.core.messages import MessageResponse

logger = logging.getLogger(__name__)

class MessageMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            # Ignora el endpoint preview completamente (mejor detección de la ruta)
            if request.url.path.endswith("/preview"):
                return await call_next(request)
            
            if not request.url.path.startswith("/api/v1/imports"):
                return await call_next(request)
            
            response = await call_next(request)
            
            # Handle only JSONResponse to avoid issues with other response types
            if isinstance(response, JSONResponse):
                try:
                    data = json.loads(response.body.decode())

                    # Check if already transformed
                    if isinstance(data, dict) and all(key in data for key in ["message", "type", "data"]):
                        return response
                    
                    # Transform the response
                    transformed_response = {
                        "message": "Operación completada",
                        "type": "success",
                        "data": data
                    }
                    
                    return JSONResponse(
                        content=transformed_response,
                        status_code=response.status_code,
                        headers=dict(response.headers)
                    )
                    
                except Exception as e:
                    # Log error but don't transform/modify the response
                    logger.error(f"Error transforming response: {str(e)}", exc_info=True)
                    return response
            
            return response
            
        except Exception as e:
            logger.error(f"Middleware error: {str(e)}", exc_info=True)
            # En caso de error en el middleware, seguimos adelante sin transformar
            return await call_next(request)