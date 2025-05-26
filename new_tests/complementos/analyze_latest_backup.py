#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Analizador de backups SQL - Versión para últimos registros

Este script analiza los últimos registros en un archivo de backup SQL
para verificar rápidamente que los datos más recientes se han guardado correctamente.
"""

import os
import sys
import re
import glob
import argparse
from datetime import datetime

# Ruta de backups
BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", "backups")

class BackupAnalyzer:
    def __init__(self, backup_file=None):
        """Inicializa el analizador de backups"""
        self.backup_dir = BACKUP_DIR
        
        # Si no se especifica un archivo, usar el más reciente
        if not backup_file:
            backup_file = self._get_latest_backup()
        
        # Comprobar si es una ruta absoluta
        if not os.path.isabs(backup_file):
            backup_file = os.path.join(self.backup_dir, backup_file)
        
        # Verificar que el archivo existe
        if not os.path.exists(backup_file):
            print(f"Error: El archivo {backup_file} no existe")
            sys.exit(1)
            
        self.backup_file = backup_file
        self.file_size = os.path.getsize(backup_file) / (1024 * 1024)  # En MB
        self.mod_time = datetime.fromtimestamp(os.path.getmtime(backup_file))
        
    def _get_latest_backup(self):
        """Obtiene el archivo de backup más reciente"""
        pattern = os.path.join(self.backup_dir, "backup_masclet_imperi_*.sql")
        files = glob.glob(pattern)
        
        if not files:
            print("Error: No se encontraron archivos de backup")
            sys.exit(1)
            
        # Ordenar por fecha de modificación (más reciente primero)
        files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        return files[0]
    
    def print_header(self):
        """Imprime información básica del archivo de backup"""
        print("\n")
        print("===== ANÁLISIS DE BACKUP MÁS RECIENTE =====")
        print(f"Archivo: {os.path.basename(self.backup_file)}")
        print(f"Ruta: {self.backup_file}")
        print(f"Tamaño: {self.file_size:.2f} MB")
        print(f"Fecha de modificación: {self.mod_time.strftime('%d/%m/%Y %H:%M:%S')}")
        print()
    
    def analyze_latest_animals(self, count=5):
        """Analiza los últimos animales en el backup"""
        print(f"----- ÚLTIMOS {count} ANIMALES EN EL BACKUP -----")
        
        # Buscar líneas de datos de animales de varias formas posibles
        animals_data = []
        copy_mode = False
        insert_mode = False
        table_name = None
        
        with open(self.backup_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
            # Buscar inserts de animales
            insert_pattern = r"INSERT INTO public\.animals \(.+?\) VALUES \((.+?)\);"
            inserts = re.findall(insert_pattern, content, re.DOTALL)
            
            if inserts:
                # Extraer datos de inserts
                for insert_data in inserts:
                    animals_data.append(insert_data)
            else:
                # Intentar con formato COPY
                copy_blocks = re.findall(r'COPY public\.animals .+?\n(.+?)\\\.',
                                       content, re.DOTALL)
                if copy_blocks:
                    for block in copy_blocks:
                        lines = block.strip().split('\n')
                        for line in lines:
                            animals_data.append(line.strip())
        
        # Mostrar los últimos 'count' animales
        if animals_data:
            # Ordenar por fecha de creación (columna 14) si es posible
            try:
                # Intentamos ordenar por la columna created_at (normalmente es la 14ª columna)
                sorted_animals = sorted(animals_data, key=lambda x: x.split('\t')[13] if len(x.split('\t')) > 13 else "", reverse=True)
            except:
                # Si falla, usamos los últimos registros tal como aparecen
                sorted_animals = animals_data[-count:]
                
            # Mostrar los últimos 'count' animales
            for i, animal in enumerate(sorted_animals[:count]):
                fields = animal.split('\t')
                if len(fields) < 4:
                    continue
                    
                # Intentar extraer campos importantes
                try:
                    id_num = fields[0]
                    explotacio = fields[1]
                    nombre = fields[2]
                    genero = fields[3]
                    estado = fields[4] if len(fields) > 4 else "?"
                    fecha_nacimiento = fields[6] if len(fields) > 6 else "?"
                    created_at = fields[13] if len(fields) > 13 else "?"
                    
                    print(f"Animal {i+1}:")
                    print(f"  - ID: {id_num}")
                    print(f"  - Nombre: {nombre}")
                    print(f"  - Explotación: {explotacio}")
                    print(f"  - Género: {'Macho' if genero == 'M' else 'Hembra'}")
                    print(f"  - Estado: {estado}")
                    print(f"  - Fecha nacimiento: {fecha_nacimiento}")
                    print(f"  - Creado: {created_at}")
                    print()
                except Exception as e:
                    print(f"Error al procesar animal: {e}")
                    print(f"Datos: {animal[:100]}...")
                    print()
        else:
            print("No se encontraron datos de animales en el backup")
            
    def analyze_latest_parts(self, count=5):
        """Analiza los últimos partos en el backup"""
        print(f"----- ÚLTIMOS {count} PARTOS EN EL BACKUP -----")
        
        # Buscar líneas de datos de partos de varias formas posibles
        parts_data = []
        
        with open(self.backup_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
            # Buscar inserts de partos
            insert_pattern = r"INSERT INTO public\.part \(.+?\) VALUES \((.+?)\);"
            inserts = re.findall(insert_pattern, content, re.DOTALL)
            
            if inserts:
                # Extraer datos de inserts
                for insert_data in inserts:
                    parts_data.append(insert_data)
            else:
                # Intentar con formato COPY
                copy_blocks = re.findall(r'COPY public\.part .+?\n(.+?)\\\.',
                                       content, re.DOTALL)
                if copy_blocks:
                    for block in copy_blocks:
                        lines = block.strip().split('\n')
                        for line in lines:
                            parts_data.append(line.strip())
        
        # Mostrar los últimos 'count' partos
        if parts_data:
            # Ordenar por fecha de creación (columna 6) si es posible
            try:
                # Intentamos ordenar por la columna created_at (normalmente es la 6ª columna)
                sorted_parts = sorted(parts_data, key=lambda x: x.split('\t')[5] if len(x.split('\t')) > 5 else "", reverse=True)
            except:
                # Si falla, usamos los últimos registros tal como aparecen
                sorted_parts = parts_data[-count:]
                
            # Mostrar los últimos 'count' partos
            for i, part in enumerate(sorted_parts[:count]):
                fields = part.split('\t')
                if len(fields) < 4:
                    continue
                    
                # Intentar extraer campos importantes
                try:
                    id_num = fields[0]
                    animal_id = fields[1]
                    part_date = fields[2]
                    genere_t = fields[3]
                    estado_t = fields[4] if len(fields) > 4 else "?"
                    created_at = fields[5] if len(fields) > 5 else "?"
                    
                    print(f"Parto {i+1}:")
                    print(f"  - ID: {id_num}")
                    print(f"  - Animal ID: {animal_id}")
                    print(f"  - Fecha: {part_date}")
                    print(f"  - Género cría: {genere_t}")
                    print(f"  - Estado cría: {estado_t}")
                    print(f"  - Creado: {created_at}")
                    print()
                except Exception as e:
                    print(f"Error al procesar parto: {e}")
                    print(f"Datos: {part[:100]}...")
                    print()
        else:
            print("No se encontraron datos de partos en el backup")

def main():
    parser = argparse.ArgumentParser(description="Analizador de backups SQL - Últimos registros")
    parser.add_argument("backup_file", nargs="?", help="Archivo de backup a analizar (opcional, por defecto usa el más reciente)")
    parser.add_argument("--count", "-c", type=int, default=5, help="Número de registros a mostrar (por defecto 5)")
    parser.add_argument("--animals", "-a", action="store_true", help="Mostrar solo datos de animales")
    parser.add_argument("--parts", "-p", action="store_true", help="Mostrar solo datos de partos")
    
    args = parser.parse_args()
    
    analyzer = BackupAnalyzer(args.backup_file)
    analyzer.print_header()
    
    if args.animals or not (args.animals or args.parts):
        analyzer.analyze_latest_animals(args.count)
        
    if args.parts or not (args.animals or args.parts):
        analyzer.analyze_latest_parts(args.count)

if __name__ == "__main__":
    main()
