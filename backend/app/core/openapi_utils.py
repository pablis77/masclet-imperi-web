"""
Utilidades básicas para la generación del esquema OpenAPI
"""
import json
from enum import Enum
import logging
from fastapi.openapi.utils import get_openapi as original_get_openapi

logger = logging.getLogger(__name__)

class EnhancedJSONEncoder(json.JSONEncoder):
    """
    Encoder JSON personalizado que maneja tipos especiales.
    """
    def default(self, obj):
        # Manejar el tipo 'type'
        if isinstance(obj, type):
            return obj.__name__
        # Manejar enumeraciones
        elif isinstance(obj, Enum):
            return obj.value
        # Manejar fechas y horas
        elif hasattr(obj, "isoformat"):
            return obj.isoformat()
        # Manejar conjuntos (sets)
        elif isinstance(obj, set):
            return list(obj)
        # Para otros tipos, convertir a string
        return str(obj)

def get_enhanced_openapi(*args, **kwargs):
    """
    Versión básica de la función get_openapi para mostrar los endpoints
    """
    # Crear un esquema mínimo
    app_info = {
        "title": kwargs.get("title", "API"),
        "version": kwargs.get("version", "0.1.0"),
        "description": kwargs.get("description", "")
    }
    
    # Construir un esquema básico con todos los endpoints
    paths = {}
    tags = []
    tag_groups = {
        "/api/v1/animals": "animals",
        "/api/v1/auth": "authentication",
        "/api/v1/backup": "backup",
        "/api/v1/dashboard": "dashboard",
        "/api/v1/explotacions": "explotacions",
        "/api/v1/health": "health",
        "/api/v1/imports": "imports",
        "/api/v1/listados": "listados",
        "/api/v1/partos": "partos",
        "/api/v1/users": "users",
        "/api/v1/admin": "admin",
        "/api/v1/diagnostico": "diagnostico"
    }
    
    # Recopilar todos los tags únicos
    for tag_name in tag_groups.values():
        if tag_name not in [t.get("name") for t in tags]:
            tags.append({"name": tag_name})
    
    # Extraer rutas de la aplicación
    if "routes" in kwargs:
        for route in kwargs["routes"]:
            if hasattr(route, "methods") and hasattr(route, "path"):
                path = route.path
                if path not in paths:
                    paths[path] = {}
                
                # Determinar el tag basado en el prefijo de la ruta
                route_tag = None
                for prefix, tag in tag_groups.items():
                    if path.startswith(prefix):
                        route_tag = tag
                        break
                
                # Añadir cada método HTTP
                for method in route.methods:
                    if method != "HEAD" and method != "OPTIONS":
                        method_lower = method.lower()
                        endpoint_name = getattr(route.endpoint, "__name__", "")
                        
                        # Definición básica del endpoint
                        endpoint_def = {
                            "summary": endpoint_name,
                            "operationId": endpoint_name,
                            "responses": {"200": {"description": "Successful response"}}
                        }
                        
                        # Añadir tag si se encontró
                        if route_tag:
                            endpoint_def["tags"] = [route_tag]
                        
                        paths[path][method_lower] = endpoint_def
    
    # Devolver el esquema
    return {
        "openapi": "3.0.2",
        "info": app_info,
        "paths": paths,
        "tags": tags
    }
