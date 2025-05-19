#!/usr/bin/env python3
"""
Script para reiniciar completamente la base de datos y recargar datos desde el CSV.

Este script realiza las siguientes operaciones:
1. Borra TODOS los datos actuales de la base de datos (explotaciones, animales, partos, etc.)
2. Recarga datos limpios desde el archivo matriz_master.csv original
3. Asegura que los datos se carguen respetando las reglas de negocio correctas

IMPORTANTE: Este script eliminará TODOS los datos actuales. Úselo con precaución.
"""
import asyncio
import sys
import os
import logging
import csv
from datetime import datetime
from tortoise import Tortoise
from tortoise.exceptions import OperationalError, IntegrityError

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"reset_database_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para poder importar desde app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importar configuración y modelos
from app.core.config import TORTOISE_ORM
from app.models.animal import Animal, Part, Genere, Estado
from app.models.explotacio import Explotacio
from app.models.user import User, UserRole

# Ruta al archivo CSV
CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'matriz_master.csv'))

async def init_db():
    """Inicializar conexión a base de datos"""
    await Tortoise.init(config=TORTOISE_ORM)
    logger.info("Conexión a base de datos inicializada")

async def close_db():
    """Cerrar conexión a base de datos"""
    await Tortoise.close_connections()
    logger.info("Conexión a base de datos cerrada")

async def reset_database():
    """Borrar todos los datos de la base de datos"""
    try:
        logger.info("=== BORRANDO TODOS LOS DATOS DE LA BASE DE DATOS ===")
        
        # Borrar datos en orden para respetar las dependencias
        await Part.all().delete()
        logger.info("✓ Borrados todos los registros de partos")
        
        await Animal.all().delete()
        logger.info("✓ Borrados todos los registros de animales")
        
        await Explotacio.all().delete()
        logger.info("✓ Borradas todas las explotaciones")
        
        # No borramos usuarios para mantener la configuración
        
        logger.info("✓ Base de datos limpiada con éxito")
        
    except Exception as e:
        logger.error(f"Error al borrar datos: {str(e)}", exc_info=True)
        raise

async def create_explotacion(explotacio_code):
    """Crear una explotación si no existe"""
    # Usar directamente el código de explotación como identificador
    explotacion = await Explotacio.get_or_none(explotacio=explotacio_code)
    if not explotacion:
        explotacion = await Explotacio.create(
            explotacio=explotacio_code
        )
        logger.info(f"Creada nueva explotación: {explotacio_code}")
    return explotacion

async def parse_date(date_str):
    """Convertir string de fecha a objeto de fecha"""
    if not date_str or date_str == '':
        return None
    
    try:
        # Formato DD/MM/YYYY
        day, month, year = date_str.split('/')
        return datetime(int(year), int(month), int(day)).date()
    except (ValueError, AttributeError):
        logger.warning(f"Formato de fecha inválido: {date_str}")
        return None

async def parse_alletar(alletar_str):
    """Convertir string de alletar a entero"""
    if not alletar_str or alletar_str == '':
        return None
    
    try:
        return int(alletar_str)
    except (ValueError, TypeError):
        logger.warning(f"Valor alletar inválido: {alletar_str}")
        return None

