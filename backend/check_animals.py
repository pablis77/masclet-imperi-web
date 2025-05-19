import asyncio
from tortoise import Tortoise
from app.models.animal import Animal

async def check_animals():
    # Inicializar conexión a la base de datos
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.explotacio', 'app.models.import_model']}
    )
    
    # Buscar a Angel (macho)
    angel = await Animal.filter(nom='angel').first()
    print(f'Angel encontrado: {angel is not None}')
    if angel:
        print(f'  - Nombre: {angel.nom}')
        print(f'  - Género: {angel.genere}')
        print(f'  - Explotación: {angel.explotacio}')
        print(f'  - Estado: {angel.estado}')
    
    # Buscar a Elsa (hembra)
    elsa = await Animal.filter(nom='elsa').first()
    print(f'Elsa encontrada: {elsa is not None}')
    if elsa:
        print(f'  - Nombre: {elsa.nom}')
        print(f'  - Género: {elsa.genere}')
        print(f'  - Explotación: {elsa.explotacio}')
        print(f'  - Estado: {elsa.estado}')
        
        # Obtener partos de Elsa
        elsa_parts = await elsa.parts.all()
        print(f'  - Partos de Elsa: {len(elsa_parts)}')
        
        # Mostrar detalles del parto si existe
        for i, parto in enumerate(elsa_parts):
            print(f'    Parto #{i+1}:')
            print(f'      - Fecha: {parto.part}')
            print(f'      - GenereT: {parto.GenereT}')
            print(f'      - EstadoT: {parto.EstadoT}')
    
    # Cerrar conexiones
    await Tortoise.close_connections()

if __name__ == "__main__":
    # Ejecutar la función asíncrona
    asyncio.run(check_animals())
