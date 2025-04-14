#!/usr/bin/env python
"""
Script para corregir duplicados de animales en la base de datos.
Este script detecta animales con el mismo nombre y explotación,
conserva uno de ellos (el primero creado) y mueve todos los partos
de las copias al original.
"""
import asyncio
import logging
from tortoise import Tortoise
from datetime import datetime
import sys

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)7s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# URL de la base de datos
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"

async def init_db():
    """Inicializar la conexión a la base de datos"""
    logger.info(f"URL de base de datos: {DB_URL}")
    
    try:
        # Inicializar ORM
        await Tortoise.init(
            db_url=DB_URL,
            modules={"models": ["app.models.animal", "app.models.explotacio", "app.models.import_model"]}
        )
        logger.info("Base de datos conectada")
    except Exception as e:
        logger.error(f"Error al conectar a la base de datos: {str(e)}")
        raise

async def fix_duplicates(mode="report"):
    """
    Corregir animales duplicados.
    
    Args:
        mode (str): 'report' solo muestra los duplicados, 'fix' corrige los duplicados
    """
    # Importar aquí para evitar problemas de importación circular
    from app.models.animal import Animal, Part
    from tortoise.functions import Count
    
    # Detectar duplicados por nombre y explotación
    logger.info("Buscando animales con el mismo nombre y explotación...")
    
    # Obtener todos los animales
    animals = await Animal.all()
    
    # Construir un diccionario para agrupar por nombre y explotación
    duplicates = {}
    for animal in animals:
        key = f"{animal.nom}|{animal.explotacio}"
        if key not in duplicates:
            duplicates[key] = []
        duplicates[key].append(animal)
    
    # Filtrar para encontrar solo los verdaderos duplicados
    real_duplicates = {k: v for k, v in duplicates.items() if len(v) > 1}
    
    if not real_duplicates:
        logger.info("No se encontraron animales duplicados.")
        return
    
    # Reportar duplicados encontrados
    total_duplicates = sum(len(v) - 1 for v in real_duplicates.values())
    logger.info(f"Se encontraron {len(real_duplicates)} grupos de duplicados ({total_duplicates} animales duplicados)")
    
    for key, animals_list in real_duplicates.items():
        nom, explotacio = key.split("|")
        logger.info(f"Duplicados de '{nom}' en '{explotacio}': {len(animals_list)} registros")
        
        # Ordenar por ID para mantener el más antiguo
        animals_list.sort(key=lambda x: x.id)
        original = animals_list[0]
        duplicates = animals_list[1:]
        
        logger.info(f"  - Original: ID {original.id}, {original.nom}, {original.genere}, {original.estado}")
        
        for i, dup in enumerate(duplicates):
            logger.info(f"  - Duplicado {i+1}: ID {dup.id}, {dup.nom}, {dup.genere}, {dup.estado}")
            
            # Contar partos del duplicado
            partos = await Part.filter(animal_id=dup.id).all()
            logger.info(f"    - Tiene {len(partos)} partos registrados")
            
            # Listar partos
            for parto in partos:
                logger.info(f"      - Fecha: {parto.part}, Género: {parto.GenereT}, Estado: {parto.EstadoT}")
        
        if mode == "fix":
            logger.info(f"  > Corrigiendo duplicados de '{nom}'...")
            
            # Transferir todos los partos de los duplicados al original
            for dup in duplicates:
                partos = await Part.filter(animal_id=dup.id).all()
                for parto in partos:
                    logger.info(f"    - Transfiriendo parto {parto.id} a animal {original.id}")
                    parto.animal_id = original.id
                    await parto.save()
                
                # Eliminar el duplicado
                logger.info(f"    - Eliminando animal duplicado {dup.id}")
                await dup.delete()
    
    if mode == "fix":
        logger.info(f"¡Corrección completada! Se eliminaron {total_duplicates} animales duplicados.")
    else:
        logger.info("Ejecute este script con '--fix' para corregir los duplicados.")

async def main():
    """Función principal"""
    mode = "report"
    if len(sys.argv) > 1 and sys.argv[1] == "--fix":
        mode = "fix"
    
    await init_db()
    try:
        await fix_duplicates(mode)
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()
        logger.info("Tortoise-ORM shutdown")

if __name__ == "__main__":
    asyncio.run(main())
