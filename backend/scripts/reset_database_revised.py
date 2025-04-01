#!/usr/bin/env python3
"""
Script para resetear y migrar la base de datos a la estructura revisada.

Este script:
1. Limpia las tablas existentes
2. Elimina tablas innecesarias (explotacions, parts)
3. Verifica que la estructura de la base de datos sea correcta
4. Importa los datos desde matriz_master.csv
"""
import os
import sys
import csv
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Set
from pprint import pprint

# Añadir el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importaciones de Tortoise ORM
from tortoise import Tortoise, connections
from tortoise.exceptions import OperationalError

# Importaciones de la aplicación
from app.core.config import TORTOISE_ORM, settings
from app.models.animal import Animal, Genere, Estado, Part
from app.models.user import User, UserRole

# Path al archivo CSV
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "matriz_master.csv")

# Configuración
VERBOSE = True  # Mostrar información detallada durante la ejecución
DRY_RUN = False  # Si es True, no realiza cambios en la base de datos

def log(message: str) -> None:
    """Función para mostrar mensajes de log"""
    if VERBOSE:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

def error(message: str) -> None:
    """Función para mostrar mensajes de error"""
    print(f"[ERROR] {message}", file=sys.stderr)
    
def parse_date(date_str: str) -> Optional[datetime]:
    """Convierte una fecha en formato DD/MM/YYYY a un objeto datetime"""
    if not date_str or date_str.strip() == '':
        return None
    
    try:
        day, month, year = map(int, date_str.split('/'))
        return datetime(year, month, day)
    except Exception as e:
        log(f"Error al parsear fecha '{date_str}': {e}")
        return None

async def init_db_connection():
    """Inicializa la conexión a la base de datos"""
    log("Inicializando conexión a la base de datos...")
    
    try:
        await Tortoise.init(config=TORTOISE_ORM)
        log(f"Conexión establecida a la base de datos {TORTOISE_ORM['apps']['models']['models']}")
    except Exception as e:
        error(f"Error al conectar a la base de datos: {e}")
        raise

async def drop_tables():
    """Elimina tablas específicas que ya no son necesarias"""
    conn = connections.get("default")
    
    tables_to_drop = ["explotacions", "parts"]
    
    for table in tables_to_drop:
        try:
            log(f"Eliminando tabla '{table}'...")
            if not DRY_RUN:
                await conn.execute_query(f'DROP TABLE IF EXISTS "{table}" CASCADE')
            log(f"Tabla '{table}' eliminada correctamente.")
        except Exception as e:
            error(f"Error al eliminar tabla '{table}': {e}")

