#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import re
import logging
import shutil
from pathlib import Path
from datetime import datetime

# Añadir directorio base al path para poder importar módulos
base_dir = str(Path(__file__).parent.parent.parent)
if base_dir not in sys.path:
    sys.path.append(base_dir)

# Configuración de logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)8s] %(message)s', 
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Archivos a actualizar para reemplazar 'quadra' por 'origen'
ARCHIVOS_FRONTEND = [
    # Ficha del animal
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', '[id].astro'),
    # Formulario de edición
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', 'update', '[id].astro'),
    # Formulario de creación
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', 'new.astro'),
    # Otras posibles ubicaciones
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', 'edit', '[id].astro'),
]

def hacer_backup(ruta_archivo):
    """Crea una copia de seguridad del archivo"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    backup_path = f"{ruta_archivo}.bak.{timestamp}"
    shutil.copy2(ruta_archivo, backup_path)
    logger.info(f"Backup creado en: {backup_path}")
    return backup_path

def reemplazar_quadra_por_origen(ruta_archivo):
    """Reemplaza las referencias visuales y de datos de 'quadra' por 'origen'"""
    if not os.path.exists(ruta_archivo):
        logger.warning(f"Archivo no encontrado: {ruta_archivo}")
        return False
    
    # Hacer backup
    hacer_backup(ruta_archivo)
    
    # Leer el contenido del archivo
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Patrones de reemplazo
    reemplazos = [
        # Etiquetas y textos: "Cuadra" -> "Origen"
        (r'\bCuadra\b', 'Origen'),
        
        # Atributos HTML: name="quadra" -> name="origen"
        (r'name="quadra"', 'name="origen"'),
        
        # Acceso a datos: animal.quadra -> animal.origen
        (r'\.quadra\b', '.origen'),
        
        # Variables JavaScript: quadra -> origen
        (r'\bquadra\b', 'origen'),
        
        # Mantener exactamente la misma estructura, posición y diseño
    ]
    
    # Realizar las sustituciones manteniendo la misma estructura
    contenido_modificado = contenido
    cambios_totales = 0
    
    for patron, reemplazo in reemplazos:
        contenido_nuevo, num_cambios = re.subn(patron, reemplazo, contenido_modificado, flags=re.IGNORECASE)
        if num_cambios > 0:
            cambios_totales += num_cambios
            contenido_modificado = contenido_nuevo
    
    # Si no hay cambios, no modificamos el archivo
    if cambios_totales == 0:
        logger.info(f"No se encontraron referencias a 'Cuadra'/'quadra' en {ruta_archivo}")
        return False
    
    # Escribir el contenido modificado
    with open(ruta_archivo, 'w', encoding='utf-8') as f:
        f.write(contenido_modificado)
    
    logger.info(f"Se reemplazaron {cambios_totales} referencias de 'quadra' a 'origen' en {ruta_archivo}")
    return True

def main():
    logger.info("=== INICIANDO REEMPLAZO DE 'QUADRA' POR 'ORIGEN' ===")
    logger.info("Se mantendrá la misma estructura, posición y diseño")
    
    total_archivos = len(ARCHIVOS_FRONTEND)
    archivos_actualizados = 0
    
    for archivo in ARCHIVOS_FRONTEND:
        logger.info(f"Procesando: {archivo}")
        if reemplazar_quadra_por_origen(archivo):
            archivos_actualizados += 1
    
    if archivos_actualizados > 0:
        logger.info(f"=== PROCESO COMPLETADO: {archivos_actualizados}/{total_archivos} ARCHIVOS ACTUALIZADOS ===")
        logger.info("Se han reemplazado todas las referencias de 'quadra' por 'origen'")
        logger.info("IMPORTANTE: Las posiciones y estructura se han mantenido idénticas")
        logger.info("Recuerde reiniciar el servidor frontend para aplicar los cambios")
    else:
        logger.warning("=== NO SE REALIZARON CAMBIOS ===")
        logger.warning("No se encontraron referencias a 'quadra' en los archivos especificados")
        logger.warning("Puede ser necesario revisar los archivos manualmente")

if __name__ == "__main__":
    main()
