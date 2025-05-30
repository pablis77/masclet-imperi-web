"""
Configuración de la aplicación
"""
from functools import lru_cache
from pydantic import BaseModel  # Volvemos a usar pydantic directamente
import os
import logging
from typing import List, Dict
from enum import Enum

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class UserRole(str, Enum):
    """Roles de usuario en el sistema"""
    ADMIN = "administrador"
    RAMON = "Ramon"  # Rol fundamental que reemplaza a GERENTE
    EDITOR = "editor"
    USER = "usuario"

class Action(str, Enum):
    """Acciones permitidas en el sistema"""
    CONSULTAR = "consultar"
    ACTUALIZAR = "actualizar"
    CREAR = "crear"
    GESTIONAR_USUARIOS = "gestionar_usuarios"
    BORRAR_USUARIOS = "borrar_usuarios"
    CAMBIAR_CONTRASEÑAS = "cambiar_contraseñas"
    GESTIONAR_EXPLOTACIONES = "gestionar_explotaciones"
    IMPORTAR_DATOS = "importar_datos"
    VER_ESTADISTICAS = "ver_estadisticas"
    EXPORTAR_DATOS = "exportar_datos"

# Matriz de permisos por rol - USANDO CADENAS DE TEXTO como claves para compatibilidad
ROLES = {
    "administrador": [
        Action.CONSULTAR, 
        Action.ACTUALIZAR, 
        Action.CREAR,
        Action.GESTIONAR_USUARIOS, 
        Action.BORRAR_USUARIOS,
        Action.CAMBIAR_CONTRASEÑAS,
        Action.GESTIONAR_EXPLOTACIONES,
        Action.IMPORTAR_DATOS, 
        Action.VER_ESTADISTICAS, 
        Action.EXPORTAR_DATOS
    ],
    "Ramon": [  # Rol fundamental - Acceso casi completo, sin importación
        Action.CONSULTAR, 
        Action.ACTUALIZAR, 
        Action.CREAR,
        Action.GESTIONAR_USUARIOS,
        Action.BORRAR_USUARIOS,
        Action.CAMBIAR_CONTRASEÑAS,
        Action.GESTIONAR_EXPLOTACIONES, 
        Action.VER_ESTADISTICAS,
        Action.EXPORTAR_DATOS
    ],
    "editor": [
        Action.CONSULTAR, 
        Action.ACTUALIZAR, 
        Action.VER_ESTADISTICAS
    ],
    "usuario": [
        Action.CONSULTAR
    ]
}

class Settings(BaseModel):
    """Configuración de la aplicación"""
    # Configuración básica
    app_name: str = "Masclet Imperi API"
    admin_email: str = "pablomgallegos@gmail.com"
    debug: bool = False
    testing: bool = bool(os.getenv("TESTING", ""))
    environment: str = os.getenv("ENV", "dev")  # dev, test, prod
    
    # Rate limiting y CORS
    enable_rate_limit: bool = os.getenv("ENABLE_RATE_LIMIT", "True").lower() in ("true", "1", "t")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:4321,http://127.0.0.1:3000,http://127.0.0.1:4321,https://masclet-imperi-web-frontend.onrender.com,https://masclet-imperi-web-frontend.onrender.com/,https://masclet-imperi-web-frontend-2025.loca.lt")

    # Configuración de base de datos
    postgres_db: str = os.getenv("POSTGRES_DB", "masclet_imperi")
    postgres_user: str = os.getenv("POSTGRES_USER", "postgres")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "db_password_placeholder")
    # FORZAR Puerto 5433 para contenedor Docker PostgreSQL
    db_port: int = 5433
    db_host: str = os.getenv("DB_HOST", "localhost")

    # Variables globales de la aplicación
    operation_semaphore: Dict[str, float] = {}
    
    # Configuración de seguridad
    api_key: str = os.getenv("API_KEY", "api_key_placeholder")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret_key_placeholder")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 horas para desarrollo

    # Modelos para ORM
    MODELS: List[str] = [
        "app.models.animal",  # Contiene Animal y Part
        "app.models.user", 
        "app.models.import_model",  # Modelo para historial de importaciones
        "app.models.listado",  # Modelo para listados personalizados
        "app.models.notification",  # Modelo para las notificaciones del sistema
        "aerich.models"  # Este es necesario para las migraciones
    ]

    # Rate Limiting
    rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # segundos

    # Configuración para Traefik
    traefik_dashboard_user: str = os.getenv("TRAEFIK_DASHBOARD_USER", "admin")
    traefik_dashboard_password: str = os.getenv("TRAEFIK_DASHBOARD_PASSWORD", "traefik_dashboard_password_placeholder")

    # Dominios
    domain: str = os.getenv("DOMAIN", "mascletimperi.local")
    api_domain: str = os.getenv("API_DOMAIN", "api.mascletimperi.local")

    # Backup
    backup_retention_days: int = int(os.getenv("BACKUP_RETENTION_DAYS", "7"))
    backup_max_size: str = os.getenv("BACKUP_MAX_SIZE", "1G")
    backup_dir: str = os.getenv("BACKUP_DIR", "./backups")

    # Conexión a base de datos
    @property
    def database_url(self) -> str:
        """
        Construir URL de conexión a la base de datos
        """
        # Si DATABASE_URL está definido, usarlo directamente (prioridad para Render)
        database_url_env = os.getenv("DATABASE_URL")
        if database_url_env:
            # Asegurarse de que sea compatible con Tortoise ORM
            return database_url_env.replace("postgresql://", "postgres://")
            
        # Caso contrario, construir URL desde componentes individuales
        # Asegurarse de que el esquema sea postgres:// (no postgresql://)
        url = f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.db_host}:{self.db_port}/{self.postgres_db}"
        # Reemplazar postgresql:// por postgres:// para compatibilidad con Tortoise ORM
        url = url.replace("postgresql://", "postgres://")
        print(f"Intentando conectar a la base de datos: {url}")
        return url

    @property
    def db_connection_string(self) -> str:
        """Obtener string de conexión a base de datos"""
        if self.testing:
            return "sqlite://:memory:"
        return self.database_url

    # Ya no usamos env_file en model_config porque lo cargamos explícitamente en get_settings
    model_config = {
        "case_sensitive": True,
        "extra": "allow",  # Permitir campos adicionales
        "from_attributes": True  # Reemplaza orm_mode en Pydantic v2
    }

