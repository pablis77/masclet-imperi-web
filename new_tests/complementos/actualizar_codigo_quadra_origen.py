"""
Script para actualizar el código del backend y frontend para usar 'origen' en lugar de 'quadra'
después de la migración de la base de datos.

Este script:
1. Busca referencias a 'quadra' en los archivos relevantes
2. Reemplaza las referencias por 'origen' manteniendo compatibilidad
"""
import os
import sys
import re
import logging
import datetime
import shutil
from pathlib import Path

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Directorio base
base_dir = Path(os.path.abspath(os.path.join(
    os.path.dirname(__file__), "../.."
)))

# Archivos a revisar y modificar
ARCHIVOS_A_REVISAR = [
    # Backend
    base_dir / "backend/app/models/animal.py",
    base_dir / "backend/app/api/endpoints/animals.py",
    base_dir / "backend/app/schemas/animal.py",
    # Frontend
    base_dir / "frontend/src/components/animal/AnimalForm.astro",
    base_dir / "frontend/src/components/animal/AnimalFormUpdate.astro",
    base_dir / "frontend/src/pages/animals/[id].astro",
    base_dir / "frontend/src/pages/animals/update/[id].astro",
]

# Diccionario de renombrado para diferentes casos
RENOMBRADO = {
    "quadra": "origen",
    "Quadra": "Origen",
    "QUADRA": "ORIGEN",
}

def realizar_backup(archivo):
    """Realiza una copia de seguridad del archivo"""
    backup_path = f"{archivo}.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    shutil.copy2(archivo, backup_path)
    logger.info(f"Backup creado en: {backup_path}")
    return backup_path

def actualizar_archivo(archivo):
    """Actualiza un archivo para usar 'origen' en lugar de 'quadra'"""
    if not os.path.exists(archivo):
        logger.warning(f"Archivo no encontrado: {archivo}")
        return False
    
    # Realizar backup
    backup_path = realizar_backup(archivo)
    
    # Leer el archivo completo
    with open(archivo, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Contenido original para comparar después
    contenido_original = contenido
    
    # Reemplazar todas las variantes del término
    for original, nuevo in RENOMBRADO.items():
        contenido = contenido.replace(original, nuevo)
    
    # Verificar si hubo cambios
    if contenido == contenido_original:
        logger.info(f"No se encontraron ocurrencias en: {archivo}")
        return False
    
    # Guardar el archivo modificado
    with open(archivo, 'w', encoding='utf-8') as f:
        f.write(contenido)
    
    logger.info(f"Archivo actualizado: {archivo}")
    return True

def main():
    """Función principal que ejecuta el script"""
    logger.info("Iniciando actualización de código para usar 'origen' en lugar de 'quadra'...")
    
    archivos_actualizados = 0
    
    for archivo in ARCHIVOS_A_REVISAR:
        archivo_str = str(archivo)
        logger.info(f"Analizando: {archivo_str}")
        
        try:
            actualizado = actualizar_archivo(archivo_str)
            if actualizado:
                archivos_actualizados += 1
        except Exception as e:
            logger.error(f"Error al procesar {archivo_str}: {str(e)}")
    
    logger.info(f"Proceso completado. Se actualizaron {archivos_actualizados} archivos de {len(ARCHIVOS_A_REVISAR)}.")
    
    if archivos_actualizados > 0:
        logger.info("✓ Recuerda reiniciar el servidor backend y frontend para aplicar los cambios")
    
    return archivos_actualizados > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
