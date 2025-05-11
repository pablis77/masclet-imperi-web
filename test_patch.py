import requests
import json

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
ANIMAL_ID = 2736  # ID de la vaca Marta

# Credenciales
credentials = {
    "username": "admin",
    "password": "admin123"
}

# Obtener token de autenticación
print("Obteniendo token de autenticación...")
auth_response = requests.post(
    f"{BASE_URL}/auth/login",
    data=credentials,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if auth_response.status_code != 200:
    print(f"Error al obtener token: {auth_response.status_code} - {auth_response.text}")
    exit(1)

token = auth_response.json()["access_token"]
print(f"Token obtenido: {token[:20]}...")

# Datos para actualización parcial (solo el campo mare)
update_data = {
    "mare": "Elena G"  # Volvemos a poner la G al nombre de la madre
}

print(f"\nActualizando animal {ANIMAL_ID} con datos: {json.dumps(update_data, indent=2)}")

# Realizar la petición PATCH
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

patch_response = requests.patch(
    f"{BASE_URL}/animals/{ANIMAL_ID}",
    json=update_data,
    headers=headers
)

# Mostrar respuesta
print(f"\nCódigo de estado: {patch_response.status_code}")
if patch_response.status_code == 200:
    print("¡Actualización exitosa!")
    print(f"Respuesta: {json.dumps(patch_response.json(), indent=2)}")
else:
    print(f"Error: {patch_response.text}")
