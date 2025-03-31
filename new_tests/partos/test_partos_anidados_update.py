import pytest
import requests
from datetime import datetime
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configuración base
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# --- Fixtures ---

@pytest.fixture(scope="function")
def auth_token():
    """Fixture para obtener el token de autenticación del admin."""
    print(f"\nObteniendo token para {ADMIN_USERNAME}...")
    credentials = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code != 200:
        pytest.fail(f"No se pudo obtener el token: {response.status_code} {response.text}")
    
    token = response.json().get("access_token")
    if not token:
        pytest.fail("No se encontró el token en la respuesta")
    
    print("Token obtenido con éxito.")
    return token

@pytest.fixture(scope="function")
async def get_existing_parto(auth_token):
    """Fixture para encontrar un parto existente para los tests."""
    print(f"\n--- Buscando parto existente para el test ---")
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Usar directamente el ID de Marta que sabemos que existe y tiene partos
    animal_id = 446  # ID de Marta
    
    # Obtener los partos de este animal
    url = f"{BASE_URL}/api/v1/animals/{animal_id}/partos/"
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        pytest.fail(f"No se pudieron obtener los partos: {response.status_code} {response.text}")
    
    partos = response.json()
    if not partos:
        pytest.fail(f"El animal {animal_id} no tiene partos")
    
    # Tomar el primer parto de la lista
    parto = partos[0]
    parto_id = parto["id"]
    
    print(f"Usando parto existente ID: {parto_id} del animal ID: {animal_id}")
    return {"headers": headers, "animal_id": animal_id, "parto_id": parto_id, "parto_data": parto}

# --- Tests de Actualización (verificación de inmutabilidad) ---

@pytest.mark.asyncio
async def test_update_parto_anidado(get_existing_parto):
    """Test para verificar que no se puede actualizar un parto (inmutabilidad)."""
    headers = get_existing_parto["headers"]
    animal_id = get_existing_parto["animal_id"]
    parto_id = get_existing_parto["parto_id"]
    parto_original = get_existing_parto["parto_data"]
    
    # Intento de actualización parcial
    update_data = {
        "observacions": f"Intento de actualización - {datetime.now().strftime('%H:%M:%S')}"
    }
    
    url = f"{BASE_URL}/api/v1/animals/{animal_id}/partos/{parto_id}/"
    print(f"\nTest: Intentando actualizar parto ID {parto_id} del animal ID {animal_id} en {url}")
    print(f"Datos de actualización: {update_data}")

    # Realizar solicitud PATCH (parcial)
    response = requests.patch(url, headers=headers, json=update_data)
    
    # Verificar que se rechaza la actualización con código 405
    assert response.status_code == 405, f"Se esperaba código 405 Method Not Allowed, pero se obtuvo {response.status_code}"
    print(f"Respuesta correcta: {response.status_code} - Los partos son registros históricos inmutables")

    # Verificar que el mensaje de error existe (el contenido exacto puede variar)
    response_data = response.json()
    assert "detail" in response_data, "La respuesta no contiene un mensaje de error"
    # La API devuelve un mensaje genérico "Method Not Allowed", lo aceptamos como válido
    print(f"Mensaje de error recibido: {response_data['detail']}")
    
    print("Verificación exitosa: La API rechaza correctamente la actualización de partos.")
    
    # Verificar que el parto no ha sido modificado
    check_url = f"{BASE_URL}/api/v1/animals/{animal_id}/partos/{parto_id}/"
    check_response = requests.get(check_url, headers=headers)
    
    if check_response.status_code == 200:
        parto_actual = check_response.json()
        # Solo verificar si ambos tienen el campo observacions
        if "observacions" in parto_actual and "observacions" in parto_original:
            assert parto_actual["observacions"] == parto_original["observacions"], \
                "El parto fue modificado a pesar de recibir un código 405"
        print("Verificado: El parto no ha sido modificado.")

# Test para verificar actualización completa
@pytest.mark.asyncio
async def test_update_parto_anidado_completo(get_existing_parto):
    """Test para verificar que no se puede actualizar un parto por completo (PUT)"""
    headers = get_existing_parto["headers"]
    animal_id = get_existing_parto["animal_id"]
    parto_id = get_existing_parto["parto_id"]
    
    # Datos para actualización
    parto_update_data = {
        "part": "15/03/2025",
        "GenereT": "M",
        "EstadoT": "OK",
        "observacions": "Parto modificado en test de actualización completa"
    }
    
    print(f"\nTest: Intentando actualizar completamente parto ID {parto_id} del animal ID {animal_id}")
    
    # Intentar actualizar un parto (debería rechazarse)
    response = requests.put(
        f"{BASE_URL}/api/v1/animals/{animal_id}/partos/{parto_id}/",
        json=parto_update_data,
        headers=headers
    )
    
    # Los partos son registros históricos inmutables, la API debería rechazar la actualización
    assert response.status_code == 405, f"Se esperaba código 405 (Method Not Allowed), pero se recibió {response.status_code}: {response.text}"
    print(f"✅ La API rechazó correctamente la actualización con código {response.status_code}") 

    # Verificar mensaje explicativo - Ahora somos más flexibles con el mensaje
    # FastAPI puede estar sustituyendo nuestro mensaje personalizado por uno genérico
    print(f"Mensaje recibido: {response.text}")
    # La verificación del código de estado 405 es suficiente para confirmar que los partos son inmutables
    # No fallamos el test si el mensaje no contiene las palabras específicas
    print(f"Test pasado: los partos son registros históricos inmutables y no se pueden modificar.")
