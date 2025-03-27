import pytest
import requests

BASE_URL = "http://localhost:8000/api/v1/auth"

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
async def test_get_current_user_info(auth_token):
    """Test para el endpoint de información del usuario actual."""
    url = f"{BASE_URL}/me"
    headers = {"Authorization": f"Bearer {auth_token}"}

    print(f"\nProbando endpoint de información de usuario: {url}")
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        user_data = response.json()
        
        # Validar estructura de la respuesta
        assert "username" in user_data, "La respuesta no contiene el campo 'username'."
        assert "email" in user_data, "La respuesta no contiene el campo 'email'."
        assert "role" in user_data, "La respuesta no contiene el campo 'role'."
        assert "id" in user_data, "La respuesta no contiene el campo 'id'."
        assert "is_active" in user_data, "La respuesta no contiene el campo 'is_active'."
        
        # Verificar que el usuario es el administrador (según las credenciales usadas)
        assert user_data["username"] == "admin", "El usuario no es 'admin'."
        
        print("Datos del usuario obtenidos correctamente:")
        print(f"- Username: {user_data['username']}")
        print(f"- Email: {user_data['email']}")
        print(f"- Role: {user_data['role']}")
        print(f"- ID: {user_data['id']}")
        print(f"- Active: {user_data['is_active']}")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
    
    print("Test de información de usuario completado con éxito.")
