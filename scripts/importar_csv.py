#!/usr/bin/env python
"""
Script para importar datos desde un archivo CSV a la base de datos.
Uso: python importar_csv.py ruta/al/archivo.csv
"""
import sys
import os
import requests
import json
from pathlib import Path

# Configuración
API_URL = "http://localhost:8000/api/v1"
AUTH_URL = f"{API_URL}/auth/login"
IMPORT_URL = f"{API_URL}/imports/csv"

def login():
    """Obtiene un token de autenticación"""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        AUTH_URL,
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code != 200:
        print(f"Error de autenticación: {response.status_code} - {response.text}")
        sys.exit(1)
        
    return response.json()["access_token"]

def import_csv(csv_path, description=None, prevent_duplicates=True):
    """Importa un archivo CSV a través del endpoint de la API"""
    if not os.path.exists(csv_path):
        print(f"ERROR: El archivo {csv_path} no existe")
        return False
        
    # Autenticarse
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Preparar la descripción
    if not description:
        description = f"Importación de {Path(csv_path).name}"
    
    # Ejecutar la importación
    with open(csv_path, "rb") as f:
        files = {"file": (Path(csv_path).name, f, "text/csv")}
        data = {
            "description": description,
            "prevent_duplicates": "true" if prevent_duplicates else "false"
        }
        
        print(f"Importando {csv_path}...")
        response = requests.post(IMPORT_URL, files=files, data=data, headers=headers)
    
    if response.status_code != 200:
        print(f"Error al importar: {response.status_code} - {response.text}")
        return False
        
    # Procesar la respuesta
    result = response.json()
    print(f"Resultado de la importación:")
    print(json.dumps(result, indent=2))
    
    # Comprobar si hay errores
    if "result" in result and "errors" in result["result"] and result["result"]["errors"] > 0:
        print(f"ATENCIÓN: La importación terminó con {result['result']['errors']} errores")
        
        # Obtener detalles de errores
        if "id" in result:
            error_url = f"{API_URL}/imports/{result['id']}/errors"
            error_response = requests.get(error_url, headers=headers)
            
            if error_response.status_code == 200:
                error_details = error_response.json()
                print("Detalles de errores:")
                print(json.dumps(error_details, indent=2))
    
    return result["status"].upper() in ["PENDING", "PROCESSING", "COMPLETED"]

def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print(f"Uso: python {sys.argv[0]} ruta/al/archivo.csv [descripción] [--allow-duplicates]")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    description = None
    prevent_duplicates = True
    
    # Procesar argumentos adicionales
    for i in range(2, len(sys.argv)):
        arg = sys.argv[i]
        if arg == "--allow-duplicates":
            prevent_duplicates = False
        elif not description:  # Primera cadena no reconocida es la descripción
            description = arg
    
    success = import_csv(csv_path, description, prevent_duplicates)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
