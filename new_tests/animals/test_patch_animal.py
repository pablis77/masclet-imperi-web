import requests
import json

# URL base del backend
BASE_URL = "http://127.0.0.1:8000"

# Credenciales de autenticación
USERNAME = "admin"
PASSWORD = "admin123"

# ID del animal a actualizar
ANIMAL_ID = 2736

def login():
    """Obtener token de autenticación"""
    print("Iniciando sesión...")
    
    # Datos para la autenticación
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    # Hacer la petición de login
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data=login_data,  # Usar form-data en lugar de JSON
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Verificar si la petición fue exitosa
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print(f"Sesión iniciada correctamente. Token: {token[:20]}...")
        return token
    else:
        print(f"Error al iniciar sesión: {response.status_code}")
        print(f"Respuesta: {response.text}")
        return None

def get_animal(token, animal_id):
    """Obtener datos actuales del animal"""
    print(f"Obteniendo datos del animal {animal_id}...")
    
    # Hacer la petición GET
    response = requests.get(
        f"{BASE_URL}/api/v1/animals/{animal_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Verificar si la petición fue exitosa
    if response.status_code == 200:
        animal_data = response.json()
        print(f"Datos obtenidos correctamente: {animal_data}")
        return animal_data
    else:
        print(f"Error al obtener datos: {response.status_code}")
        print(f"Respuesta: {response.text}")
        return None

def update_animal_quadra(token, animal_id, animal_data, new_quadra):
    """Actualizar la cuadra de un animal"""
    print(f"Actualizando cuadra del animal {animal_id} a '{new_quadra}'...")
    
    # Crear datos para la actualización - SOLO el campo que queremos actualizar
    update_data = {
        # Campo a actualizar
        "quadra": new_quadra
    }
    
    # Imprimir datos que se van a enviar
    print(f"Datos a enviar: {json.dumps(update_data, indent=2)}")
    
    # Hacer la petición PATCH
    response = requests.patch(
        f"{BASE_URL}/api/v1/animals/{animal_id}",
        json=update_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    # Verificar si la petición fue exitosa
    if response.status_code == 200:
        updated_data = response.json()
        print(f"Animal actualizado correctamente: {updated_data}")
        return updated_data
    else:
        print(f"Error al actualizar animal: {response.status_code}")
        print(f"Respuesta: {response.text}")
        return None

def update_animal_alletar(token, animal_id, animal_data, new_alletar):
    """Actualizar el estado de amamantamiento de un animal"""
    print(f"Actualizando estado de amamantamiento del animal {animal_id} a '{new_alletar}'...")
    
    # Crear datos para la actualización - SOLO el campo que queremos actualizar
    update_data = {
        # Campo a actualizar
        "alletar": str(new_alletar)
    }
    
    # Imprimir datos que se van a enviar
    print(f"Datos a enviar: {json.dumps(update_data, indent=2)}")
    
    # Hacer la petición PATCH
    response = requests.patch(
        f"{BASE_URL}/api/v1/animals/{animal_id}",
        json=update_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    # Verificar si la petición fue exitosa
    if response.status_code == 200:
        updated_data = response.json()
        print(f"Animal actualizado correctamente: {updated_data}")
        return updated_data
    else:
        print(f"Error al actualizar animal: {response.status_code}")
        print(f"Respuesta: {response.text}")
        return None

def main():
    """Función principal"""
    # 1. Iniciar sesión
    token = login()
    if not token:
        print("No se pudo obtener el token de autenticación. Abortando.")
        return
    
    # 2. Obtener datos actuales del animal
    animal_data = get_animal(token, ANIMAL_ID)
    if not animal_data:
        print("No se pudieron obtener los datos del animal. Abortando.")
        return
    
    # 3. Actualizar cuadra
    new_quadra = "Test Cuadra Python"
    updated_animal = update_animal_quadra(token, ANIMAL_ID, animal_data, new_quadra)
    if not updated_animal:
        print("No se pudo actualizar la cuadra del animal.")
    
    # 4. Actualizar estado de amamantamiento
    new_alletar = "1"  # 1 ternero
    updated_animal = update_animal_alletar(token, ANIMAL_ID, animal_data, new_alletar)
    if not updated_animal:
        print("No se pudo actualizar el estado de amamantamiento del animal.")

if __name__ == "__main__":
    main()
