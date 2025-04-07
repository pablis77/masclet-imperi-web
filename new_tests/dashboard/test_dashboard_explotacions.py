import os
import pytest
import requests
import json

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
async def test_list_dashboard_explotacions(test_token):
    """Test para verificar que se pueden listar las explotaciones desde el dashboard."""
    url = f"{BASE_URL}api/v1/dashboard/explotacions/"

    print(f"\nProbando listar explotaciones para el dashboard: {url}")

    # Realizar la solicitud GET para obtener las explotaciones
    response = requests.get(url, headers=test_token)

    print(f"Código de estado: {response.status_code}")

    # Verificar que la respuesta sea exitosa
    assert response.status_code == 200, f"Error al listar explotaciones: {response.text}"        

    # Verificar la estructura de la respuesta
    data = response.json()
    
    # Verificar que la respuesta es una lista
    assert isinstance(data, list), "La respuesta no es una lista de explotaciones"
    
    # Verificar que hay al menos una explotación
    assert len(data) > 0, "No se encontraron explotaciones"
    
    # Verificar que cada explotación tiene los campos esperados
    for explotacion in data:
        assert "explotacio" in explotacion, "Falta el campo explotacio en la explotación"
        # El campo se llama 'explotacio', no 'explotacion' en la API actual
        # assert "explotacion" in explotacion, "Falta el campo explotacion en la explotación"

@pytest.mark.asyncio
async def test_list_dashboard_explotacions_with_filters(test_token):
    """Test para verificar que se pueden filtrar las explotaciones por diferentes criterios."""  
    # Primero obtenemos todas las explotaciones para usar en las pruebas de filtrado
    all_url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    all_response = requests.get(all_url, headers=test_token)

    assert all_response.status_code == 200, "Error al obtener todas las explotaciones"

    all_data = all_response.json()
    
    # Verificar que la respuesta es una lista
    assert isinstance(all_data, list), "La respuesta no es una lista de explotaciones"
    
    # Verificar que hay al menos una explotación
    assert len(all_data) > 0, "No se encontraron explotaciones"
    
    # Si hay al menos una explotación, probamos el filtro por código de explotación
    if len(all_data) > 0:
        explotacio_codigo = all_data[0]["explotacio"]
        filter_url = f"{BASE_URL}api/v1/dashboard/explotacions/?explotacio={explotacio_codigo}"
        
        print(f"\nProbando filtrar explotaciones por código {explotacio_codigo}: {filter_url}")
        
        filter_response = requests.get(filter_url, headers=test_token)
        
        # Verificar que la respuesta sea exitosa
        assert filter_response.status_code == 200, f"Error al filtrar explotaciones por código: {filter_response.text}"
        
        # Verificar que la respuesta contiene la explotación filtrada
        filter_data = filter_response.json()
        assert isinstance(filter_data, list), "La respuesta filtrada no es una lista"
        
        # Puede que el filtro devuelva la explotación específica o una lista que la contiene
        if len(filter_data) > 0:
            found = False
            for explotacion in filter_data:
                if explotacion["explotacio"] == explotacio_codigo:
                    found = True
                    break
            
            assert found, f"No se encontró la explotación con código {explotacio_codigo} en la respuesta filtrada"

@pytest.mark.asyncio
async def test_list_dashboard_explotacions_unauthorized():
    """Test para verificar que el endpoint requiere autenticación."""
    url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    
    print(f"\nProbando acceso no autorizado a listado de explotaciones: {url}")
    
    # Realizar la solicitud GET sin token
    response = requests.get(url)
    
    print(f"Código de estado: {response.status_code}")
    
    # Verificar que se rechaza el acceso sin autenticación
    assert response.status_code in [401, 403], f"Se esperaba un código 401 o 403, pero se recibió: {response.status_code}"
    
    print("Test de acceso no autorizado completado con éxito.")
