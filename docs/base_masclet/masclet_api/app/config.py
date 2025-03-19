# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Masclet Imperi API"
    admin_email: str = "admin@mascletimperi.com"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_file: str = "data/matriz_master.csv"
    backup_dir: str = "backups"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()