async def truncate_tables():
    """Vacía las tablas principales para un reset completo"""
    conn = connections.get("default")
    
    tables_to_truncate = ["animals", "part", "animal_history"]
    
    for table in tables_to_truncate:
        try:
            log(f"Vaciando tabla '{table}'...")
            if not DRY_RUN:
                await conn.execute_query(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE')
            log(f"Tabla '{table}' vaciada correctamente.")
        except Exception as e:
            error(f"Error al vaciar tabla '{table}': {e}")

async def optimize_tables():
    """Optimiza las tablas y crea índices necesarios"""
    conn = connections.get("default")
    
    # Crear índices para búsquedas eficientes
    indices = [
        ('animals', 'explotacio'),
        ('animals', 'nom'),
        ('part', 'animal_id'),
        ('animal_history', 'animal_id')
    ]
    
    for table, column in indices:
        try:
            index_name = f"idx_{table}_{column}"
            log(f"Creando índice '{index_name}'...")
            if not DRY_RUN:
                await conn.execute_query(
                    f'CREATE INDEX IF NOT EXISTS {index_name} ON "{table}" ("{column}")'
                )
            log(f"Índice '{index_name}' creado correctamente.")
        except Exception as e:
            error(f"Error al crear índice para {table}.{column}: {e}")

async def read_csv_data() -> List[Dict]:
    """Lee los datos del archivo CSV y los devuelve como una lista de diccionarios"""
    log(f"Leyendo datos del archivo CSV: {CSV_PATH}")
    
    data = []
    animals_by_nom = {}  # Para detectar duplicados/múltiples registros del mismo animal
    
    try:
        with open(CSV_PATH, mode='r', encoding='utf-8') as file:
            csv_reader = csv.reader(file, delimiter=';')
            headers = next(csv_reader)  # Leer encabezados
            
            # Normalizar encabezados para evitar problemas con mayúsculas/minúsculas
            headers = [h.lower() for h in headers]
            
            # Mapeo de nombres de columnas del CSV a nombres de atributos en los modelos
            column_mapping = {
                'alletar': 'alletar',
                'explotacio': 'explotacio',
                'nom': 'nom',
                'genere': 'genere',
                'pare': 'pare',
                'mare': 'mare', 
                'quadra': 'quadra',
                'cod': 'cod',
                'num serie': 'num_serie',
                'dob': 'dob',
                'estado': 'estado',
                'part': 'part',
                'generet': 'generet',
                'estadot': 'estadot'
            }
            
            # Verificar que los encabezados esperados estén presentes
            expected_headers = set(column_mapping.keys())
            actual_headers = set(headers)
            missing_headers = expected_headers - actual_headers
            
            if missing_headers:
                error(f"Faltan los siguientes encabezados en el CSV: {missing_headers}")
                return []
            
            for row_idx, row in enumerate(csv_reader, start=2):  # Start=2 para contar filas desde 1 (después de headers)
                if len(row) != len(headers):
                    error(f"La fila {row_idx} tiene {len(row)} columnas, esperaba {len(headers)}")
                    continue
                
                # Crear diccionario con los valores de la fila
                row_data = {}
                for i, value in enumerate(row):
                    column_name = headers[i].lower()
                    if column_name in column_mapping:
                        model_attribute = column_mapping[column_name]
                        # Limpiar datos y convertir tipos si es necesario
                        cleaned_value = value.strip() if value else None
                        row_data[model_attribute] = cleaned_value
                
                # Verificar campos obligatorios
                required_fields = ['explotacio', 'nom', 'genere', 'estado']
                missing_fields = [f for f in required_fields if not row_data.get(f)]
                
                if missing_fields:
                    error(f"Fila {row_idx}: Faltan campos obligatorios: {missing_fields}")
                    continue
                
                # Agregar datos para procesamiento posterior
                animal_key = (row_data['explotacio'], row_data['nom'])
                
                # Si este animal ya existe, puede ser un parto adicional
                if animal_key in animals_by_nom:
                    # Si tiene datos de parto, lo agregamos como parto
                    if row_data.get('part'):
                        if 'partos' not in animals_by_nom[animal_key]:
                            animals_by_nom[animal_key]['partos'] = []
                        
                        animals_by_nom[animal_key]['partos'].append({
                            'part': row_data.get('part'),
                            'generet': row_data.get('generet'),
                            'estadot': row_data.get('estadot')
                        })
                    else:
                        # Si es un duplicado sin parto, lo ignoramos o actualizamos datos
                        log(f"Fila {row_idx}: Registro duplicado para animal {animal_key}")
                else:
                    # Nuevo animal
                    animal_data = {
                        'explotacio': row_data['explotacio'],
                        'nom': row_data['nom'],
                        'genere': row_data['genere'],
                        'estado': row_data['estado'],
                        'alletar': row_data.get('alletar'),
                        'pare': row_data.get('pare'),
                        'mare': row_data.get('mare'),
                        'quadra': row_data.get('quadra'),
                        'cod': row_data.get('cod'),
                        'num_serie': row_data.get('num_serie'),
                        'dob': row_data.get('dob'),
                    }
                    
                    # Si tiene datos de parto, lo agregamos
                    if row_data.get('part'):
                        animal_data['partos'] = [{
                            'part': row_data.get('part'),
                            'generet': row_data.get('generet'),
                            'estadot': row_data.get('estadot')
                        }]
                    
                    animals_by_nom[animal_key] = animal_data
            
            # Convertir diccionario a lista para procesamiento
            data = list(animals_by_nom.values())
            log(f"Leídos {len(data)} animales únicos del CSV")
            
            # Contar partos
            total_partos = sum(1 for animal in data if 'partos' in animal for _ in animal['partos'])
            log(f"Encontrados {total_partos} partos en total")
            
            return data
            
    except Exception as e:
        error(f"Error al leer el archivo CSV: {e}")
        return []

async def import_data(data: List[Dict]):
    """Importa los datos a la base de datos"""
    log("Importando datos a la base de datos...")
    
    # Contadores para estadísticas
    stats = {
        'animals_created': 0,
        'animals_skipped': 0,
        'partos_created': 0,
        'partos_skipped': 0,
        'errors': 0
    }
    
    # Mapeo para valores de alletar
    alletar_map = {
        "0": "NO",  # No amamanta
        "1": "1",   # Amamanta a un ternero
        "2": "2",   # Amamanta a dos terneros
        0: "NO",    # Valores numéricos también
        1: "1",
        2: "2",
        None: "NO"  # Valor por defecto
    }
    
    # Mapeo para valores de género
    genere_map = {
        "Mascle": "M",
        "mascle": "M",
        "MASCLE": "M",
        "M": "M",
        "m": "M",
        "Femella": "F",
        "femella": "F",
        "FEMELLA": "F",
        "F": "F",
        "f": "F",
        "esforrada": "E",  # Esto parece ser algún estado especial
        None: "F"  # Valor por defecto para partos
    }
    
    for animal_data in data:
        try:
            # Extraer datos de partos antes de crear el animal
            partos_data = animal_data.pop('partos', [])
            
            # Convertir fechas al formato adecuado
            if animal_data.get('dob'):
                animal_data['dob'] = parse_date(animal_data['dob'])
            
            # Convertir alletar al formato esperado
            if 'alletar' in animal_data:
                alletar_value = animal_data.get('alletar')
                if alletar_value in alletar_map:
                    animal_data['alletar'] = alletar_map[alletar_value]
                else:
                    animal_data['alletar'] = "NO"  # Valor por defecto
            else:
                animal_data['alletar'] = "NO"  # Asegurar que siempre tenga un valor
            
            # Validar que alletar sólo se use para hembras
            if animal_data.get('genere') == 'M' and animal_data.get('alletar') in ["1", "2"]:
                log(f"Advertencia: Animal {animal_data['nom']} es macho pero tiene valor alletar={animal_data['alletar']}, corrigiendo")
                animal_data['alletar'] = "NO"
            
            # Crear el animal
            if not DRY_RUN:
                try:
                    # Ajustar campos enum al formato esperado
                    if animal_data.get('genere'):
                        animal_data['genere'] = Genere(animal_data['genere'])
                    
                    if animal_data.get('estado'):
                        animal_data['estado'] = Estado(animal_data['estado'])
                    
                    animal = await Animal.create(**animal_data)
                    log(f"Creado animal: {animal.nom} ({animal.explotacio}), ID={animal.id}")
                    stats['animals_created'] += 1
                    
                    # Crear partos asociados al animal
                    # Los partos sólo pueden aplicar a animales hembras
                    if animal.genere == Genere.FEMELLA and partos_data:
                        for idx, parto_data in enumerate(partos_data, start=1):
                            try:
                                if parto_data.get('part'):
                                    # Convertir fecha de parto
                                    part_date = parse_date(parto_data['part'])
                                    if not part_date:
                                        log(f"Saltando parto {idx} para animal {animal.nom}: fecha inválida")
                                        stats['partos_skipped'] += 1
                                        continue
                                    
                                    # Mapear el género del ternero al formato esperado
                                    genere_ternero = parto_data.get('generet')
                                    if genere_ternero in genere_map:
                                        genere_ternero = genere_map[genere_ternero]
                                    else:
                                        log(f"Advertencia: Género del ternero '{genere_ternero}' no reconocido para parto {idx} de {animal.nom}, usando 'F' por defecto")
                                        genere_ternero = "F"
                                    
                                    # Crear el parto
                                    parto = await Part.create(
                                        animal=animal,
                                        part=part_date,
                                        GenereT=genere_ternero,
                                        EstadoT=parto_data.get('estadot', 'OK'),  # Valor predeterminado OK
                                        numero_part=idx
                                    )
                                    log(f"Creado parto {idx} para animal {animal.nom}, ID={parto.id}")
                                    stats['partos_created'] += 1
                            except Exception as e:
                                error(f"Error al crear parto {idx} para animal {animal.nom}: {str(e)}")
                                stats['partos_skipped'] += 1
                                stats['errors'] += 1
                    elif partos_data and animal.genere == Genere.MASCLE:
                        log(f"Advertencia: Animal {animal.nom} es macho pero tiene partos asociados, ignorando partos")
                        stats['partos_skipped'] += len(partos_data)
                except Exception as e:
                    error(f"Error al crear animal {animal_data.get('nom', 'desconocido')}: {str(e)}")
                    stats['animals_skipped'] += 1
                    stats['errors'] += 1
                    continue
            else:
                log(f"[DRY RUN] Creando animal: {animal_data['nom']} ({animal_data['explotacio']})")
                stats['animals_created'] += 1
                
                if animal_data.get('genere') == 'F' and partos_data:
                    for parto_data in partos_data:
                        log(f"[DRY RUN] Creando parto para animal {animal_data['nom']}")
                        stats['partos_created'] += 1
                elif partos_data and animal_data.get('genere') == 'M':
                    log(f"[DRY RUN] Animal {animal_data['nom']} es macho pero tiene partos asociados, ignorando partos")
                    stats['partos_skipped'] += len(partos_data)
                
        except Exception as e:
            error(f"Error al importar animal {animal_data.get('nom', 'desconocido')}: {e}")
            stats['errors'] += 1
            stats['animals_skipped'] += 1
    
    log("\nEstadísticas de importación:")
    log(f"- Animales creados: {stats['animals_created']}")
    log(f"- Animales omitidos: {stats['animals_skipped']}")
    log(f"- Partos creados: {stats['partos_created']}")
    log(f"- Partos omitidos: {stats['partos_skipped']}")
    log(f"- Errores: {stats['errors']}")

async def verify_database():
    """Verifica el estado final de la base de datos"""
    log("\nVerificando estado final de la base de datos...")
    
    # Contar registros en las tablas principales
    animals_count = await Animal.all().count()
    parts_count = await Part.all().count()
    
    log(f"- Tabla animals: {animals_count} registros")
    log(f"- Tabla part: {parts_count} registros")
    
    # Verificar que no existan las tablas eliminadas
    conn = connections.get("default")
    
    for table in ["explotacions", "parts"]:
        try:
            result = await conn.execute_query(f"SELECT to_regclass('public.{table}')")
            exists = result[1][0][0] is not None
            
            if exists:
                error(f"¡La tabla '{table}' todavía existe en la base de datos!")
            else:
                log(f"- Tabla '{table}' eliminada correctamente")
        except Exception as e:
            error(f"Error al verificar tabla '{table}': {e}")
            
    # Verificar explotaciones únicas
    try:
        query = "SELECT explotacio, COUNT(*) FROM animals GROUP BY explotacio ORDER BY COUNT(*) DESC"
        result = await conn.execute_query(query)
        
        log("\nExplotaciones encontradas:")
        for row in result[1]:
            log(f"- {row[0]}: {row[1]} animales")
    except Exception as e:
        error(f"Error al verificar explotaciones: {e}")

async def main():
    """Función principal que ejecuta todo el proceso"""
    try:
        log("=== INICIANDO RESET Y MIGRACIÓN DE BASE DE DATOS ===")
        
        if DRY_RUN:
            log("MODO PRUEBA ACTIVADO: No se realizarán cambios reales en la base de datos")
        
        # Inicializar conexión a la base de datos
        await init_db_connection()
        
        # Eliminar tablas innecesarias
        await drop_tables()
        
        # Vaciar tablas principales
        await truncate_tables()
        
        # Leer datos del CSV
        data = await read_csv_data()
        
        if not data:
            error("No se encontraron datos para importar. Abortando.")
            return
        
        # Importar datos
        await import_data(data)
        
        # Optimizar tablas
        await optimize_tables()
        
        # Verificar estado final
        await verify_database()
        
        log("=== PROCESO COMPLETADO EXITOSAMENTE ===")
        
    except Exception as e:
        error(f"Error general: {e}")
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()

if __name__ == "__main__":
    # Procesar argumentos de línea de comandos
    import argparse
    
    parser = argparse.ArgumentParser(description="Script para resetear y migrar la base de datos")
    parser.add_argument("--dry-run", action="store_true", help="Ejecutar en modo prueba (sin cambios reales)")
    parser.add_argument("--verbose", action="store_true", help="Mostrar información detallada")
    
    args = parser.parse_args()
    
    DRY_RUN = args.dry_run
    VERBOSE = args.verbose
    
    # Ejecutar la función principal
    asyncio.run(main())
