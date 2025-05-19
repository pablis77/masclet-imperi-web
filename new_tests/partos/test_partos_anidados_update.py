import pytest
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid

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
    """Fixture para encontrar o crear un parto existente para los tests."""
    print(f"\n--- Buscando o creando parto existente para el test ---")
    headers = {"Authorization": f"Bearer {auth_token}"}

    # En lugar de usar un ID fijo, creamos un animal y un parto para el test
    # Crear un animal femenino
    animal_name = f"Test_Female_{uuid.uuid4().hex[:8]}"
    animal_data = {
        "nom": animal_name,
        "genere": "F",  # Femenino
        "explotacio": "Test",
        "estado": "OK",
        "alletar": "0"  # No amamanta (valores válidos: '0', '1', '2')
    }
    
    print(f"Creando animal hembra para test de partos...")
    
    # Crear el animal
    create_animal_response = requests.post(f"{BASE_URL}/api/v1/animals/", json=animal_data, headers=headers)
    
    if create_animal_response.status_code != 201:
        pytest.fail(f"Error al crear animal: {create_animal_response.status_code} - {create_animal_response.text}")
    
    animal_data = create_animal_response.json()
    if "data" in animal_data:
        animal_data = animal_data["data"]
        
    animal_id = animal_data["id"]
    print(f"Animal creado con ID: {animal_id}, Nombre: {animal_name}")
    
    # Crear un parto para este animal
    parto_data = {
        "animal_id": animal_id,
        "numero_part": 1,
        "part": datetime.now().strftime('%d/%m/%Y'),  # Formato DD/MM/YYYY
        "GenereT": "F",  # Género de la cría: hembra
        "EstadoT": "OK",  # Estado de la cría: vivo
        "observacions": "Parto de prueba para tests"
    }
    
    # Crear el parto usando el endpoint anidado
    create_parto_url = f"{BASE_URL}/api/v1/animals/{animal_id}/partos"
    create_parto_response = requests.post(create_parto_url, json=parto_data, headers=headers)
    
    if create_parto_response.status_code not in [200, 201]:
        # Si falla el endpoint anidado, intentar con el endpoint directo
        direct_url = f"{BASE_URL}/api/v1/partos"
        create_parto_response = requests.post(direct_url, json=parto_data, headers=headers)
        
        if create_parto_response.status_code not in [200, 201]:
            pytest.fail(f"No se pudo crear el parto: {create_parto_response.status_code} - {create_parto_response.text}")
    
    parto_data = create_parto_response.json()
    if "data" in parto_data:
        parto_data = parto_data["data"]
        
    parto_id = parto_data["id"]
    print(f"Parto creado con ID: {parto_id} para el animal ID: {animal_id}")
    
    # Retornar los datos necesarios para los tests
    return {
        "animal_id": animal_id,
        "animal_name": animal_name,
        "parto_id": parto_id,
        "headers": headers,
        "parto_data": parto_data
    }

# --- Tests de Actualización (verificación de inmutabilidad) ---

@pytest.mark.asyncio
async def test_update_parto_anidado(get_existing_parto):
    """Test para verificar que los partos son inmutables al intentar actualizarlos a través del endpoint anidado."""
    animal_id = get_existing_parto["animal_id"]
    parto_id = get_existing_parto["parto_id"]
    headers = get_existing_parto["headers"]
    
    # Datos para actualizar el parto
    update_data = {
        "observacions": "Parto actualizado por test anidado"
    }
    
    url = f"{BASE_URL}/api/v1/animals/{animal_id}/partos/{parto_id}/"
    print(f"\nTest: Actualizando parto ID {parto_id} del animal ID {animal_id} con PATCH en URL anidada: {url}")
    
    try:
        # Intentar actualizar con PATCH
        response = requests.patch(url, json=update_data, headers=headers)
        
        # Verificar que no se puede actualizar (405 Method Not Allowed)
        # Los partos son registros históricos inmutables
        assert response.status_code == 405, f"Se esperaba código 405, se recibió: {response.status_code} - {response.text}"
        
        print(f"Actualización rechazada correctamente (405) - Los partos son inmutables por regla de negocio")
        
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión: {e}")
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_update_parto_anidado_completo(get_existing_parto):
    """Test para verificar que los partos son inmutables al intentar actualizarlos completamente."""
    animal_id = get_existing_parto["animal_id"]
    parto_id = get_existing_parto["parto_id"]
    headers = get_existing_parto["headers"]
    
    # Fecha del parto (ayer)
    yesterday = datetime.now() - timedelta(days=1)
    fecha_parto = yesterday.strftime("%d/%m/%Y")
    
    # Datos completos para actualizar el parto
    update_data = {
        "animal_id": animal_id,
        "numero_part": 2,
        "part": fecha_parto,
        "GenereT": "M",
        "EstadoT": "OK",
        "observacions": "Parto actualizado completamente por test anidado"
    }
    
    url = f"{BASE_URL}/api/v1/animals/{animal_id}/partos/{parto_id}/"
    print(f"\nTest: Actualizando completamente parto ID {parto_id} del animal ID {animal_id} con PUT en URL anidada: {url}")
    
    try:
        # Intentar actualizar con PUT
        response = requests.put(url, json=update_data, headers=headers)
        
        # Verificar que no se puede actualizar (405 Method Not Allowed)
        # Los partos son registros históricos inmutables
        assert response.status_code == 405, f"Se esperaba código 405, se recibió: {response.status_code} - {response.text}"
        
        print(f"Actualización completa rechazada correctamente (405) - Los partos son inmutables por regla de negocio")
        
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión: {e}")
        assert False, "Excepción durante la solicitud HTTP."
