import asyncio
from tortoise import Tortoise
from app.core.config import TORTOISE_ORM
from app.models import Animal, Part

async def verify_database():
    # Usar la misma inicialización que funciona en import_csv.py
    await Tortoise.init(
        db_url=TORTOISE_ORM["connections"]["default"],
        modules={"models": TORTOISE_ORM["apps"]["models"]["models"]}
    )
    
    try:
        animals_count = await Animal.all().count()
        parts_count = await Part.all().count()
        
        print("\n=== Estado de la Base de Datos ===")
        print(f"Total Animales: {animals_count}")
        print(f"Total Partos: {parts_count}")
        
        if animals_count > 0:
            sample = await Animal.first()
            print(f"\n=== Muestra de Animal ===")
            print(f"ID: {sample.id}")
            print(f"Nombre: {sample.nom}")
            print(f"Explotación: {sample.explotacio}")
            print(f"Género: {sample.genere}")
            print(f"Estado: {sample.estado}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")    
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(verify_database())