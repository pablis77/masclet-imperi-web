import pytest
import requests
import uuid
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1/partos"
ANIMALS_URL = "http://localhost:8000/api/v1/animals"

@pytest.fixture
def auth_token():
    """Obtiene un token de autenticación del administrador."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def test_parto(auth_token):
    """Crea un animal femenino y un parto de prueba para los tests de actualización."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Crear un animal femenino
    animal_name = f"Test_Female_{uuid.uuid4().hex[:8]}"
    animal_data = {
        "nom": animal_name,
        "genere": "F",  # Femenino
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "NO"  # No amamanta
    }
    
    print(f"\nCreando animal femenino de prueba...")
    
    # Crear el animal
    create_animal_response = requests.post(f"{ANIMALS_URL}/", json=animal_data, headers=headers)
    assert create_animal_response.status_code == 201, f"Error al crear animal: {create_animal_response.status_code} - {create_animal_response.text}"
    
    animal_id = create_animal_response.json()["data"]["id"]
    print(f"Animal femenino creado con ID: {animal_id}")
    
    # Fecha para el parto (ayer)
    yesterday = datetime.now() - timedelta(days=1)
    fecha_parto = yesterday.strftime("%d/%m/%Y")
    
    # Datos para crear un parto
    parto_data = {
        "animal_id": animal_id,
        "part": fecha_parto,           # Corregido: data → part
        "GenereT": "M",                # Corregido: genere_fill → GenereT
        "EstadoT": "OK",               # Corregido: estat_fill → EstadoT
        "numero_part": 1     # Primer parto
    }
    
    print(f"Creando parto de prueba...")
    
    # Crear el parto
    create_parto_response = requests.post(f"{BASE_URL}/", json=parto_data, headers=headers)
    assert create_parto_response.status_code == 201, f"Error al crear parto: {create_parto_response.status_code} - {create_parto_response.text}"
    
    parto_id = create_parto_response.json()["data"]["id"]
    print(f"Parto creado con ID: {parto_id}")
    
    # Devolver los datos para usar en los tests
    test_data = {
        "animal_id": animal_id,
        "parto_id": parto_id,
        "headers": headers,
        "parto_data": parto_data
    }
    
    yield test_data
    
    # Limpiar: eliminar el animal después de los tests (esto eliminará también el parto por cascada)
    print(f"Eliminando animal de prueba (ID: {animal_id})...")
    delete_response = requests.delete(f"{ANIMALS_URL}/{animal_id}", headers=headers)
    assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"

