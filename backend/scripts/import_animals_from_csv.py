#!/usr/bin/env python
"""
Script para importar animales desde el archivo matriz_master.csv
"""

import csv
import os
import sys
from pathlib import Path
from datetime import datetime
import asyncio

# Configurar la ruta del proyecto para importar módulos correctamente
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
sys.path.append(str(project_root))

# Importar después de configurar la ruta
from tortoise import Tortoise
from app.models.animal import Animal, Part, Genere, Estado, EstadoAlletar
from app.models.explotacio import Explotacio

async def init_db():
    """Inicializar la conexión a la base de datos."""
    username = os.environ.get('POSTGRES_USER', 'postgres')
    password = os.environ.get('POSTGRES_PASSWORD', 'postgres')
    host = os.environ.get('POSTGRES_HOST', 'localhost')
    port = os.environ.get('POSTGRES_PORT', '5432')
    db_name = os.environ.get('POSTGRES_DB', 'masclet_imperi')

    print(f"Conectando a la base de datos: {db_name} en {host}")

    # Construir la URL de conexión con el formato correcto para Tortoise ORM
    db_url = f"postgres://{username}:{password}@{host}:{port}/{db_name}"
    
    try:
        await Tortoise.init(
            db_url=db_url,
            modules={'models': ['app.models.animal', 'app.models.explotacio']}
        )
        
        # Crear una explotación por defecto si no existe
        try:
            default_explotacio = await Explotacio.filter(id=1).first()
            if not default_explotacio:
                default_explotacio = await Explotacio.create(id=1, nom="Explotación Por Defecto")
                print("Creada explotación por defecto con ID 1")
        except Exception as e:
            print(f"Error al crear explotación por defecto: {str(e)}")
            
    except Exception as e:
        print(f"Error al conectar a la base de datos: {str(e)}")
        sys.exit(1)

