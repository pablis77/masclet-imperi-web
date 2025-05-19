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
    
    # Verificar que los campos del CSV están presentes y tienen los valores correctos
    retrieved_animal = data["data"]
    original_animal = animal  # El animal que obtuvimos de la lista
    
    # Verificar campos principales
    assert "nom" in retrieved_animal
    assert retrieved_animal["nom"] == original_animal["nom"], f"Nombre no coincide: {retrieved_animal['nom']} != {original_animal['nom']}"
    
    assert "genere" in retrieved_animal
    assert retrieved_animal["genere"] == original_animal["genere"], f"Género no coincide: {retrieved_animal['genere']} != {original_animal['genere']}"
    
    assert "explotacio" in retrieved_animal
    assert retrieved_animal["explotacio"] == original_animal["explotacio"], f"Explotación no coincide: {retrieved_animal['explotacio']} != {original_animal['explotacio']}"
    
    assert "estado" in retrieved_animal
    assert retrieved_animal["estado"] == original_animal["estado"], f"Estado no coincide: {retrieved_animal['estado']} != {original_animal['estado']}"
    
    assert "alletar" in retrieved_animal
    assert retrieved_animal["alletar"] == original_animal["alletar"], f"Estado de amamantamiento no coincide: {retrieved_animal['alletar']} != {original_animal['alletar']}"
    
    # Verificar campos adicionales según el CSV
    for field in ["mare", "pare", "quadra", "cod", "num_serie", "dob", "part"]:
        assert field in retrieved_animal, f"Campo {field} no encontrado en la respuesta"
        assert retrieved_animal[field] == original_animal[field], f"Campo {field} no coincide: {retrieved_animal[field]} != {original_animal[field]}"
    
    # Verificar campos de metadatos
    assert "created_at" in retrieved_animal
    assert "updated_at" in retrieved_animal
    
    # Imprimir todos los campos para verificar si hay campos adicionales no esperados
    print("\nCampos en la respuesta del animal:")
    for field, value in retrieved_animal.items():
        print(f"  - {field}: {value}")
    
    # Verificar si hay campos en la respuesta que no están en el CSV
    csv_fields = ["id", "nom", "genere", "explotacio", "estado", "alletar", "mare", "pare", "quadra", "cod", "num_serie", "dob", "part", "created_at", "updated_at"]
    extra_fields = [field for field in retrieved_animal.keys() if field not in csv_fields]
    
    if extra_fields:
        print(f"\nCAMPOS ADICIONALES encontrados en la respuesta (no en CSV): {extra_fields}")
    
    print("Test de obtener animal por ID completado con éxito.")
