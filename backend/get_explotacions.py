"""
Script para obtener todas las explotaciones
"""
import asyncio
from tortoise import Tortoise
from app.models.explotacio import Explotacio
from app.core.config import settings

async def init():
    # Inicializar la conexión a la base de datos
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["app.models"]}
    )

async def get_explotacions():
    await init()
    explotacions = await Explotacio.all()
    for exp in explotacions:
        print(f"ID: {exp.id}, Nombre: {exp.nom}")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(get_explotacions())
