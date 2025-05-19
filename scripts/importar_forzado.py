#!/usr/bin/env python
"""
Script para importar CSV en modo DEBUG y forzando la ruta correcta.
Este script copia temporalmente el archivo CSV a la carpeta uploads para asegurar que sea encontrado.
"""
import os
import sys
import csv
import json
import logging
import shutil
import asyncio
from datetime import datetime
from tortoise import Tortoise

# Configurar logging con nivel DEBUG
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Agregar la ruta al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# URL de la base de datos
DB_URL = "postgres://postgres:1234@localhost:5432/masclet_imperi"

async def init_db():
    """Inicializar conexión a base de datos"""
    logger.info(f"Conectando a: {DB_URL}")
    
    await Tortoise.init(
        db_url=DB_URL,
        modules={"models": ["backend.app.models.animal", "backend.app.models.import_model"]}
    )
    logger.info("Conexión a base de datos inicializada")

async def importar_csv_forzado(ruta_archivo, descripcion):
    """Importar CSV copiando el archivo a uploads para garantizar que sea encontrado"""
    try:
        # Importar aquí para evitar problemas de circularidad
        from backend.app.models.animal import Animal, Part
        from backend.app.models.import_model import Import
        from backend.app.services.csv_import_service import process_csv_file
        from backend.app.core.config import FILE_UPLOAD_DIR
        
        # Comprobar si el archivo existe
        if not os.path.exists(ruta_archivo):
            logger.error(f"ERROR: El archivo {ruta_archivo} no existe")
            return
        
        # Leer el CSV para análisis previo
        logger.info(f"Analizando archivo: {ruta_archivo}")
        
        animales_unicos = {}
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=';')
            for i, fila in enumerate(reader, 1):
                nom = fila.get('nom', '').strip()
                explotacio = fila.get('explotacio', '').strip()
                clave = f"{nom}_{explotacio}"
                
                if clave not in animales_unicos:
                    animales_unicos[clave] = []
                animales_unicos[clave].append(i)
        
        logger.info(f"CSV contiene {len(animales_unicos)} animales únicos")
        for clave, filas in animales_unicos.items():
            if len(filas) > 1:
                logger.info(f"Animal {clave}: {len(filas)} registros en filas {filas}")
        
        # Verificar y crear directorio uploads si no existe
        if not os.path.exists(FILE_UPLOAD_DIR):
            logger.info(f"Creando directorio uploads: {FILE_UPLOAD_DIR}")
            os.makedirs(FILE_UPLOAD_DIR)
        
        # Copiar el archivo a la carpeta uploads
        nombre_archivo = os.path.basename(ruta_archivo)
        ruta_destino = os.path.join(FILE_UPLOAD_DIR, nombre_archivo)
        logger.info(f"Copiando archivo de {ruta_archivo} a {ruta_destino}")
        shutil.copy2(ruta_archivo, ruta_destino)
        
        # Crear registro de importación
        logger.info("Creando registro de importación")
        import_obj = await Import.create(
            file_name=nombre_archivo,
            file_size=os.path.getsize(ruta_archivo),
            file_type="text/csv",
            status="PENDING",
            description=descripcion
        )
        
        logger.info(f"Creado registro de importación con ID: {import_obj.id}")
        
        # PARCHEAR TEMPORALMENTE EL SERVICIO DE IMPORTACIÓN
        logger.info("== HACIENDO PATCH TEMPORAL AL SERVICIO DE IMPORTACIÓN ==")
        import backend.app.services.csv_import_service as csv_service
        
        # Guardar la función original
        original_import_animal = csv_service.import_animal_with_partos
        
        # Crear wrapper de debug
        async def debug_import_animal(registro, ignore_parto=False, existing_animal=None):
            nom = registro.get('nom', 'SIN_NOMBRE')
            explotacio = registro.get('explotacio', 'SIN_EXPLOTACION')
            logger.debug(f">>> PROCESANDO ANIMAL: '{nom}' en '{explotacio}'")
            logger.debug(f"    Datos: {json.dumps(registro, ensure_ascii=False)}")
            
            # Guardar parámetros adicionales que no usa la función original
            if ignore_parto:
                logger.debug(f"    [IGNORADO] ignore_parto={ignore_parto}")
                
            if existing_animal:
                logger.debug(f"    [IGNORADO] existing_animal={existing_animal.id}")
            
            # CORRECCIÓN: Llamar a la función original SOLO con el primer parámetro
            result = await original_import_animal(registro)
            
            if result:
                logger.debug(f"<<< ÉXITO procesando '{nom}': ID={result.id}")
            else:
                logger.debug(f"<<< ERROR procesando '{nom}'")
            
            return result
        
        # Reemplazar temporalmente con nuestra versión de debug
        csv_service.import_animal_with_partos = debug_import_animal
        
        # Ejecutar la importación con monitoreo detallado
        logger.info("=== INICIANDO IMPORTACIÓN EN MODO DEBUG ===")
        logger.info(f"Importando {nombre_archivo}...")
        
        import_result = await process_csv_file(
            nombre_archivo,  # Nombre del archivo, no la ruta completa
            str(import_obj.id),
            prevent_duplicates=True
        )
        
        # Restaurar función original
        csv_service.import_animal_with_partos = original_import_animal
        
        # Verificar resultado final
        logger.info("=== RESULTADO DE LA IMPORTACIÓN ===")
        logger.info(json.dumps(import_result, indent=2, ensure_ascii=False))
        
        # Verificar específicamente si ciertos animales se importaron
        logger.info("=== VERIFICANDO ANIMALES ESPECÍFICOS ===")
        animales_a_verificar = ['20-36', '20-50', '20-51', '20-64', 'R-32', 'Marta']
        
        for nombre in animales_a_verificar:
            animales = await Animal.filter(nom=nombre)
            if animales:
                for animal in animales:
                    partos = await Part.filter(animal_id=animal.id)
                    logger.info(f"Animal '{nombre}' (ID: {animal.id}) en explotación '{animal.explotacio}' - Partos: {len(partos)}")
                    for parto in partos:
                        logger.info(f"  - Parto: Fecha={parto.part}, Género={parto.GenereT}, Estado={parto.EstadoT}")
            else:
                logger.error(f"¡ANIMAL NO ENCONTRADO!: '{nombre}'")
                
        # Comprobación de 20-36 con más detalle
        logger.info("=== COMPROBACIÓN ESPECÍFICA DEL ANIMAL 20-36 ===")
        # Búsqueda por nombre exacto
        animal_20_36 = await Animal.filter(nom="20-36").first()
        if animal_20_36:
            logger.info(f"Animal 20-36 encontrado con ID: {animal_20_36.id}")
            logger.info(f"Detalles: {animal_20_36}")
            
            # Ver los partos de este animal
            partos = await Part.filter(animal_id=animal_20_36.id)
            logger.info(f"Partos del animal 20-36: {len(partos)}")
            for parto in partos:
                logger.info(f"  - Parto: Fecha={parto.part}, Género={parto.GenereT}, Estado={parto.EstadoT}")
        else:
            logger.error("¡ANIMAL 20-36 NO ENCONTRADO! Buscando por código...")
            
            # Buscar por código
            animal_por_codigo = await Animal.filter(cod="6350").first()
            if animal_por_codigo:
                logger.info(f"Encontrado animal con código 6350: {animal_por_codigo.nom} (ID: {animal_por_codigo.id})")
            else:
                logger.error("No se encontró ningún animal con código 6350")
                
            # Buscar por número de serie
            animal_por_serie = await Animal.filter(num_serie="ES02090513").first()
            if animal_por_serie:
                logger.info(f"Encontrado animal con número de serie ES02090513: {animal_por_serie.nom} (ID: {animal_por_serie.id})")
            else:
                logger.error("No se encontró ningún animal con número de serie ES02090513")
        
        # Eliminar el archivo copiado
        if os.path.exists(ruta_destino):
            logger.info(f"Eliminando archivo temporal: {ruta_destino}")
            os.remove(ruta_destino)
            
    except Exception as e:
        logger.error(f"Error en la importación DEBUG: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

async def main():
    """Función principal"""
    if len(sys.argv) < 3:
        print("Uso: python importar_forzado.py <ruta_archivo_csv> <descripcion>")
        sys.exit(1)
        
    ruta_archivo = sys.argv[1]
    descripcion = sys.argv[2]
    
    try:
        await init_db()
        await importar_csv_forzado(ruta_archivo, descripcion)
    except Exception as e:
        logger.error(f"Error general: {str(e)}")
    finally:
        # Siempre cerramos conexiones
        await Tortoise.close_connections()
        logger.info("Conexión a base de datos cerrada")

if __name__ == "__main__":
    asyncio.run(main())
