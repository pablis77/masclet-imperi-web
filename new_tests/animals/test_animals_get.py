"""
Test para obtener un animal por ID
"""
import pytest
import requests
import uuid
import os
import json
import sys
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
        "password": "admin123"
    }
    
    print("\n=== Obteniendo token de autenticación ===")
    response = requests.post(
        f"{AUTH_URL}/login", 
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    print(f"Respuesta de autenticación: {response.status_code}")
    if response.status_code != 200:
        print(f"Error de autenticación: {response.text}")
        
    assert response.status_code == 200, f"Error al autenticar: {response.text}"
    token = response.json()["access_token"]
    print(f"Token obtenido: {token[:10]}...")
    return token

def test_get_animal_by_id(auth_token):
    """Probar obtener un animal por ID."""
    # En lugar de crear un animal, vamos a obtener uno existente de la lista
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print("\n=== Obteniendo lista de animales ===")
    list_response = requests.get(f"{BASE_URL}/", headers=headers)
    assert list_response.status_code == 200, f"Error al listar animales: {list_response.status_code} - {list_response.text}"
    
    # Extraer la lista de animales
    animals_data = list_response.json()
    print(f"Estructura de la respuesta: {list(animals_data.keys())}")
    
    # Verificar que hay animales en la respuesta
    assert "data" in animals_data, "No se encontró la clave 'data' en la respuesta"
    assert "items" in animals_data["data"], "No se encontró la clave 'items' en data"
    assert len(animals_data["data"]["items"]) > 0, "No hay animales en la respuesta"
    
    # Obtener el primer animal de la lista
    animal = animals_data["data"]["items"][0]
    animal_id = animal["id"]
    print(f"Usando animal existente con ID: {animal_id}")
    print(f"Datos del animal: {json.dumps(animal, indent=2)}")
    
    # Obtener el animal por ID
    print(f"\n=== Obteniendo animal por ID ===")
    print(f"URL: {BASE_URL}/{animal_id}")
    get_response = requests.get(f"{BASE_URL}/{animal_id}", headers=headers)
    print(f"Código de respuesta: {get_response.status_code}")
    
    assert get_response.status_code == 200, f"Error al obtener animal: {get_response.status_code} - {get_response.text}"
    
    # Verificar que los datos son correctos
    data = get_response.json()
    print(f"Datos del animal obtenido: {json.dumps(data, indent=2)}")
    
    assert data["status"] == "success"
    assert "data" in data
    assert data["data"]["id"] == animal_id
    
    # Verificar que los campos del CSV están presentes
    retrieved_animal = data["data"]
    assert "nom" in retrieved_animal
    assert "genere" in retrieved_animal
    assert "explotacio" in retrieved_animal
    assert "estado" in retrieved_animal
    assert "alletar" in retrieved_animal
    
    # Verificar campos adicionales según el CSV
    for field in ["mare", "pare", "quadra", "cod", "num_serie", "dob", "part"]:
        assert field in retrieved_animal, f"Campo {field} no encontrado en la respuesta"
    
    print("Test de obtener animal por ID completado con éxito.")
