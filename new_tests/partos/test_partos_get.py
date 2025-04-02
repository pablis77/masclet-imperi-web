import pytest
import requests
import uuid
from datetime import datetime

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
    """Crea un animal femenino y un parto de prueba."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Crear un animal femenino
    animal_name = f"Test_Female_{uuid.uuid4().hex[:8]}"
    animal_data = {
        "nom": animal_name,
        "genere": "F",  # Femenino
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "0"  # No amamanta (usar valores numéricos según los estándares)
    }
    
    print(f"\nCreando animal femenino de prueba...")
    
    # Crear el animal
    create_animal_response = requests.post(f"{ANIMALS_URL}/", json=animal_data, headers=headers)
    assert create_animal_response.status_code == 201, f"Error al crear animal: {create_animal_response.status_code} - {create_animal_response.text}"
    
    animal_id = create_animal_response.json()["data"]["id"]
    print(f"Animal femenino creado con ID: {animal_id}")
    
    # Obtener fecha actual en formato DD/MM/YYYY
    today = datetime.now()
    fecha_parto = today.strftime("%d/%m/%Y")
    
    # Datos para crear un parto
    parto_data = {
        "animal_id": animal_id,
        "part": fecha_parto,
        "GenereT": "M",  # Cría masculina
        "EstadoT": "OK",  # Cría en buen estado
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
async def test_get_parto(test_parto):
    """Test para obtener los detalles de un parto específico."""
    parto_id = test_parto["parto_id"]
    animal_id = test_parto["animal_id"]
    headers = test_parto["headers"]
    parto_data = test_parto["parto_data"]
    
    # Usar el endpoint anidado en lugar del endpoint standalone
    base = BASE_URL.split('/api/v1')[0]  # Obtener solo la parte base de la URL (http://localhost:8000)
    url = f"{base}/api/v1/animals/{animal_id}/partos/{parto_id}/"
    
    print(f"\nProbando obtener detalles del parto: {url}")
    
    try:
        # Realizar la solicitud GET para obtener el parto
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"   
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"  
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        parto = data["data"]
        
        # Verificar que los campos del parto son correctos
        assert parto["id"] == parto_id, f"ID de parto incorrecto: {parto['id']} != {parto_id}"   
        assert parto["animal_id"] == parto_data["animal_id"], f"ID de animal incorrecto: {parto['animal_id']} != {parto_data['animal_id']}"
        assert parto["part"] == parto_data["part"], f"Fecha de parto incorrecta: {parto['part']} != {parto_data['part']}"
        assert parto["GenereT"] == parto_data["GenereT"], f"Género de cría incorrecto: {parto['GenereT']} != {parto_data['GenereT']}"
        assert parto["EstadoT"] == parto_data["EstadoT"], f"Estado de cría incorrecto: {parto['EstadoT']} != {parto_data['EstadoT']}"
        assert parto["numero_part"] == parto_data["numero_part"], f"Número de parto incorrecto: {parto['numero_part']} != {parto_data['numero_part']}"
        
        print("Test de obtención de parto completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_get_nonexistent_parto(auth_token):
    """Test para intentar obtener un parto que no existe."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # ID de un animal que existe (usamos un ID conocido)
    animal_id = 446  # ID conocido de un animal
    # ID de un parto que no existe
    nonexistent_id = 99999
    
    # Usar el endpoint anidado
    base = BASE_URL.split('/api/v1')[0]  # Obtener solo la parte base de la URL (http://localhost:8000)
    url = f"{base}/api/v1/animals/{animal_id}/partos/{nonexistent_id}/"
    
    print(f"\nProbando obtener parto inexistente: {url}")
    
    try:
        # Realizar la solicitud GET para un parto que no existe
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 404
        assert response.status_code == 404, f"Se esperaba un error 404, pero se recibió: {response.status_code} - {response.text}"
        
        print(f"Error recibido (esperado): {response.text}")
        print("Test de obtención de parto inexistente completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
