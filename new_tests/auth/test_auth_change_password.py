import pytest
import requests
import uuid

BASE_URL = "http://localhost:8000/api/v1/auth"

@pytest.fixture
def auth_token():
    """Obtiene un token de autenticación del administrador."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        f"{BASE_URL}/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def test_user(auth_token):
    """Crea un usuario de prueba para cambiar su contraseña."""
    # Generar un nombre de usuario único
    username = f"test_user_{uuid.uuid4().hex[:8]}"
    email = f"{username}@test.com"
    
    # Datos del usuario
    user_data = {
        "username": username,
        "email": email,
        "password": "password123",
        "role": "usuario"
    }
    
    # Crear el usuario
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.post(f"{BASE_URL}/signup", json=user_data, headers=headers)
    
    assert response.status_code == 201, f"Error al crear usuario: {response.status_code} - {response.text}"
    
    # Obtener el ID del usuario creado
    user_id = response.json()["id"]
    
    # Devolver los datos necesarios para el test
    yield {
        "id": user_id,
        "username": username,
        "password": "password123"
    }
    
    # Limpiar: eliminar el usuario después del test
    delete_response = requests.delete(f"{BASE_URL}/users/{user_id}", headers=headers)
    assert delete_response.status_code == 204, f"Error al eliminar usuario: {delete_response.status_code} - {delete_response.text}"

@pytest.fixture
def test_user_for_own_password(auth_token):
    """Crea un usuario de prueba específico para el test de cambio de contraseña propio."""
    # Generar un nombre de usuario único
    username = f"test_user_own_{uuid.uuid4().hex[:8]}"
    email = f"{username}@test.com"
    
    # Datos del usuario
    user_data = {
        "username": username,
        "email": email,
        "password": "password123",
        "role": "usuario"
    }
    
    # Crear el usuario
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.post(f"{BASE_URL}/signup", json=user_data, headers=headers)
    
    assert response.status_code == 201, f"Error al crear usuario: {response.status_code} - {response.text}"
    
    # Obtener el ID del usuario creado
    user_id = response.json()["id"]
    
    # Devolver los datos necesarios para el test
    yield {
        "id": user_id,
        "username": username,
        "password": "password123"
    }
    
    # Limpiar: eliminar el usuario después del test
    delete_response = requests.delete(f"{BASE_URL}/users/{user_id}", headers=headers)
    assert delete_response.status_code == 204, f"Error al eliminar usuario: {delete_response.status_code} - {delete_response.text}"

@pytest.mark.asyncio
async def test_change_user_password_by_admin(auth_token, test_user):
    """Test para el endpoint de cambio de contraseña por un administrador."""
    url = f"{BASE_URL}/users/{test_user['id']}/password"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Datos para el cambio de contraseña
    password_data = {
        "new_password": "newpassword456"
    }
    
    print(f"\nProbando cambio de contraseña por administrador: {url}")
    
    try:
        # Realizar la solicitud PATCH para cambiar la contraseña
        response = requests.patch(url, json=password_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta contiene un mensaje de éxito
        assert "message" in data, "La respuesta no contiene el campo 'message'."
        assert "actualizada" in data["message"].lower(), "El mensaje no indica que la contraseña fue actualizada."
        
        print(f"Respuesta: {data['message']}")
        
        # Verificar que podemos iniciar sesión con la nueva contraseña
        login_response = requests.post(
            f"{BASE_URL}/login",
            data={
                "username": test_user["username"],
                "password": "newpassword456"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 200, f"Error al iniciar sesión con la nueva contraseña: {login_response.status_code} - {login_response.text}"
        assert "access_token" in login_response.json(), "No se pudo obtener un token con la nueva contraseña."
        
        print("Verificación de inicio de sesión con nueva contraseña exitosa.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
    
    print("Test de cambio de contraseña por administrador completado con éxito.")

@pytest.mark.asyncio
async def test_change_own_password(auth_token, test_user_for_own_password):
    """Test para el endpoint de cambio de contraseña por el propio usuario."""
    # Primero obtener un token para el usuario de prueba
    login_response = requests.post(
        f"{BASE_URL}/login",
        data={
            "username": test_user_for_own_password["username"],
            "password": "password123"  # Usamos la contraseña original
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert login_response.status_code == 200, f"Error al iniciar sesión: {login_response.status_code} - {login_response.text}"
    user_token = login_response.json()["access_token"]
    
    # URL para cambiar la contraseña
    url = f"{BASE_URL}/users/{test_user_for_own_password['id']}/password"
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Datos para el cambio de contraseña (incluye la contraseña actual)
    password_data = {
        "current_password": "password123",  # Contraseña original
        "new_password": "finalpassword789"
    }
    
    print(f"\nProbando cambio de contraseña por el propio usuario: {url}")
    
    try:
        # Realizar la solicitud PATCH para cambiar la contraseña
        response = requests.patch(url, json=password_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta contiene un mensaje de éxito
        assert "message" in data, "La respuesta no contiene el campo 'message'."
        assert "actualizada" in data["message"].lower(), "El mensaje no indica que la contraseña fue actualizada."
        
        print(f"Respuesta: {data['message']}")
        
        # Verificar que podemos iniciar sesión con la nueva contraseña
        login_response = requests.post(
            f"{BASE_URL}/login",
            data={
                "username": test_user_for_own_password["username"],
                "password": "finalpassword789"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert login_response.status_code == 200, f"Error al iniciar sesión con la nueva contraseña: {login_response.status_code} - {login_response.text}"
        assert "access_token" in login_response.json(), "No se pudo obtener un token con la nueva contraseña."
        
        print("Verificación de inicio de sesión con nueva contraseña exitosa.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
    
    print("Test de cambio de contraseña por el propio usuario completado con éxito.")
