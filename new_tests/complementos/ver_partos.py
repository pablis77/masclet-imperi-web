import asyncio
import sys
import os
from datetime import datetime

# Agregar el directorio raíz del proyecto al PATH para poder importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from tortoise import Tortoise
from backend.app.models.animal import Animal
from backend.app.models.animal import Part


async def main():
    # Inicializar Tortoise
    await Tortoise.init(
        db_url="postgres://admin:admin123@localhost:5432/masclet",
        modules={"models": ["backend.app.models"]}
    )
    
    # Obtener todos los partos
    partos = await Part.all().prefetch_related('animal')
    
    print(f"\n=== PARTOS EN LA BASE DE DATOS ({len(partos)}) ===")
    print("+------+------------+------------+----------+----------+---------------+")
    print("| ID   | Animal ID  | Animal Nom | Fecha    | Género   | Estado        |")
    print("+======+============+============+==========+==========+===============+")
    
    for parto in partos:
        # Formatear la fecha como string
        fecha_str = parto.part.strftime('%Y-%m-%d') if parto.part else "N/A"
        
        # Obtener el nombre del animal
        nombre_animal = parto.animal.nom if parto.animal else "N/A"
        
        print(f"| {parto.id:<4} | {parto.animal_id:<10} | {nombre_animal:<10} | {fecha_str:<10} | {parto.GenereT:<8} | {parto.EstadoT:<13} |")
    
    print("+------+------------+------------+----------+----------+---------------+")
    
    # Cerrar la conexión a la base de datos
    await Tortoise.close_connections()


if __name__ == "__main__":
    asyncio.run(main())
