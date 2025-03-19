# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://user:1234@localhost:5432/masclet"
    
    # JWT
    SECRET_KEY: str = "1234"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Aplicación
    APP_NAME: str = "Masclet Imperi API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Rutas
    DATA_DIR: str = "data"
    BACKUP_DIR: str = "backups"
    
    # CORS
    
    ALLOWED_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()