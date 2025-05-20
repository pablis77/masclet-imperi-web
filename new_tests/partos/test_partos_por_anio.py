#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para obtener la distribución anual de partos.
"""

import sys
import os
import json
from datetime import datetime
import asyncio
import logging
from collections import defaultdict

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

async def get_partos_por_anio():
    """Obtiene la distribución anual de partos"""
    
    logger.info("Conectando a la base de datos...")
    
    # Inicializar Tortoise ORM
    await Tortoise.init(config=TORTOISE_ORM)
    
    try:
        # Obtener todos los partos
        logger.info("Obteniendo todos los partos de la base de datos...")
        partos = await Part.all()
        logger.info(f"Se encontraron {len(partos)} partos en total")
        
        # Agrupar por año
        partos_por_anio = defaultdict(int)
        
        for parto in partos:
            if parto.part:  # Acceder directamente al atributo
                anio = parto.part.year
                partos_por_anio[str(anio)] += 1
        
        # Ordenar los años
        anios_ordenados = sorted(partos_por_anio.keys(), key=lambda x: int(x))
        logger.info(f"Datos agrupados por año. Se encontraron {len(anios_ordenados)} años con partos")
        
        # Mostrar la información
        print("\n======= DISTRIBUCIÓN ANUAL DE PARTOS =======")
        print(f"Total de partos: {len(partos)}")
        print(f"Años con partos: {len(partos_por_anio)}")
        print("\nDesglose por año:")
        
        for anio in anios_ordenados:
            print(f"{anio}: {partos_por_anio[anio]} partos")
        
        # Mostrar también los años con más y menos partos
        if anios_ordenados:
            anio_max = max(partos_por_anio.items(), key=lambda x: x[1])
            anio_min = min(partos_por_anio.items(), key=lambda x: x[1])
            
            print(f"\nAño con más partos: {anio_max[0]} ({anio_max[1]} partos)")
            print(f"Año con menos partos: {anio_min[0]} ({anio_min[1]} partos)")
            
            # Mostrar el primer y último año con partos
            primer_anio = anios_ordenados[0]
            ultimo_anio = anios_ordenados[-1]
            
            print(f"\nPrimer año con partos: {primer_anio} ({partos_por_anio[primer_anio]} partos)")
            print(f"Último año con partos: {ultimo_anio} ({partos_por_anio[ultimo_anio]} partos)")
            
        print("===========================================\n")
        
        return partos_por_anio
            
    except Exception as e:
        print(f"\n❌ Error al obtener los partos anualizados: {str(e)}")
        return None
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

async def main():
    """Función principal del script"""
    print("\n🔍 Analizando la distribución anual de partos...\n")
    await get_partos_por_anio()

if __name__ == "__main__":
    asyncio.run(main())
