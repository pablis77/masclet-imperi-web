import requests
import json
import time

# Configuración base
BASE_URL = "http://127.0.0.1:8000/api/v1"
AUTH_URL = "http://127.0.0.1:8000/api/v1/auth/login"

# Credenciales de administrador
USERNAME = "admin"
PASSWORD = "admin123"

def main():
    print("=== Test de Login y Actualización de Animal ===")
    
    # Paso 1: Autenticación
    print("\nIntentando autenticación...")
    
    # Usar form data en lugar de JSON para la autenticación
    auth_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    # Intentar con form data
    auth_response = requests.post(
        AUTH_URL,
        data=auth_data
    )
    
    # Si falla, intentar con JSON
    if auth_response.status_code != 200:
        print(f"Intento con form data falló ({auth_response.status_code}), probando con JSON...")
        auth_response = requests.post(
            AUTH_URL,
            json=auth_data
        )
    
    print(f"Estado de autenticación: {auth_response.status_code}")
    print(f"Respuesta: {auth_response.text}")
    
    if auth_response.status_code != 200:
        print("Error de autenticación. No se puede continuar.")
        return
    
    # Extraer token
    token_data = auth_response.json()
    token = token_data.get("access_token")
    
    if not token:
        print("No se pudo obtener el token. No se puede continuar.")
        return
    
    print(f"Token obtenido: {token[:20]}...")
    
    # Configurar headers con el token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Paso 2: Obtener datos actuales del animal
    print("\nObteniendo datos actuales del animal...")
    animal_id = 2736  # ID del animal a actualizar
    
    get_response = requests.get(
        f"{BASE_URL}/animals/{animal_id}",
        headers=headers
    )
    
    if get_response.status_code != 200:
        print(f"Error al obtener el animal: {get_response.status_code}")
        print(f"Respuesta: {get_response.text}")
        return
    
    animal_data = get_response.json()
    if "data" in animal_data:
        animal_data = animal_data["data"]
    
    print(f"Datos actuales del animal:")
    print(f"- Nombre: {animal_data.get('nom')}")
    print(f"- Cuadra actual: {animal_data.get('quadra')}")
    print(f"- Estado de amamantamiento: {animal_data.get('alletar')}")
    
    # Paso 3: Actualizar el animal usando PATCH
    print("\nIntentando actualizar animal (solo quadra)...")
    nueva_cuadra = "Cuadra Test " + str(int(time.time()) % 1000)  # Generar un nombre único
    
    update_response = requests.patch(
        f"{BASE_URL}/animals/{animal_id}",
        headers=headers,
        json={"quadra": nueva_cuadra}
    )
    
    print(f"Estado de actualización: {update_response.status_code}")
    print(f"Respuesta: {update_response.text[:200]}...")  # Mostrar solo el inicio para no saturar
    
    # Paso 4: Verificar la actualización
    print("\nVerificando actualización...")
    verify_response = requests.get(
        f"{BASE_URL}/animals/{animal_id}",
        headers=headers
    )
    
    if verify_response.status_code == 200:
        verify_data = verify_response.json()
        if "data" in verify_data:
            verify_data = verify_data["data"]
        
        quadra_actual = verify_data.get("quadra")
        print(f"Cuadra actual: {quadra_actual}")
        
        if quadra_actual == nueva_cuadra:
            print("\n✅ ÉXITO: La actualización se realizó correctamente.")
        else:
            print("\n❌ ERROR: La cuadra no se actualizó correctamente.")
    else:
        print(f"\n❌ ERROR al verificar: {verify_response.status_code}")
        print(f"Respuesta: {verify_response.text}")

if __name__ == "__main__":
    main()
