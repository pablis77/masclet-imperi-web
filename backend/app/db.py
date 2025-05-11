from app.core.config import settings
import os

# Determine if we're running in Docker or locally
IS_DOCKER = os.getenv('DOCKER_ENV', '0') == '1'

# Usar DATABASE_URL si está disponible (para producción), o conexión local para desarrollo
DB_URL = os.getenv('DATABASE_URL', 'postgres://postgres:1234@localhost:5432/masclet_imperi')

# Imprimir la URL que estamos usando (con contraseña oculta para seguridad en logs)
db_log_url = DB_URL.replace(DB_URL.split('@')[0].split('//')[1].split(':')[1], '***')
print(f"Intentando conectar a la base de datos: {db_log_url}")

TORTOISE_ORM = {
    "connections": {"default": DB_URL},
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