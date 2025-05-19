import requests
import json

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
ANIMAL_ID = 2736  # ID de la vaca Marta
NUEVO_VALOR_MARE = "Elena"  # Nuevo valor para el campo mare

# Credenciales
credentials = {
    "username": "admin",
    "password": "admin123"
}

print("=== ACTUALIZADOR DE CAMPO MARE ===")
print(f"Animal ID: {ANIMAL_ID}")
print(f"Nuevo valor de mare: {NUEVO_VALOR_MARE}")
print("Autenticando...")

# Obtener token de autenticación
auth_response = requests.post(
    f"{BASE_URL}/auth/login",
    data=credentials,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if auth_response.status_code != 200:
    print(f"Error de autenticación: {auth_response.status_code} - {auth_response.text}")
    exit(1)

token = auth_response.json()["access_token"]
print(f"Autenticación exitosa. Token: {token[:20]}...")

# Datos para actualización parcial (solo el campo mare)
update_data = {
    "mare": NUEVO_VALOR_MARE
}

print(f"\nEnviando actualización PATCH...")
print(f"Datos: {json.dumps(update_data, indent=2)}")

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
    print("¡ACTUALIZACIÓN EXITOSA!")
    print(f"Respuesta: {json.dumps(patch_response.json(), indent=2)}")
else:
    print(f"Error: {patch_response.text}")

# Verificar que el cambio se haya aplicado
print("\nVerificando el cambio...")
get_response = requests.get(
    f"{BASE_URL}/animals/{ANIMAL_ID}",
    headers={"Authorization": f"Bearer {token}"}
)

if get_response.status_code == 200:
    animal_data = get_response.json()
    print(f"Valor actual de mare: {animal_data.get('mare', 'No disponible')}")
    if animal_data.get('mare') == NUEVO_VALOR_MARE:
        print("¡VERIFICACIÓN EXITOSA! El campo mare se actualizó correctamente.")
    else:
        print("ADVERTENCIA: El valor no coincide con lo esperado.")
else:
    print(f"Error al verificar: {get_response.status_code} - {get_response.text}")

input("\nPresiona Enter para salir...")
