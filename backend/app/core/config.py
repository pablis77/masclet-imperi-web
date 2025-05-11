"""
Configuración de la aplicación
"""
from functools import lru_cache
from pydantic import BaseModel  # Volvemos a usar pydantic directamente
import os
from typing import List, Dict
from enum import Enum

class UserRole(str, Enum):
    """Roles de usuario en el sistema"""
    ADMIN = "administrador"
    GERENTE = "gerente"
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

# Matriz de permisos por rol
ROLES: Dict[UserRole, List[Action]] = {
    UserRole.ADMIN: [
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
    UserRole.GERENTE: [
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
    UserRole.EDITOR: [
        Action.CONSULTAR, 
        Action.ACTUALIZAR, 
        Action.VER_ESTADISTICAS
    ],
    UserRole.USER: [
        Action.CONSULTAR
    ]
}

class Settings(BaseModel):
    """Configuración de la aplicación"""
    # Configuración básica
    app_name: str = "Masclet Imperi API"
    admin_email: str = "pablomgallegos@gmail.com"
    debug: bool = True
    testing: bool = bool(os.getenv("TESTING", ""))
    environment: str = os.getenv("ENV", "dev")  # dev, test, prod
    enable_rate_limit: bool = True
    
    # Rate limiting y CORS
    enable_rate_limit: bool = os.getenv("ENABLE_RATE_LIMIT", "True").lower() in ("true", "1", "t")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:4321,http://127.0.0.1:3000,http://127.0.0.1:4321")

    # Configuración de base de datos
    postgres_db: str = os.getenv("POSTGRES_DB", "masclet_imperi")
    postgres_user: str = os.getenv("POSTGRES_USER", "postgres")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "1234")
    db_port: str = os.getenv("DB_PORT", "5432")
    db_host: str = os.getenv("DB_HOST", "localhost")

    # Claves de seguridad
    api_key: str = os.getenv("API_KEY", "masclet_api_2024_secure")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "masclet_secret_key_2024_secure")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Modelos para ORM
    MODELS: List[str] = [
        "app.models.animal",  # Contiene Animal y Part
        "app.models.user", 
        "app.models.import_model",  # Modelo para historial de importaciones
        "aerich.models"  # Este es necesario para las migraciones
    ]

    # Rate Limiting
    rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # segundos

    # Configuración para Traefik
    traefik_dashboard_user: str = os.getenv("TRAEFIK_DASHBOARD_USER", "admin")
    traefik_dashboard_password: str = os.getenv("TRAEFIK_DASHBOARD_PASSWORD", "masclet_admin_2024_secure")

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
        # Asegurarse de que el esquema sea postgres:// (no postgresql://)
        url = f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.db_host}:{self.db_port}/{self.postgres_db}"
        # Reemplazar postgresql:// por postgres:// para compatibilidad con Tortoise ORM
        url = url.replace("postgresql://", "postgres://")
        return url

    @property
    def db_connection_string(self) -> str:
        """Obtener string de conexión a base de datos"""
        if self.testing:
            return "sqlite://:memory:"
        return self.database_url

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "allow",  # Permitir campos adicionales
        "from_attributes": True  # Reemplaza orm_mode en Pydantic v2
    }

@lru_cache()
def get_settings() -> Settings:
    """Obtener configuración cacheada"""
    return Settings()

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