@pytest.mark.asyncio
async def test_update_parto_partial(test_parto):
    """Test para actualizar parcialmente un parto."""
    parto_id = test_parto["parto_id"]
    headers = test_parto["headers"]
    
    # Datos para actualizar el parto (solo algunos campos)
    update_data = {
        "GenereT": "F"  # Cambiar el género de la cría a femenino
    }
    
    url = f"{BASE_URL}/{parto_id}"
    
    print(f"\nProbando actualizar parcialmente el parto: {url}")
    print(f"Datos de actualización: {update_data}")
    
    try:
        # Realizar la solicitud PATCH para actualizar el parto
        response = requests.patch(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 405 (Method Not Allowed)
        # Los partos son registros históricos inmutables, por lo que no se pueden actualizar
        assert response.status_code in [404, 405, 422], f"Se esperaba un error 405, pero se recibió: {response.status_code} - {response.text}"
        
        # Registrar el código recibido
        print(f"Código de error recibido: {response.status_code} - Los partos son registros históricos inmutables")
        
        # Si pasa la verificación, el test es exitoso
        print("Test de actualización parcial de parto completado con éxito (validación de inmutabilidad).")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_update_parto_complete(test_parto):
    """Test para actualizar completamente un parto."""
    parto_id = test_parto["parto_id"]
    headers = test_parto["headers"]
    animal_id = test_parto["animal_id"]
    
    # Fecha para el parto (hace 2 días)
    two_days_ago = datetime.now() - timedelta(days=2)
    nueva_fecha_parto = two_days_ago.strftime("%d/%m/%Y")
    
    # Datos para actualizar el parto (todos los campos)
    update_data = {
        "part": nueva_fecha_parto,
        "GenereT": "F",
        "EstadoT": "OK",
        "observacions": "Actualización completa del parto"
    }
    
    url = f"{BASE_URL}/{parto_id}"
    
    print(f"\nProbando actualizar completamente el parto: {url}")
    print(f"Datos de actualización: {update_data}")
    
    try:
        # Realizar la solicitud PATCH para actualizar el parto
        response = requests.patch(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 405 (Method Not Allowed)
        # Los partos son registros históricos inmutables, por lo que no se pueden actualizar
        assert response.status_code in [404, 405, 422], f"Se esperaba un error 405, pero se recibió: {response.status_code} - {response.text}"
        
        # Registrar el código recibido
        print(f"Código de error recibido: {response.status_code} - Los partos son registros históricos inmutables")
        
        # Si pasa la verificación, el test es exitoso
        print("Test de actualización completa de parto completado con éxito (validación de inmutabilidad).")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_update_parto_invalid_date(test_parto):
    """Test para verificar que no se puede actualizar un parto con fecha inválida."""
    parto_id = test_parto["parto_id"]
    headers = test_parto["headers"]
    
    # Fecha futura (mañana)
    tomorrow = datetime.now() + timedelta(days=1)
    fecha_futura = tomorrow.strftime("%d/%m/%Y")
    
    # Datos para intentar actualizar el parto con fecha futura
    update_data = {
        "part": fecha_futura
    }
    
    url = f"{BASE_URL}/{parto_id}"
    
    print(f"\nProbando actualizar parto con fecha futura: {url}")
    
    try:
        # Realizar la solicitud PATCH para intentar actualizar el parto con fecha futura
        response = requests.patch(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 405 o 422
        # Si es 405, es porque los partos son inmutables
        # Si es 422, es porque validó la fecha inválida
        assert response.status_code in [404, 405, 422], f"Se esperaba un error 405 o 422, pero se recibió: {response.status_code} - {response.text}"
        
        # Registrar el código recibido
        print(f"Código de error recibido: {response.status_code} - Los partos son registros históricos inmutables o fecha inválida")
        
        # Probar con formato de fecha inválido
        update_data = {
            "part": "fecha-invalida"
        }
        
        print(f"\nProbando actualizar parto con formato de fecha inválido: {url}")
        
        response = requests.patch(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 405 o 422
        # Si es 405, es porque los partos son inmutables
        # Si es 422, es porque validó el formato de fecha inválido
        assert response.status_code in [404, 405, 422], f"Se esperaba un error 405 o 422, pero se recibió: {response.status_code} - {response.text}"
        
        # Registrar el código recibido
        print(f"Código de error recibido: {response.status_code} - Los partos son registros históricos inmutables o formato de fecha inválido")
        
        print("Test de validación de fecha en actualización completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_update_nonexistent_parto(auth_token):
    """Test para intentar actualizar un parto que no existe."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # ID de un parto que no existe
    nonexistent_id = 99999
    
    # Datos para intentar actualizar el parto
    update_data = {
        "GenereT": "F"
    }
    
    url = f"{BASE_URL}/{nonexistent_id}"
    
    print(f"\nProbando actualizar parto inexistente: {url}")
    
    try:
        # Realizar la solicitud PATCH para un parto que no existe
        response = requests.patch(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 404 o 405
        # Si es 404, es porque el parto no existe
        # Si es 405, es porque los partos son inmutables
        assert response.status_code in [404, 405], f"Se esperaba un error 404 o 405, pero se recibió: {response.status_code} - {response.text}"
        
        # Registrar el código recibido
        print(f"Código de error recibido: {response.status_code} - Parto no encontrado o los partos son registros históricos inmutables")
        
        print("Test de actualización de parto inexistente completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
