"""
Test específico para importar el archivo matriz_master.csv.
"""
import pytest
import requests
import os
import csv
import io
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1/imports"
AUTH_URL = "http://localhost:8000/api/v1/auth"

@pytest.fixture
def auth_token():
    """Obtiene un token de autenticación del administrador."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        f"{AUTH_URL}/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_matriz_master_csv(auth_token):
    """
    Test específico para importar matriz_master.csv,
    el archivo principal con todos los datos reales.
    """
    # Archivo real del sistema
    test_file_path = "backend/database/matriz_master.csv"
    
    # Verificar que el archivo existe
    assert os.path.exists(test_file_path), f"El archivo {test_file_path} no existe"
    
    # Imprimir las primeras líneas para ver formato
    with open(test_file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        header = next(reader)
        print(f"\nCabeceras del archivo: {header}")
        
        # Mostrar las primeras 3 filas para referencia
        print("\nPrimeras 3 filas del archivo:")
        for i, row in enumerate(reader):
            if i < 3:
                print(f"Fila {i+1}: {row}")
            else:
                break
    
    # Ejecutar importación
    url = f"{BASE_URL}/csv"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nImportando matriz_master.csv: {url}")
    
    with open(test_file_path, "rb") as f:
        files = {"file": ("matriz_master.csv", f, "text/csv")}
        data = {"description": "Test importación matriz_master"}
        response = requests.post(url, files=files, data=data, headers=headers)

    # Verificar respuesta básica
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    result = response.json()
    
    print(f"\nResultado detallado de la importación:")
    print(json.dumps(result, indent=2))
    
    # Mostrar los errores de la importación
    if "result" in result and "error_details" in result["result"]:
        # Verificar si error_details es None (lo que significa que no hay errores)
        if result["result"]["error_details"] is None:
            print("\nNo hay errores en la importación.")
        else:
            error_count = len(result["result"]["error_details"])
            print(f"\nDETALLES DE ERRORES ({error_count}):")
            for i, error in enumerate(result["result"]["error_details"]):
                if i < 10:  # Mostrar solo los primeros 10 errores
                    print(f"{i+1}. {error.get('message', 'Error sin detalle')}")
                else:
                    print(f"... y {error_count - 10} errores más")
                    break
    
    # Obtener errores detallados si es posible
    if "id" in result:
        error_url = f"{BASE_URL}/{result['id']}/errors"
        error_response = requests.get(error_url, headers=headers)
        if error_response.status_code == 200:
            detailed_errors = error_response.json()
            print("\nERRORES DETALLADOS:")
            print(json.dumps(detailed_errors, indent=2))
    
    # No hacemos assert de éxito aquí, solo queremos ver qué pasa
    print(f"\nEstado final de la importación: {result.get('status', 'desconocido')}")
    print(f"Total registros: {result.get('result', {}).get('total', 0)}")
    print(f"Éxitos: {result.get('result', {}).get('success', 0)}")
    print(f"Errores: {result.get('result', {}).get('errors', 0)}")
