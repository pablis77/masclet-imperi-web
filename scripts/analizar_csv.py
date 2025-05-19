#!/usr/bin/env python
"""
Script para analizar detalladamente un archivo CSV y verificar problemas de importación.
"""
import csv
import sys
import os
from collections import defaultdict
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

def analizar_csv(ruta_archivo):
    """Analiza un archivo CSV para buscar posibles problemas"""
    if not os.path.exists(ruta_archivo):
        logger.error(f"El archivo {ruta_archivo} no existe")
        return
    
    # Diccionarios para almacenar información
    animales_por_nombre = defaultdict(list)
    animales_por_clave = defaultdict(list)
    
    # Total de registros y filas con partos
    total_registros = 0
    filas_con_parto = 0
    
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file, delimiter=';')
            
            for i, fila in enumerate(reader, 1):
                total_registros += 1
                
                # Analizar datos de la fila
                nom = fila.get('nom', '').strip()
                explotacio = fila.get('explotacio', '').strip()
                genere = fila.get('genere', '').strip()
                cod = fila.get('cod', '').strip()
                num_serie = fila.get('num_serie', '').strip()
                
                # Verificar si tiene datos de parto
                tiene_parto = bool(fila.get('part', '').strip())
                if tiene_parto:
                    filas_con_parto += 1
                
                # Verificar campos críticos
                if not nom:
                    logger.warning(f"Fila {i}: Sin nombre de animal")
                if not explotacio:
                    logger.warning(f"Fila {i}: Sin explotación")
                if not genere:
                    logger.warning(f"Fila {i}: Sin género")
                
                # Agrupar por nombre y explotación
                clave_nombre_explotacion = f"{nom}_{explotacio}" if nom and explotacio else None
                if clave_nombre_explotacion:
                    animales_por_nombre[clave_nombre_explotacion].append({
                        'fila': i,
                        'datos': fila,
                        'tiene_parto': tiene_parto
                    })
                
                # Agrupar por identificador único prioritario
                clave_unica = None
                if cod:
                    clave_unica = f"cod:{cod}"
                elif num_serie:
                    clave_unica = f"num_serie:{num_serie}"
                elif clave_nombre_explotacion:
                    clave_unica = f"nom_explotacio:{clave_nombre_explotacion}"
                
                if clave_unica:
                    animales_por_clave[clave_unica].append({
                        'fila': i,
                        'datos': fila,
                        'tiene_parto': tiene_parto
                    })
    
        # Resumen general
        logger.info(f"Total de registros en CSV: {total_registros}")
        logger.info(f"Filas con información de parto: {filas_con_parto}")
        logger.info(f"Animales únicos por nombre+explotación: {len(animales_por_nombre)}")
        logger.info(f"Animales únicos por clave priorizada: {len(animales_por_clave)}")
        
        # Analizar animales con múltiples registros
        logger.info("\n=== Animales con múltiples registros ===")
        for clave, registros in animales_por_nombre.items():
            if len(registros) > 1:
                nom, explotacio = clave.split('_', 1)
                logger.info(f"Animal '{nom}' en explotación '{explotacio}': {len(registros)} registros")
                
                # Verificar si tienen partos
                partos = sum(1 for r in registros if r['tiene_parto'])
                logger.info(f"  - Registros con partos: {partos}")
                
                # Mostrar detalles de cada registro
                for idx, registro in enumerate(registros, 1):
                    fila = registro['fila']
                    datos = registro['datos']
                    tiene_parto = "SÍ" if registro['tiene_parto'] else "NO"
                    
                    parto_info = f", Fecha parto: {datos.get('part')}" if registro['tiene_parto'] else ""
                    logger.info(f"  - Registro {idx} (Fila {fila}): Tiene parto: {tiene_parto}{parto_info}")
        
        # Verificar específicamente por 20-36
        logger.info("\n=== Análisis específico para animal 20-36 ===")
        clave_animal = "20-36"
        clave_busqueda = f"{clave_animal}_Gurans"
        
        if clave_busqueda in animales_por_nombre:
            registros = animales_por_nombre[clave_busqueda]
            logger.info(f"Animal '{clave_animal}' encontrado con {len(registros)} registros")
            
            # Analizar en detalle
            for idx, registro in enumerate(registros, 1):
                fila = registro['fila']
                datos = registro['datos']
                
                # Mostrar todos los campos relevantes
                logger.info(f"  - Registro {idx} (Fila {fila}):")
                for campo, valor in datos.items():
                    if valor and campo in ['nom', 'explotacio', 'genere', 'cod', 'num_serie', 'part', 'GenereT', 'EstadoT']:
                        logger.info(f"    {campo}: {valor}")
        else:
            logger.warning(f"¡Animal '{clave_animal}' NO encontrado en agrupación por nombre!")
            
            # Buscar si está en alguna otra clave
            for clave, registros in animales_por_clave.items():
                for registro in registros:
                    if registro['datos'].get('nom') == clave_animal:
                        logger.info(f"Encontrado en clave: {clave}")
                        logger.info(f"Datos: {registro['datos']}")
    
    except Exception as e:
        logger.error(f"Error al analizar el CSV: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python analizar_csv.py <ruta_archivo_csv>")
        sys.exit(1)
        
    ruta_archivo = sys.argv[1]
    analizar_csv(ruta_archivo)
