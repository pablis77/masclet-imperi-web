"""
Serializador JSON personalizado para manejar tipos problemáticos
"""
import json
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Type, Union

# Serializador JSON personalizado para manejar tipos problemáticos
class CustomJSONEncoder(json.JSONEncoder):
    """
    Serializador JSON personalizado que maneja tipos que normalmente no son serializables.
    """
    def default(self, obj):
        # Manejar tipos de Enum
        if isinstance(obj, Enum):
            return obj.value
        # Manejar tipos de clase (type)
        elif isinstance(obj, type):
            return obj.__name__
        # Manejar objetos con __dict__
        elif hasattr(obj, "__dict__"):
            return obj.__dict__
        # Manejar objetos que implementan __str__
        elif hasattr(obj, "__str__"):
            return str(obj)
        # Dejar que el serializador base maneje el resto
        return super().default(obj)

# Función para serializar a JSON usando nuestro encoder personalizado
def custom_json_dumps(obj: Any) -> str:
    """
    Serializa un objeto a JSON usando nuestro encoder personalizado.
    """
    return json.dumps(obj, cls=CustomJSONEncoder)

# Función para deserializar desde JSON
def custom_json_loads(s: str) -> Any:
    """
    Deserializa un string JSON a un objeto Python.
    """
    return json.loads(s)
