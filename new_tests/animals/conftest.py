"""
Configuración para pruebas de animales
"""
import pytest
import requests
import os
import json
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# URLs base para las pruebas
API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1")
BASE_URL = f"{API_URL}/animals"
AUTH_URL = f"{API_URL}/auth"

@pytest.fixture
def auth_token():
    """Obtener token de autenticación para las pruebas."""
    credentials = {
        "username": "admin",
        "password": "admin"
    }
    
    response = requests.post(f"{AUTH_URL}/login", json=credentials)
    assert response.status_code == 200, f"Error al autenticar: {response.text}"
    
    data = response.json()
    assert "access_token" in data, "Falta el token de acceso en la respuesta"
    
    return data["access_token"]

@pytest.fixture
def setup_explotacio(auth_token):
    """Configurar explotación para las pruebas."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Verificar si la explotación Gurans ya existe
    response = requests.get(f"{API_URL}/explotacions", headers=headers)
    assert response.status_code == 200, f"Error al obtener explotaciones: {response.text}"
    
    data = response.json()
    explotacions = data.get("data", {}).get("items", [])
    
    gurans_exists = False
    for explotacio in explotacions:
        if explotacio.get("nom") == "Gurans":
            gurans_exists = True
            break
    
    # Si no existe, crearla
    if not gurans_exists:
        explotacio_data = {
            "nom": "Gurans",
            "activa": True,
            "explotaci": "Gurans"
        }
        
        response = requests.post(f"{API_URL}/explotacions", json=explotacio_data, headers=headers)
        assert response.status_code in [200, 201], f"Error al crear explotación: {response.text}"
    
    return "Gurans"
