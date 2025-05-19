import os
import requests

# Configuración de la API
API_URL = "http://localhost:8000/api/v1"

def main():
    print("Importando datos reales desde matriz_master.csv...")
    
    # Archivo a importar
    csv_file_path = "backend/database/matriz_master.csv"
    if not os.path.exists(csv_file_path):
        print(f"Error: No se encuentra el archivo {csv_file_path}")
        return
    
    # Obtener token de autenticación
    auth_data = {
        "username": "admin",
        "password": "admin"
    }
    auth_response = requests.post(
        f"{API_URL}/auth/login",
        data=auth_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if auth_response.status_code != 200:
        print(f"Error de autenticación: {auth_response.status_code} - {auth_response.text}")
        return
    
    auth_token = auth_response.json()["access_token"]
    
    # Importar CSV a través de la API
    url = f"{API_URL}/imports/csv"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    with open(csv_file_path, "rb") as f:
        files = {"file": ("matriz_master.csv", f, "text/csv")}
        data = {"description": "Importación de datos reales"}
        print(f"Enviando petición a: {url}")
        response = requests.post(url, files=files, data=data, headers=headers)
    
    if response.status_code != 200:
        print(f"Error en la importación: {response.status_code} - {response.text}")
        return
    
    result = response.json()
    print(f"Respuesta de la importación: {result}")
    
    # Verificar el estado
    status = result["status"].upper()
    print(f"Estado de la importación: {status}")
    
    # Si hay errores, obtener los detalles
    if "result" in result and "errors" in result["result"] and result["result"]["errors"] > 0:
        if "id" in result:
            error_url = f"{API_URL}/imports/{result['id']}/errors"
            error_response = requests.get(error_url, headers=headers)
            if error_response.status_code == 200:
                error_details = error_response.json()
                print(f"Detalles de errores: {error_details}")
    
    # Resumen final
    if "result" in result:
        if "imported" in result["result"]:
            print(f"Registros importados correctamente: {result['result']['imported']}")
        if "errors" in result["result"]:
            print(f"Registros con errores: {result['result']['errors']}")
    
    print("Proceso completado.")

if __name__ == "__main__":
    main()
