import pytest
import requests
import uuid

BASE_URL = "http://localhost:8000/api/v1/animals"

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

@pytest.mark.asyncio
async def test_delete_animal(auth_token):
    """Test para eliminar un animal."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Crear un animal de prueba para eliminar
    animal_name = f"Test_Delete_{uuid.uuid4().hex[:8]}"
    animal_data = {
        "nom": animal_name,
        "genere": "M",
        "explotacio": "Gurans",
        "estado": "OK"
    }
    
    print(f"\nCreando animal de prueba para eliminar...")
    
    # Crear el animal
    create_response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
    assert create_response.status_code == 201, f"Error al crear animal: {create_response.status_code} - {create_response.text}"
    
    animal_id = create_response.json()["data"]["id"]
    url = f"{BASE_URL}/{animal_id}"
    
    print(f"Animal creado con ID: {animal_id}")
    print(f"Probando eliminar animal: {url}")
    
    try:
        # Verificar que el animal existe antes de eliminarlo
        get_response = requests.get(url, headers=headers)
        assert get_response.status_code == 200, f"El animal no existe antes de eliminarlo: {get_response.status_code} - {get_response.text}"
        
        # Realizar la solicitud DELETE para eliminar el animal
        delete_response = requests.delete(url, headers=headers)
        
        print(f"Código de estado de eliminación: {delete_response.status_code}")
        
        assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"
        
        # Verificar que el animal ya no existe
        get_after_delete = requests.get(url, headers=headers)
        assert get_after_delete.status_code == 404, f"El animal sigue existiendo después de eliminarlo: {get_after_delete.status_code} - {get_after_delete.text}"
        
        print("Test de eliminar animal completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_delete_nonexistent_animal(auth_token):
    """Test para intentar eliminar un animal que no existe."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # ID de un animal que no existe
    nonexistent_id = 99999
    url = f"{BASE_URL}/{nonexistent_id}"
    
    print(f"\nProbando eliminar animal inexistente: {url}")
    
    try:
        # Realizar la solicitud DELETE para un animal que no existe
        response = requests.delete(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        # Verificar que la solicitud falla con código 404
        assert response.status_code == 404, f"Se esperaba un error 404, pero se recibió: {response.status_code} - {response.text}"
        
        print(f"Error recibido (esperado): {response.text}")
        print("Test de eliminar animal inexistente completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
