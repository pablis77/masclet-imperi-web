"""
Configuración y utilidades de base de datos
"""
from typing import Dict, Any
import os

def get_tortoise_config() -> Dict[str, Any]:
    """
    Obtiene la configuración de Tortoise ORM según el entorno
    """
    testing = os.getenv("TESTING", "0") == "1"
    
    if testing:
        # Configuración para tests (SQLite en memoria)
        db_url = "sqlite://:memory:"
    else:
        # Configuración para desarrollo/producción (PostgreSQL)
        db_url = "postgresql://postgres:1234@localhost:5432/masclet_imperi"
    
    return {
        "connections": {
            "default": db_url
        },
        "apps": {
            "models": {
                "models": [
                    "app.models.animal",
                    "app.models.explotacio"
                ],
                "default_connection": "default",
            }
        },
        "use_tz": False,
        "timezone": "UTC"
    }

def get_test_db_url() -> str:
    """Obtiene la URL de la base de datos para tests"""
    return "sqlite://:memory:"

def get_db_url() -> str:
    """Obtiene la URL de la base de datos para desarrollo/producción"""
    return "postgresql://postgres:1234@localhost:5432/masclet_imperi"