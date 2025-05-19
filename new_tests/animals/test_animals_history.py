import pytest
import requests
import uuid
import time

BASE_URL = "http://localhost:8000/api/v1/animals"

@pytest.fixture
def auth_token():
    """Obtiene un token de autenticación del administrador."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def test_animal_with_history(auth_token):
    """Crea un animal de prueba y realiza varias actualizaciones para generar historial."""
    # Generar un nombre único
    animal_name = f"Test_History_{uuid.uuid4().hex[:8]}"
    
    # Generar código único
    unique_code = f"HIST_{uuid.uuid4().hex[:8]}"
    
    # Datos iniciales del animal
    animal_data = {
        "nom": animal_name,
        "genere": "F",
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "0",
        "cod": unique_code,
        "num_serie": "ES22222222",
        "dob": "01/01/2022",
        "mare": "Madre Test",
        "pare": "Padre Test",
        "quadra": "Quadra Test"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Crear el animal
    response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
    assert response.status_code == 201, f"Error al crear animal: {response.status_code} - {response.text}"
    
    # Obtener el ID del animal creado
    animal_id = response.json()["data"]["id"]
    
    # Realizar varias actualizaciones para generar historial
    # Actualización 1: Cambiar quadra
    update_data_1 = {"quadra": "Quadra Nueva"}
    response = requests.patch(f"{BASE_URL}/{animal_id}", json=update_data_1, headers=headers)
    assert response.status_code == 200, f"Error al actualizar animal (1): {response.status_code} - {response.text}"
    
    # Pequeña pausa para asegurar orden cronológico en el historial
    time.sleep(1)
    
    # Actualización 2: Cambiar estado de amamantamiento
    update_data_2 = {"alletar": "1"}
    response = requests.patch(f"{BASE_URL}/{animal_id}", json=update_data_2, headers=headers)
    assert response.status_code == 200, f"Error al actualizar animal (2): {response.status_code} - {response.text}"
    
    time.sleep(1)
    
    # Actualización 3: Cambiar múltiples campos
    update_data_3 = {
        "num_serie": "ES33333333",
        "mare": "Madre Actualizada",
        "pare": "Padre Actualizado"
    }
    response = requests.patch(f"{BASE_URL}/{animal_id}", json=update_data_3, headers=headers)
    assert response.status_code == 200, f"Error al actualizar animal (3): {response.status_code} - {response.text}"
    
    # Devolver el ID del animal
    return animal_id

def test_get_animal_history(test_animal_with_history, auth_token):
    """Test para obtener el historial de cambios de un animal."""
    animal_id = test_animal_with_history
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Obtener el historial
    response = requests.get(f"{BASE_URL}/{animal_id}/history", headers=headers)
    
    # Verificar respuesta
    assert response.status_code == 200, f"Error al obtener historial: {response.status_code} - {response.text}"
    
    # Verificar estructura de la respuesta
    historial = response.json()
    assert isinstance(historial, list), "El historial debe ser una lista"
    assert len(historial) >= 5, f"El historial debe tener al menos 5 registros, tiene {len(historial)}"
    
    # Verificar campos de cada registro
    for registro in historial:
        assert "id" in registro, "Falta el campo 'id'"
        assert "animal_id" in registro, "Falta el campo 'animal_id'"
        assert "fecha" in registro, "Falta el campo 'fecha'"
        assert "usuario" in registro, "Falta el campo 'usuario'"
        assert "cambio" in registro, "Falta el campo 'cambio'"
        assert "campo" in registro, "Falta el campo 'campo'"
        assert "valor_anterior" in registro or registro["valor_anterior"] is None, "Valor anterior debe estar presente o ser null"
        assert "valor_nuevo" in registro or registro["valor_nuevo"] is None, "Valor nuevo debe estar presente o ser null"
    
    # Verificar que se registraron los cambios específicos que hicimos
    cambios_esperados = ["quadra", "alletar", "num_serie", "mare", "pare"]
    campos_encontrados = set()
    
    for registro in historial:
        if registro["campo"] in cambios_esperados:
            campos_encontrados.add(registro["campo"])
    
    # Verificar que todos los cambios esperados estén en el historial
    for campo in cambios_esperados:
        assert campo in campos_encontrados, f"No se encontró registro para el cambio de '{campo}'"
    
    # Verificar el orden (más reciente primero por ID)
    if len(historial) >= 2:
        assert historial[0]["id"] > historial[1]["id"], "Los registros no están ordenados por ID (más reciente primero)"

def test_get_animal_history_not_found(auth_token):
    """Test para verificar error cuando se busca el historial de un animal inexistente."""
    # ID inválido
    invalid_id = 999999
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Intentar obtener el historial
    response = requests.get(f"{BASE_URL}/{invalid_id}/history", headers=headers)
    
    # Verificar respuesta
    assert response.status_code == 404, f"Debe retornar 404 para un animal inexistente, devolvió: {response.status_code}"
    
    # Verificar mensaje de error
    error_data = response.json()
    assert "detail" in error_data, "La respuesta de error debe contener el campo 'detail'"
    assert f"Animal con ID {invalid_id} no encontrado" in error_data["detail"], "Mensaje de error incorrecto"
