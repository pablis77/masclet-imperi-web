"""
Utilidades para la serialización JSON de tipos complejos.
"""
import json
from enum import Enum
from typing import Any, Dict, List, Optional, Type, Union
import logging

logger = logging.getLogger(__name__)

class EnhancedJSONEncoder(json.JSONEncoder):
    """
    Encoder JSON personalizado que maneja tipos especiales como 'type', Enum, etc.
    """
    def default(self, obj):
        # Manejar el tipo 'type'
        if isinstance(obj, type):
            return {"__type__": obj.__name__}
        # Manejar enumeraciones
        elif isinstance(obj, Enum):
            return obj.value
        # Manejar fechas y horas
        elif hasattr(obj, "isoformat"):
            return obj.isoformat()
        # Manejar conjuntos (sets)
        elif isinstance(obj, set):
            return list(obj)
        # Intentar convertir a diccionario si tiene __dict__
        elif hasattr(obj, "__dict__"):
            return obj.__dict__
        # Dejar que el encoder base maneje el resto
        try:
            return super().default(obj)
        except TypeError:
            # Si todo falla, convertir a string
            return str(obj)

def json_dumps(obj: Any) -> str:
    """
    Serializa un objeto a JSON usando nuestro encoder personalizado.
    """
    try:
        return json.dumps(obj, cls=EnhancedJSONEncoder)
    except Exception as e:
        logger.error(f"Error al serializar a JSON: {str(e)}")
        # En caso de error, intentar una serialización más básica
        return json.dumps({"error": "Error de serialización"})

def patch_pydantic_encoder():
    """
    Aplica un parche al encoder de Pydantic para manejar tipos problemáticos.
    """
    try:
        from pydantic.json import pydantic_encoder
        
        # Guardar la función original
        original_encoder = pydantic_encoder
        
        # Definir una nueva función que envuelve la original
        def patched_encoder(obj):
            try:
                # Intentar usar el encoder original
                return original_encoder(obj)
            except TypeError:
                # Si falla, manejar casos especiales
                if isinstance(obj, type):
                    return obj.__name__
                elif isinstance(obj, Enum):
                    return obj.value
                elif hasattr(obj, "isoformat"):
                    return obj.isoformat()
                elif isinstance(obj, set):
                    return list(obj)
                elif hasattr(obj, "__dict__"):
                    return obj.__dict__
                # Si todo lo anterior falla, intentar convertir a string
                try:
                    return str(obj)
                except:
                    # Si no podemos manejar el tipo, lanzar la excepción original
                    raise
        
        # Reemplazar el encoder de Pydantic con nuestra versión
        import pydantic.json
        pydantic.json.pydantic_encoder = patched_encoder
        
        # También parchear el encoder de FastAPI para OpenAPI
        try:
            from fastapi.openapi.utils import get_openapi
            from fastapi.openapi.utils import generate_operation_id
            from fastapi.openapi.utils import get_model_definitions
            
            # Guardar las funciones originales
            original_get_openapi = get_openapi
            
            # Crear una versión mejorada de get_openapi
            def enhanced_get_openapi(*args, **kwargs):
                try:
                    return original_get_openapi(*args, **kwargs)
                except TypeError as e:
                    logger.error(f"Error en get_openapi: {e}")
                    # Devolver un esquema mínimo si falla
                    return {
                        "openapi": "3.0.2",
                        "info": {"title": "API", "version": "0.1.0"},
                        "paths": {}
                    }
            
            # Reemplazar la función original
            import fastapi.openapi.utils
            fastapi.openapi.utils.get_openapi = enhanced_get_openapi
            
            logger.info("Funciones OpenAPI de FastAPI parcheadas correctamente")
        except Exception as e:
            logger.error(f"Error al parchear funciones OpenAPI: {str(e)}")
        
        logger.info("Encoder de Pydantic parcheado correctamente")
        return True
    except Exception as e:
        logger.error(f"Error al aplicar parche al encoder de Pydantic: {str(e)}")
        return False
