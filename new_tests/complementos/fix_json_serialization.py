#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para corregir el problema de serialización JSON en FastAPI
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

# Importar los módulos necesarios
from app.main import app
from fastapi.encoders import jsonable_encoder
from fastapi.openapi.utils import get_openapi

print("=== CORRECCIÓN DE SERIALIZACIÓN JSON EN FASTAPI ===")

# 1. Crear un encoder personalizado para manejar tipos no serializables
def custom_jsonable_encoder(obj: Any, **kwargs):
    """Encoder personalizado que maneja tipos no serializables"""
    if isinstance(obj, type):
        return str(obj)
    return jsonable_encoder(obj, **kwargs)

# 2. Crear una función personalizada para generar el esquema OpenAPI
def custom_openapi():
    """Función personalizada para generar el esquema OpenAPI con manejo de errores"""
    if app.openapi_schema:
        return app.openapi_schema
    
    try:
        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            openapi_version=app.openapi_version,
            description=app.description,
            routes=app.routes,
            tags=app.openapi_tags,
            servers=app.servers,
        )
        
        # Convertir el esquema a JSON y luego de vuelta a diccionario para asegurar serialización
        openapi_json = json.dumps(openapi_schema, default=lambda o: str(o) if isinstance(o, type) else o)
        app.openapi_schema = json.loads(openapi_json)
        
        return app.openapi_schema
    except Exception as e:
        print(f"Error al generar el esquema OpenAPI: {str(e)}")
        # Devolver un esquema mínimo en caso de error
        return {
            "openapi": "3.0.2",
            "info": {
                "title": app.title,
                "version": app.version,
                "description": "Error al generar el esquema completo: " + str(e)
            },
            "paths": {}
        }

# 3. Crear un archivo con las correcciones
main_file_path = inspect.getfile(app.__class__)
print(f"Archivo principal de la aplicación: {main_file_path}")

# Leer el contenido del archivo
with open(main_file_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

# Buscar dónde se crea la aplicación FastAPI
app_creation_index = main_content.find("app = FastAPI(")
if app_creation_index == -1:
    print("No se encontró la creación de la aplicación FastAPI")
    sys.exit(1)

# Buscar el final de la función de creación
app_creation_end = main_content.find(")", app_creation_index)
if app_creation_end == -1:
    print("No se encontró el final de la creación de la aplicación FastAPI")
    sys.exit(1)

# Crear el código para sobrescribir la función openapi
openapi_override_code = """

# Sobrescribir la función openapi para manejar tipos no serializables
@app.get("/api/v1/openapi.json", include_in_schema=False)
async def custom_openapi_endpoint():
    try:
        if app.openapi_schema:
            return app.openapi_schema
        
        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            openapi_version=app.openapi_version,
            description=app.description,
            routes=app.routes,
            tags=app.openapi_tags,
            servers=app.servers,
        )
        
        # Convertir el esquema a JSON y luego de vuelta a diccionario para asegurar serialización
        openapi_json = json.dumps(openapi_schema, default=lambda o: str(o) if isinstance(o, type) else o.__dict__ if hasattr(o, "__dict__") else str(o))
        app.openapi_schema = json.loads(openapi_json)
        
        return app.openapi_schema
    except Exception as e:
        logger.error(f"Error al generar el esquema OpenAPI: {str(e)}")
        # Devolver un esquema mínimo en caso de error
        return {
            "openapi": "3.0.2",
            "info": {
                "title": app.title,
                "version": app.version,
                "description": "Error al generar el esquema completo: " + str(e)
            },
            "paths": {}
        }

app.openapi = custom_openapi_endpoint
"""

# Buscar un buen lugar para insertar el código (justo antes de incluir los routers)
include_routers_index = main_content.find("# Incluir routers")
if include_routers_index == -1:
    # Alternativa: buscar la primera inclusión de un router
    include_routers_index = main_content.find("app.include_router(")

if include_routers_index == -1:
    print("No se encontró un buen lugar para insertar el código")
    sys.exit(1)

# Insertar el código
new_content = main_content[:include_routers_index] + openapi_override_code + main_content[include_routers_index:]

# Escribir el contenido modificado en un archivo temporal
fixed_file_path = os.path.join(os.path.dirname(__file__), 'main_fixed.py')
with open(fixed_file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nArchivo con correcciones creado: {fixed_file_path}")
print("\n=== INSTRUCCIONES PARA APLICAR LA CORRECCIÓN ===")
print(f"1. Revisar el archivo corregido: {fixed_file_path}")
print(f"2. Copiar el código de sobrescritura de la función openapi al archivo principal: {main_file_path}")
print("3. Insertar el código justo antes de la inclusión de los routers")
print("4. Reiniciar el servidor FastAPI para aplicar los cambios")
print("\nLa corrección sobrescribe la función openapi para manejar tipos no serializables")
