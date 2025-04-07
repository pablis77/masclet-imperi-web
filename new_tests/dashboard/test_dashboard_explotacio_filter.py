import os
import pytest
import requests
import json
from datetime import datetime

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
async def test_list_explotaciones(test_token):
    """
    Prueba para listar explotaciones disponibles y verificar la estructura correcta.
    """
    print("\n=== EXPLOTACIONES DISPONIBLES ===")
    explotacions_url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    response = requests.get(explotacions_url, headers=test_token)
    
    assert response.status_code == 200, f"Error al obtener explotaciones: {response.status_code} - {response.text}"
    
    explotaciones = response.json()
    print(f"Total explotaciones: {len(explotaciones)}")
    
    # Mostrar algunas explotaciones para verificar manualmente
    for e in explotaciones[:3]:  # Mostrar las primeras 3
        print(f"Código: {e.get('explotacio')}")
    
    # Verificar estructura de datos según las reglas de negocio
    if explotaciones:
        first_exp = explotaciones[0]
        assert 'explotacio' in first_exp, "Campo 'explotacio' no encontrado"
        # El campo se llama 'explotacio', no 'explotacion' en la API actual
        # assert 'explotacion' in first_exp, "Campo 'explotacion' no encontrado"
        assert 'nom' not in first_exp, "Campo 'nom' encontrado (no debería estar en explotaciones)"

@pytest.mark.asyncio
async def test_global_dashboard(test_token):
    """
    Prueba para obtener el resumen global del dashboard.
    """
    print("\n=== RESUMEN GLOBAL ===")
    resumen_url = f"{BASE_URL}api/v1/dashboard/stats"
    response = requests.get(resumen_url, headers=test_token)
    
    assert response.status_code == 200, f"Error al obtener resumen global: {response.status_code} - {response.text}"
    
    resumen = response.json()
    # Verificar estructura mínima esperada
    assert 'animales' in resumen, "El resumen no contiene estadísticas de animales"
    
    print("✅ Resumen global obtenido correctamente")

@pytest.mark.asyncio
async def test_filtered_dashboard(test_token):
    """
    Prueba para obtener el dashboard filtrado por explotación.
    """
    # Obtener lista de explotaciones para usar un código real
    explotacions_url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    exp_response = requests.get(explotacions_url, headers=test_token)
    assert exp_response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = exp_response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Extraer código de explotación
    explotacio_value = explotaciones[0]['explotacio']
    
    # Endpoint para estadísticas por explotación
    dashboard_url = f"{BASE_URL}api/v1/dashboard/explotacions/{explotacio_value}/stats"
    response = requests.get(dashboard_url, headers=test_token)
    
    assert response.status_code == 200, f"Error al obtener resumen filtrado: {response.status_code} - {response.text}"
    
    data = response.json()
    # Verificar estructura mínima esperada
    assert 'animales' in data, "El resumen filtrado no contiene estadísticas de animales"
    # Verificar que los datos estén filtrados por la explotación correcta
    assert 'explotacio' in data, "Código de explotación no encontrado"
    assert data['explotacio'] == explotacio_value, f"Código incorrecto: {data['explotacio']} != {explotacio_value}"
    
    print("✅ Resumen filtrado obtenido correctamente")
    
    # Si hay más de una explotación, probar también con la última
    if len(explotaciones) > 1:
        last_explotacio = explotaciones[-1].get('explotacio')
        last_descripcion = last_explotacio
        
        print(f"\n=== RESUMEN FILTRADO POR ÚLTIMA EXPLOTACIÓN: {last_explotacio} ({last_descripcion}) ===")
        last_filtered_url = f"{BASE_URL}api/v1/dashboard/stats?explotacio={last_explotacio}"
        last_filtered_response = requests.get(last_filtered_url, headers=test_token)
        
        assert last_filtered_response.status_code == 200, f"Error al obtener resumen de última explotación: {last_filtered_response.status_code} - {last_filtered_response.text}"
        
        last_filtered_resumen = last_filtered_response.json()
        # Verificar estructura mínima esperada
        assert 'animales' in last_filtered_resumen, "El resumen de última explotación no contiene estadísticas de animales"
        
        print("✅ Resumen de última explotación obtenido correctamente")

@pytest.mark.asyncio
async def test_combined_dashboard_filter(test_token):
    """
    Prueba para verificar el filtrado en el endpoint combinado.
    """
    # Obtener lista de explotaciones para usar un código real
    explotacions_url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    exp_response = requests.get(explotacions_url, headers=test_token)
    assert exp_response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = exp_response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Extraer código de explotación
    explotacio_value = explotaciones[0]['explotacio']
    
    print(f"\n=== DASHBOARD COMBINADO FILTRADO POR EXPLOTACIÓN: {explotacio_value} ===")
    combined_url = f"{BASE_URL}api/v1/dashboard/combined?explotacio={explotacio_value}"
    combined_response = requests.get(combined_url, headers=test_token)
    
    assert combined_response.status_code == 200, f"Error al obtener dashboard combinado: {combined_response.status_code} - {combined_response.text}"
    
    combined_data = combined_response.json()
    assert 'animales' in combined_data, "No se encontró 'animales' en el dashboard combinado"
    assert 'partos' in combined_data, "No se encontró 'partos' en el dashboard combinado"
    assert 'explotacio' in combined_data, "No se encontró 'explotacio' en el dashboard combinado"
    
    print("✅ Dashboard combinado filtrado obtenido correctamente")
