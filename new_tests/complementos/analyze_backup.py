#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para analizar un archivo de backup sin necesidad de restaurarlo
"""
import os
import re
import sys
import argparse
from datetime import datetime

def parse_arguments():
    """Parsear los argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(description='Analizar un archivo de backup SQL')
    parser.add_argument('backup_file', nargs='?', help='Ruta al archivo de backup a analizar. Si no se especifica, se usará el más reciente')
    parser.add_argument('--table', help='Nombre de la tabla específica a analizar')
    parser.add_argument('--summary', action='store_true', help='Mostrar solo un resumen')
    parser.add_argument('--list', action='store_true', help='Mostrar la lista de backups disponibles')
    parser.add_argument('--records', type=int, default=5, help='Número de registros a mostrar (por defecto: 5)')
    return parser.parse_args()

def find_backup_files(backup_dir=None):
    """Encontrar todos los archivos de backup disponibles"""
    # Si no se proporciona un directorio, usar el directorio predeterminado
    if not backup_dir:
        # Obtener la ruta base del proyecto
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        backup_dir = os.path.join(project_root, "backend", "backups")
    
    if not os.path.exists(backup_dir):
        print(f"Error: El directorio de backups {backup_dir} no existe")
        return []
    
    # Buscar todos los archivos .sql en el directorio de backups
    backup_files = []
    for root, _, files in os.walk(backup_dir):
        for file in files:
            if file.endswith(".sql"):
                backup_files.append(os.path.join(root, file))
    
    # Ordenar por fecha de modificación (más reciente primero)
    backup_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    return backup_files

def print_backup_list(backup_files):
    """Imprimir la lista de archivos de backup disponibles"""
    if not backup_files:
        print("No se encontraron archivos de backup")
        return
    
    print("\n===== ARCHIVOS DE BACKUP DISPONIBLES =====")
    print("Nº | Fecha               | Tamaño   | Nombre")
    print("-" * 70)
    
    for i, backup_file in enumerate(backup_files, 1):
        # Obtener fecha de modificación
        mod_time = os.path.getmtime(backup_file)
        mod_date = datetime.fromtimestamp(mod_time).strftime('%d/%m/%Y %H:%M:%S')
        
        # Obtener tamaño
        file_size = os.path.getsize(backup_file)
        file_size_mb = file_size / (1024 * 1024)
        
        # Obtener nombre del archivo
        file_name = os.path.basename(backup_file)
        
        print(f"{i:2d} | {mod_date} | {file_size_mb:6.2f} MB | {file_name}")

