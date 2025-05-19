"""
Script para corregir el problema de valores nulos en el historial de animales.

Este script modifica el endpoint update_animal_patch para que:
1. Procese correctamente los valores nulos (como borrar un campo 'padre')
2. Incluya los campos obligatorios 'action' y otros en AnimalHistory

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

def corregir_procesamiento_valores_nulos():
    """
    Corrige el procesamiento de valores nulos en el endpoint update_animal_patch
    """
    if not os.path.exists(ANIMALS_ENDPOINT_PATH):
        logger.error(f"Archivo no encontrado: {ANIMALS_ENDPOINT_PATH}")
        return False
    
    # Realizar backup
    backup_path = realizar_backup(ANIMALS_ENDPOINT_PATH)
    
    # Leer el archivo completo
    with open(ANIMALS_ENDPOINT_PATH, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Importar el módulo json si no está ya importado
    if "import json" not in contenido:
        contenido = contenido.replace(
            "import subprocess", 
            "import subprocess\nimport json"
        )
        logger.info("Añadida importación de módulo json")
    
    # Corregir la creación de registros de historial para incluir el campo 'action'
    patron_historial = re.compile(
        r'(\s+# Registrar en historial\s+await AnimalHistory\.create\(\s+animal=animal,\s+usuario=current_user\.username,\s+cambio=descripcion,\s+campo=campo,\s+valor_anterior=.*?,\s+valor_nuevo=.*?\s+\))',
        re.DOTALL
    )
    
    reemplazo_historial = '''
            # Registrar en historial
            cambios_json = {campo: {"anterior": str(valor_anterior) if valor_anterior is not None else None, 
                                 "nuevo": str(nuevo_valor) if nuevo_valor is not None else None}}
            
            await AnimalHistory.create(
                animal=animal,
                usuario=current_user.username,
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None,
                
                # Campos obligatorios del nuevo formato
                action="UPDATE",
                user=current_user.username,
                timestamp=datetime.now(),
                field=campo,
                description=descripcion,
                old_value=str(valor_anterior) if valor_anterior is not None else None,
                new_value=str(nuevo_valor) if nuevo_valor is not None else None,
                changes=json.dumps(cambios_json)
            )'''
    
    nuevo_contenido = patron_historial.sub(reemplazo_historial, contenido)
    
    # Verificar si se hizo el cambio
    if nuevo_contenido == contenido:
        logger.warning("No se encontró el patrón para el historial o no se pudo hacer la sustitución")
        return False
    
    # Guardar el archivo modificado
    with open(ANIMALS_ENDPOINT_PATH, 'w', encoding='utf-8') as f:
        f.write(nuevo_contenido)
    
    logger.info("Se modificó correctamente el archivo de endpoints de animales")
    logger.info("Ahora el sistema procesará correctamente los valores nulos y registrará la acción en el historial")
    
    return True

if __name__ == "__main__":
    logger.info("Iniciando corrección de procesamiento de valores nulos en historial...")
    if corregir_procesamiento_valores_nulos():
        logger.info("Corrección completada exitosamente")
    else:
        logger.error("Hubo un problema al realizar la corrección")
