import pytest
import requests

BASE_URL = "http://localhost:8000/api/v1/auth"

@pytest.mark.asyncio
async def test_login():
    """Test para el endpoint de login."""
    url = f"{BASE_URL}/login"
    credentials = {
        "username": "admin",
        "password": "admin123"
    }

    print(f"Probando autenticación con usuario: {credentials['username']}")
    print(f"URL: {url}")

    try:
        # Realizar la solicitud POST al endpoint
        response = requests.post(
            url, 
            data=credentials,  # Usar data en lugar de json
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        print(f"\nCódigo de estado: {response.status_code}")

        if response.status_code == 200:
            token_data = response.json()
            print("Autenticación exitosa!")
            print(f"Token: {token_data.get('access_token')[:20]}...")
            assert "access_token" in token_data, "El token de acceso no está presente en la respuesta."
            assert token_data["token_type"] == "bearer", "El tipo de token no es 'bearer'."
        else:
            print(f"Error de autenticación: {response.status_code}")
            print(f"Respuesta: {response.text}")
            assert False, f"Error: {response.status_code} - {response.text}"

    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

    print("Test de login completado.")

@pytest.fixture
def auth_token():
    """Obtiene un token de autenticación."""
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

@pytest.mark.asyncio
async def test_refresh_token(auth_token):
    """Test para el endpoint de renovación de token."""
    url = f"{BASE_URL}/refresh"
    headers = {"Authorization": f"Bearer {auth_token}"}

    response = requests.post(url, headers=headers)

    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    data = response.json()

    assert "access_token" in data, "El token de acceso no está presente en la respuesta."
    assert data["token_type"] == "bearer", "El tipo de token no es 'bearer'."

    print("Test de renovación de token exitoso.")

@pytest.mark.asyncio
async def test_get_users(auth_token):
    """Test para el endpoint de listado de usuarios."""
    url = f"{BASE_URL}/users"
    headers = {"Authorization": f"Bearer {auth_token}"}

    response = requests.get(url, headers=headers)

    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    data = response.json()

    # Validar estructura de la respuesta
    assert "items" in data, "La respuesta no contiene la clave 'items'."
    assert isinstance(data["items"], list), "La clave 'items' no es una lista de usuarios."
    assert len(data["items"]) > 0, "La lista de usuarios está vacía."

    # Validar contenido de cada usuario
    for user in data["items"]:
        assert "username" in user, "Falta el campo 'username' en un usuario."
        assert "role" in user, "Falta el campo 'role' en un usuario."
        assert "email" in user, "Falta el campo 'email' en un usuario."

    print("Test de listado de usuarios ajustado y exitoso.")

@pytest.mark.asyncio
async def test_delete_user(auth_token):
    """Test para el endpoint de eliminación de usuario."""
    # Crear un usuario de prueba para eliminar
    create_url = f"{BASE_URL}/signup"
    headers = {"Authorization": f"Bearer {auth_token}"}
    new_user = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "password123",
        "role": "usuario"
    }

    create_response = requests.post(create_url, json=new_user, headers=headers)
    assert create_response.status_code == 201, f"Error al crear usuario: {create_response.status_code} - {create_response.text}"

    # Obtener el ID del usuario creado
    user_id = create_response.json()["id"]

    # Eliminar el usuario creado
    delete_url = f"{BASE_URL}/users/{user_id}"
    delete_response = requests.delete(delete_url, headers=headers)

    assert delete_response.status_code == 204, f"Error al eliminar usuario: {delete_response.status_code} - {delete_response.text}"

    # Verificar que el usuario ya no existe
    list_response = requests.get(f"{BASE_URL}/users", headers=headers)
    assert list_response.status_code == 200, f"Error al listar usuarios: {list_response.status_code} - {list_response.text}"
    users = list_response.json()["items"]
    assert not any(user["id"] == user_id for user in users), "El usuario no fue eliminado correctamente."

    print("Test de eliminación de usuario exitoso.")