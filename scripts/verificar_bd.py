#!/usr/bin/env python
"""
Script para verificar el contenido de la base de datos
Uso: python verificar_bd.py [nombre_animal]
"""
import sys
import asyncio
import logging
from tortoise import Tortoise
from datetime import datetime

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

async def check_animals(nombre_filtro=None):
    """Verificar animales en la base de datos"""
    # Importar aquí para evitar problemas de importación circular
    from app.models.animal import Animal, Part
    
    # Contar animales
    total_animales = await Animal.all().count()
    logger.info(f"Total de animales en la base de datos: {total_animales}")
    
    # Distribución por explotación
    explotaciones = {}
    async for animal in Animal.all():
        explotacion = animal.explotacio
        if explotacion not in explotaciones:
            explotaciones[explotacion] = 0
        explotaciones[explotacion] += 1
    
    logger.info("Distribución de animales por explotación:")
    for explotacion, count in explotaciones.items():
        logger.info(f"  - {explotacion}: {count} animales")
    
    # Distribución por género
    machos = await Animal.filter(genere="M").count()
    hembras = await Animal.filter(genere="F").count()
    logger.info(f"Distribución por género: {machos} machos, {hembras} hembras")
    
    # Distribución por estado
    activos = await Animal.filter(estado="OK").count()
    fallecidos = await Animal.filter(estado="DEF").count()
    logger.info(f"Distribución por estado: {activos} activos, {fallecidos} fallecidos")
    
    # Si se especifica un filtro, buscar animales por nombre
    if nombre_filtro:
        animales_filtrados = await Animal.filter(nom__icontains=nombre_filtro).all()
        logger.info(f"Animales con nombre '{nombre_filtro}': {len(animales_filtrados)}")
        
        for animal in animales_filtrados:
            logger.info(f"  - ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}, Género: {animal.genere}")
            
            # Mostrar partos asociados si es hembra
            if animal.genere == "F":
                try:
                    # Usar una consulta simple con el ORM
                    partos_animal = await Part.filter(animal_id=animal.id).order_by("-part")
                    num_partos = len(partos_animal)
                    
                    if num_partos > 0:
                        logger.info(f"    Partos registrados: {num_partos}")
                        for parto in partos_animal:
                            logger.info(f"      - ID: {parto.id}, Fecha: {parto.part}, "
                                      f"Género cría: {parto.GenereT}, Estado cría: {parto.EstadoT}")
                    else:
                        logger.info(f"    No se encontraron partos para este animal")
                except Exception as e:
                    logger.error(f"    Error al verificar partos del animal: {str(e)}")
    
    # Sección de verificación de partos usando los modelos ORM directamente
    logger.info("\n==== VERIFICACIÓN DE PARTOS =====")
    
    try:
        # Usar ORM para contar partos
        count_query = Part.all()
        total_partos = await count_query.count()
        logger.info(f"Total de partos registrados: {total_partos}")
        
        if total_partos > 0:
            # Recuperar los últimos 5 partos
            ultimos_partos = await Part.all().order_by("-id").limit(5)
            
            if ultimos_partos:
                logger.info("Últimos 5 partos registrados:")
                for parto in ultimos_partos:
                    # Recuperar el animal asociado a cada parto
                    try:
                        animal = await Animal.get(id=parto.animal_id)
                        animal_nombre = animal.nom
                    except Exception:
                        animal_nombre = "Desconocido"
                        
                    logger.info(f"  - ID: {parto.id}, Animal: {animal_nombre} (ID: {parto.animal_id}), "  
                              f"Fecha: {parto.part}, Género cría: {parto.GenereT}, Estado cría: {parto.EstadoT}")
            else:
                logger.info("No se pudieron recuperar los partos")
        else:
            logger.info("No hay partos registrados en la base de datos")
    
    except Exception as e:
        logger.error(f"Error al verificar partos: {str(e)}")

async def main():
    """Función principal"""
    await init_db()
    try:
        # Obtener filtro de nombre si se proporciona
        nombre_filtro = sys.argv[1] if len(sys.argv) > 1 else None
        
        await check_animals(nombre_filtro)
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()
        logger.info("Tortoise-ORM shutdown")

if __name__ == "__main__":
    asyncio.run(main())
