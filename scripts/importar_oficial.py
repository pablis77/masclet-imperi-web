#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script oficial para importar CSV de manera forzada y con depuración.
Este script utiliza la forma correcta de importar los módulos y configurar Tortoise ORM.
"""
import os
import sys
import csv
import json
import logging
import shutil
import asyncio
from datetime import datetime

# Configurar logging con nivel DEBUG
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Agregar la ruta al path (correctamente)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# URL de la base de datos
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"
# Carpeta de uploads (corregida para coincidir con la ruta esperada por el servicio)
UPLOADS_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'backend', 'uploads')

async def main():
    """Función principal que ejecuta todo el proceso"""
    if len(sys.argv) < 2:
        print("Uso: python importar_oficial.py <ruta_archivo_csv> [descripcion]")
        return 1
    
    # Obtener argumentos
    ruta_archivo = sys.argv[1]
    descripcion = sys.argv[2] if len(sys.argv) > 2 else f"Importación de {os.path.basename(ruta_archivo)}"
    
    # Comprobar si existe el archivo
    if not os.path.exists(ruta_archivo):
        logger.error(f"ERROR: El archivo {ruta_archivo} no existe")
        return 1
    
    # Verificar y crear directorio uploads si no existe
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    # Preparar para importación
    from tortoise import Tortoise
    
    try:
        # Inicializar Tortoise ORM
        logger.info(f"Conectando a la base de datos: {DB_URL}")
        await Tortoise.init(
            db_url=DB_URL,
            modules={
                'models': [
                    'app.models.animal',
                    'app.models.import_model'
                ]
            }
        )
        
        # Importar modelos y servicios
        from app.models.import_model import Import
        from app.models.enums import ImportStatus
        from app.services.import_service import process_csv_file
        
        # Copiar el archivo a la carpeta uploads
        filename = os.path.basename(ruta_archivo)
        dest_path = os.path.join(UPLOADS_DIR, filename)
        
        # Solo copiar si no está ya en la carpeta de uploads
        if os.path.abspath(ruta_archivo) != os.path.abspath(dest_path):
            logger.info(f"Copiando archivo a {dest_path}")
            shutil.copy2(ruta_archivo, dest_path)
        
        # Crear registro de importación
        import_obj = await Import.create(
            file_name=filename,
            file_size=os.path.getsize(dest_path),
            file_type="text/csv",
            description=descripcion,
            status=ImportStatus.PENDING.value,
            result={}
        )
        logger.info(f"Creado registro de importación con ID: {import_obj.id}")
        
        # Ejecutar la importación
        logger.info(f"Iniciando importación del archivo {filename}")
        result = await process_csv_file(
            filename=filename,
            import_id=str(import_obj.id),
            prevent_duplicates=True,
            importar_partos=True
        )
        
        # Actualizar el registro de importación
        if result["success"]:
            import_obj.status = ImportStatus.COMPLETED.value
        else:
            import_obj.status = ImportStatus.FAILED.value
        
        import_obj.result = result
        import_obj.completed_at = datetime.now()
        await import_obj.save()
        
        # Mostrar resultados
        if result["success"]:
            logger.info("=== RESULTADO DE LA IMPORTACIÓN ===")
            logger.info(f"Animales creados: {result['stats']['created']}")
            logger.info(f"Animales actualizados: {result['stats']['updated']}")
            logger.info(f"Errores: {result['stats']['failed']}")
            logger.info(f"Advertencias: {result['stats']['warnings']}")
            logger.info(f"Total de registros procesados: {result['stats']['total_records']}")
            logger.info(f"Total de animales únicos: {result['stats']['total_animales']}")
            logger.info("====================================")
            return 0
        else:
            logger.error(f"Error durante la importación: {result.get('detail', 'Error desconocido')}")
            return 1
    
    except Exception as e:
        logger.error(f"Error durante la importación: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return 1
    
    finally:
        # Cerrar conexiones de Tortoise
        try:
            await Tortoise.close_connections()
            logger.info("Conexiones a base de datos cerradas")
        except Exception as e:
            logger.error(f"Error al cerrar conexiones: {str(e)}")

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
