from tortoise import Tortoise, run_async
from app.database import TORTOISE_ORM

async def create_tables():
    print("Iniciando Tortoise...")
    await Tortoise.init(config=TORTOISE_ORM)
    
    print("Generando esquemas...")
    await Tortoise.generate_schemas(safe=True)
    
    print("Cerrando conexiones...")
    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(create_tables())