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