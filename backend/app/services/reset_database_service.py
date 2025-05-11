"""
Servicio para reiniciar la base de datos
"""
import asyncio
import logging
import sys
import os
from typing import Dict, List, Any, Optional, Union, Tuple
from tortoise import Tortoise
from app.models.animal import Animal, Part
from app.models.import_model import Import
from app.models.user import User

logger = logging.getLogger(__name__)

async def reset_database() -> bool:
    """
    Reinicia la base de datos eliminando todos los datos
    Implementado de forma simplificada en lugar de usar el script externo
    """
    try:
        logger.info("Iniciando proceso de limpieza de la base de datos...")
        
        # Eliminar todos los partos
        logger.info("Eliminando todos los registros de partos...")
        await Part.all().delete()
        logger.info("Borrados todos los registros de partos")
        
        # Eliminar todos los animales
        logger.info("Eliminando todos los registros de animales...")
        await Animal.all().delete()
        logger.info("Borrados todos los registros de animales")
        
        # Eliminar todos los registros de importación
        logger.info("Eliminando todos los registros de importación...")
        await Import.all().delete()
        logger.info("Borrados todos los registros de importación")
        
        # No eliminar usuarios para mantener la autenticación
        
        logger.info("Base de datos limpiada con éxito")
        return True
        
    except Exception as e:
        logger.error(f"Error al reiniciar la base de datos: {str(e)}", exc_info=True)
        return False
