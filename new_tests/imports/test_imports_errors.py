"""
Tests para verificar el manejo de errores en la importación.
"""
import pytest
import os
import requests
import aiofiles
import uuid

# URLs base para las pruebas
API_URL = "http://localhost:8000/api/v1"
IMPORTS_URL = f"{API_URL}/imports"
AUTH_URL = f"{API_URL}/auth"

@pytest.fixture
def auth_token():
    """Obtener token de autenticación para las pruebas."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = requests.post(f"{AUTH_URL}/login", data=credentials)
    assert response.status_code == 200, f"Error al autenticar: {response.text}"
    
    data = response.json()
    assert "access_token" in data, "Falta el token de acceso en la respuesta"
    
    return data["access_token"]

@pytest.mark.asyncio
async def test_import_invalid_csv(auth_token):
    """
    Test que verifica el manejo de un CSV inválido o con formato incorrecto.
    """
    # Crear archivo CSV con formato incorrecto
    test_file_path = "test_invalid.csv"
    test_content = """esta,no,es,una,cabecera,válida
esto,no,son,datos,válidos,tampoco"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)
    
    try:
        # Preparar cabeceras con token de autenticación
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Ejecutar importación
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_invalid.csv", f, "text/csv")}
            data = {"description": "Test CSV inválido"}
            response = requests.post(
                f"{IMPORTS_URL}/csv",
                files=files,
                data=data,
                headers=headers
            )
        
        # Verificar que se identifica el error pero no falla la importación
        assert response.status_code == 200
        result = response.json()
        assert result["status"] in ["completed", "completed_err"]
        assert result["result"]["errors"] > 0
        
    finally:
        # Limpieza
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

@pytest.mark.asyncio
async def test_import_missing_required_fields(auth_token):
    """
    Test que verifica el manejo de CSV con campos obligatorios faltantes.
    """
    # Crear archivo CSV sin campos obligatorios
    test_file_path = "test_missing_fields.csv"
    test_content = """alletar;mare;pare;quadra
0;MadreTest;PadreTest;CuadraTest"""  # Faltan nom, genere, estado, explotacio

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)
    
    try:
        # Preparar cabeceras con token de autenticación
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Ejecutar importación
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_missing_fields.csv", f, "text/csv")}
            data = {"description": "Test campos faltantes"}
            response = requests.post(
                f"{IMPORTS_URL}/csv",
                files=files,
                data=data,
                headers=headers
            )
        
        # Verificar que se identifican los errores
        assert response.status_code == 200
        result = response.json()
        assert result["status"] in ["completed", "completed_err"]
        assert result["result"]["errors"] > 0
        assert result["result"]["success"] == 0
        
        # Verificar que los detalles de error incluyen información sobre campos faltantes
        assert any("obligatorio" in str(error).lower() for error in result["result"]["error_details"])
        
    finally:
        # Limpieza
        if os.path.exists(test_file_path):
            os.remove(test_file_path)