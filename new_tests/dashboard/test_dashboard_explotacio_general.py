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
    url = f"{BASE_URL}api/v1/dashboard/explotacions/"
    
    print(f"\n=== VERIFICACIÓN DE NOMENCLATURA DE CAMPOS ===")
    print(f"Obteniendo lista de explotaciones: {url}")
    
    response = requests.get(url, headers=test_token)
    assert response.status_code == 200, f"Error al obtener explotaciones: {response.status_code} - {response.text}"
    
    explotaciones = response.json()
    print(f"Total explotaciones: {len(explotaciones)}")
    
    # Verificar el primer registro para comprobar los nombres de campo
    if explotaciones:
        first_exp = explotaciones[0]
        assert 'explotacio' in first_exp, "Campo 'explotacio' no encontrado en la primera explotación"
        # El campo se llama 'explotacio', no 'explotacion' en la API actual
        # assert 'explotacion' in first_exp, "Campo 'explotacion' no encontrado en la primera explotación"
        
        # Verificar que NO exista el campo 'id' ni el campo 'nom'
        assert 'id' not in first_exp, "El campo 'id' existe en explotaciones (eliminado en la nueva estructura)"
        assert 'nom' not in first_exp, "El campo 'nom' existe en explotaciones (debe evitarse)"
        
        print("\n=== DATOS DE LA PRIMERA EXPLOTACIÓN ===")
        print(json.dumps(first_exp, indent=2))
        
        # Verificar tipos de datos
        assert isinstance(first_exp['explotacio'], str), f"Campo 'explotacio' no es string: {type(first_exp['explotacio'])}"
    
    print("\u2705 Verificación de campos exitosa: 'explotacio' está presente y 'id' y 'nom' no lo están")

@pytest.mark.asyncio
async def test_explotacio_stats_endpoint(test_token):
    """
    Prueba para verificar que las estadísticas de explotación funcionan correctamente.
    Utiliza el primer ID de explotación disponible para obtener sus estadísticas.
    """
    # Obtener una explotación para probar
    url_explotacions = f"{BASE_URL}api/v1/dashboard/explotacions/"
    response = requests.get(url_explotacions, headers=test_token)
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Usar la primera explotación para la prueba
    explotacion = explotaciones[0]
    explotacio_value = explotacion['explotacio']
    explotacion_nombre = explotacio_value  # Usamos el código como nombre ya que no hay campo explotacion
    
    print(f"\n=== PROBANDO ESTADÍSTICAS PARA EXPLOTACIÓN: {explotacio_value} ({explotacion_nombre}) ===")
    
    # Endpoint para estadísticas de explotación
    stats_url = f"{BASE_URL}api/v1/dashboard/explotacions/{explotacio_value}/stats"
    stats_response = requests.get(stats_url, headers=test_token)
    
    assert stats_response.status_code == 200, f"Error al obtener estadísticas: {stats_response.status_code} - {stats_response.text}"
    
    stats = stats_response.json()
    print(f"Estadísticas recibidas correctamente")
    
    # Verificar que las estadísticas contengan información básica
    assert 'animales' in stats, "No se encontró 'animales' en las estadísticas"
    
    print("✅ Prueba de endpoint de estadísticas completada exitosamente")

@pytest.mark.asyncio
async def test_combined_dashboard_with_explotacio(test_token):
    """
    Prueba para verificar que el endpoint combinado funciona con filtro de explotación.
    """
    # Obtener una explotación para probar
    url_explotacions = f"{BASE_URL}api/v1/dashboard/explotacions/"
    response = requests.get(url_explotacions, headers=test_token)
    assert response.status_code == 200, "No se pudieron obtener explotaciones"
    
    explotaciones = response.json()
    assert len(explotaciones) > 0, "No hay explotaciones disponibles para probar"
    
    # Usar la primera explotación para la prueba
    explotacion = explotaciones[0]
    explotacio_value = explotacion['explotacio']
    explotacion_nombre = explotacio_value  # Usamos el código como nombre ya que no hay campo explotacion
    
    print(f"\n=== PROBANDO DASHBOARD COMBINADO PARA EXPLOTACIÓN: {explotacio_value} ({explotacion_nombre}) ===")
    
    # Endpoint combinado de dashboard con filtro por explotación
    combined_url = f"{BASE_URL}api/v1/dashboard/combined?explotacio={explotacio_value}"
    combined_response = requests.get(combined_url, headers=test_token)
    
    assert combined_response.status_code == 200, f"Error al obtener dashboard combinado: {combined_response.status_code} - {combined_response.text}"
    
    combined_data = combined_response.json()
    print(f"Dashboard combinado recibido correctamente")
    
    # Verificar estructura básica
    assert 'animales' in combined_data, "No se encontró 'animales' en el dashboard combinado"
    assert 'partos' in combined_data, "No se encontró 'partos' en el dashboard combinado"
    assert 'explotacio' in combined_data, "No se encontró 'explotacio' en el dashboard combinado"
    
    print("✅ Prueba de dashboard combinado completada exitosamente")
