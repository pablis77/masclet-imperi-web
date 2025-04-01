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
async def test_explotacio_fields_nomenclature(test_token):
    """
    Prueba para verificar la nomenclatura correcta de campos en el modelo de explotación.
    
    IMPORTANTE: Reglas de nomenclatura en el sistema:
    - 'descripcion' es el nombre de la explotación (distinto del campo 'explotacio')
    - 'explotacio' es un identificador/código de explotación (puede ser null)
    - 'id' es un campo técnico generado automáticamente por la base de datos
    - 'nom' NO debe usarse en explotaciones, solo en animales
    """
    url = f"{BASE_URL}api/v1/explotacions/"
    
    print(f"\n=== VERIFICACIÓN DE NOMENCLATURA DE CAMPOS ===")
    print(f"Obteniendo lista de explotaciones: {url}")
    
    response = requests.get(url, headers=test_token)
    assert response.status_code == 200, f"Error al obtener explotaciones: {response.status_code} - {response.text}"
    
    explotaciones = response.json()
    print(f"Total explotaciones: {len(explotaciones)}")
    
    # Verificar el primer registro para comprobar los nombres de campo
    assert len(explotaciones) > 0, "No hay explotaciones para verificar"
    
    first_exp = explotaciones[0]
    print("\nVerificando nombres de campos en la respuesta de explotaciones:")
    print(f"Campos presentes: {', '.join(first_exp.keys())}")
    
    # Verificar los campos según la estructura correcta
    assert 'descripcion' in first_exp, "El campo 'descripcion' no está presente en el modelo de explotación"
    assert 'explotacio' in first_exp, "El campo 'explotacio' no está presente en el modelo de explotación"
    assert 'id' in first_exp, "El campo 'id' no está presente en el modelo de explotación"
    assert 'nom' not in first_exp, "El campo 'nom' está presente en el modelo de explotación y debería usarse solo para animales"
    
    print("✅ Verificación de campos exitosa: 'descripcion', 'explotacio' e 'id' están presentes y 'nom' no lo está")

@pytest.mark.asyncio
async def test_explotacio_stats_endpoint(test_token):
    """
    Prueba para verificar que las estadísticas de explotación funcionan correctamente.
    Utiliza el primer ID de explotación disponible para obtener sus estadísticas.
    """
    # Primero obtenemos una explotación para usar su ID
    url_explotacions = f"{BASE_URL}api/v1/explotacions/"
    response = requests.get(url_explotacions, headers=test_token)
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Usar el ID del primer elemento
    explotacio_id = explotaciones[0]['id']
    print(f"\n=== PRUEBA DE ENDPOINT DE ESTADÍSTICAS ===")
    print(f"Probando estadísticas para explotación con ID: {explotacio_id}")
    
    # Utilizamos la ruta correcta de los endpoints existentes
    stats_url = f"{BASE_URL}api/v1/dashboard/stats?explotacio_id={explotacio_id}"
    stats_response = requests.get(stats_url, headers=test_token)
    
    assert stats_response.status_code == 200, f"Error al obtener estadísticas: {stats_response.status_code} - {stats_response.text}"
    
    stats = stats_response.json()
    print(f"Estadísticas recibidas correctamente")
    
    # Verificar que las estadísticas contienen información básica
    assert 'animals_stats' in stats, "No se encontró 'animals_stats' en las estadísticas"
    
    print("✅ Prueba de endpoint de estadísticas completada exitosamente")

@pytest.mark.asyncio
async def test_combined_dashboard_with_explotacio(test_token):
    """
    Prueba para verificar que el endpoint combinado funciona con filtro de explotación.
    """
    # Primero obtenemos una explotación para usar su ID
    url_explotacions = f"{BASE_URL}api/v1/explotacions/"
    response = requests.get(url_explotacions, headers=test_token)
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Usar el ID del primer elemento
    explotacio_id = explotaciones[0]['id']
    print(f"\n=== PRUEBA DE ENDPOINT COMBINADO ===")
    print(f"Obteniendo dashboard combinado para explotación con ID: {explotacio_id}")
    
    combined_url = f"{BASE_URL}api/v1/dashboard/combined?explotacio_id={explotacio_id}"
    combined_response = requests.get(combined_url, headers=test_token)
    
    assert combined_response.status_code == 200, f"Error al obtener dashboard combinado: {combined_response.status_code} - {combined_response.text}"
    
    combined_data = combined_response.json()
    print(f"Dashboard combinado recibido correctamente")
    
    # Verificar estructura básica
    assert 'summary' in combined_data, "No se encontró 'summary' en el dashboard combinado"
    
    print("✅ Prueba de dashboard combinado completada exitosamente")