async def import_data_from_csv():
    """Importar datos desde el archivo CSV"""
    try:
        logger.info(f"=== IMPORTANDO DATOS DESDE {CSV_PATH} ===")
        
        if not os.path.exists(CSV_PATH):
            logger.error(f"Archivo CSV no encontrado en: {CSV_PATH}")
            return
        
        # Registro para rastrear animales creados (para no crear duplicados)
        animals_created = {}
        # Registro para rastrear explotaciones creadas
        explotaciones_created = {}
        
        total_rows = 0
        animals_count = 0
        parts_count = 0
        
        with open(CSV_PATH, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            
            for row in reader:
                total_rows += 1
                
                # Obtener o crear explotación
                explotacio_code = row['explotacio'].strip()
                if not explotacio_code:
                    logger.warning(f"Fila {total_rows}: Campo explotacio vacío, ignorando")
                    continue
                
                if explotacio_code not in explotaciones_created:
                    explotacion = await create_explotacion(explotacio_code)
                    explotaciones_created[explotacio_code] = explotacion
                else:
                    explotacion = explotaciones_created[explotacio_code]
                
                # Verificar si el animal ya existe
                animal_key = f"{explotacio_code}_{row['NOM'].strip()}"
                
                if animal_key not in animals_created:
                    # Crear nuevo animal
                    animal_data = {
                        'nom': row['NOM'].strip(),
                        'explotacio': explotacion,
                        'genere': Genere.F if row['Genere'].strip() == 'F' else Genere.M,
                        'estado': Estado.DEF if row['Estado'].strip() == 'DEF' else Estado.OK,
                    }
                    
                    # Campos opcionales
                    alletar = await parse_alletar(row['Alletar'])
                    if alletar is not None:
                        animal_data['alletar'] = alletar
                    
                    if row['Pare'] and row['Pare'].strip():
                        animal_data['pare'] = row['Pare'].strip()
                    
                    if row['Mare'] and row['Mare'].strip():
                        animal_data['mare'] = row['Mare'].strip()
                    
                    if row['Quadra'] and row['Quadra'].strip():
                        animal_data['quadra'] = row['Quadra'].strip()
                    
                    if row['COD'] and row['COD'].strip():
                        animal_data['cod'] = row['COD'].strip()
                    
                    if row['Num Serie'] and row['Num Serie'].strip():
                        animal_data['num_serie'] = row['Num Serie'].strip()
                    
                    dob = await parse_date(row['DOB'])
                    if dob:
                        animal_data['dob'] = dob
                    
                    animal = await Animal.create(**animal_data)
                    animals_created[animal_key] = animal
                    animals_count += 1
                    logger.info(f"Creado animal: {explotacio_code} - {row['NOM']}")
                else:
                    animal = animals_created[animal_key]
                
                # Verificar si hay datos de parto
                if row['part'] and row['part'].strip():
                    part_date = await parse_date(row['part'])
                    
                    if part_date and animal.genere == Genere.F:  # Solo hembras pueden tener partos
                        # Determinar género y estado de la cría
                        genere_t = row['GenereT'].strip() if row['GenereT'] and row['GenereT'].strip() else None
                        estado_t = Estado.DEF if row['EstadoT'] and row['EstadoT'].strip() == 'DEF' else Estado.OK
                        
                        # Crear parto
                        await Part.create(
                            animal=animal,
                            part=part_date,
                            GenereT=genere_t,
                            EstadoT=estado_t
                        )
                        parts_count += 1
                        logger.info(f"Creado parto para {explotacio_code} - {row['NOM']} en fecha {row['part']}")
        
        logger.info(f"✓ Importación completada: {total_rows} filas procesadas")
        logger.info(f"✓ Creados {len(explotaciones_created)} explotaciones")
        logger.info(f"✓ Creados {animals_count} animales")
        logger.info(f"✓ Creados {parts_count} registros de partos")
        
    except Exception as e:
        logger.error(f"Error al importar datos: {str(e)}", exc_info=True)
        raise

async def create_default_admin():
    """Crear usuario administrador por defecto si no existe"""
    try:
        admin = await User.get_or_none(username="admin")
        
        if not admin:
            await User.create(
                username="admin",
                hashed_password="$2b$12$AJWk2HqMBSXY1nQl8s5d1.Ka7mfxZjOQkOTXPraeB6oIFJm9dwcXG",  # "admin"
                full_name="Administrador",
                email="admin@mascletimperi.com",
                role=UserRole.ADMIN,
                is_active=True
            )
            logger.info("✓ Creado usuario administrador por defecto")
        else:
            logger.info("✓ Usuario administrador ya existe")
    
    except Exception as e:
        logger.error(f"Error al crear administrador: {str(e)}", exc_info=True)

async def main():
    """Función principal"""
    try:
        await init_db()
        
        # Preguntar confirmación
        response = input("⚠️ ADVERTENCIA: Este script borrará TODOS los datos actuales de la base de datos. ¿Estás seguro? (s/N): ")
        
        if response.lower() != 's':
            logger.info("Operación cancelada por el usuario")
            await close_db()
            return
        
        # Ejecutar reinicio
        await reset_database()
        await import_data_from_csv()
        await create_default_admin()
        
        logger.info("=== OPERACIÓN COMPLETADA CON ÉXITO ===")
        
    except Exception as e:
        logger.error(f"Error en la operación: {str(e)}", exc_info=True)
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(main())
