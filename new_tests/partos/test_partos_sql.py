#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test para obtener la distribución anual de partos usando SQL directo.
"""

import sys
import os
import json
import asyncio
import logging
import asyncpg
from collections import defaultdict
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)8s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Configuración de la base de datos
DB_HOST = "localhost"
DB_PORT = 5433
DB_USER = "postgres"
DB_PASS = "1234"
DB_NAME = "masclet_imperi"

async def get_partos_con_sql():
    """Obtiene los partos usando SQL directo"""
    
    logger.info("Conectando a la base de datos...")
    
    try:
        # Conectar a PostgreSQL
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        
        logger.info("Conexión establecida")
        
        # Consulta para obtener todos los partos
        query = """
        SELECT p.id, p.part, p.animal_id, p."GenereT", p."EstadoT",
               a.nom as animal_nom, a.explotacio
        FROM part p
        LEFT JOIN animals a ON p.animal_id = a.id
        ORDER BY p.part;
        """
        
        logger.info("Ejecutando consulta SQL...")
        result = await conn.fetch(query)
        
        logger.info(f"Se encontraron {len(result)} partos en total")
        
        # Ver el parto más antiguo
        if result:
            oldest = result[0]
            print("\n======= PARTO MÁS ANTIGUO =======")
            print(f"ID: {oldest['id']}")
            print(f"Fecha: {oldest['part'].strftime('%d/%m/%Y')}")
            print(f"Animal: {oldest['animal_nom']} (ID: {oldest['animal_id']})")
            print(f"Explotación: {oldest['explotacio']}")
            print(f"Género de la cría: {oldest['GenereT']}")
            print(f"Estado de la cría: {oldest['EstadoT']}")
            print("================================\n")
        
        # Agrupar por año
        partos_por_anio = defaultdict(int)
        
        for parto in result:
            if parto['part']:
                anio = parto['part'].year
                partos_por_anio[str(anio)] += 1
        
        # Ordenar los años
        anios_ordenados = sorted(partos_por_anio.keys(), key=lambda x: int(x))
        logger.info(f"Datos agrupados por año. Se encontraron {len(anios_ordenados)} años con partos")
        
        # Mostrar la información
        print("\n======= DISTRIBUCIÓN ANUAL DE PARTOS =======")
        print(f"Total de partos: {len(result)}")
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
        
        # Distribución por meses
        partos_por_mes = defaultdict(int)
        meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                 "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        
        for parto in result:
            if parto['part']:
                mes = parto['part'].month - 1  # 0-indexed para el array
                partos_por_mes[meses[mes]] += 1
        
        # Mostrar la distribución mensual
        print("\n======= DISTRIBUCIÓN MENSUAL DE PARTOS =======")
        for mes in meses:
            print(f"{mes}: {partos_por_mes[mes]} partos")
        print("===========================================\n")
        
        # Cerrar conexión
        await conn.close()
        
        return partos_por_anio
            
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        print(f"\n❌ Error: {str(e)}")
        return None

async def main():
    """Función principal del script"""
    print("\n🔍 Analizando la distribución anual de partos con SQL directo...\n")
    await get_partos_con_sql()

if __name__ == "__main__":
    asyncio.run(main())
