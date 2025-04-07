import sys
import os
import asyncio
from tortoise import Tortoise

# Configurar la ruta base para importaciones
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importar models
from backend.app.models.animal import Animal

async def main():
    """Verificar animales importados exitosamente y sus fechas"""
    # Conectar a la base de datos
    DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"
    print(f"Conectando a la base de datos: {DB_URL}")
    
    await Tortoise.init(
        db_url=DB_URL,
        modules={"models": ["backend.app.models.animal", "backend.app.models.explotacio", "backend.app.models.import_model"]}
    )
    
    # Contar animales
    total_animales = await Animal.all().count()
    print(f"Total de animales en la base de datos: {total_animales}")
    
    # Mostrar los últimos 5 animales con sus fechas
    animales = await Animal.all().order_by("-id").limit(5)
    
    print("\nÚltimos 5 animales importados:")
    for animal in animales:
        print(f"ID: {animal.id}, Nombre: {animal.nom}, Fecha nacimiento: {animal.dob}")
        if hasattr(animal, 'parts') and animal.parts:
            parts = await animal.parts.all()
            for part in parts:
                print(f"  - Parto: {part.part}, Género: {part.GenereT}")
    
    # Cerrar conexión
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
