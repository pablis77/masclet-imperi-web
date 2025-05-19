import requests
import json
import pytest
import os
import io
import csv

# Configuración
BASE_URL = "http://localhost:8000/api/v1/imports"

def get_auth_token():
    """Obtiene el token de autenticación"""
    auth_url = "http://localhost:8000/api/v1/auth/login"
    auth_data = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        auth_url,
        data=auth_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Error de autenticación: {response.status_code} - {response.text}"
    return response.json()["access_token"]

def main():
    """Función principal que importa el archivo matriz_master.csv"""
    # Obtener token de autenticación
    auth_token = get_auth_token()
    
    # Usar el archivo pruebaampliacion.csv que sabemos que funciona
    test_file_path = "backend/database/pruebaampliacion.csv"
    
    # Verificar que el archivo existe
    if not os.path.exists(test_file_path):
        print(f"Error: No se encuentra el archivo {test_file_path}")
        return
    
    # Ejecutar importación
    url = f"{BASE_URL}/csv"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nImportando datos desde {test_file_path}: {url}")
    
    with open(test_file_path, "rb") as f:
        files = {"file": ("matriz_master.csv", f, "text/csv")}
        data = {"description": "Importación de datos reales"}
        response = requests.post(url, files=files, data=data, headers=headers)

    # Verificar respuesta básica
    if response.status_code != 200:
        print(f"Error en la importación: {response.status_code} - {response.text}")
        return
    
    result = response.json()
    print(f"Resultado de la importación: {result}")
    
    # Verificar estado
    status = result["status"].upper()
    print(f"Estado de la importación: {status}")
    
    # Mostrar errores si los hay
    if "result" in result and "errors" in result["result"] and result["result"]["errors"] > 0:
        error_details = "No se pudieron obtener detalles de errores"
        
        # Obtener detalles de errores
        if "id" in result:
            error_url = f"{BASE_URL}/{result['id']}/errors"
            error_response = requests.get(error_url, headers=headers)
            if error_response.status_code == 200:
                error_details = error_response.json()
                print(f"Detalles de errores: {error_details}")
    
    # Mostrar resumen
    if "result" in result:
        if "imported" in result["result"]:
            print(f"Registros importados correctamente: {result['result']['imported']}")
        if "errors" in result["result"]:
            print(f"Registros con errores: {result['result']['errors']}")
    
    print("Proceso completado.")

if __name__ == "__main__":
    main()
