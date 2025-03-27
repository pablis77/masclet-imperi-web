import pytest
import requests
import uuid

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
def test_animal(auth_token):
    """Crea un animal de prueba para actualizar."""
    # Generar un nombre único
    animal_name = f"Test_Update_{uuid.uuid4().hex[:8]}"
    
    # Datos iniciales del animal
    animal_data = {
        "nom": animal_name,
        "genere": "M",
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "NO",
        "cod": "UPDATE1",
        "num_serie": "ES11111111",
        "dob": "01/01/2022",
        "mare": "Madre Original",
        "pare": "Padre Original",
        "quadra": "Quadra Original"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Crear el animal
    response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
    assert response.status_code == 201, f"Error al crear animal: {response.status_code} - {response.text}"
    
    # Obtener el ID del animal creado
    animal_id = response.json()["data"]["id"]
    
    # Devolver los datos necesarios para el test
    yield {
        "id": animal_id,
        "data": animal_data,
        "headers": headers
    }
    
    # Limpiar: eliminar el animal después del test
    delete_response = requests.delete(f"{BASE_URL}/{animal_id}", headers=headers)
    assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"

@pytest.mark.asyncio
async def test_update_animal_partial(test_animal):
    """Test para actualizar parcialmente un animal."""
    animal_id = test_animal["id"]
    headers = test_animal["headers"]
    
    # Datos para actualización parcial
    update_data = {
        "nom": f"Updated_{uuid.uuid4().hex[:8]}",
        "estado": "DEF",
        "quadra": "Quadra Actualizada"
    }
    
    url = f"{BASE_URL}/{animal_id}"
    
    print(f"\nProbando actualizar parcialmente un animal: {url}")
    
    try:
        # Realizar la solicitud PATCH para actualizar el animal
        response = requests.patch(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        animal = data["data"]
        
        # Verificar que los campos actualizados tienen los nuevos valores
        assert animal["nom"] == update_data["nom"], f"El nombre no se actualizó correctamente: {animal['nom']} != {update_data['nom']}"
        assert animal["estado"] == update_data["estado"], f"El estado no se actualizó correctamente: {animal['estado']} != {update_data['estado']}"
        assert animal["quadra"] == update_data["quadra"], f"La cuadra no se actualizó correctamente: {animal['quadra']} != {update_data['quadra']}"
        
        # Verificar que los campos no actualizados mantienen sus valores originales
        assert animal["genere"] == test_animal["data"]["genere"], f"El género cambió inesperadamente: {animal['genere']} != {test_animal['data']['genere']}"
        assert animal["explotacio"] == test_animal["data"]["explotacio"], f"La explotación cambió inesperadamente: {animal['explotacio']} != {test_animal['data']['explotacio']}"
        assert animal["alletar"] == test_animal["data"]["alletar"], f"El estado de amamantamiento cambió inesperadamente: {animal['alletar']} != {test_animal['data']['alletar']}"
        assert animal["cod"] == test_animal["data"]["cod"], f"El código cambió inesperadamente: {animal['cod']} != {test_animal['data']['cod']}"
        assert animal["num_serie"] == test_animal["data"]["num_serie"], f"El número de serie cambió inesperadamente: {animal['num_serie']} != {test_animal['data']['num_serie']}"
        assert animal["dob"] == test_animal["data"]["dob"], f"La fecha de nacimiento cambió inesperadamente: {animal['dob']} != {test_animal['data']['dob']}"
        assert animal["mare"] == test_animal["data"]["mare"], f"La madre cambió inesperadamente: {animal['mare']} != {test_animal['data']['mare']}"
        assert animal["pare"] == test_animal["data"]["pare"], f"El padre cambió inesperadamente: {animal['pare']} != {test_animal['data']['pare']}"
        
        print("Test de actualización parcial completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_update_animal_complete(test_animal):
    """Test para actualizar completamente un animal."""
    animal_id = test_animal["id"]
    headers = test_animal["headers"]
    
    # Datos para actualización completa
    update_data = {
        "nom": f"FullUpdate_{uuid.uuid4().hex[:8]}",
        "genere": test_animal["data"]["genere"],  # No se puede cambiar el género
        "explotacio": test_animal["data"]["explotacio"],  # No se puede cambiar la explotación
        "estado": "DEF",
        "alletar": "1",
        "cod": "UPDATE2",
        "num_serie": test_animal["data"]["num_serie"],  # No se puede cambiar el número de serie
        "dob": "02/02/2022",
        "mare": "Madre Actualizada",
        "pare": "Padre Actualizado",
        "quadra": "Quadra Actualizada"
    }
    
    url = f"{BASE_URL}/{animal_id}"
    
    print(f"\nProbando actualizar completamente un animal: {url}")
    
    try:
        # Realizar la solicitud PUT para actualizar el animal
        response = requests.put(url, json=update_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        animal = data["data"]
        
        # Verificar que todos los campos tienen los valores actualizados
        assert animal["nom"] == update_data["nom"], f"El nombre no se actualizó correctamente: {animal['nom']} != {update_data['nom']}"
        assert animal["genere"] == update_data["genere"], f"El género no coincide: {animal['genere']} != {update_data['genere']}"
        assert animal["explotacio"] == update_data["explotacio"], f"La explotación no coincide: {animal['explotacio']} != {update_data['explotacio']}"
        assert animal["estado"] == update_data["estado"], f"El estado no se actualizó correctamente: {animal['estado']} != {update_data['estado']}"
        assert animal["alletar"] == update_data["alletar"], f"El estado de amamantamiento no se actualizó correctamente: {animal['alletar']} != {update_data['alletar']}"
        assert animal["cod"] == update_data["cod"], f"El código no se actualizó correctamente: {animal['cod']} != {update_data['cod']}"
        assert animal["num_serie"] == update_data["num_serie"], f"El número de serie no coincide: {animal['num_serie']} != {update_data['num_serie']}"
        assert animal["dob"] == update_data["dob"], f"La fecha de nacimiento no se actualizó correctamente: {animal['dob']} != {update_data['dob']}"
        assert animal["mare"] == update_data["mare"], f"La madre no se actualizó correctamente: {animal['mare']} != {update_data['mare']}"
        assert animal["pare"] == update_data["pare"], f"El padre no se actualizó correctamente: {animal['pare']} != {update_data['pare']}"
        assert animal["quadra"] == update_data["quadra"], f"La cuadra no se actualizó correctamente: {animal['quadra']} != {update_data['quadra']}"
        
        print("Test de actualización completa completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_update_animal_invalid_data(test_animal):
    """Test para verificar la validación de datos al actualizar un animal."""
    animal_id = test_animal["id"]
    headers = test_animal["headers"]
    
    # Casos de prueba con datos inválidos
    test_cases = [
        {
            "description": "Género inválido",
            "data": {
                "genere": "X"  # Valor inválido
            }
        },
        {
            "description": "Estado inválido",
            "data": {
                "estado": "INVALID"  # Valor inválido
            }
        },
        {
            "description": "Fecha de nacimiento con formato inválido",
            "data": {
                "dob": "2022-01-01"  # Formato inválido, debería ser DD/MM/YYYY
            }
        }
    ]
    
    url = f"{BASE_URL}/{animal_id}"
    
    for test_case in test_cases:
        print(f"\nProbando actualizar animal con datos inválidos - {test_case['description']}")
        
        try:
            # Realizar la solicitud PATCH con datos inválidos
            response = requests.patch(url, json=test_case["data"], headers=headers)
            
            print(f"Código de estado: {response.status_code}")
            
            # Verificar que la solicitud falla con código 400 o 422
            assert response.status_code in [400, 422], f"Se esperaba un error 400 o 422, pero se recibió: {response.status_code} - {response.text}"
            
            print(f"Error recibido (esperado): {response.text}")
            
        except Exception as e:
            print(f"Error durante la solicitud: {e}")
            import traceback
            traceback.print_exc()
            assert False, f"Excepción durante la solicitud HTTP para el caso: {test_case['description']}."
    
    print("Test de validación de datos al actualizar animales completado con éxito.")
