"""
Script para limpiar la base de datos e importar datos del CSV.
"""
import asyncio
import sys
import os
import csv
import logging
import datetime
from tortoise import Tortoise
from typing import Dict, List, Any

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Añadir directorio raíz al path para poder importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importar modelos y configuración
from app.core.config import settings
from app.models.animal import Animal, EstadoAlletar, Estado, Genere

# Ruta al archivo CSV
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                       "database", "matriz_master.csv")

async def init_db():
    """Inicializar conexión a la base de datos"""
    # Corregir URL si es necesario (cambiar postgresql:// a postgres://)
    db_url = settings.DATABASE_URL
    if db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', 'postgres://')
    
    logger.info(f"URL original de base de datos: {settings.DATABASE_URL}")
    logger.info(f"URL corregida de base de datos: {db_url}")
    
    await Tortoise.init(
        db_url=db_url,
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.import_model', 'aerich.models']}
    )
    logger.info("Base de datos conectada")

async def clean_database():
    """Limpiar la base de datos eliminando todos los animales"""
    count = await Animal.all().count()
    logger.info(f"Total de animales antes de limpiar: {count}")
    
    # Eliminar todos los animales
    await Animal.all().delete()
    
    count_after = await Animal.all().count()
    logger.info(f"Total de animales después de limpiar: {count_after}")

def parse_date(date_str):
    """Parsear fecha del formato DD/MM/YYYY"""
    if not date_str or date_str.strip() == '':
        return None
    
    try:
        day, month, year = date_str.split('/')
        return datetime.date(int(year), int(month), int(day))
    except Exception as e:
        logger.warning(f"Error parseando fecha '{date_str}': {str(e)}")
        return None

async def import_csv_data():
    """Importar datos desde el archivo CSV"""
    logger.info(f"Iniciando importación desde {CSV_PATH}")
    
    if not os.path.exists(CSV_PATH):
        logger.error(f"Archivo CSV no encontrado: {CSV_PATH}")
        return
    
    try:
        animals_created = 0
        errors = 0
        
        with open(CSV_PATH, 'r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            
            for row in reader:
                try:
                    # Convertir valores vacíos a None
                    record = {k: (v if v.strip() != '' else None) for k, v in row.items()}
                    
                    # Validar campos obligatorios
                    if not record.get('nom') or not record.get('explotacio') or not record.get('genere'):
                        logger.warning(f"Fila con campos obligatorios faltantes: {record}")
                        errors += 1
                        continue
                    
                    # Crear objeto animal
                    animal = Animal(
                        nom=record.get('nom'),
                        explotacio=record.get('explotacio'),
                        genere=Genere(record.get('genere')).value,
                        estado=Estado(record.get('estado', 'OK')).value,
                        alletar=EstadoAlletar(record.get('alletar', '0')).value,
                        pare=record.get('pare'),
                        mare=record.get('mare'),
                        quadra=record.get('quadra'),
                        cod=record.get('cod'),
                        num_serie=record.get('num_serie'),
                        dob=parse_date(record.get('dob'))
                    )
                    
                    await animal.save()
                    animals_created += 1
                    
                    # Agregar parto si existe
                    if record.get('part') and record.get('GenereT') and record.get('EstadoT'):
                        from app.models.animal import Part
                        
                        part_fecha = parse_date(record.get('part'))
                        if part_fecha:
                            part = Part(
                                animal_id=animal.id,
                                part=part_fecha,
                                generet=record.get('GenereT'),
                                estadot=record.get('EstadoT')
                            )
                            await part.save()
                    
                except Exception as e:
                    logger.error(f"Error al procesar fila {record.get('nom', 'unknown')}: {str(e)}")
                    errors += 1
                    continue
        
        logger.info(f"Importación completada: {animals_created} animales creados, {errors} errores")
    
    except Exception as e:
        logger.error(f"Error general durante la importación: {str(e)}")

async def verify_import():
    """Verificar la importación correcta de los datos"""
    count = await Animal.all().count()
    logger.info(f"Total de animales después de importación: {count}")
    
    # Buscar animales con 'Marta' en el nombre
    marta = await Animal.filter(nom__icontains="marta").all()
    logger.info(f"Animales con nombre 'Marta': {len(marta)}")
    
    if marta:
        logger.info("Detalles de los animales 'Marta' encontrados:")
        for animal in marta:
            logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}")
    
    # Listar algunos nombres para ver qué hay
    animals = await Animal.all().limit(20)
    logger.info("Primeros 20 animales importados:")
    for animal in animals:
        logger.info(f"ID: {animal.id}, Nombre: {animal.nom}, Explotación: {animal.explotacio}")

async def main():
    """Función principal"""
    await init_db()
    try:
        await clean_database()
        await import_csv_data()
        await verify_import()
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
