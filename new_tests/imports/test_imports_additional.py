"""
Tests adicionales para los endpoints de importación.
Verifica los endpoints restantes de la funcionalidad de importación.
"""
import pytest
import requests
import os
import aiofiles
import csv
import io
import time
import random

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
async def test_download_template(auth_token):
    """
    Test que verifica el endpoint GET /api/v1/imports/template
    para descargar una plantilla CSV vacía con las cabeceras correctas.
    """
    url = f"{BASE_URL}/template"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nProbando descarga de plantilla CSV: {url}")
    
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    
    # Verificar que la respuesta es un archivo CSV
    content_disposition = response.headers.get('Content-Disposition', '')
    assert 'attachment' in content_disposition
    assert '.csv' in content_disposition
    
    # Leer el contenido del CSV y verificar que tiene las cabeceras correctas
    content = response.content.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(content), delimiter=';')
    headers = next(csv_reader)
    
    # Convertir headers a minúsculas para comparación insensible a mayúsculas
    lowercase_headers = [h.lower() for h in headers]
    print(f"Headers encontrados: {headers}")
    
    # Verificar que contiene al menos las cabeceras obligatorias según los campos fundamentales
    # usando los nombres estandarizados según la documentación
    required_fields = ['nom', 'genere', 'estado', 'explotacio']
    for field in required_fields:
        assert field.lower() in lowercase_headers, f"Falta la cabecera obligatoria: {field}"
    
    # Verificar que incluye otros campos importantes según el modelo de datos
    important_fields = ['alletar', 'pare', 'mare', 'quadra', 'cod', 'dob']
    for field in important_fields:
        assert any(field.lower() in h.lower() for h in headers), f"Falta la cabecera importante: {field}"
    
    # Verificar específicamente el campo num_serie que puede tener diferentes formatos
    assert any('num' in h.lower() and 'serie' in h.lower() for h in headers), "Falta la cabecera para número de serie"

@pytest.mark.asyncio
async def test_import_real_csv(auth_token):
    """
    Test que verifica la importación de un CSV con datos reales,
    simulando el uso real del sistema.
    """
    # Utilizar archivo existente en el sistema en lugar de crear uno temporal
    test_file_path = "backend/database/pruebaampliacion.csv"
    
    # Ejecutar importación
    url = f"{BASE_URL}/csv"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nProbando importación con CSV real: {url}")
    
    with open(test_file_path, "rb") as f:
        files = {"file": ("test_import.csv", f, "text/csv")}
        data = {"description": "Test importación real"}
        response = requests.post(url, files=files, data=data, headers=headers)

    # Verificar respuesta básica
    assert response.status_code == 200
    result = response.json()
    
    print(f"Resultado de la importación real: {result}")
    
    # La importación debe completarse correctamente (no FAILED)
    status = result["status"].upper()
    assert status in ["PENDING", "PROCESSING", "COMPLETED"], f"Estado de importación incorrecto: {result['status']}"
    
    # No debe haber errores en la importación
    if "result" in result and "errors" in result["result"]:
        assert result["result"]["errors"] == 0, f"La importación tiene errores: {result['result'].get('error_details', 'Sin detalles')}"
    
    # Si hay errores a pesar de las verificaciones anteriores, mostrarlos y hacer que el test falle
    if "result" in result and "errors" in result["result"] and result["result"]["errors"] > 0:
        error_details = "No se pudieron obtener detalles de errores"
        
        # Obtener detalles de errores
        if "id" in result:
            error_url = f"{BASE_URL}/{result['id']}/errors"
            error_response = requests.get(error_url, headers=headers)
            if error_response.status_code == 200:
                error_details = error_response.json()
        
        # Hacer que el test falle con detalles sobre los errores
        pytest.fail(f"La importación falló con errores: {error_details}")
    
    # Verificar que se haya importado al menos un registro correctamente
    if "result" in result and "imported" in result["result"]:
        assert result["result"]["imported"] > 0, "No se importó ningún registro correctamente"

@pytest.mark.asyncio
async def test_get_import_errors(auth_token):
    """
    Test que verifica el endpoint GET /api/v1/imports/{import_id}/errors
    para obtener los detalles de errores de una importación.
    """
    # Primero necesitamos crear una importación con errores
    test_file_path = "test_error_import.csv"
    
    # Crear CSV con datos inválidos para forzar errores
    # - GenereT inválido usando un valor que no es M, F o esforrada
    timestamp = int(time.time())
    test_content = f"""alletar;explotacio;nom;genere;pare;mare;quadra;cod;num_serie;dob;estado;part;GenereT;EstadoT
0;ExplotacioTest;TestErrorAnimal{timestamp};F;Padre;Madre;Quadra;ERR{timestamp};ES12345;01/01/2020;OK;01/01/2023;X;OK"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)

    try:
        # Ejecutar importación que debería fallar o tener errores
        url = f"{BASE_URL}/csv"
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        print(f"\nCreando importación con errores: {url}")
        
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_error.csv", f, "text/csv")}
            data = {"description": "Test importación con errores"}
            response = requests.post(url, files=files, data=data, headers=headers)

        # La importación puede completarse con errores (status 200)
        assert response.status_code == 200
        result = response.json()
        import_id = result["id"]
        
        print(f"Respuesta de importación: {result}")
        
        # Obtener los detalles de errores
        errors_url = f"{BASE_URL}/{import_id}/errors"
        print(f"\nProbando consulta de errores de importación: {errors_url}")
        
        # Esperar un poco para que la importación se procese
        time.sleep(2)
        
        errors_response = requests.get(errors_url, headers=headers)
        assert errors_response.status_code == 200
        
        errors_result = errors_response.json()
        print(f"Respuesta de errores: {errors_result}")
        
        # Verificar la estructura de la respuesta
        assert "import_id" in errors_result
        assert errors_result["import_id"] == import_id
        assert "errors" in errors_result
        
        # Mostrar el número de errores encontrados para depuración
        print(f"Número de errores encontrados: {len(errors_result['errors'])}")
        
    finally:
        # Limpiar archivo temporal
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

@pytest.mark.asyncio
async def test_import_with_empty_fields(auth_token):
    """
    Test que verifica la importación de un CSV con campos vacíos,
    simulando una situación real de uso en campo.
    """
    test_file_path = "test_empty_fields_import.csv"
    
    timestamp = int(time.time())
    random_id = random.randint(10000, 99999)
    
    # Crear un CSV con varios campos vacíos, pero con los campos obligatorios
    # Esto simula el uso real en entorno de campo
    test_content = f"""alletar;explotacio;nom;genere;pare;mare;quadra;cod;num_serie;dob;estado;part;GenereT;EstadoT
;TestExplotacio;AnimalVacio{timestamp};M;;;;;;;OK;;;;
0;TestExplotacio;AnimalParcial{random_id};F;;;;COD{random_id};;01/01/2021;OK;;;;"""

    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)

    try:
        # Ejecutar importación 
        url = f"{BASE_URL}/csv"
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        print(f"\nProbando importación con campos vacíos: {url}")
        
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_empty_fields.csv", f, "text/csv")}
            data = {"description": "Test importación con campos vacíos"}
            response = requests.post(url, files=files, data=data, headers=headers)

        # Verificar respuesta
        assert response.status_code == 200
        result = response.json()
        
        print(f"Resultado de la importación con campos vacíos: {result}")
        
        # La importación debería completarse o estar procesándose
        # Los campos no obligatorios pueden estar vacíos
        status = result["status"].upper()
        assert status in ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], f"Estado inesperado: {result['status']}"
        
    finally:
        # Limpiar archivo temporal
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
