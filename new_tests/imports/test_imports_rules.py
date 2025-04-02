"""
Tests para verificar que la importación respeta las reglas de negocio.
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
ANIMALS_URL = f"{API_URL}/animals"

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
async def test_import_alletar_rules(auth_token):
    """
    Test que verifica que el campo 'alletar' se procese correctamente
    según las reglas de negocio:
    - Machos: siempre tienen alletar="0"
    - Hembras: pueden tener alletar con valores "0", "1", o "2"
    """
    # Crear archivo CSV con diferentes combinaciones de genere/alletar
    test_file_path = "test_alletar_rules.csv"
    test_content = """nom;genere;estado;explotacio;alletar
TestMacho1;M;OK;ExplotacioTest;0
TestMacho2;M;OK;ExplotacioTest;1
TestHembra0;F;OK;ExplotacioTest;0
TestHembra1;F;OK;ExplotacioTest;1
TestHembra2;F;OK;ExplotacioTest;2"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)
    
    try:
        # Preparar cabeceras con token de autenticación
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Ejecutar importación
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_alletar.csv", f, "text/csv")}
            data = {"description": "Test reglas alletar"}
            response = requests.post(
                f"{IMPORTS_URL}/csv",
                files=files,
                data=data,
                headers=headers
            )
        
        # Verificar que la importación fue exitosa
        assert response.status_code == 200
        result = response.json()
        assert result["status"] in ["completed", "completed_err"]
        
        # Verificar que los machos siempre tienen alletar="0" independientemente del valor en CSV
        response = requests.get(f"{ANIMALS_URL}/?nom=TestMacho1", headers=headers)
        assert response.json()["data"]["items"][0]["alletar"] == "0"
        
        response = requests.get(f"{ANIMALS_URL}/?nom=TestMacho2", headers=headers)
        assert response.json()["data"]["items"][0]["alletar"] == "0"
        
        # Verificar que las hembras mantienen sus valores de alletar
        response = requests.get(f"{ANIMALS_URL}/?nom=TestHembra0", headers=headers)
        assert response.json()["data"]["items"][0]["alletar"] == "0"
        
        response = requests.get(f"{ANIMALS_URL}/?nom=TestHembra1", headers=headers)
        assert response.json()["data"]["items"][0]["alletar"] == "1"
        
        response = requests.get(f"{ANIMALS_URL}/?nom=TestHembra2", headers=headers)
        assert response.json()["data"]["items"][0]["alletar"] == "2"
        
    finally:
        # Limpieza
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        
        # Limpiar animales creados
        for name in ["TestMacho1", "TestMacho2", "TestHembra0", "TestHembra1", "TestHembra2"]:
            try:
                response = requests.get(f"{ANIMALS_URL}/?nom={name}", headers=headers)
                animal_id = response.json()["data"]["items"][0]["id"]
                requests.delete(f"{ANIMALS_URL}/{animal_id}", headers=headers)
            except:
                pass

@pytest.mark.asyncio
async def test_import_partos_rules(auth_token):
    """
    Test que verifica que los partos se importen correctamente:
    - Solo los animales hembra (genere="F") pueden tener partos
    - Los datos del parto (part, GenereT, EstadoT) se procesan correctamente
    """
    # Crear archivo CSV con datos de partos
    test_file_path = "test_parto_rules.csv"
    test_content = """nom;genere;estado;explotacio;part;GenereT;EstadoT
TestHembraParto;F;OK;ExplotacioTest;01/01/2023;M;OK
TestMachoParto;M;OK;ExplotacioTest;01/01/2023;F;OK"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)
    
    try:
        # Preparar cabeceras con token de autenticación
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Ejecutar importación
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_parto.csv", f, "text/csv")}
            data = {"description": "Test reglas partos"}
            response = requests.post(
                f"{IMPORTS_URL}/csv",
                files=files,
                data=data,
                headers=headers
            )
        
        # Verificar que la importación fue exitosa
        assert response.status_code == 200
        result = response.json()
        assert result["status"] in ["completed", "completed_err"]
        
        # Verificar que la hembra tiene un parto
        response = requests.get(f"{ANIMALS_URL}/?nom=TestHembraParto", headers=headers)
        assert response.status_code == 200
        hembra = response.json()["data"]["items"][0]
        hembra_id = hembra["id"]
        
        # Obtener los partos de la hembra
        response = requests.get(f"{ANIMALS_URL}/{hembra_id}/partos", headers=headers)
        assert response.status_code == 200
        partos = response.json()
        
        # Verificar que hay al menos un parto
        assert len(partos) > 0
        
        # Verificar datos del parto
        parto = partos[0]
        assert parto["part"] == "01/01/2023"  # Formato DD/MM/YYYY
        assert parto["GenereT"] == "M"
        assert parto["EstadoT"] == "OK"
        
        # Verificar que el macho NO tiene partos
        response = requests.get(f"{ANIMALS_URL}/?nom=TestMachoParto", headers=headers)
        assert response.status_code == 200
        macho = response.json()["data"]["items"][0]
        macho_id = macho["id"]
        
        # Intentar obtener partos del macho
        response = requests.get(f"{ANIMALS_URL}/{macho_id}/partos", headers=headers)
        assert response.status_code == 200
        partos_macho = response.json()
        
        # Verificar que no tiene partos
        assert len(partos_macho) == 0
        
    finally:
        # Limpieza
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        
        # Limpiar animales creados
        headers = {"Authorization": f"Bearer {auth_token}"}
        for name in ["TestHembraParto", "TestMachoParto"]:
            try:
                response = requests.get(f"{ANIMALS_URL}/?nom={name}", headers=headers)
                animal_id = response.json()["data"]["items"][0]["id"]
                requests.delete(f"{ANIMALS_URL}/{animal_id}", headers=headers)
            except:
                pass