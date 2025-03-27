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

@pytest.mark.asyncio
async def test_create_animal_minimal(auth_token):
    """Test para crear un animal con campos mínimos obligatorios."""
    # Generar un nombre único
    animal_name = f"Test_Animal_Min_{uuid.uuid4().hex[:8]}"
    
    # Datos mínimos del animal
    animal_data = {
        "nom": animal_name,
        "genere": "M",
        "explotacio": "Gurans",
        "estado": "OK"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nProbando crear animal con campos mínimos: {BASE_URL}/")
    
    try:
        # Realizar la solicitud POST para crear el animal
        response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 201, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        animal = data["data"]
        
        # Verificar que todos los campos obligatorios están presentes
        assert "id" in animal, "Falta el campo 'id'"
        assert "explotacio" in animal, "Falta el campo 'explotacio'"
        assert "nom" in animal, "Falta el campo 'nom'"
        assert "genere" in animal, "Falta el campo 'genere'"
        assert "estado" in animal, "Falta el campo 'estado'"
        
        # Verificar que los valores coinciden con los datos enviados
        assert animal["nom"] == animal_data["nom"], f"El nombre no coincide: {animal['nom']} != {animal_data['nom']}"
        assert animal["genere"] == animal_data["genere"], f"El género no coincide: {animal['genere']} != {animal_data['genere']}"
        assert animal["explotacio"] == animal_data["explotacio"], f"La explotación no coincide: {animal['explotacio']} != {animal_data['explotacio']}"
        assert animal["estado"] == animal_data["estado"], f"El estado no coincide: {animal['estado']} != {animal_data['estado']}"
        
        # Limpiar: eliminar el animal creado
        animal_id = animal["id"]
        delete_response = requests.delete(f"{BASE_URL}/{animal_id}", headers=headers)
        assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"
        
        print("Test de crear animal con campos mínimos completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_create_animal_complete(auth_token):
    """Test para crear un animal con todos los campos."""
    # Generar un nombre único
    animal_name = f"Test_Animal_Full_{uuid.uuid4().hex[:8]}"
    
    # Datos completos del animal
    animal_data = {
        "nom": animal_name,
        "genere": "F",
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "NO",
        "dob": "01/01/2022",
        "mare": "Madre Test",
        "pare": "Padre Test",
        "quadra": "Quadra Test",
        "cod": "TEST456",
        "num_serie": "ES87654321",
        "part": None
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    print(f"\nProbando crear animal con todos los campos: {BASE_URL}/")
    
    try:
        # Realizar la solicitud POST para crear el animal
        response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 201, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        
        animal = data["data"]
        
        # Verificar que todos los campos están presentes
        assert "id" in animal, "Falta el campo 'id'"
        assert "explotacio" in animal, "Falta el campo 'explotacio'"
        assert "nom" in animal, "Falta el campo 'nom'"
        assert "genere" in animal, "Falta el campo 'genere'"
        assert "estado" in animal, "Falta el campo 'estado'"
        assert "alletar" in animal, "Falta el campo 'alletar'"
        assert "dob" in animal, "Falta el campo 'dob'"
        assert "mare" in animal, "Falta el campo 'mare'"
        assert "pare" in animal, "Falta el campo 'pare'"
        assert "quadra" in animal, "Falta el campo 'quadra'"
        assert "cod" in animal, "Falta el campo 'cod'"
        assert "num_serie" in animal, "Falta el campo 'num_serie'"
        
        # Verificar que los valores coinciden con los datos enviados
        assert animal["nom"] == animal_data["nom"], f"El nombre no coincide: {animal['nom']} != {animal_data['nom']}"
        assert animal["genere"] == animal_data["genere"], f"El género no coincide: {animal['genere']} != {animal_data['genere']}"
        assert animal["explotacio"] == animal_data["explotacio"], f"La explotación no coincide: {animal['explotacio']} != {animal_data['explotacio']}"
        assert animal["estado"] == animal_data["estado"], f"El estado no coincide: {animal['estado']} != {animal_data['estado']}"
        assert animal["alletar"] == animal_data["alletar"], f"El estado de amamantamiento no coincide: {animal['alletar']} != {animal_data['alletar']}"
        assert animal["dob"] == animal_data["dob"], f"La fecha de nacimiento no coincide: {animal['dob']} != {animal_data['dob']}"
        assert animal["mare"] == animal_data["mare"], f"La madre no coincide: {animal['mare']} != {animal_data['mare']}"
        assert animal["pare"] == animal_data["pare"], f"El padre no coincide: {animal['pare']} != {animal_data['pare']}"
        assert animal["quadra"] == animal_data["quadra"], f"La cuadra no coincide: {animal['quadra']} != {animal_data['quadra']}"
        assert animal["cod"] == animal_data["cod"], f"El código no coincide: {animal['cod']} != {animal_data['cod']}"
        assert animal["num_serie"] == animal_data["num_serie"], f"El número de serie no coincide: {animal['num_serie']} != {animal_data['num_serie']}"
        
        # Si es hembra, verificar la estructura de partos
        if animal["genere"] == "F":
            assert "partos" in animal, "Falta el campo 'partos' para una hembra"
            assert "total" in animal["partos"], "Falta el campo 'total' en partos"
            assert "items" in animal["partos"], "Falta el campo 'items' en partos"
            assert "first_date" in animal["partos"], "Falta el campo 'first_date' en partos"
            assert "last_date" in animal["partos"], "Falta el campo 'last_date' en partos"
        
        # Limpiar: eliminar el animal creado
        animal_id = animal["id"]
        delete_response = requests.delete(f"{BASE_URL}/{animal_id}", headers=headers)
        assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"
        
        print("Test de crear animal con todos los campos completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_create_animal_invalid_data(auth_token):
    """Test para verificar la validación de datos al crear un animal."""
    # Casos de prueba con datos inválidos
    test_cases = [
        {
            "description": "Falta el nombre",
            "data": {
                "genere": "M",
                "explotacio": "Gurans",
                "estado": "OK"
            }
        },
        {
            "description": "Falta el género",
            "data": {
                "nom": "Test Sin Género",
                "explotacio": "Gurans",
                "estado": "OK"
            }
        },
        {
            "description": "Falta la explotación",
            "data": {
                "nom": "Test Sin Explotación",
                "genere": "M",
                "estado": "OK"
            }
        },
        {
            "description": "Género inválido",
            "data": {
                "nom": "Test Género Inválido",
                "genere": "X",  # Valor inválido
                "explotacio": "Gurans",
                "estado": "OK"
            }
        },
        {
            "description": "Estado inválido",
            "data": {
                "nom": "Test Estado Inválido",
                "genere": "M",
                "explotacio": "Gurans",
                "estado": "INVALID"  # Valor inválido
            }
        },
        {
            "description": "Fecha de nacimiento con formato inválido",
            "data": {
                "nom": "Test Fecha Inválida",
                "genere": "M",
                "explotacio": "Gurans",
                "estado": "OK",
                "dob": "2022-01-01"  # Formato inválido, debería ser DD/MM/YYYY
            }
        }
    ]
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    for test_case in test_cases:
        print(f"\nProbando crear animal con datos inválidos - {test_case['description']}")
        
        try:
            # Realizar la solicitud POST con datos inválidos
            response = requests.post(f"{BASE_URL}/", json=test_case["data"], headers=headers)
            
            print(f"Código de estado: {response.status_code}")
            
            # Verificar que la solicitud falla con código 400 o 422
            assert response.status_code in [400, 422], f"Se esperaba un error 400 o 422, pero se recibió: {response.status_code} - {response.text}"
            
            print(f"Error recibido (esperado): {response.text}")
            
        except Exception as e:
            print(f"Error durante la solicitud: {e}")
            import traceback
            traceback.print_exc()
            assert False, f"Excepción durante la solicitud HTTP para el caso: {test_case['description']}."
    
    print("Test de validación de datos al crear animales completado con éxito.")