def analyze_backup(backup_file, table=None, summary=False, records=5):
    """Analizar el contenido de un archivo de backup SQL"""
    if not os.path.exists(backup_file):
        print(f"Error: El archivo {backup_file} no existe")
        return False
    
    # Obtener tamaño del archivo
    file_size = os.path.getsize(backup_file)
    file_size_mb = file_size / (1024 * 1024)
    
    # Obtener fecha de creación
    creation_time = os.path.getmtime(backup_file)  # Usar mtime en lugar de ctime
    creation_date = datetime.fromtimestamp(creation_time).strftime('%d/%m/%Y %H:%M:%S')
    
    print(f"\n===== ANÁLISIS DE BACKUP: {os.path.basename(backup_file)} =====")
    print(f"Ruta: {backup_file}")
    print(f"Tamaño: {file_size_mb:.2f} MB")
    print(f"Fecha de modificación: {creation_date}")
    
    # Abrir y analizar el archivo
    tables = {}
    tables_structure = {}
    
    try:
        with open(backup_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Buscar todas las tablas en el archivo (formato PostgreSQL)
        create_table_matches = re.findall(r'CREATE TABLE public\.(\w+)', content)
        
        for table_name in create_table_matches:
            # Encontrar estructura de la tabla
            table_structure_match = re.search(r'CREATE TABLE public\.' + table_name + r' \((.*?)\);', content, re.DOTALL)
            if table_structure_match:
                tables_structure[table_name] = table_structure_match.group(1)
            
            # Contar inserciones para esta tabla - buscar tanto INSERT como COPY
            insert_count = len(re.findall(r'INSERT INTO public\.' + table_name, content))
            
            # Buscar bloques COPY
            copy_pattern = r'COPY public\.' + table_name + r'.*?FROM stdin;\n([\s\S]*?)\\\.'  
            copy_blocks = re.findall(copy_pattern, content)
            
            # Contar líneas en bloques COPY (cada línea es un registro)
            copy_count = 0
            for block in copy_blocks:
                copy_count += len(block.strip().split('\n'))
                
            # Total de registros
            tables[table_name] = insert_count + copy_count
        
        # Mostrar resumen
        print("\n----- RESUMEN DE TABLAS -----")
        if not tables:
            print("No se encontraron tablas en el backup")
        else:
            for table_name, count in sorted(tables.items(), key=lambda x: x[1], reverse=True):
                print(f"{table_name}: {count} registros")
        
        # Si solo queremos el resumen, terminamos aquí
        if summary:
            return True
        
        # Si se especificó una tabla, mostrar detalles de esa tabla
        if table:
            if table not in tables:
                print(f"\nLa tabla '{table}' no se encontró en el backup")
                return False
            
            print(f"\n----- ESTRUCTURA DE TABLA: {table} -----")
            if table in tables_structure:
                print(tables_structure[table])
            
            print(f"\n----- MUESTRA DE DATOS ({records} registros): {table} -----")
            
            # Buscar registros INSERT
            insert_pattern = r'INSERT INTO public\.' + table + r' VALUES \((.*?)\);'
            inserts = re.findall(insert_pattern, content, re.DOTALL)
            
            # Buscar registros COPY
            copy_pattern = r'COPY public\.' + table + r'.*?FROM stdin;\n([\s\S]*?)\\\.'  
            copy_blocks = re.findall(copy_pattern, content, re.DOTALL)
            
            # Procesar datos encontrados
            found_data = False
            records_shown = 0
            
            # Mostrar registros INSERT
            for i, insert in enumerate(inserts[:records]):
                print(f"Registro {records_shown+1}: {insert} (INSERT)")
                records_shown += 1
                found_data = True
                if records_shown >= records:
                    break
            
            # Si todavía necesitamos mostrar más registros, buscar en COPY
            if records_shown < records:
                for block in copy_blocks:
                    # Dividir los datos por líneas
                    data_lines = block.strip().split('\n')
                    for i, line in enumerate(data_lines[:records-records_shown]):
                        print(f"Registro {records_shown+1}: {line} (COPY)")
                        records_shown += 1
                        found_data = True
                        if records_shown >= records:
                            break
                    if records_shown >= records:
                        break
            
            if not found_data:
                print("No se encontraron datos en la tabla")
        
        return True
    except Exception as e:
        print(f"Error al analizar el archivo: {str(e)}")
        return False

if __name__ == "__main__":
    args = parse_arguments()
    
    # Encontrar archivos de backup disponibles
    backup_files = find_backup_files()
    
    if not backup_files:
        print("No se encontraron archivos de backup")
        sys.exit(1)
    
    # Si se solicitó listar los backups disponibles
    if args.list:
        print_backup_list(backup_files)
        sys.exit(0)
    
    # Si no se especificó un archivo, usar el más reciente
    if args.backup_file is None:
        selected_backup = backup_files[0]  # El primero es el más reciente
        print(f"Seleccionando el backup más reciente: {os.path.basename(selected_backup)}")
    else:
        # Comprobar si el archivo existe
        if os.path.exists(args.backup_file):
            selected_backup = args.backup_file
        else:
            # Comprobar si es un índice o un nombre parcial
            try:
                # Intentar convertir a entero (1-based)
                index = int(args.backup_file) - 1
                if 0 <= index < len(backup_files):
                    selected_backup = backup_files[index]
                else:
                    print(f"Error: Índice {args.backup_file} fuera de rango (1-{len(backup_files)})")
                    sys.exit(1)
            except ValueError:
                # Buscar por nombre parcial
                matching_backups = [f for f in backup_files if args.backup_file.lower() in os.path.basename(f).lower()]
                if matching_backups:
                    if len(matching_backups) > 1:
                        print(f"Se encontraron {len(matching_backups)} backups que coinciden con '{args.backup_file}'")
                        print_backup_list(matching_backups)
                        print("\nSeleccionando el más reciente de la lista.")
                    selected_backup = matching_backups[0]
                else:
                    print(f"Error: No se encontró ningún backup que coincida con '{args.backup_file}'")
                    sys.exit(1)
    
    # Analizar el backup seleccionado
    analyze_backup(selected_backup, args.table, args.summary, args.records)
