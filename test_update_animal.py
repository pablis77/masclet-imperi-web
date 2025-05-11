import requests
import json

# URL base de la API
BASE_URL = "http://localhost:8000/api/v1"

# Datos de autenticación
auth_data = {
    "username": "admin",
    "password": "admin123"
}

# Paso 1: Obtener token de autenticación
print("Intentando autenticación...")
auth_response = requests.post(f"{BASE_URL}/auth/login", data=auth_data)
print(f"Estado de autenticación: {auth_response.status_code}")
print(f"Respuesta: {auth_response.text}")

if auth_response.status_code == 200:
    # Extraer token
    token = auth_response.json().get("access_token")
    print(f"Token obtenido: {token[:20]}...")
    
    # Paso 2: Actualizar el animal
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Datos a actualizar (solo quadra)
    update_data = {
        "quadra": "Andres"
    }
    
    print("\nIntentando actualizar animal...")
    update_response = requests.put(
        f"{BASE_URL}/animals/2736", 
        headers=headers,
        json=update_data
    )
    
    print(f"Estado de actualización: {update_response.status_code}")
    print(f"Respuesta: {update_response.text}")
    
    # Paso 3: Verificar si se actualizó correctamente
    print("\nVerificando actualización...")
    get_response = requests.get(
        f"{BASE_URL}/animals/2736",
        headers=headers
    )
    
    print(f"Estado de verificación: {get_response.status_code}")
    animal_data = get_response.json()
    print(f"Quadra actual: {animal_data.get('data', {}).get('quadra')}")
else:
    print("Error de autenticación. No se pudo obtener token.")
