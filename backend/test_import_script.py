"""
Script para probar la importación de datos desde un archivo CSV
"""
import asyncio
import sys
import os
import csv
import json
import traceback

# Añadir el directorio raíz al path para importar correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.services.import_service import import_animal_with_partos
from app.core.config import get_settings
from tortoise import Tortoise

async def init_db():
    """Inicializar la base de datos"""
    try:
        # Obtener la configuración de la base de datos
        config = get_settings()
        
        # Corregir el formato de URL para Tortoise ORM
        # Tortoise ORM espera postgres:// y no postgresql://
        # También ajustar el host si es necesario para Docker
        database_url = config.database_url
        
        # Reemplazar postgresql:// por postgres:// si es necesario
        if database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgres://")
            
        # Reemplazar localhost por host.docker.internal si es necesario
        if "localhost" in database_url and os.environ.get("DOCKER_ENV"):
            database_url = database_url.replace("localhost", "host.docker.internal")
        
        print(f"Intentando conectar a la base de datos: {database_url}")
        
        # Configurar Tortoise ORM
        await Tortoise.init(
            db_url=database_url,
            modules={"models": config.MODELS},
            _create_db=False  # No intentar crear la base de datos
        )
        
        # Generar esquemas para asegurar que todas las tablas y columnas existen
        await Tortoise.generate_schemas(safe=True)
        
        # Verificar si las columnas genere_t y estado_t existen en la tabla animals
        # Si no existen, intentaremos continuar sin ellas
        try:
            conn = Tortoise.get_connection("default")
            result = await conn.execute_query("SELECT column_name FROM information_schema.columns WHERE table_name='animals' AND column_name IN ('genere_t', 'estado_t')")
            existing_columns = [row[0] for row in result[1]]
            
            if 'genere_t' not in existing_columns or 'estado_t' not in existing_columns:
                print(f"Advertencia: Las columnas 'genere_t' y/o 'estado_t' no existen en la tabla 'animals'.")
                print("El script intentará funcionar sin estas columnas.")
        except Exception as e:
            print(f"Advertencia al verificar columnas: {str(e)}")
        
        print("Conexión a la base de datos establecida")
        return True
    except Exception as e:
        print(f"Error al conectar a la base de datos: {str(e)}")
        print(f"Detalles adicionales: Asegúrate que la cadena de conexión tiene el formato correcto (postgres:// en lugar de postgresql://)")
        return False

async def import_csv(csv_path):
    """
    Importa datos desde un archivo CSV.
    
    Args:
        csv_path (str): Ruta al archivo CSV
    """
    try:
        print(f"Iniciando importación desde {csv_path}")
        
        if not os.path.exists(csv_path):
            print(f"Error: El archivo {csv_path} no existe.")
            return
        
        # Determinar el delimitador
        with open(csv_path, 'r', encoding='utf-8') as file:
            sample = file.read(1024)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            print(f"Delimitador detectado: '{delimiter}'")
        
        # Contar total de filas para seguimiento
        with open(csv_path, 'r', encoding='utf-8') as file:
            total_rows = sum(1 for _ in file) - 1  # Restar 1 por la cabecera
        
        print(f"Total de filas a procesar: {total_rows}")
        
        # Procesar el archivo CSV
        with open(csv_path, 'r', encoding='utf-8') as file:
            # Detectar automáticamente el delimitador
            csv_reader = csv.DictReader(file, delimiter=delimiter)
            
            # Normalizar los nombres de las columnas
            fieldnames = []
            for field in csv_reader.fieldnames:
                # Eliminar espacios al inicio y final, y convertir a minúsculas
                normalized_field = field.strip().lower()
                fieldnames.append(normalized_field)
            
            # Reiniciar el archivo para leerlo desde el principio
            file.seek(0)
            next(file)  # Saltar la cabecera original
            
            # Crear un nuevo lector con los nombres de campo normalizados
            csv_reader = csv.DictReader(file, fieldnames=fieldnames, delimiter=delimiter)
            
            processed = 0
            success = 0
            errors = 0
            
            for row_num, row in enumerate(csv_reader, start=2):  # Empezar desde 2 para contar la cabecera
                try:
                    # Limpiar valores vacíos y espacios
                    clean_row = {}
                    for key, value in row.items():
                        if key is None:
                            continue
                        
                        # Normalizar clave
                        clean_key = key.strip().lower()
                        
                        # Normalizar valor
                        if value is None or value.strip() == '':
                            clean_row[clean_key] = None
                        else:
                            clean_row[clean_key] = value.strip()
                    
                    print(f"Procesando fila {row_num}/{total_rows+1}: {clean_row.get('nom', 'Sin nombre')}")
                    
                    # Importar animal con sus partos
                    await import_animal_with_partos(clean_row)
                    
                    success += 1
                    print(f"✓ Fila {row_num} importada correctamente")
                
                except Exception as e:
                    errors += 1
                    print(f"✗ Error en fila {row_num}: {str(e)}")
                    # Continuar con la siguiente fila a pesar del error
                
                processed += 1
                
                # Mostrar progreso cada 10 filas
                if processed % 10 == 0:
                    print(f"Progreso: {processed}/{total_rows} ({(processed/total_rows)*100:.1f}%) - Éxitos: {success}, Errores: {errors}")
            
            print(f"\nImportación finalizada. Total: {processed}, Éxitos: {success}, Errores: {errors}")
    
    except Exception as e:
        print(f"Error durante la importación: {str(e)}")
        traceback.print_exc()

