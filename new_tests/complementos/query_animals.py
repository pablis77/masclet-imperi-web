import asyncio
from tortoise import Tortoise
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run():
    try:
        # Inicializar Tortoise ORM
        await Tortoise.init(
            db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
            modules={'models': ['app.models']}
        )
        
        # Importar modelos después de inicializar Tortoise
        from app.models import Animal, Part
        
        # Consultar animales
        logger.info("Consultando animales y sus explotaciones:")
        animales = await Animal.all().values('id', 'nom', 'explotacio')
        
        print("\n=== ANIMALES Y SUS EXPLOTACIONES ===")
        for animal in animales:
            print(f"ID: {animal['id']}, Nombre: {animal['nom']}, Explotación: {animal['explotacio']}")
        
        # Consultar conteo de animales por explotación
        print("\n=== CONTEO DE ANIMALES POR EXPLOTACIÓN ===")
        explotaciones = await Animal.all().distinct().values_list('explotacio', flat=True)
        
        for explotacion in explotaciones:
            count = await Animal.filter(explotacio=explotacion).count()
            print(f"Explotación: {explotacion}, Total animales: {count}")
        
        # Consultar relación entre partos y animales
        print("\n=== CONTEO DE PARTOS POR EXPLOTACIÓN ===")
        for explotacion in explotaciones:
            # Obtener IDs de animales de esta explotación
            animal_ids = await Animal.filter(explotacio=explotacion).values_list('id', flat=True)
            
            # Contar partos para estos animales
            if animal_ids:
                partos_count = await Part.filter(animal_id__in=animal_ids).count()
                print(f"Explotación: {explotacion}, Total partos: {partos_count}")
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(run())
