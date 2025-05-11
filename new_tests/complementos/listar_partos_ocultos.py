import asyncio
from tortoise import Tortoise
import logging
from datetime import datetime

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
        
        # Buscar la explotación Guadalajara
        explotacion = "Guadalajara"
        
        # Obtener animales de Guadalajara
        animales = await Animal.filter(explotacio=explotacion).all()
        
        print(f"\n=== ANIMALES EN EXPLOTACIÓN {explotacion} ===")
        for animal in animales:
            print(f"ID: {animal.id}, Nombre: {animal.nom}, Género: {animal.genere}")
        
        # Obtener IDs de animales
        animal_ids = [animal.id for animal in animales]
        
        # Obtener todos los partos relacionados con estos animales
        partos = await Part.filter(animal_id__in=animal_ids).all().order_by('animal_id', 'part')
        
        print(f"\n=== TODOS LOS PARTOS EN EXPLOTACIÓN {explotacion} ===")
        print("Total partos encontrados:", len(partos))
        
        # Cabecera de tabla
        print(f"{'ID':^5} | {'Animal ID':^10} | {'Animal Nombre':^15} | {'Fecha Parto':^15} | {'Género T':^10} | {'Estado T':^10} | {'Observaciones':<40}")
        print("-" * 120)
        
        # Mostrar detalles de cada parto
        for parto in partos:
            # Obtener el nombre del animal
            animal = await Animal.filter(id=parto.animal_id).first()
            animal_nombre = animal.nom if animal else "Desconocido"
            
            # Formatear fecha
            fecha_parto = parto.part.strftime("%d/%m/%Y") if parto.part else "Sin fecha"
            
            # Truncar observaciones si son muy largas
            observaciones = parto.observacions if parto.observacions else ""
            if len(observaciones) > 40:
                observaciones = observaciones[:37] + "..."
            
            # Imprimir fila
            print(f"{parto.id:^5} | {parto.animal_id:^10} | {animal_nombre:^15} | {fecha_parto:^15} | {parto.GenereT:^10} | {parto.EstadoT:^10} | {observaciones:<40}")
        
        # Mostrar información detallada de partos ocultos
        print(f"\n=== DETALLE DE PARTOS POSIBLEMENTE OCULTOS ===")
        textos_ocultar = ['[REEMPLAZADO POR NUEVO REGISTRO]', '[REGISTRO DUPLICADO - IGNORAR]']
        
        partos_ocultos = []
        for parto in partos:
            es_oculto = False
            if parto.observacions:
                for texto in textos_ocultar:
                    if texto in parto.observacions:
                        es_oculto = True
                        break
            
            if es_oculto:
                partos_ocultos.append(parto)
        
        print(f"Total partos posiblemente ocultos: {len(partos_ocultos)}")
        if partos_ocultos:
            for parto in partos_ocultos:
                animal = await Animal.filter(id=parto.animal_id).first()
                animal_nombre = animal.nom if animal else "Desconocido"
                fecha_parto = parto.part.strftime("%d/%m/%Y") if parto.part else "Sin fecha"
                
                print(f"\nID: {parto.id}")
                print(f"Animal: {animal_nombre} (ID: {parto.animal_id})")
                print(f"Fecha de parto: {fecha_parto}")
                print(f"Género ternero: {parto.GenereT}")
                print(f"Estado ternero: {parto.EstadoT}")
                print(f"Observaciones: {parto.observacions}")
                print("-" * 40)
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(run())
