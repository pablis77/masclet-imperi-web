#!/usr/bin/env python
"""
Script para verificar si un animal específico existe en la base de datos.
"""
import asyncio
import sys
import logging
from tortoise import Tortoise

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# URL de la base de datos
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"

async def init_db():
    """Inicializar conexión a base de datos"""
    logger.info(f"Conectando a: {DB_URL}")
    
    await Tortoise.init(
        db_url=DB_URL,
        modules={"models": ["app.models.animal"]}
    )
    logger.info("Conexión a base de datos inicializada")

async def verificar_animal(nombre):
    """Verificar si existe un animal con el nombre dado"""
    try:
        # Importar aquí para evitar problemas
        from app.models.animal import Animal, Part
        
        # Buscar por nombre exacto
        animales = await Animal.filter(nom=nombre)
        
        logger.info(f"Animales encontrados con nombre '{nombre}': {len(animales)}")
        
        for animal in animales:
            logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}, Género: {animal.genere}")
            
            # Buscar partos asociados
            partos = await Part.filter(animal_id=animal.id)
            logger.info(f"  Partos registrados: {len(partos)}")
            
            for parto in partos:
                logger.info(f"  - Fecha: {parto.part}, Género cría: {parto.GenereT}, Estado cría: {parto.EstadoT}")
        
        # También buscar nombres similares
        logger.info("\nBúsqueda de nombres similares:")
        animales_similares = await Animal.filter(nom__contains=nombre)
        animales_similares = [a for a in animales_similares if a.nom != nombre]  # Excluir los exactos
        
        logger.info(f"Animales con nombres similares a '{nombre}': {len(animales_similares)}")
        for animal in animales_similares:
            logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}")
        
    except Exception as e:
        logger.error(f"Error al verificar animal: {str(e)}")
        raise

async def main():
    """Función principal"""
    try:
        await init_db()
        
        # Verificar nombre pasado como argumento o usar uno predeterminado
        nombre = sys.argv[1] if len(sys.argv) > 1 else "20-36"
        
        await verificar_animal(nombre)
    except Exception as e:
        logger.error(f"Error en la operación: {str(e)}")
    finally:
        # Siempre cerramos conexiones
        await Tortoise.close_connections()
        logger.info("Conexión a base de datos cerrada")

if __name__ == "__main__":
    asyncio.run(main())
