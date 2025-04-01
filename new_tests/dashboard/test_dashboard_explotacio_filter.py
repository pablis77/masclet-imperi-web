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
    explotacions_url = f"{BASE_URL}api/v1/explotacions/"
    response = requests.get(explotacions_url, headers=test_token)
    
    assert response.status_code == 200, f"Error al obtener explotaciones: {response.status_code} - {response.text}"
    
    explotaciones = response.json()
    print(f"Total explotaciones: {len(explotaciones)}")
    
    # Mostrar algunas explotaciones para verificar manualmente
    for e in explotaciones[:3]:  # Mostrar las primeras 3
        print(f"ID: {e.get('id')}, Código: {e.get('explotacio')}, Nombre: {e.get('descripcion')}")
    
    # Verificar estructura de datos según las reglas de negocio
    if explotaciones:
        first_exp = explotaciones[0]
        assert 'id' in first_exp, "Campo 'id' no encontrado"
        assert 'explotacio' in first_exp, "Campo 'explotacio' no encontrado"
        assert 'descripcion' in first_exp, "Campo 'descripcion' no encontrado"
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
    assert 'animals_stats' in resumen, "El resumen no contiene estadísticas de animales"
    
    print("✅ Resumen global obtenido correctamente")

@pytest.mark.asyncio
async def test_filtered_dashboard(test_token):
    """
    Prueba para obtener el dashboard filtrado por explotación.
    """
    # Primero obtenemos las explotaciones
    explotacions_url = f"{BASE_URL}api/v1/explotacions/"
    response = requests.get(explotacions_url, headers=test_token)
    
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para pruebas"
    
    # Probar con la primera explotación
    explotacio_id = explotaciones[0].get('id')
    descripcion = explotaciones[0].get('descripcion')
    
    print(f"\n=== RESUMEN FILTRADO POR EXPLOTACIÓN ID: {explotacio_id} ({descripcion}) ===")
    filtered_url = f"{BASE_URL}api/v1/dashboard/stats?explotacio_id={explotacio_id}"
    filtered_response = requests.get(filtered_url, headers=test_token)
    
    assert filtered_response.status_code == 200, f"Error al obtener resumen filtrado: {filtered_response.status_code} - {filtered_response.text}"
    
    filtered_resumen = filtered_response.json()
    # Verificar estructura mínima esperada
    assert 'animals_stats' in filtered_resumen, "El resumen filtrado no contiene estadísticas de animales"
    
    print("✅ Resumen filtrado obtenido correctamente")
    
    # Si hay más de una explotación, probar también con la última
    if len(explotaciones) > 1:
        last_explotacio_id = explotaciones[-1].get('id')
        last_descripcion = explotaciones[-1].get('descripcion')
        
        print(f"\n=== RESUMEN FILTRADO POR ÚLTIMA EXPLOTACIÓN ID: {last_explotacio_id} ({last_descripcion}) ===")
        last_filtered_url = f"{BASE_URL}api/v1/dashboard/stats?explotacio_id={last_explotacio_id}"
        last_filtered_response = requests.get(last_filtered_url, headers=test_token)
        
        assert last_filtered_response.status_code == 200, f"Error al obtener resumen de última explotación: {last_filtered_response.status_code} - {last_filtered_response.text}"
        
        last_filtered_resumen = last_filtered_response.json()
        # Verificar estructura mínima esperada
        assert 'animals_stats' in last_filtered_resumen, "El resumen de última explotación no contiene estadísticas de animales"
        
        print("✅ Resumen de última explotación obtenido correctamente")

@pytest.mark.asyncio
async def test_combined_dashboard_filter(test_token):
    """
    Prueba para verificar el filtrado en el endpoint combinado.
    """
    # Obtener explotaciones
    explotacions_url = f"{BASE_URL}api/v1/explotacions/"
    response = requests.get(explotacions_url, headers=test_token)
    
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    if not explotaciones:
        pytest.skip("No hay explotaciones disponibles para probar")
    
    # Probar con la primera explotación
    explotacio_id = explotaciones[0].get('id')
    descripcion = explotaciones[0].get('descripcion')
    
    print(f"\n=== DASHBOARD COMBINADO FILTRADO POR EXPLOTACIÓN ID: {explotacio_id} ({descripcion}) ===")
    
    # Usar el endpoint combinado con filtro
    combined_url = f"{BASE_URL}api/v1/dashboard/combined?explotacio_id={explotacio_id}"
    combined_response = requests.get(combined_url, headers=test_token)
    
    assert combined_response.status_code == 200, f"Error al obtener dashboard combinado: {combined_response.status_code} - {combined_response.text}"
    
    combined_data = combined_response.json()
    assert 'summary' in combined_data, "No se encontró 'summary' en el dashboard combinado"
    
    print("✅ Dashboard combinado filtrado obtenido correctamente")
