import os
from tortoise import Tortoise
from tortoise.exceptions import OperationalError
from fastapi import FastAPI
from dotenv import load_dotenv
from app.core.config import settings

# Cargar variables de entorno
load_dotenv()

# Configuración de Tortoise ORM para Aerich
TORTOISE_ORM = {
    "connections": {
        "default": {
            "engine": "tortoise.backends.asyncpg",
            "credentials": {
                "host": "localhost",
                "port": int(settings.db_port),
                "user": settings.postgres_user,
                "password": settings.postgres_password,
                "database": settings.postgres_db,
            }
        },
    },
    "apps": {
        "models": {
            "models": settings.MODELS,
            "default_connection": "default",
        }
    },
    "use_tz": False,
    "generate_schemas": True
}

async def init_db(app: FastAPI):
    try:
        await Tortoise.init(
            db_url=settings.DATABASE_URL,
            modules={'models': settings.MODELS}
        )
        try:
            print("Generating database schemas...")
            await Tortoise.generate_schemas(safe=True)
            print("Database schemas generated successfully")
        except OperationalError as e:
            print(f"Note: {e}")
            print("Continuing with existing tables...")
    except Exception as e:
        print(f"Database initialization error: {str(e)}")
        raise

async def close_db():
    await Tortoise.close_connections()