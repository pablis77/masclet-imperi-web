import asyncio
import os
from dotenv import load_dotenv
from tortoise import Tortoise
from app.models.animal import Animal, EstadoAlletar
from app.core.config import get_settings

# Cargar variables de entorno
load_dotenv()

# Obtener configuración
settings = get_settings()

# Configuración de la base de datos
DATABASE_URL = settings.database_url
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgres://")

async def check_alletar_values():
    """Consulta los valores del campo alletar en la base de datos"""
    print(f"Conectando a la base de datos: {DATABASE_URL}")
    
    try:
        # Conectar a Tortoise ORM
        await Tortoise.init(
            db_url=DATABASE_URL,
            modules={"models": ["app.models.animal"]}
        )
        
        # Consultar todos los animales
        animals = await Animal.all()
        
        # Contar los valores de alletar
        alletar_counts = {
            EstadoAlletar.NO_ALLETAR: 0,
            EstadoAlletar.UN_TERNERO: 0,
            EstadoAlletar.DOS_TERNEROS: 0,
            None: 0
        }
        
        for animal in animals:
            if animal.alletar in alletar_counts:
                alletar_counts[animal.alletar] += 1
            else:
                print(f"Valor inesperado para alletar: {animal.alletar}")
        
        # Mostrar resultados
        print(f"\nTotal de animales: {len(animals)}")
        print(f"Distribución de valores para el campo 'alletar':")
        print(f"- NO: {alletar_counts[EstadoAlletar.NO_ALLETAR]}")
        print(f"- 1: {alletar_counts[EstadoAlletar.UN_TERNERO]}")
        print(f"- 2: {alletar_counts[EstadoAlletar.DOS_TERNEROS]}")
        print(f"- None: {alletar_counts[None]}")
        
        # Mostrar algunos ejemplos
        print("\nEjemplos de registros:")
        for i, animal in enumerate(animals[:5]):
            print(f"{i+1}. ID: {animal.id}, Explotacio: {animal.explotacio}, Nom: {animal.nom}, Alletar: {animal.alletar}")
        
    except Exception as e:
        print(f"Error al consultar la base de datos: {str(e)}")
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_alletar_values())
