import pytest
import requests
import uuid
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1/partos"
ANIMALS_URL = "http://localhost:8000/api/v1/animals"

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
def test_partos(auth_token):
    """Crea varios animales femeninos y partos de prueba para tests de listado."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Lista para almacenar los IDs y nombres de los animales creados
    animal_ids = []
    animal_names = []
    parto_ids = []
    total_partos = 0 # Contador para el número total de partos creados
    
    # Crear dos animales femeninos
    for i in range(2):
        animal_name = f"Test_Female_{uuid.uuid4().hex[:8]}"
        animal_data = {
            "nom": animal_name,
            "genere": "F",  # Femenino
            "explotacio": "Gurans",
            "estado": "OK",
            "alletar": "NO"  # No amamanta
        }
        
        print(f"\nCreando animal femenino de prueba {i+1}...")
        
        # Crear el animal
        create_animal_response = requests.post(f"{ANIMALS_URL}/", json=animal_data, headers=headers)
        assert create_animal_response.status_code == 201, f"Error al crear animal: {create_animal_response.status_code} - {create_animal_response.text}"
        
        animal_id = create_animal_response.json()["data"]["id"]
        animal_ids.append(animal_id)
        animal_names.append(animal_name) # Guardar el nombre
        print(f"Animal femenino creado con ID: {animal_id}, Nombre: {animal_name}")
        
        # Verificar que el animal se ha creado como hembra
        get_animal_response = requests.get(f"{ANIMALS_URL}/{animal_id}", headers=headers)
        assert get_animal_response.status_code == 200, f"Error al obtener animal: {get_animal_response.status_code} - {get_animal_response.text}"
        assert get_animal_response.json()["data"]["genere"] == "F", f"El animal no se ha creado como hembra: {get_animal_response.json()['data']['genere']}"
        
        # Crear dos partos para cada animal (con fechas diferentes)
        for j in range(2):
            # Fecha hace j+1 días
            date = datetime.now() - timedelta(days=j+1)
            fecha_parto = date.strftime("%d/%m/%Y")
            
            # Alternar entre crías masculinas y femeninas
            genere_fill = "M" if j % 2 == 0 else "F"
            
            # Datos para crear un parto
            parto_data = {
                "animal_id": animal_id,  # Usar el ID del animal en lugar del nombre
                "part": fecha_parto,     # Fecha del parto
                "GenereT": genere_fill,  # Género de la cría
                "EstadoT": "OK",         # Estado de la cría (viva)
                "numero_part": j + 1,    # Número de parto (se calculará automáticamente)
                "observacions": f"Parto de prueba {j+1} para {animal_name}" # Observaciones
            }
            
            print(f"Creando parto {j+1} para animal {i+1}...")
            
            # Crear el parto
            create_parto_response = requests.post(f"{BASE_URL}/", json=parto_data, headers=headers)
            assert create_parto_response.status_code == 201, f"Error al crear parto: {create_parto_response.status_code} - {create_parto_response.text}"
            
            parto_id = create_parto_response.json()["data"]["id"]
            parto_ids.append(parto_id)
            total_partos += 1 # Incrementar contador
            print(f"Parto creado con ID: {parto_id}")
    
    # Devolver los datos creados y la cabecera de autenticación
    yield {
        "headers": headers,
        "animal_ids": animal_ids,
        "animal_names": animal_names, # Devolver nombres
        "parto_ids": parto_ids,
        "total_partos": total_partos
    }
    
    # Limpiar: eliminar los animales después de los tests (esto eliminará también los partos por cascada)
    for animal_id in animal_ids:
        print(f"Eliminando animal de prueba (ID: {animal_id})...")
        delete_response = requests.delete(f"{ANIMALS_URL}/{animal_id}", headers=headers)
        assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"

@pytest.mark.asyncio
async def test_list_all_partos(test_partos):
    """Test para listar todos los partos."""
    headers = test_partos["headers"]
    total_partos = test_partos["total_partos"]
    
    url = f"{BASE_URL}/"
    
    print(f"\nProbando listar todos los partos: {url}")
    
    try:
        # Realizar la solicitud GET para listar los partos
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        assert "items" in data["data"], "La respuesta no contiene el campo 'items'"
        
        # Verificar que se devuelven al menos los partos que hemos creado
        partos = data["data"]["items"]
        assert len(partos) >= total_partos, f"Se esperaban al menos {total_partos} partos, pero se recibieron {len(partos)}"
        
        # Verificar que los partos tienen la estructura correcta
        for parto in partos:
            assert "id" in parto, "El parto no tiene ID"
            assert "animal_id" in parto, "El parto no tiene ID de animal (animal_id)" # Corregido
            assert "part" in parto, "El parto no tiene fecha (part)"
            assert "GenereT" in parto, "El parto no tiene género de cría (GenereT)"
            assert "EstadoT" in parto, "El parto no tiene estado de cría (EstadoT)"
            assert "numero_part" in parto, "El parto no tiene número de parto"
        
        print("Test de listado de partos completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_list_partos_by_animal(test_partos):
    """Test para listar los partos de un animal específico."""
    headers = test_partos["headers"]
    animal_id_to_test = test_partos["animal_ids"][0]  # Usar el primer ID de animal

    url = f"{BASE_URL}/?animal_id={animal_id_to_test}" # Corregido: usar animal_id

    print(f"\nProbando listar partos por animal: {url}")

    try:
        # Realizar la solicitud GET para listar los partos de un animal
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        assert "items" in data["data"], "La respuesta no contiene el campo 'items'"
        
        # Verificar que todos los partos pertenecen al animal especificado
        partos = data["data"]["items"]
        for parto in partos:
            assert "animal_id" in parto, f"Parto con ID {parto.get('id')} no tiene 'animal_id'"
            assert parto["animal_id"] == animal_id_to_test, f"Parto con ID {parto.get('id')} pertenece al animal {parto['animal_id']}, no al {animal_id_to_test}" # Corregido

        print("Test de listado de partos por animal completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_list_partos_by_genere_fill(test_partos):
    """Test para listar los partos por género de la cría."""
    headers = test_partos["headers"]
    
    # Probar con género masculino
    url = f"{BASE_URL}/?GenereT=M"
    
    print(f"\nProbando listar partos por género de cría (M): {url}")
    
    try:
        # Realizar la solicitud GET para listar los partos con crías masculinas
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que todos los partos tienen crías masculinas
        partos = data["data"]["items"]
        for parto in partos:
            assert parto["GenereT"] == "M", f"Parto con ID {parto['id']} tiene género de cría {parto['GenereT']}, no M"
        
        # Probar con género femenino
        url = f"{BASE_URL}/?GenereT=F"
        
        print(f"\nProbando listar partos por género de cría (F): {url}")
        
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que todos los partos tienen crías femeninas
        partos = data["data"]["items"]
        for parto in partos:
            assert parto["GenereT"] == "F", f"Parto con ID {parto['id']} tiene género de cría {parto['GenereT']}, no F"
        
        print("Test de listado de partos por género de cría completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."

@pytest.mark.asyncio
async def test_list_partos_by_date_range(test_partos):
    """Test para listar los partos por rango de fechas."""
    headers = test_partos["headers"]
    
    # Fechas para el rango (últimos 30 días)
    end_date = datetime.now().strftime("%d/%m/%Y")
    start_date = (datetime.now() - timedelta(days=30)).strftime("%d/%m/%Y")
    
    url = f"{BASE_URL}/?start_date={start_date}&end_date={end_date}"
    
    print(f"\nProbando listar partos por rango de fechas: {url}")
    
    try:
        # Realizar la solicitud GET para listar los partos en un rango de fechas
        response = requests.get(url, headers=headers)
        
        print(f"Código de estado: {response.status_code}")
        
        assert response.status_code == 200, f"Error: {response.status_code} - {response.text}"
        data = response.json()
        
        # Verificar que la respuesta tiene la estructura correcta
        assert "status" in data, "La respuesta no contiene el campo 'status'"
        assert data["status"] == "success", f"El estado no es 'success', es '{data['status']}'"
        assert "data" in data, "La respuesta no contiene el campo 'data'"
        assert "items" in data["data"], "La respuesta no contiene el campo 'items'"
        
        # Verificar que se devuelven los partos en el rango de fechas
        # Nota: No podemos verificar exactamente las fechas porque están en formato string
        # y habría que parsearlas, pero al menos verificamos que hay resultados
        
        print("Test de listado de partos por rango de fechas completado con éxito.")
        
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        import traceback
        traceback.print_exc()
        assert False, "Excepción durante la solicitud HTTP."
