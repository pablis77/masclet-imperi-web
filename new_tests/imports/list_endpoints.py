#!/usr/bin/env python3
"""
Script para listar todos los endpoints registrados en la API.
Esto nos dará una visión clara de la API actual antes de crear la documentación.
"""
import sys
import os
from pprint import pprint

# Agregar el directorio raíz al path para poder importar desde app
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(root_path)

# Importar la aplicación FastAPI
from backend.app.main import app

def list_all_routes():
    """Lista todas las rutas registradas en la aplicación FastAPI"""
    
    print("\n=== TODOS LOS ENDPOINTS REGISTRADOS ===\n")
    
    # Ordenar por ruta para mayor claridad
    routes = sorted(app.routes, key=lambda route: getattr(route, "path", ""))
    
    endpoints_by_tag = {}
    
    for route in routes:
        # Obtener información básica de la ruta
        path = getattr(route, "path", "")
        name = getattr(route, "name", "")
        methods = getattr(route, "methods", set())
        
        # Obtener tags (si existen)
        tags = getattr(route, "tags", [])
        tag_name = tags[0] if tags else "sin_categoria"
        
        # Inicializar diccionario para tag si no existe
        if tag_name not in endpoints_by_tag:
            endpoints_by_tag[tag_name] = []
        
        # Añadir endpoint a su categoría
        endpoints_by_tag[tag_name].append({
            "path": path,
            "name": name,
            "methods": sorted(methods),
        })
    
    # Imprimir endpoints organizados por tag
    for tag, endpoints in sorted(endpoints_by_tag.items()):
        print(f"\n## {tag.upper()} ##\n")
        
        for endpoint in endpoints:
            methods_str = ", ".join(endpoint["methods"])
            print(f"{methods_str:<10} {endpoint['path']:<40} {endpoint['name']}")
    
    print(f"\nTotal de endpoints: {len(routes)}")

if __name__ == "__main__":
    list_all_routes()
