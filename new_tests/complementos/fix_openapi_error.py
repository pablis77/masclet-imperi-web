#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para diagnosticar y corregir el error de serialización JSON en la API
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
from app.services.backup_service import BackupInfo, BackupOptions

# Importar solo los modelos que existen
try:
    from app.schemas.animal import AnimalCreate, AnimalUpdate, Animal
except ImportError:
    print("No se pudieron importar algunos modelos de Animal")

try:
    from app.schemas.user import UserCreate, UserUpdate, User
except ImportError:
    print("No se pudieron importar algunos modelos de User")

try:
    from app.schemas.import_schema import ImportCreate, Import
except ImportError:
    print("No se pudieron importar algunos modelos de Import")

try:
    from app.schemas.parto import PartCreate, PartUpdate, Part
except ImportError:
    print("No se pudieron importar algunos modelos de Part")

try:
    from app.schemas.explotacio import ExplotacioCreate, ExplotacioUpdate, Explotacio
except ImportError:
    print("No se pudieron importar algunos modelos de Explotacio")

try:
    from app.schemas.listado import ListadoCreate, ListadoUpdate, Listado
except ImportError:
    print("No se pudieron importar algunos modelos de Listado")

def is_json_serializable(obj: Any) -> bool:
    """Verifica si un objeto es serializable a JSON"""
    try:
        json.dumps(obj)
        return True
    except (TypeError, OverflowError):
        return False

def check_model_fields(model_class: Type[BaseModel]) -> Dict[str, Any]:
    """Verifica si todos los campos de un modelo Pydantic son serializables a JSON"""
    problematic_fields = {}
    
    # Obtener los campos del modelo
    for field_name, field in model_class.__fields__.items():
        # Verificar el valor por defecto
        if field.default is not None and not is_json_serializable(field.default):
            problematic_fields[field_name] = {
                "default": str(field.default),
                "type": str(field.type_),
                "outer_type": str(field.outer_type_),
                "reason": "El valor por defecto no es serializable a JSON"
            }
        
        # Verificar el tipo
        if hasattr(field.type_, "__origin__") and not is_json_serializable(field.type_.__origin__):
            problematic_fields[field_name] = {
                "type": str(field.type_),
                "outer_type": str(field.outer_type_),
                "reason": "El tipo no es serializable a JSON"
            }
    
    return problematic_fields

def main():
    """Función principal"""
    print("=== DIAGNÓSTICO DE ERRORES DE SERIALIZACIÓN JSON ===")
    
    # Lista de modelos Pydantic a verificar
    models = [
        BackupInfo, BackupOptions
    ]
    
    # Añadir modelos adicionales si están disponibles
    try:
        models.extend([AnimalCreate, AnimalUpdate, Animal])
    except NameError:
        pass
        
    try:
        models.extend([UserCreate, UserUpdate, User])
    except NameError:
        pass
        
    try:
        models.extend([ImportCreate, Import])
    except NameError:
        pass
        
    try:
        models.extend([PartCreate, PartUpdate, Part])
    except NameError:
        pass
        
    try:
        models.extend([ExplotacioCreate, ExplotacioUpdate, Explotacio])
    except NameError:
        pass
        
    try:
        models.extend([ListadoCreate, ListadoUpdate, Listado])
    except NameError:
        pass
    
    # Verificar cada modelo
    for model in models:
        print(f"\nVerificando modelo: {model.__name__}")
        problematic_fields = check_model_fields(model)
        
        if problematic_fields:
            print(f"  ❌ Encontrados {len(problematic_fields)} campos problemáticos:")
            for field_name, details in problematic_fields.items():
                print(f"    - Campo: {field_name}")
                for key, value in details.items():
                    print(f"      {key}: {value}")
        else:
            print(f"  ✅ No se encontraron problemas en este modelo")
    
    print("\n=== RECOMENDACIONES ===")
    print("1. Para valores por defecto que no son serializables a JSON, utiliza un valor None y establece el valor real en el constructor")
    print("2. Para tipos complejos, utiliza tipos más simples o implementa métodos de serialización personalizados")
    print("3. Evita usar tipos como 'type', 'function', o clases personalizadas como valores por defecto")

if __name__ == "__main__":
    main()
