#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para corregir los modelos Pydantic de backup que causan errores de serialización JSON
Autor: Cascade AI
Fecha: 26/05/2025
"""

import sys
import os
import inspect
import importlib
import json
from typing import Any, Dict, List, Set, Type
from pydantic import BaseModel

# Añadir el directorio raíz del proyecto al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Importar los modelos Pydantic de la aplicación
from app.services.backup_service import BackupInfo, BackupOptions, BackupService

# Crear versiones corregidas de los modelos
print("=== CORRECCIÓN DE MODELOS PYDANTIC PARA SERIALIZACIÓN JSON ===")

# 1. Verificar y corregir BackupOptions
print("\nVerificando modelo: BackupOptions")
print(f"Campos actuales: {BackupOptions.__fields__.keys()}")

# 2. Crear un archivo temporal con las correcciones
corrected_file_path = os.path.join(os.path.dirname(__file__), 'backup_service_fixed.py')
original_file_path = inspect.getfile(BackupService)

print(f"\nArchivo original: {original_file_path}")
print(f"Archivo corregido: {corrected_file_path}")

# Leer el contenido del archivo original
with open(original_file_path, 'r', encoding='utf-8') as f:
    original_content = f.read()

# Buscar la definición de la clase BackupOptions
backup_options_start = original_content.find("class BackupOptions(BaseModel):")
if backup_options_start == -1:
    print("No se encontró la definición de la clase BackupOptions")
    sys.exit(1)

# Buscar el final de la definición de la clase
backup_options_end = original_content.find("class BackupService:", backup_options_start)
if backup_options_end == -1:
    print("No se encontró el final de la definición de la clase BackupOptions")
    sys.exit(1)

# Extraer la definición actual
current_definition = original_content[backup_options_start:backup_options_end].strip()
print(f"\nDefinición actual:\n{current_definition}")

# Crear una nueva definición corregida
corrected_definition = """class BackupOptions(BaseModel):
    include_animals: bool = True
    include_births: bool = True
    include_config: bool = True
    created_by: str = "admin"
    description: str = ""
    
    class Config:
        json_encoders = {
            type: lambda v: str(v)
        }
"""

# Reemplazar la definición en el contenido original
corrected_content = original_content.replace(current_definition, corrected_definition)

# Escribir el contenido corregido en el archivo temporal
with open(corrected_file_path, 'w', encoding='utf-8') as f:
    f.write(corrected_content)

print("\n=== INSTRUCCIONES PARA APLICAR LA CORRECCIÓN ===")
print(f"1. Revisar el archivo corregido: {corrected_file_path}")
print(f"2. Reemplazar el archivo original: {original_file_path}")
print("3. Reiniciar el servidor FastAPI para aplicar los cambios")
print("\nLa corrección añade la clase Config con json_encoders para manejar tipos no serializables")
