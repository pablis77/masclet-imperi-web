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
        "data": fecha_parto,
        "genere_fill": "M",  # Cría masculina
        "estat_fill": "OK",  # Cría en buen estado
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
        "genere_fill": "F",  # Cambiar a cría femenina
        "estat_fill": "DEF"  # Cambiar a cría fallecida
    }
    
    url = f"{BASE_URL}/{parto_id}"
    
    print(f"\nProbando actualizar parcialmente el parto: {url}")
    print(f"Datos de actualización: {update_data}")
    
    try:
        # Realizar la solicitud PUT para actualizar el parto
        response = requests.put(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        parto = data["data"]
        
        # Verificar que los campos actualizados tienen los nuevos valores
        assert parto["genere_fill"] == update_data["genere_fill"], f"Género de cría no actualizado: {parto['genere_fill']} != {update_data['genere_fill']}"
        assert parto["estat_fill"] == update_data["estat_fill"], f"Estado de cría no actualizado: {parto['estat_fill']} != {update_data['estat_fill']}"
        
        # Verificar que los campos no actualizados mantienen sus valores originales
        assert parto["data"] == test_parto["parto_data"]["data"], f"Fecha de parto modificada: {parto['data']} != {test_parto['parto_data']['data']}"
        assert parto["numero_part"] == test_parto["parto_data"]["numero_part"], f"Número de parto modificado: {parto['numero_part']} != {test_parto['parto_data']['numero_part']}"
        
        print("Test de actualización parcial de parto completado con éxito.")
        
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
    nueva_fecha = two_days_ago.strftime("%d/%m/%Y")
    
    # Datos para actualizar el parto (todos los campos)
    update_data = {
        "data": nueva_fecha,
        "genere_fill": "F",  # Cambiar a cría femenina
        "estat_fill": "OK",  # Mantener cría en buen estado
        "numero_part": 2     # Cambiar a segundo parto
    }
    
    url = f"{BASE_URL}/{parto_id}"
    
    print(f"\nProbando actualizar completamente el parto: {url}")
    print(f"Datos de actualización: {update_data}")
    
    try:
        # Realizar la solicitud PUT para actualizar el parto
        response = requests.put(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        parto = data["data"]
        
        # Verificar que todos los campos se han actualizado correctamente
        assert parto["data"] == update_data["data"], f"Fecha de parto no actualizada: {parto['data']} != {update_data['data']}"
        assert parto["genere_fill"] == update_data["genere_fill"], f"Género de cría no actualizado: {parto['genere_fill']} != {update_data['genere_fill']}"
        assert parto["estat_fill"] == update_data["estat_fill"], f"Estado de cría no actualizado: {parto['estat_fill']} != {update_data['estat_fill']}"
        assert parto["numero_part"] == update_data["numero_part"], f"Número de parto no actualizado: {parto['numero_part']} != {update_data['numero_part']}"
        
        # Verificar que el animal_id no ha cambiado
        assert parto["animal_id"] == animal_id, f"ID de animal modificado: {parto['animal_id']} != {animal_id}"
        
        print("Test de actualización completa de parto completado con éxito.")
        
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
        "data": fecha_futura
    }
    
    url = f"{BASE_URL}/{parto_id}"
    
    print(f"\nProbando actualizar parto con fecha futura: {url}")
    
    try:
        # Realizar la solicitud PUT para intentar actualizar el parto con fecha futura
        response = requests.put(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 422 (Unprocessable Entity)
        assert response.status_code == 422, f"Se esperaba un error 422, pero se recibió: {response.status_code} - {response.text}"
        
        # Verificar que el mensaje de error es el esperado
        assert "La fecha del parto no puede ser futura" in response.text, f"Mensaje de error incorrecto: {response.text}"
        
        print(f"Error recibido (esperado): {response.text}")
        
        # Probar con formato de fecha inválido
        update_data = {
            "data": "fecha-invalida"
        }
        
        print(f"\nProbando actualizar parto con formato de fecha inválido: {url}")
        
        response = requests.put(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 422 (Unprocessable Entity)
        assert response.status_code == 422, f"Se esperaba un error 422, pero se recibió: {response.status_code} - {response.text}"
        
        # Verificar que el mensaje de error es el esperado
        assert "formato de fecha" in response.text.lower(), f"Mensaje de error incorrecto: {response.text}"
        
        print(f"Error recibido (esperado): {response.text}")
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
        "genere_fill": "F"
    }
    
    url = f"{BASE_URL}/{nonexistent_id}"
    
    print(f"\nProbando actualizar parto inexistente: {url}")
    
    try:
        # Realizar la solicitud PUT para un parto que no existe
        response = requests.put(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 404
        assert response.status_code == 404, f"Se esperaba un error 404, pero se recibió: {response.status_code} - {response.text}"
        
        print(f"Error recibido (esperado): {response.text}")
        print("Test de actualización de parto inexistente completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
