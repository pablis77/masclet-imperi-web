import os
import pytest
import requests
import json
from datetime import datetime, timedelta
import re

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
async def test_list_dashboard_partos(test_token):
    """Test para verificar que se pueden listar los partos desde el dashboard."""
    url = f"{BASE_URL}api/v1/dashboard/partos/"

    print(f"\nProbando listar partos para el dashboard: {url}")

    # Realizar la solicitud GET para obtener los partos
    response = requests.get(url, headers=test_token)

    print(f"Código de estado: {response.status_code}")
    print(f"Respuesta: {response.text}")

    # Verificar que la respuesta sea exitosa
    assert response.status_code == 200, f"Error al listar partos: {response.text}"

    # Verificar la estructura de la respuesta
    data = response.json()
    
    # Verificar que es un objeto con las propiedades esperadas
    assert isinstance(data, dict), "La respuesta no es un objeto JSON"
    assert "total" in data, "No se encontró el campo 'total'"
    assert "por_mes" in data, "No se encontró el campo 'por_mes'"
    assert "por_genero_cria" in data, "No se encontró el campo 'por_genero_cria'"
    assert "distribucion_anual" in data, "No se encontró el campo 'distribucion_anual'"
    assert "por_animal" in data, "No se encontró el campo 'por_animal'"
    assert "periodo" in data, "No se encontró el campo 'periodo'"
    
    # Verificar que los valores tienen el tipo correcto
    assert isinstance(data["total"], int), "El total de partos no es un número entero"
    assert isinstance(data["por_mes"], dict), "La distribución por mes no es un objeto"
    assert isinstance(data["por_animal"], list), "Los partos por animal no están en una lista"
        
    print("Test de listado de partos completado con éxito.")




@pytest.mark.asyncio
async def test_dashboard_partos_unauthorized():
    """Test para verificar que el endpoint de partos requiere autenticación."""
    url = f"{BASE_URL}api/v1/dashboard/partos/"
    
    print(f"\nProbando acceso no autorizado a partos: {url}")
    
    # Realizar la solicitud GET sin token
    response = requests.get(url)
    
    print(f"Código de estado: {response.status_code}")
    
    # Verificar que se rechaza el acceso sin autenticación
    assert response.status_code in [401, 403], f"Se esperaba un código 401 o 403, pero se recibió: {response.status_code}"
    
    print("Test de acceso no autorizado completado con éxito.")
