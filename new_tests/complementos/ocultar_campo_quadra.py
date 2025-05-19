#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import re
import asyncio
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

# Archivos a actualizar para ocultar referencias visuales a 'quadra'
ARCHIVOS_FRONTEND = [
    # Ficha del animal
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', '[id].astro'),
    # Formulario de edición
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', 'update', '[id].astro'),
    # Formulario de creación
    os.path.join(base_dir, 'frontend', 'src', 'pages', 'animals', 'create.astro'),
]

def hacer_backup(ruta_archivo):
    """Crea una copia de seguridad del archivo"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    backup_path = f"{ruta_archivo}.bak.{timestamp}"
    shutil.copy2(ruta_archivo, backup_path)
    logger.info(f"Backup creado en: {backup_path}")
    return backup_path

def ocultar_campo_quadra_en_archivo(ruta_archivo):
    """Oculta las referencias visuales al campo 'quadra' en un archivo"""
    if not os.path.exists(ruta_archivo):
        logger.warning(f"Archivo no encontrado: {ruta_archivo}")
        return False
    
    # Hacer backup
    hacer_backup(ruta_archivo)
    
    # Leer el contenido del archivo
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Patrones para identificar etiquetas HTML relacionadas con 'quadra'
    patrones = [
        # Para la ficha de animal: divs que contienen "Cuadra"
        (r'<div[^>]*>\s*<p[^>]*>\s*Cuadra\s*</p>.*?</div>\s*</div>', 
         '<!-- Campo "quadra" ocultado, usar "origen" en su lugar -->'),
         
        # Para formularios: campos de entrada con nombre "quadra"
        (r'<div[^>]*>\s*<label[^>]*>\s*Cuadra\s*</label>.*?name="quadra".*?</div>', 
         '<!-- Campo "quadra" ocultado, usar "origen" en su lugar -->'),
    ]
    
    # Realizar las sustituciones
    contenido_modificado = contenido
    cambios_totales = 0
    
    for patron, reemplazo in patrones:
        contenido_nuevo, num_cambios = re.subn(patron, reemplazo, contenido_modificado, flags=re.DOTALL)
        if num_cambios > 0:
            cambios_totales += num_cambios
            contenido_modificado = contenido_nuevo
    
    # Si no hubo cambios con los patrones predefinidos, intentamos buscar manualmente
    if cambios_totales == 0:
        # Buscar cualquier etiqueta que contenga la palabra "Cuadra" o "quadra"
        cuadra_patron = r'(<[^>]*>.*?\b(?:Cuadra|quadra)\b.*?</[^>]*>)'
        coincidencias = re.findall(cuadra_patron, contenido_modificado, flags=re.DOTALL | re.IGNORECASE)
        
        if coincidencias:
            logger.info(f"Se encontraron {len(coincidencias)} referencias a 'Cuadra'/'quadra' en {ruta_archivo}")
            logger.info("Ejemplos de coincidencias:")
            for i, match in enumerate(coincidencias[:3]):  # Mostrar solo las primeras 3
                logger.info(f"  {i+1}. {match[:100]}...")
            
            # No hacemos cambios automáticos si no coinciden los patrones predefinidos
            logger.warning("No se pudieron ocultar automáticamente todas las referencias a 'quadra'")
            logger.warning("Se requiere revisión manual del archivo")
            return False
    
    # Si no hay cambios, no modificamos el archivo
    if cambios_totales == 0:
        logger.info(f"No se encontraron referencias a 'Cuadra'/'quadra' en {ruta_archivo}")
        return False
    
    # Escribir el contenido modificado
    with open(ruta_archivo, 'w', encoding='utf-8') as f:
        f.write(contenido_modificado)
    
    logger.info(f"Se ocultaron {cambios_totales} referencias a 'quadra' en {ruta_archivo}")
    return True

def main():
    logger.info("=== INICIANDO OCULTACIÓN DEL CAMPO 'QUADRA' ===")
    
    total_archivos = len(ARCHIVOS_FRONTEND)
    archivos_actualizados = 0
    
    for archivo in ARCHIVOS_FRONTEND:
        logger.info(f"Procesando: {archivo}")
        if ocultar_campo_quadra_en_archivo(archivo):
            archivos_actualizados += 1
    
    if archivos_actualizados > 0:
        logger.info(f"=== PROCESO COMPLETADO: {archivos_actualizados}/{total_archivos} ARCHIVOS ACTUALIZADOS ===")
        logger.info("Se han ocultado las referencias visuales al campo 'quadra' en los formularios y vistas")
        logger.info("IMPORTANTE: La columna 'quadra' sigue existiendo en la base de datos por compatibilidad")
        logger.info("Para eliminar completamente la columna, ejecute el script 'eliminar_columna_quadra.py'")
        logger.info("Recuerde reiniciar el servidor frontend para aplicar los cambios")
    else:
        logger.warning("=== NO SE REALIZARON CAMBIOS ===")
        logger.warning("No se encontraron referencias directas a 'quadra' en los archivos especificados")
        logger.warning("Puede ser necesario revisar los archivos manualmente")

if __name__ == "__main__":
    main()