async def inspect_db_structure():
    """Inspeccionar la estructura actual de la base de datos"""
    try:
        # Obtener la configuración de la base de datos
        config = get_settings()
        
        # Corregir el formato de URL para Tortoise ORM
        database_url = config.database_url
        if database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgres://")
        if "localhost" in database_url and os.environ.get("DOCKER_ENV"):
            database_url = database_url.replace("localhost", "host.docker.internal")
        
        print(f"Intentando conectar a la base de datos: {database_url}")
        
        # Configurar Tortoise ORM
        await Tortoise.init(
            db_url=database_url,
            modules={"models": config.MODELS},
            _create_db=False
        )
        
        # Obtener conexión
        conn = Tortoise.get_connection("default")
        
        # Listar todas las tablas
        result = await conn.execute_query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tables = [row[0] for row in result[1]]
        print("\nTablas en la base de datos:")
        for table in tables:
            print(f"- {table}")
        
        # Para cada tabla, listar sus columnas
        for table in tables:
            result = await conn.execute_query(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table}'")
            columns = [(row[0], row[1]) for row in result[1]]
            print(f"\nColumnas de la tabla '{table}':")
            for col_name, col_type in columns:
                print(f"- {col_name} ({col_type})")
        
        await Tortoise.close_connections()
        return True
    except Exception as e:
        print(f"Error al inspeccionar la base de datos: {str(e)}")
        return False

async def main():
    """Función principal"""
    # Inspeccionar la estructura de la base de datos
    print("\n=== INSPECCIÓN DE LA ESTRUCTURA DE LA BASE DE DATOS ===")
    await inspect_db_structure()
    
    db_initialized = False
    try:
        # Inicializar la base de datos
        db_initialized = await init_db()
        
        # Si la base de datos no se inicializó correctamente, salir
        if not db_initialized:
            print("No se pudo inicializar la base de datos. Abortando.")
            return
        
        # Ruta al archivo CSV - Usar la ruta absoluta según las memorias
        csv_path = r"c:\Proyectos\claude\masclet-imperi-web\backend\database\matriz_master.csv"
        
        # Verificar que el archivo existe
        if not os.path.exists(csv_path):
            print(f"Error: El archivo {csv_path} no existe")
            print(f"Directorio actual: {os.getcwd()}")
            print(f"Contenido del directorio: {os.listdir('.')}")
            if os.path.exists("database"):
                print(f"Contenido de database: {os.listdir('database')}")
            return
        
        # Importar datos
        await import_csv(csv_path)
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Cerrar la conexión a la base de datos solo si se inicializó correctamente
        if db_initialized:
            await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
