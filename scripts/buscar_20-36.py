from tortoise import Tortoise, run_async
from app.models.animal import Animal
import asyncio

async def main():
    # Inicializar conexión
    print("Intentando conectar a la base de datos...")
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.import_model', 'aerich.models']}
    )
    
    print("Buscando vaca 20-36...")
    animal = await Animal.filter(nom='20-36').first()
    
    if animal:
        print(f'Vaca 20-36 encontrada:')
        print(f'  ID: {animal.id}')
        print(f'  Nombre: {animal.nom}')
        print(f'  Explotación: {animal.explotacio}')
        print(f'  Género: {animal.genere}')
        print(f'  Estado: {animal.estado}')
        print(f'  Alletar: {animal.alletar}')
        print(f'  Fecha nacimiento: {animal.dob}')
        
        # Buscar partos asociados
        partos = await animal.partos.all()
        print(f'  Número de partos: {len(partos)}')
        for parto in partos:
            print(f'    Parto ID: {parto.id}, Fecha: {parto.part}, Género cría: {parto.genere_t}, Estado cría: {parto.estado_t}')
    else:
        print('No se encontró la vaca 20-36')
    
    # Ahora busquemos por cualquier animal que contenga "20" en su nombre
    print("\nBuscando animales con '20' en su nombre:")
    animales_20 = await Animal.filter(nom__contains='20').all()
    for animal in animales_20:
        print(f'  {animal.id}: {animal.nom} - {animal.explotacio}')
    
    # Cerrar conexión
    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(main())
