"""
Script para revertir temporalmente los campos extendidos de AnimalHistory
hasta que se complete la migración de la base de datos.

Este script:
1. Guarda una copia de seguridad del archivo animals.py modificado
2. Restaura el código para que solo use los campos existentes en la tabla
"""
import os
import sys
import re
import logging
import datetime
import shutil

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Archivo a modificar
ANIMALS_ENDPOINT_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 
    "../../backend/app/api/endpoints/animals.py"
))

def realizar_backup(archivo):
    """Realiza una copia de seguridad del archivo"""
    backup_path = f"{archivo}.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    shutil.copy2(archivo, backup_path)
    logger.info(f"Backup creado en: {backup_path}")
    return backup_path

def restaurar_codigo_original():
    """
    Revierte temporalmente el código para quitar los campos extendidos
    """
    if not os.path.exists(ANIMALS_ENDPOINT_PATH):
        logger.error(f"Archivo no encontrado: {ANIMALS_ENDPOINT_PATH}")
        return False
    
    # Realizar backup
    backup_path = realizar_backup(ANIMALS_ENDPOINT_PATH)
    
    # Leer el archivo completo
    with open(ANIMALS_ENDPOINT_PATH, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Buscar y reemplazar la parte de creación de AnimalHistory extendida
    patron_historial = re.compile(
        r'(\s+# Registrar en historial.*?cambios_json.*?\s+await AnimalHistory\.create\(\s+# Campos del formato antiguo.*?valor_nuevo=.*?,\s+\s+# Campos del nuevo formato extendido.*?changes=json\.dumps\(cambios_json\)\s+\))',
        re.DOTALL
    )
    
    # Versión simple y compatible sin campos extendidos
    reemplazo_historial = '''            # Registrar en historial
            await AnimalHistory.create(
                animal=animal,
                usuario=current_user.username,
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None
            )'''
    
    nuevo_contenido = patron_historial.sub(reemplazo_historial, contenido)
    
    # Si no coincide el patrón exacto, buscar un patrón alternativo
    if nuevo_contenido == contenido:
        patron_alt = re.compile(
            r'(\s+# Registrar en historial con compatibilidad.*?await AnimalHistory\.create\(.*?changes=json\.dumps\(.*?\)\s+\))',
            re.DOTALL
        )
        nuevo_contenido = patron_alt.sub(reemplazo_historial, contenido)
    
    # Verificar si se hizo el cambio
    if nuevo_contenido == contenido:
        # Intento final - usar la técnica más conservadora
        with open(ANIMALS_ENDPOINT_PATH, 'w', encoding='utf-8') as f:
            # Restaurar desde el backup inicial (antes de nuestras modificaciones)
            backup_original = os.path.join(os.path.dirname(ANIMALS_ENDPOINT_PATH), 
                                         "animals.py.bak.20250519191813")
            if os.path.exists(backup_original):
                with open(backup_original, 'r', encoding='utf-8') as bak:
                    nuevo_contenido = bak.read()
                    f.write(nuevo_contenido)
                    logger.info("Se restauró desde el backup original")
                    return True
            else:
                logger.warning("No se encontró el patrón para el historial y no existe el backup original")
                return False
    
    # Guardar el archivo modificado
    with open(ANIMALS_ENDPOINT_PATH, 'w', encoding='utf-8') as f:
        f.write(nuevo_contenido)
    
    logger.info("Se revirtió temporalmente el código para usar solo campos existentes")
    logger.info("Ahora deberías poder actualizar animales correctamente")
    
    return True

if __name__ == "__main__":
    logger.info("Iniciando restauración de código compatible...")
    if restaurar_codigo_original():
        logger.info("Restauración completada exitosamente")
    else:
        logger.error("Hubo un problema al restaurar el código")
