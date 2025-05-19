import asyncio
from tortoise import Tortoise
from app.models.animal import Animal
from app.models.animal import Part

async def main():
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.explotacio', 'app.models.import_model']}
    )
    
    # Verificar que los animales del CSV se importaron
    print("\n=== VERIFICANDO IMPORTACIÓN DE ANIMALES ===")
    animals = await Animal.all()
    print(f"Total de animales en la base: {len(animals)}")
    
    # Buscar animales específicos
    angel = await Animal.filter(nom="angel").first()
    elsa = await Animal.filter(nom="elsa").first()
    
    print("\n--- Datos de Angel ---")
    if angel:
        print(f"ID: {angel.id}")
        print(f"Nombre: {angel.nom}")
        print(f"Género: {angel.genere}")
        print(f"Explotación: {angel.explotacio}")
    else:
        print("Angel no encontrado")
    
    print("\n--- Datos de Elsa ---")
    if elsa:
        print(f"ID: {elsa.id}")
        print(f"Nombre: {elsa.nom}")
        print(f"Género: {elsa.genere}")
        print(f"Explotación: {elsa.explotacio}")
    else:
        print("Elsa no encontrada")
    
    # Buscar partos directamente
    print("\n--- Partos registrados ---")
    all_parts = await Part.all()
    print(f"Total de partos: {len(all_parts)}")
    
    for parto in all_parts:
        animal = await parto.animal
        print(f"Parto de {animal.nom}:")
        print(f"  Fecha: {parto.part}")
        print(f"  GenereT: {parto.GenereT}")
        print(f"  EstadoT: {parto.EstadoT}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
