#!/usr/bin/env python3
"""
Script para reiniciar completamente la base de datos y recargar datos desde el CSV.

Este script es intencionalmente simple y directo:
1. Borra TODOS los datos actuales de la base de datos
2. Ejecuta SQL directo para modificar las restricciones necesarias
3. Carga los datos directamente desde matriz_master.csv
"""
import asyncio
import sys
import os
import logging
import csv
from datetime import datetime
from tortoise import Tortoise

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para poder importar desde app
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

# Importar configuración y modelos
from backend.app.core.config import settings
from backend.app.models.animal import Animal, Part, Genere, Estado
from backend.app.models.explotacio import Explotacio
from backend.app.models.user import User, UserRole

# Ruta al archivo CSV
CSV_PATH = os.path.abspath(os.path.join(root_path, 'backend', 'database', 'matriz_master.csv'))

async def init_db():
    """Inicializar conexión a base de datos"""
    await Tortoise.init(
        db_url=f"postgres://{settings.postgres_user}:{settings.postgres_password}@{settings.db_host}:{settings.db_port}/{settings.postgres_db}",
        modules={"models": ["backend.app.models.animal", "backend.app.models.user", "backend.app.models.explotacio"]}
    )
    logger.info("Conexión establecida con la base de datos")

async def close_db():
    """Cerrar conexión a base de datos"""
    await Tortoise.close_connections()
    logger.info("Conexión cerrada")

async def execute_sql(sql, params=None):
    """Ejecuta una consulta SQL directamente"""
    conn = Tortoise.get_connection("default")
    try:
        if params:
            await conn.execute_query(sql, params)
        else:
            await conn.execute_query(sql)
        return True
    except Exception as e:
        logger.error(f"Error al ejecutar SQL: {str(e)}")
        return False

async def reset_database():
    """Borra todos los datos y resetea la base de datos"""
    print("⚠️ ADVERTENCIA: Este script borrará TODOS los datos de la base de datos.")
    response = input("¿Estás seguro de continuar? (s/N): ")
    
    if response.lower() != 's':
        logger.info("Operación cancelada por el usuario")
        return False
    
    try:
        # 1. Borramos en orden para respetar dependencias
        logger.info("Borrando todos los datos...")
        await execute_sql("DELETE FROM part")
        logger.info("✓ Partos borrados")
        
        await execute_sql("DELETE FROM animal")
        logger.info("✓ Animales borrados")
        
        await execute_sql("DELETE FROM explotacions")
        logger.info("✓ Explotaciones borradas")
        
        # 2. Modificamos la estructura de la tabla explotacions si es necesario
        # Hacer que 'nom' acepte NULL (ya que no lo usaremos más)
        await execute_sql("ALTER TABLE explotacions ALTER COLUMN nom DROP NOT NULL")
        logger.info("✓ Restricción NOT NULL eliminada de la columna 'nom' en explotaciones")
        
        # Asegurar que 'explotacio' sea NOT NULL
        await execute_sql("ALTER TABLE explotacions ALTER COLUMN explotacio SET NOT NULL")
        logger.info("✓ Campo 'explotacio' establecido como NOT NULL")
        
        return True
    
    except Exception as e:
        logger.error(f"Error al resetear la base de datos: {str(e)}")
        return False

