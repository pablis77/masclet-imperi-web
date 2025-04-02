import uuid
import pytest
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# URL base de la API 
BASE_URL = os.getenv("API_URL", "http://localhost:8000")
ANIMALS_URL = f"{BASE_URL}/api/v1/animals"
PARTOS_URL = f"{BASE_URL}/api/v1/partos"

@pytest.fixture(scope="function")
def auth_token():
    """Obtener token de autenticación para las pruebas"""
    credentials = {
        "username": "admin",
        "password": "admin123"  # Contraseña correcta
    }
    # Usar data= en lugar de json= para enviar como form-urlencoded
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=credentials)
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    return response.json()["access_token"]

@pytest.fixture(scope="function")
def get_existing_parto(auth_token):
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
    create_animal_response = requests.post(f"{ANIMALS_URL}", json=animal_data, headers=headers)
    
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
    
    # Crear el parto usando el endpoint directo
    create_parto_response = requests.post(f"{PARTOS_URL}", json=parto_data, headers=headers)
        
    if create_parto_response.status_code not in [200, 201]:
        pytest.fail(f"No se pudo crear el parto: {create_parto_response.status_code} - {create_parto_response.text}")
    
    parto_data = create_parto_response.json()
    if "data" in parto_data:
        parto_data = parto_data["data"]
        
    parto_id = parto_data["id"]
    print(f"Parto creado con ID: {parto_id} para el animal ID: {animal_id}")

    # Limpiar después del test
    yield {
        "animal_id": animal_id,
        "animal_name": animal_name,
        "parto_id": parto_id,
        "headers": headers,
        "parto_data": parto_data
    }
    
    # Eliminar el animal (esto también eliminará el parto debido a la cascada)
    try:
        requests.delete(f"{ANIMALS_URL}/{animal_id}", headers=headers)
        print(f"Animal ID {animal_id} eliminado después del test")
    except Exception as e:
        print(f"Error al eliminar animal después del test: {e}")

def test_update_parto_partial(get_existing_parto):
    """Test para verificar que los partos son inmutables al intentar actualizarlos."""
    parto_id = get_existing_parto["parto_id"]
    headers = get_existing_parto["headers"]
    
    # Datos para actualizar el parto (solo algunos campos)
    update_data = {
        "observacions": "Parto actualizado por test"
    }
    
    # Intentar actualizar el parto
    url = f"{PARTOS_URL}/{parto_id}"
    print(f"\nTest: Intentando actualizar parto ID {parto_id} con PATCH en {url}")
    
    # Probar con PATCH - la API debe rechazar la operación con 405
    response = requests.patch(url, json=update_data, headers=headers)
    
    # Comprobar que se rechaza correctamente
    assert response.status_code == 405, f"Se esperaba código 405, se recibió: {response.status_code} - {response.text}"
    print(f"Actualización rechazada correctamente (405) - Los partos son inmutables por regla de negocio")

def test_update_parto_put(get_existing_parto):
    """Test para verificar que los partos son inmutables al intentar actualizarlos con PUT."""
    parto_id = get_existing_parto["parto_id"]
    headers = get_existing_parto["headers"]
    
    # Para PUT necesitamos enviar todos los datos
    parto_completo = get_existing_parto["parto_data"].copy()
    parto_completo["observacions"] = "Actualizado mediante PUT"
    
    # Intentar actualizar el parto
    url = f"{PARTOS_URL}/{parto_id}"
    print(f"\nTest: Intentando actualizar parto ID {parto_id} con PUT en {url}")
    
    response = requests.put(url, json=parto_completo, headers=headers)
    
    # Los partos son inmutables, debe rechazar la actualización
    assert response.status_code == 405, f"Se esperaba código 405, se recibió: {response.status_code} - {response.text}"
    print(f"Actualización rechazada correctamente (405) - Los partos son inmutables por regla de negocio")

def test_update_parto_invalid_date(get_existing_parto):
    """Test para verificar que no se puede actualizar un parto con fecha inválida."""
    parto_id = get_existing_parto["parto_id"]
    headers = get_existing_parto["headers"]
    
    # Fecha futura (mañana)
    tomorrow = datetime.now() + timedelta(days=1)
    fecha_futura = tomorrow.strftime("%d/%m/%Y")
    
    # Datos para actualizar el parto con fecha inválida
    update_data = {
        "part": fecha_futura
    }
    
    # Intentar actualizar el parto
    url = f"{PARTOS_URL}/{parto_id}"
    print(f"\nTest: Intentando actualizar parto ID {parto_id} con fecha futura en {url}")
    
    # Intentar actualizar con PATCH
    response = requests.patch(url, json=update_data, headers=headers)
    
    # Los partos son inmutables, debe rechazar la actualización
    assert response.status_code == 405, f"Se esperaba código 405, se recibió: {response.status_code} - {response.text}"
    print(f"Actualización rechazada correctamente (405) - Los partos son inmutables")

def test_update_nonexistent_parto(auth_token):
    """Test para verificar el comportamiento al intentar actualizar un parto inexistente."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    nonexistent_id = 99999  # ID que no existe
    
    # Datos para actualizar un parto inexistente
    update_data = {
        "observacions": "Este parto no existe"
    }
    
    url = f"{PARTOS_URL}/{nonexistent_id}"
    print(f"\nTest: Intentando actualizar parto inexistente ID {nonexistent_id}")
    
    # Intentar actualizar un parto inexistente
    response = requests.patch(url, json=update_data, headers=headers)
    
    # Debería devolver 404 Not Found o 405 Method Not Allowed
    assert response.status_code in [404, 405], f"Se esperaba código 404 o 405, se recibió: {response.status_code} - {response.text}"
    print(f"Respuesta correcta ({response.status_code}) al intentar actualizar un parto inexistente")
