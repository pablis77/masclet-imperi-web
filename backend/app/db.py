from app.core.config import settings
import os

# Determine if we're running in Docker or locally
IS_DOCKER = os.getenv('DOCKER_ENV', '0') == '1'

TORTOISE_ORM = {
    "connections": {"default": "postgres://postgres:1234@localhost:5432/masclet_imperi"},
    "apps": {
        "models": {
            "models": [
                "app.models.animal",
                "app.models.parto",
                "app.auth.models",  # Añadimos los modelos de auth
                "aerich.models"
            ],
            "default_connection": "default",
        }
    },
    "use_tz": False,
    "timezone": "Europe/Madrid"
}