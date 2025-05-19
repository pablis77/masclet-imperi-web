"""
Tests básicos para los endpoints de importación.
Verifica que los tres endpoints principales funcionen correctamente.
"""
import pytest
import requests
import os
import aiofiles

BASE_URL = "http://localhost:8000/api/v1/imports"
AUTH_URL = "http://localhost:8000/api/v1/auth"

@pytest.fixture
def auth_token():
    """Obtiene un token de autenticación del administrador."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        f"{AUTH_URL}/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_list_imports(auth_token):
    """
    Test que verifica el endpoint GET /api/v1/imports/
    para listar el historial de importaciones.
    """
    url = f"{BASE_URL}/?page=1&size=10"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nProbando listar importaciones: {url}")
    
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    result = response.json()
    
    # Verificar estructura de respuesta
    assert "items" in result
    assert "total" in result
    assert "page" in result
    assert "size" in result
    
    # No verificamos el contenido porque puede estar vacío inicialmente

@pytest.mark.asyncio
async def test_simple_import_csv(auth_token):
    """
    Test que verifica el endpoint POST /api/v1/imports/csv
    para importar datos desde un CSV básico.
    """
    # Crear archivo CSV temporal con datos mínimos válidos
    test_file_path = "test_basic_import.csv"
    test_content = """nom;genere;estado;explotacio
TestAnimal;M;OK;ExplotacioTest"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)

    try:
        # Ejecutar importación
        url = f"{BASE_URL}/csv"
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        print(f"\nProbando importación CSV: {url}")
        
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_basic.csv", f, "text/csv")}
            data = {"description": "Test importación básica"}
            response = requests.post(url, files=files, data=data, headers=headers)

        # Verificar respuesta
        assert response.status_code == 200
        result = response.json()
        
        # Verificar estructura de la respuesta
        assert "id" in result
        assert "file_name" in result
        assert "status" in result
        assert "result" in result
        
        # Obtener ID para el siguiente test
        import_id = result["id"]
        
        return import_id
    finally:
        # Limpiar archivo temporal
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

@pytest.mark.asyncio
async def test_get_import_status(auth_token):
    """
    Test que verifica el endpoint GET /api/v1/imports/{import_id}
    para obtener el estado de una importación específica.
    """
    # Primero realizar una importación para obtener un ID
    test_file_path = "test_status_import.csv"
    test_content = """nom;genere;estado;explotacio
TestStatus;M;OK;ExplotacioTest"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)

    try:
        # Ejecutar importación
        url = f"{BASE_URL}/csv"
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_status.csv", f, "text/csv")}
            data = {"description": "Test estado importación"}
            response = requests.post(url, files=files, data=data, headers=headers)

        assert response.status_code == 200
        import_id = response.json()["id"]
        
        # Consultar el estado de la importación
        status_url = f"{BASE_URL}/{import_id}"
        print(f"\nProbando consulta de estado de importación: {status_url}")
        
        status_response = requests.get(status_url, headers=headers)
        assert status_response.status_code == 200
        
        status_result = status_response.json()
        assert "id" in status_result
        assert status_result["id"] == import_id
        assert "status" in status_result
        
        # La importación debería estar completada o fallida, pero no en procesamiento
        assert status_result["status"] in ["completed", "failed"]
        
    finally:
        # Limpiar archivo temporal
        if os.path.exists(test_file_path):
            os.remove(test_file_path)