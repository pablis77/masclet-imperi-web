import os
import pytest
import requests
import json
from datetime import datetime, timedelta

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
async def test_get_dashboard_resumen(test_token):
    """Test para verificar que se puede obtener el resumen del dashboard."""
    url = f"{BASE_URL}api/v1/dashboard/resumen/"

    print(f"\nProbando obtener resumen del dashboard: {url}")

    # Realizar la solicitud GET para obtener el resumen
    response = requests.get(url, headers=test_token)

    print(f"Código de estado: {response.status_code}")
    print(f"Respuesta: {response.text}")

    # Verificar que la respuesta sea exitosa
    assert response.status_code == 200, f"Error al obtener resumen: {response.text}"

    # Verificar la estructura de la respuesta
    data = response.json()
    
    # Verificar que la respuesta contiene los campos esperados para resumen
    assert "total_animales" in data, "No se encontró el campo 'total_animales'"
    assert "total_terneros" in data, "No se encontró el campo 'total_terneros'"
    assert "total_partos" in data, "No se encontró el campo 'total_partos'"
    assert "periodo" in data, "No se encontró el campo 'periodo'"
    
    # Verificar que los valores principales son enteros positivos
    assert isinstance(data["total_animales"], int), "El total de animales no es un entero"
    assert data["total_animales"] >= 0, "El total de animales es negativo"
    
    # Verificar los terneros
    assert isinstance(data["total_terneros"], int), "El total de terneros no es un entero"
    assert data["total_terneros"] >= 0, "El total de terneros es negativo"
    
    # Verificar los partos
    assert isinstance(data["total_partos"], int), "El total de partos no es un entero"
    assert data["total_partos"] >= 0, "El total de partos es negativo"
    
    # Verificar que existe el ratio de partos por animal
    assert "ratio_partos_animal" in data, "No se encontró el campo 'ratio_partos_animal'"
    
    # Verificar que existe el campo de tendencias
    assert "tendencias" in data, "No se encontró el campo 'tendencias'"
    
    print("Test de resumen completado con éxito.")

@pytest.mark.asyncio
async def test_get_dashboard_resumen_with_filter(test_token):
    """Test para verificar que se puede filtrar el resumen del dashboard por explotación."""
    # Primero obtenemos una lista de explotaciones para usar un ID válido
    explot_url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    explot_response = requests.get(explot_url, headers=test_token)
    
    assert explot_response.status_code == 200, f"Error al obtener lista de explotaciones: {explot_response.text}"
    
    explotacions = explot_response.json()
    
    # Si no hay explotaciones, omitimos la prueba de filtrado
    if len(explotacions) == 0:
        print("No hay explotaciones disponibles para probar filtros")
        return
    
    # Tomamos el valor de explotacio de la primera explotación
    explotacio = explotacions[0]["explotacio"]
    
    # Probamos el endpoint con filtro por explotación
    filter_url = f"{BASE_URL}api/v1/dashboard/resumen/?explotacio={explotacio}"
    
    print(f"\nProbando obtener resumen filtrado por explotación: {explotacio}: {filter_url}")
    
    filter_response = requests.get(filter_url, headers=test_token)
    
    print(f"Código de estado: {filter_response.status_code}")
    
    # Verificar que la respuesta sea exitosa
    assert filter_response.status_code == 200, f"Error al obtener resumen filtrado: {filter_response.text}"
    
    # Verificar la estructura de la respuesta
    filter_data = filter_response.json()
    
    # Las mismas verificaciones que en el test anterior
    assert "total_animales" in filter_data, "No se encontró el campo 'total_animales'"
    assert "total_terneros" in filter_data, "No se encontró el campo 'total_terneros'"
    assert "total_partos" in filter_data, "No se encontró el campo 'total_partos'"
    
    # Verificar información de la explotación, si está presente
    if "explotacion" in filter_data:
        assert "explotacio" in filter_data["explotacion"], "No se encontró el campo explotacio"
        assert filter_data["explotacion"]["explotacio"] == explotacio, "El valor de explotacio no coincide"
    
    print("Test de resumen filtrado completado con éxito.")

@pytest.mark.asyncio
async def test_get_dashboard_resumen_by_date(test_token):
    """Test para verificar que se puede filtrar el resumen del dashboard por fechas."""
    # Configuramos un rango de fechas para el filtro (último mes)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Convertir a formato de fecha esperado por la API (YYYY-MM-DD)
    start_str = start_date.strftime("%Y-%m-%d")
    end_str = end_date.strftime("%Y-%m-%d")
    
    # URL con filtro de fechas
    filter_url = f"{BASE_URL}api/v1/dashboard/resumen/?start_date={start_str}&end_date={end_str}"
    
    print(f"\nProbando obtener resumen filtrado por fechas de {start_str} a {end_str}: {filter_url}")
    
    filter_response = requests.get(filter_url, headers=test_token)
    
    print(f"Código de estado: {filter_response.status_code}")
    
    # Verificar que la respuesta sea exitosa
    assert filter_response.status_code == 200, f"Error al obtener resumen filtrado por fechas: {filter_response.text}"
    
    # Verificar la estructura de la respuesta (misma que en test_get_dashboard_resumen)
    date_data = filter_response.json()
    
    assert "total_animales" in date_data, "No se encontró el campo 'total_animales'"
    assert "total_terneros" in date_data, "No se encontró el campo 'total_terneros'"
    assert "total_partos" in date_data, "No se encontró el campo 'total_partos'"
    assert "tendencias" in date_data, "No se encontró el campo 'tendencias'"
    
    # Como es un filtro por fechas, verificamos que tenga información de fechas
    if "periodo" in date_data:
        assert "inicio" in date_data["periodo"], "No se encontró la fecha de inicio"
        assert "fin" in date_data["periodo"], "No se encontró la fecha de fin"
        
        # Verificar que las fechas corresponden a las solicitadas
        parsed_start = datetime.strptime(date_data["periodo"]["inicio"], "%Y-%m-%d").date()
        parsed_end = datetime.strptime(date_data["periodo"]["fin"], "%Y-%m-%d").date()
        
        # Convertir las fechas de string a objetos date para comparar
        requested_start = datetime.strptime(start_str, "%Y-%m-%d").date()
        requested_end = datetime.strptime(end_str, "%Y-%m-%d").date()
        
        assert parsed_start == requested_start, "La fecha de inicio no coincide con la solicitada"
        assert parsed_end == requested_end, "La fecha de fin no coincide con la solicitada"
    
    print("Test de resumen filtrado por fechas completado con éxito.")

@pytest.mark.asyncio
async def test_get_dashboard_resumen_unauthorized():
    """Test para verificar que el endpoint requiere autenticación."""
    url = f"{BASE_URL}api/v1/dashboard/resumen/"
    
    print(f"\nProbando acceso no autorizado a resumen: {url}")
    
    # Realizar la solicitud GET sin token
    response = requests.get(url)
    
    print(f"Código de estado: {response.status_code}")
    
    # Verificar que se rechaza el acceso sin autenticación
    assert response.status_code in [401, 403], f"Se esperaba un código 401 o 403, pero se recibió: {response.status_code}"
    
    print("Test de acceso no autorizado completado con éxito.")