async def importar_datos():
    """Importa datos desde el CSV a la base de datos"""
    logger.info(f"Importando datos desde: {CSV_PATH}")
    
    if not os.path.exists(CSV_PATH):
        logger.error(f"Archivo no encontrado: {CSV_PATH}")
        return False
    
    try:
        # Diccionarios para rastrear entidades ya creadas
        explotaciones = {}
        animales = {}
        partos_creados = 0
        
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=';')
            
            for row in reader:
                # 1. Procesamos la explotación
                codigo_explotacion = row['explotacio'].strip()
                if not codigo_explotacion:
                    logger.warning(f"Fila con código de explotación vacío: {row}")
                    continue
                
                # Crear explotación si no existe
                if codigo_explotacion not in explotaciones:
                    try:
                        # Intentar crear directamente con ORM
                        explotacion = await Explotacio.create(explotacio=codigo_explotacion)
                        logger.info(f"Creada explotación: {codigo_explotacion}")
                    except Exception:
                        # Si falla, crear con SQL directo
                        await execute_sql(
                            "INSERT INTO explotacions (explotacio) VALUES ($1) ON CONFLICT (explotacio) DO NOTHING",
                            [codigo_explotacion]
                        )
                        logger.info(f"Creada explotación con SQL: {codigo_explotacion}")
                    
                    # Obtener objeto de explotación
                    explotacion = await Explotacio.get_or_none(explotacio=codigo_explotacion)
                    explotaciones[codigo_explotacion] = explotacion
                else:
                    explotacion = explotaciones[codigo_explotacion]
                
                # 2. Procesamos el animal
                nombre_animal = row['NOM'].strip()
                if not nombre_animal:
                    logger.warning(f"Fila con nombre de animal vacío: {row}")
                    continue
                
                # Clave única para el animal (combinación de explotación y nombre)
                animal_key = f"{codigo_explotacion}_{nombre_animal}"
                
                if animal_key not in animales:
                    # Datos básicos del animal
                    animal_data = {
                        'nom': nombre_animal,
                        'explotacio': codigo_explotacion,
                        'genere': Genere.FEMELLA if row['Genere'].strip() == 'F' else Genere.MASCLE,
                        'estado': Estado.DEF if row['Estado'].strip() == 'DEF' else Estado.OK
                    }
                    
                    # Campos opcionales
                    if row['Alletar'] and row['Alletar'].strip() and row['Alletar'].strip() != '0':
                        animal_data['alletar'] = int(row['Alletar'].strip())
                    
                    if row['DOB'] and row['DOB'].strip():
                        try:
                            day, month, year = row['DOB'].strip().split('/')
                            dob = datetime(int(year), int(month), int(day)).date()
                            animal_data['dob'] = dob
                        except:
                            pass
                    
                    # Otros campos opcionales
                    for campo in ['pare', 'mare', 'quadra', 'COD', 'Num Serie']:
                        if campo in row and row[campo] and row[campo].strip():
                            # Mapear nombres de columnas a nombres de campos
                            campo_db = {
                                'COD': 'cod',
                                'Num Serie': 'num_serie'
                            }.get(campo, campo.lower())
                            
                            animal_data[campo_db] = row[campo].strip()
                    
                    # Crear el animal
                    animal = await Animal.create(**animal_data)
                    animales[animal_key] = animal
                    logger.info(f"Creado animal: {codigo_explotacion} - {nombre_animal}")
                else:
                    animal = animales[animal_key]
                
                # 3. Procesamos el parto (solo si es hembra)
                if animal.genere == Genere.FEMELLA and row['part'] and row['part'].strip():
                    try:
                        # Convertir fecha de parto
                        day, month, year = row['part'].strip().split('/')
                        fecha_parto = datetime(int(year), int(month), int(day)).date()
                        
                        # Datos del parto
                        parto_data = {
                            'animal': animal,
                            'part': fecha_parto
                        }
                        
                        # Género y estado del ternero (opcional)
                        if row['GenereT'] and row['GenereT'].strip():
                            parto_data['GenereT'] = row['GenereT'].strip()
                        
                        if row['EstadoT'] and row['EstadoT'].strip():
                            parto_data['EstadoT'] = row['EstadoT'].strip()
                        
                        # Crear el parto
                        await Part.create(**parto_data)
                        partos_creados += 1
                        logger.info(f"Creado parto para {codigo_explotacion} - {nombre_animal} en fecha {row['part']}")
                    except Exception as e:
                        logger.error(f"Error al crear parto: {str(e)}")
        
        logger.info(f"Importación completada: {len(explotaciones)} explotaciones, {len(animales)} animales, {partos_creados} partos")
        return True
    
    except Exception as e:
        logger.error(f"Error al importar datos: {str(e)}")
        return False

async def main():
    try:
        await init_db()
        
        # Paso 1: Resetear la base de datos
        if await reset_database():
            # Paso 2: Importar datos
            await importar_datos()
            
            logger.info("Proceso completado con éxito")
        
    except Exception as e:
        logger.error(f"Error general: {str(e)}")
    
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(main())