async def import_animals_from_csv(csv_path):
    """
    Importa animales desde un archivo CSV al sistema.
    
    Args:
        csv_path (str): Ruta al archivo CSV.
    """
    print(f"Importando animales desde {csv_path}...")
    
    # Contadores para estadísticas
    imported_count = 0
    error_count = 0
    
    try:
        # Intentar leer el archivo con diferentes codificaciones
        encoding = 'latin-1'  # Probamos primero con latin-1 que suele funcionar bien con archivos españoles
        print(f"Intentando leer el archivo CSV con codificación {encoding}")
        
        # Leer los primeros bytes del archivo para diagnóstico
        with open(csv_path, 'rb') as f:
            first_bytes = f.read(500)  # Leer los primeros 500 bytes
        
        # Intentar abrir el archivo y leer su contenido
        with open(csv_path, 'r', encoding=encoding) as csvfile:
            # Detectar el delimitador - asumimos que es punto y coma (;) como estándar en español
            sample = csvfile.read(1024)
            if ';' in sample:
                delimiter = ';'
            else:
                delimiter = ','
            
            # Volver al inicio del archivo
            csvfile.seek(0)
            
            # Crear un lector CSV con el delimitador detectado
            reader = csv.DictReader(csvfile, delimiter=delimiter)
            
            # Verificar las columnas encontradas (para diagnóstico)
            if reader.fieldnames:
                print(f"Columnas encontradas: {', '.join(reader.fieldnames)}")
            else:
                print("No se pudieron detectar las columnas en el archivo CSV.")
                return
            
            # Mostrar los primeros bytes del archivo para diagnóstico
            print("Primeros bytes del archivo CSV:")
            with open(csv_path, 'r', encoding=encoding) as f:
                for i, line in enumerate(f):
                    if i < 6:  # Mostrar solo las primeras 6 líneas
                        print(line.strip())
            
            # Volver a abrir el archivo para procesarlo
            with open(csv_path, 'r', encoding=encoding) as csvfile:
                reader = csv.DictReader(csvfile, delimiter=delimiter)
                
                # Mostrar los campos detectados
                print(f"Campos detectados: {reader.fieldnames}")
                
                # Procesar cada fila del CSV
                for row in reader:
                    try:
                        # Asegurar que los valores necesarios existan y tengan el formato correcto
                        nom = row.get('NOM', '').strip()
                        cod = row.get('COD', '').strip()
                        
                        # Establecer 'pare' y 'mare' si existen
                        padre = row.get('Pare', '').strip() if row.get('Pare') else None
                        madre = row.get('Mare', '').strip() if row.get('Mare') else None
                        
                        # Convertir género
                        if row.get('Genere', '').strip().upper() == 'M':
                            genero = Genere.MASCLE
                        elif row.get('Genere', '').strip().upper() == 'F':
                            genero = Genere.FEMELLA
                        else:
                            genero = None  # Valor por defecto o nulo
                        
                        # Convertir fecha de nacimiento (DOB) de formato DD/MM/YYYY a objeto date
                        dob = None
                        if row.get('DOB'):
                            try:
                                dob_str = row.get('DOB', '').strip()
                                if dob_str:
                                    # Convertir de formato DD/MM/YYYY a objeto datetime
                                    dob_parts = dob_str.split('/')
                                    if len(dob_parts) == 3:
                                        day, month, year = int(dob_parts[0]), int(dob_parts[1]), int(dob_parts[2])
                                        dob = datetime(year, month, day).date()
                                    else:
                                        print(f"Formato de fecha inválido: {dob_str}")
                            except Exception as e:
                                print(f"Error al convertir fecha {row.get('DOB')}: {str(e)}")
                        
                        # Procesar datos de partos (si existen)
                        parts_data = []
                        try:
                            # Si existe una fecha de parto, procesar la información
                            part_date_str = row.get('part', '').strip()
                            genere_ternero = row.get('GenereT', '').strip()
                            estado_ternero = row.get('EstadoT', '').strip()
                            
                            if part_date_str:
                                # Convertir fecha de parto a formato correcto (DD/MM/YYYY -> YYYY-MM-DD)
                                try:
                                    part_parts = part_date_str.split('/')
                                    if len(part_parts) == 3:
                                        day, month, year = int(part_parts[0]), int(part_parts[1]), int(part_parts[2])
                                        part_date = datetime(year, month, day).date()
                                        
                                        # Determinar el género del ternero
                                        genere_valor = None
                                        if genere_ternero.lower() in ['mascle', 'm']:
                                            genere_valor = Genere.MASCLE
                                        elif genere_ternero.lower() in ['femella', 'f']:
                                            genere_valor = Genere.FEMELLA
                                        else:
                                            genere_valor = Genere.FEMELLA  # Por defecto femenino
                                        
                                        # Determinar el estado del ternero
                                        estado_valor = Estado.OK  # Por defecto
                                        if estado_ternero.lower() in ['def', 'muerto', 'mort']:
                                            estado_valor = Estado.DEF
                                        
                                        # Guardar la información del parto para procesarla después
                                        parts_data.append({
                                            'data': part_date,
                                            'genere_vedell': genere_valor,
                                            'estat_vedell': estado_valor,
                                        })
                                except Exception as e:
                                    print(f"Error al procesar fecha de parto {part_date_str}: {str(e)}")
                        except Exception as e:
                            print(f"Error general al procesar datos de parto: {str(e)}")
                        
                        # Obtener valores desde el CSV respetando su formato original
                        estado_valor = row.get('Estado', 'OK').strip()
                        
                        # Obtener o crear la explotación
                        explotacio_nombre = row.get('explotació', '').strip()
                        explotacio = None
                        
                        try:
                            # Buscar la explotación por nombre
                            explotacio = await Explotacio.filter(nom=explotacio_nombre).first()
                            
                            # Si no existe, crearla
                            if not explotacio and explotacio_nombre:
                                explotacio = await Explotacio.create(nom=explotacio_nombre)
                                print(f"Nueva explotación creada: {explotacio_nombre} (ID: {explotacio.id})")
                            
                            if not explotacio:
                                print(f"No se pudo encontrar o crear la explotación '{explotacio_nombre}', usando ID=1 por defecto")
                                explotacio_id = 1
                            else:
                                explotacio_id = explotacio.id
                        except Exception as e:
                            print(f"Error al procesar explotación '{explotacio_nombre}': {str(e)}")
                            print("Usando ID=1 por defecto")
                            explotacio_id = 1
                        
                        # Preparar datos para el modelo Animal
                        animal_data = {
                            'nom': nom,
                            'genere': genero,
                            'cod': cod,
                            'explotacio_id': explotacio_id,  # Usar el ID numérico obtenido de la búsqueda o creación
                            'estado': estado_valor,  # Usar el valor original del CSV
                            'num_serie': row.get('Nº Serie', None),
                            'dob': dob,
                        }
                        
                        # Relacionar con padre y madre si existen
                        if row.get('Pare', '').strip():
                            animal_data['pare'] = row.get('Pare', '').strip()
                        
                        if row.get('Mare', '').strip():
                            animal_data['mare'] = row.get('Mare', '').strip()
                        
                        # Manejar el campo 'alletar'
                        alletar_value = row.get('Alletar', '').strip().lower()
                        if alletar_value == 'si':
                            animal_data['alletar'] = 1  # EstadoAlletar.UN_TERNERO
                        elif alletar_value == 'no':
                            animal_data['alletar'] = 0  # EstadoAlletar.NO_ALLETAR
                        
                        # Añadir quadra si existe
                        if row.get('Quadra', ''):
                            animal_data['quadra'] = row.get('Quadra', '').strip()
                        
                        # Crear el animal
                        try:
                            animal = await Animal.create(**animal_data)
                            
                            # Procesar datos de partos
                            for part_data in parts_data:
                                try:
                                    await Part.create(
                                        animal_id=animal.id,  
                                        data=part_data['data'],  
                                        genere_fill=part_data['genere_vedell'],
                                        estat_fill=part_data['estat_vedell'],
                                        numero_part=1,  
                                        observacions="Importado desde CSV"
                                    )
                                    print(f"Parto registrado para animal {animal.nom} con fecha {part_data['data']}")
                                except Exception as e:
                                    print(f"Error detallado al registrar parto: {str(e)}")
                            
                            print(f"Animal importado: {animal.nom}")
                            imported_count += 1
                        except Exception as e:
                            print(f"Error al crear animal {nom}: {str(e)}")
                            error_count += 1
                    except Exception as e:
                        print(f"Error al procesar fila {row}: {str(e)}")
                        error_count += 1
    
    except UnicodeDecodeError:
        print(f"Error de codificación. Prueba con otra codificación como utf-8, cp1252, etc.")
    except Exception as e:
        print(f"Error general: {str(e)}")
    
    print(f"Importación completada: {imported_count} animales importados, {error_count} errores")

async def close_db():
    """Cerrar la conexión a la base de datos."""
    await Tortoise.close_connections()

def main():
    """Función principal."""
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    else:
        # Usar ruta por defecto al archivo CSV
        csv_path = Path(project_root) / "database" / "matriz_master.csv"
    
    if not os.path.exists(csv_path):
        print(f"Error: El archivo {csv_path} no existe.")
        sys.exit(1)
    
    # Ejecutar la secuencia asíncrona completa
    async def run_sequence():
        await init_db()
        try:
            await import_animals_from_csv(csv_path)
        finally:
            await close_db()
    
    # Ejecutar la secuencia
    asyncio.run(run_sequence())

if __name__ == "__main__":
    main()
