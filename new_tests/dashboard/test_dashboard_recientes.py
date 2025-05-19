import os
import pytest
import requests
import json
from datetime import datetime

# Configuraciones base para las pruebas
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
if not BASE_URL.endswith("/"):
    BASE_URL += "/"

@pytest.fixture
def test_token():
    """Fixture para obtener un token de autenticación."""
    url = f"{BASE_URL}api/v1/auth/login"
    data = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(url, data=data)
    assert response.status_code == 200, f"Error al obtener token: {response.text}"
    
    token_data = response.json()
    assert "access_token" in token_data, "No se encontró el token de acceso en la respuesta"
    
    return {
        "Authorization": f"Bearer {token_data['access_token']}"
    }

@pytest.mark.asyncio
async def test_get_dashboard_recent_activity(test_token):
    """Test para verificar que se puede obtener la actividad reciente."""
    url = f"{BASE_URL}api/v1/dashboard/recientes/"

    print(f"\nProbando obtener actividad reciente: {url}")

    # Realizar la solicitud GET para obtener la actividad reciente
    response = requests.get(url, headers=test_token)

    print(f"Código de estado: {response.status_code}")
    print(f"Respuesta: {response.text}")

    # Verificar que la respuesta sea exitosa
    assert response.status_code == 200, f"Error al obtener actividad reciente: {response.text}"  

    # Verificar la estructura de la respuesta
    data = response.json()
    assert "recientes" in data, "La respuesta no contiene el campo 'recientes'"
    
    recientes = data["recientes"]
    assert isinstance(recientes, dict), "El campo 'recientes' no es un objeto"
    
    # Verificar campos esperados en el objeto recientes
    assert "animales" in recientes, "Falta el campo 'animales' en la respuesta"
    assert "partos" in recientes, "Falta el campo 'partos' en la respuesta"
    assert "periodo_dias" in recientes, "Falta el campo 'periodo_dias' en la respuesta"
    
    # Verificar que los campos numéricos son valores enteros positivos
    assert isinstance(recientes["animales"], int), "El campo 'animales' no es un entero"
    assert isinstance(recientes["partos"], int), "El campo 'partos' no es un entero"
    assert isinstance(recientes["periodo_dias"], int), "El campo 'periodo_dias' no es un entero"
    
    assert recientes["periodo_dias"] > 0, "El período de días debe ser positivo"
    
    print("Test de actividad reciente completado con éxito.")

@pytest.mark.asyncio
async def test_get_dashboard_recent_activity_with_limit(test_token):
    """Test para verificar que se puede limitar la cantidad de elementos de actividad reciente."""
    limit = 5
    url = f"{BASE_URL}api/v1/dashboard/recientes/?limit={limit}"

    print(f"\nProbando obtener actividad reciente con límite {limit}: {url}")

    # Realizar la solicitud GET para obtener la actividad reciente limitada
    response = requests.get(url, headers=test_token)

    print(f"Código de estado: {response.status_code}")

    # Verificar que la respuesta sea exitosa
    assert response.status_code == 200, f"Error al obtener actividad reciente limitada: {response.text}"

    # Verificar la estructura de la respuesta
    data = response.json()
    assert "recientes" in data, "La respuesta no contiene el campo 'recientes'"
    
    recientes = data["recientes"]
    assert isinstance(recientes, dict), "El campo 'recientes' no es un objeto"
    
    # Verificar campos esperados en el objeto recientes (igual que el test anterior)
    assert "animales" in recientes, "Falta el campo 'animales' en la respuesta"
    assert "partos" in recientes, "Falta el campo 'partos' en la respuesta"
    assert "periodo_dias" in recientes, "Falta el campo 'periodo_dias' en la respuesta"
    
    print("Test de actividad reciente con límite completado con éxito.")

@pytest.mark.asyncio
async def test_get_dashboard_recent_activity_with_type_filter(test_token):
    """Test para verificar que se puede filtrar la actividad reciente por tipo."""
    # Probamos filtrar por tipo de actividad "parto_registered"
    activity_type = "parto_registered"
    url = f"{BASE_URL}api/v1/dashboard/recientes/?type={activity_type}"

    print(f"\nProbando obtener actividad reciente filtrada por tipo '{activity_type}': {url}")   

    # Realizar la solicitud GET para obtener la actividad reciente filtrada
    response = requests.get(url, headers=test_token)

    print(f"Código de estado: {response.status_code}")

    # Verificar que la respuesta sea exitosa
    assert response.status_code == 200, f"Error al obtener actividad reciente filtrada: {response.text}"

    # Verificar la estructura de la respuesta
    data = response.json()
    assert "recientes" in data, "La respuesta no contiene el campo 'recientes'"
    
    recientes = data["recientes"]
    assert isinstance(recientes, dict), "El campo 'recientes' no es un objeto"
    
    # Verificar campos esperados en el objeto recientes (igual que el test anterior)
    assert "animales" in recientes, "Falta el campo 'animales' en la respuesta"
    assert "partos" in recientes, "Falta el campo 'partos' en la respuesta"
    assert "periodo_dias" in recientes, "Falta el campo 'periodo_dias' en la respuesta"
    
    print("Test de actividad reciente filtrada por tipo completado con éxito.")

@pytest.mark.asyncio
async def test_get_dashboard_recent_activity_unauthorized():
    """Test para verificar que el endpoint requiere autenticación."""
    url = f"{BASE_URL}api/v1/dashboard/recientes/"

    print(f"\nProbando acceso no autorizado a actividad reciente: {url}")

    # Realizar la solicitud GET sin token
    response = requests.get(url)

    print(f"Código de estado: {response.status_code}")

    # Verificar que se rechaza el acceso sin autenticación
    assert response.status_code in [401, 403], f"Se esperaba un código 401 o 403, pero se recibió: {response.status_code}"
    
    print("Test de acceso no autorizado completado con éxito.")
