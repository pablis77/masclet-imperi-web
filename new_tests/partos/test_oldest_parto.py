#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para obtener el parto más antiguo de la base de datos.
"""

import sys
import os
import json
from datetime import datetime
import asyncio
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)8s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Añadir el directorio raíz al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

# Importaciones específicas de la aplicación
from app.models import Part
from app.core.config import settings
from tortoise import Tortoise

# Configuración de la base de datos
DB_URL = f"postgres://postgres:1234@localhost:5433/masclet_imperi"

TORTOISE_ORM = {
    "connections": {"default": DB_URL},
    "apps": {
        "models": {
            "models": ["app.models"],
            "default_connection": "default",
        },
    },
}

async def get_oldest_parto():
    """Obtiene el parto más antiguo de la base de datos"""
    
    logger.info("Conectando a la base de datos...")
    
    # Inicializar Tortoise ORM
    await Tortoise.init(config=TORTOISE_ORM)
    
    try:
        # Obtener el parto más antiguo
        logger.info("Buscando el parto más antiguo...")
        oldest_parto = await Part.all().order_by('part').first()
        
        if oldest_parto:
            # Formatear la fecha para mejor visualización
            fecha_formateada = oldest_parto.part.strftime('%d/%m/%Y') if oldest_parto.part else "Sin fecha"
            
            # Obtener datos adicionales del parto
            animal = await oldest_parto.animal
            animal_nombre = animal.nom if animal else "Desconocido"
            
            # Mostrar la información
            print("\n======= PARTO MÁS ANTIGUO =======")
            print(f"ID: {oldest_parto.id}")
            print(f"Fecha: {fecha_formateada}")
            print(f"Animal: {animal_nombre} (ID: {oldest_parto.animal_id})")
            print(f"Género de la cría: {oldest_parto.GenereT}")
            print(f"Estado de la cría: {oldest_parto.EstadoT}")
            print("================================\n")
            
            return oldest_parto
        else:
            print("\n⚠️ No se encontraron partos en la base de datos")
            return None
            
    except Exception as e:
        logger.error(f"Error al obtener el parto más antiguo: {str(e)}")
        print(f"\n❌ Error al obtener el parto más antiguo: {str(e)}")
        return None
    finally:
        # Cerrar conexiones
        logger.info("Cerrando conexiones a la base de datos...")
        await Tortoise.close_connections()

async def main():
    """Función principal del script"""
    print("\n🔍 Buscando el parto más antiguo en la base de datos...\n")
    await get_oldest_parto()

if __name__ == "__main__":
    asyncio.run(main())
