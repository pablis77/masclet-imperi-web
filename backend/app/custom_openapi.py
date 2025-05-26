from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
import json
from typing import Any, Dict, Optional

def custom_openapi(app: FastAPI) -> Dict[str, Any]:
    """
    Función personalizada para generar el esquema OpenAPI con manejo de tipos no serializables.
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags,
        servers=app.servers,
    )
    
    # Convertir a JSON y luego de vuelta a diccionario para manejar tipos no serializables
    openapi_json = json.dumps(
        openapi_schema,
        default=lambda o: str(o) if isinstance(o, type) else (o.__dict__ if hasattr(o, "__dict__") else str(o))
    )
    
    return json.loads(openapi_json)