# Variable para guardar la última fecha de modificación del archivo .env
_env_last_modified_time = 0

# Variable para guardar la configuración en caché
_settings_cache = None

def get_settings() -> Settings:
    """Obtener configuración actualizada, verificando si el archivo .env ha cambiado"""
    global _env_last_modified_time, _settings_cache
    
    # Rutas a verificar en orden de prioridad
    env_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'),  # /backend/.env
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env'),  # Raíz del proyecto
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'docker', '.env'),  # /backend/docker/.env
    ]
    
    # Encontrar todos los archivos .env que existan y mostrarlos
    for env_path in env_paths:
        if os.path.exists(env_path):
            logger.info(f"Archivo .env encontrado: {env_path}")
            # Mostrar el puerto configurado en este archivo
            with open(env_path, 'r') as f:
                for line in f:
                    if line.startswith('DB_PORT='):
                        logger.info(f"  - {line.strip()}")
    
    # Usar directamente el archivo backend/.env (prioridad máxima)
    backend_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
    
    if os.path.exists(backend_env_path):
        env_file_to_use = backend_env_path
        newest_mtime = os.path.getmtime(backend_env_path)
    else:
        # Si no existe backend/.env, usar el archivo en la raíz
        root_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env')
        if os.path.exists(root_env_path):
            env_file_to_use = root_env_path
            newest_mtime = os.path.getmtime(root_env_path)
        else:
            # Si no encontramos ningún archivo .env, devolver configuración por defecto
            logger.warning("No se encontró ningún archivo .env. Usando configuración por defecto.")
            if _settings_cache is None:
                _settings_cache = Settings()
            return _settings_cache
    
    # Forzar recarga explícita para testing
    should_reload = True
    
    # Si el archivo .env ha cambiado o no hay caché, cargar una nueva configuración
    if should_reload or newest_mtime > _env_last_modified_time or _settings_cache is None:
        logger.info(f"Usando archivo .env: {env_file_to_use}")
        # Cargar variables de entorno de este archivo específico
        from dotenv import load_dotenv
        load_dotenv(env_file_to_use, override=True)
        
        # Crear nueva configuración después de cargar variables
        _settings_cache = Settings()
        _env_last_modified_time = newest_mtime
        
        # Mostrar el puerto de la base de datos para depuración
        logger.info(f"DB_PORT cargado: {_settings_cache.db_port}")
        logger.info(f"DATABASE_URL generada: {_settings_cache.database_url}")
    
    return _settings_cache

# Instancia global de configuración para compatibilidad con tests
settings = get_settings()

# Configuración de Tortoise ORM para compatibilidad con tests
TORTOISE_ORM = {
    "connections": {"default": settings.db_connection_string},
    "apps": {
        "models": {
            "models": settings.MODELS,
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "UTC",
}