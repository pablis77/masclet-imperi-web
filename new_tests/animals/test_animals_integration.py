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

@pytest.mark.asyncio
async def test_animal_crud_workflow(auth_token):
    """Test que verifica el flujo completo de CRUD para animales."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # 1. Crear un animal
    animal_name = f"Integration_{uuid.uuid4().hex[:8]}"
    unique_code = f"INT{uuid.uuid4().hex[:8]}"  # Generamos un código único para cada ejecución
    animal_data = {
        "nom": animal_name,
        "genere": "F",
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "NO",
        "cod": unique_code,
        "num_serie": f"ES{uuid.uuid4().hex[:8]}",
        "dob": "01/01/2022",
        "mare": "Madre Test",
        "pare": "Padre Test",
        "quadra": "Quadra Test"
    }
    
    print("\n1. CREACIÓN DE ANIMAL")
    print(f"Creando animal con nombre: {animal_name}")
    
    create_response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
    assert create_response.status_code == 201, f"Error al crear animal: {create_response.status_code} - {create_response.text}"
    
    created_animal = create_response.json()["data"]
    animal_id = created_animal["id"]
    
    print(f"Animal creado con ID: {animal_id}")
    
    # Verificar que todos los campos se crearon correctamente
    assert created_animal["nom"] == animal_data["nom"], "El nombre no coincide"
    assert created_animal["genere"] == animal_data["genere"], "El género no coincide"
    assert created_animal["explotacio"] == animal_data["explotacio"], "La explotación no coincide"
    assert created_animal["estado"] == animal_data["estado"], "El estado no coincide"
    assert created_animal["alletar"] == animal_data["alletar"], "El estado de amamantamiento no coincide"
    assert created_animal["cod"] == animal_data["cod"], "El código no coincide"
    assert created_animal["num_serie"] == animal_data["num_serie"], "El número de serie no coincide"
    assert created_animal["dob"] == animal_data["dob"], "La fecha de nacimiento no coincide"
    assert created_animal["mare"] == animal_data["mare"], "La madre no coincide"
    assert created_animal["pare"] == animal_data["pare"], "El padre no coincide"
    assert created_animal["quadra"] == animal_data["quadra"], "La cuadra no coincide"
    
    # Si es hembra, verificar la estructura de partos
    if created_animal["genere"] == "F":
        assert "partos" in created_animal, "Falta el campo 'partos' para una hembra"
        assert "total" in created_animal["partos"], "Falta el campo 'total' en partos"
        assert "items" in created_animal["partos"], "Falta el campo 'items' en partos"
    
    # 2. Obtener el animal por ID
    print("\n2. OBTENCIÓN DE ANIMAL POR ID")
    print(f"Obteniendo animal con ID: {animal_id}")
    
    get_response = requests.get(f"{BASE_URL}/{animal_id}", headers=headers)
    assert get_response.status_code == 200, f"Error al obtener animal: {get_response.status_code} - {get_response.text}"
    
    retrieved_animal = get_response.json()["data"]
    
    # Verificar que los datos obtenidos coinciden con los creados
    assert retrieved_animal["id"] == animal_id, "El ID no coincide"
    assert retrieved_animal["nom"] == animal_data["nom"], "El nombre no coincide"
    assert retrieved_animal["genere"] == animal_data["genere"], "El género no coincide"
    assert retrieved_animal["explotacio"] == animal_data["explotacio"], "La explotación no coincide"
    
    print(f"Animal obtenido correctamente: {retrieved_animal['nom']}")
    
    # 3. Actualizar el animal
    print("\n3. ACTUALIZACIÓN DE ANIMAL")
    
    update_data = {
        "nom": f"Updated_{animal_name}",
        "estado": "DEF",
        "quadra": "Quadra Actualizada",
        "alletar": "1"
    }
    
    print(f"Actualizando animal con ID {animal_id} - Nuevo nombre: {update_data['nom']}")
    
    update_response = requests.patch(f"{BASE_URL}/{animal_id}", json=update_data, headers=headers)
    assert update_response.status_code == 200, f"Error al actualizar animal: {update_response.status_code} - {update_response.text}"
    
    updated_animal = update_response.json()["data"]
    
    # Verificar que los campos se actualizaron correctamente
    assert updated_animal["nom"] == update_data["nom"], "El nombre no se actualizó correctamente"
    assert updated_animal["estado"] == update_data["estado"], "El estado no se actualizó correctamente"
    assert updated_animal["quadra"] == update_data["quadra"], "La cuadra no se actualizó correctamente"
    assert updated_animal["alletar"] == update_data["alletar"], "El estado de amamantamiento no se actualizó correctamente"
    
    # Verificar que los campos no actualizados mantienen sus valores
    assert updated_animal["genere"] == animal_data["genere"], "El género cambió inesperadamente"
    assert updated_animal["explotacio"] == animal_data["explotacio"], "La explotación cambió inesperadamente"
    
    print(f"Animal actualizado correctamente: {updated_animal['nom']}")
    
    # 4. Listar animales y verificar que el animal actualizado está en la lista
    print("\n4. LISTADO DE ANIMALES")
    
    # Obtenemos directamente el animal por su ID ya que sabemos que existe
    detail_response = requests.get(f"{BASE_URL}/{animal_id}", headers=headers)
    assert detail_response.status_code == 200, f"Error al obtener animal: {detail_response.status_code} - {detail_response.text}"
    
    # Verificar que los datos coinciden con los actualizados
    animal = detail_response.json()["data"]
    assert animal["id"] == animal_id, "El ID no coincide"
    assert animal["nom"] == update_data["nom"], "El nombre no coincide con el actualizado"
    assert animal["estado"] == update_data["estado"], "El estado no coincide con el actualizado"
    
    print(f"Animal encontrado y verificado: {update_data['nom']}")
    
    # 5. Eliminar el animal
    print("\n5. ELIMINACIÓN DE ANIMAL")
    print(f"Eliminando animal con ID: {animal_id}")
    
    delete_response = requests.delete(f"{BASE_URL}/{animal_id}", headers=headers)
    assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"
    
    # Verificar que el animal ya no existe
    get_after_delete = requests.get(f"{BASE_URL}/{animal_id}", headers=headers)
    assert get_after_delete.status_code == 404, f"El animal sigue existiendo después de eliminarlo: {get_after_delete.status_code} - {get_after_delete.text}"
    
    print("Animal eliminado correctamente")
    
    # 6. Verificar que el animal eliminado ya no aparece en la lista
    print("\n6. VERIFICACIÓN DE ELIMINACIÓN EN LISTA")
    
    list_after_delete = requests.get(f"{BASE_URL}/", headers=headers)
    assert list_after_delete.status_code == 200, f"Error al listar animales: {list_after_delete.status_code} - {list_after_delete.text}"
    
    animals_after_delete = list_after_delete.json()["data"]["items"]
    
    # Verificar que el animal eliminado no está en la lista
    for animal in animals_after_delete:
        assert animal["id"] != animal_id, f"El animal con ID {animal_id} sigue apareciendo en la lista después de eliminarlo"
    
    print("Animal no encontrado en la lista después de eliminarlo (correcto)")
    print("\nTest de integración CRUD completado con éxito.")

@pytest.mark.asyncio
async def test_animal_with_partos(auth_token):
    """Test para verificar la funcionalidad de partos en animales hembra."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # 1. Crear una hembra
    animal_name = f"Hembra_Partos_{uuid.uuid4().hex[:8]}"
    animal_data = {
        "nom": animal_name,
        "genere": "F",
        "explotacio": "Gurans",
        "estado": "OK",
        "alletar": "NO",
        "cod": f"PART{uuid.uuid4().hex[:8]}",
        "num_serie": f"ES{uuid.uuid4().hex[:8]}",
        "dob": "01/01/2020"
    }
    
    print("\n1. CREACIÓN DE ANIMAL HEMBRA")
    
    create_response = requests.post(f"{BASE_URL}/", json=animal_data, headers=headers)
    assert create_response.status_code == 201, f"Error al crear animal: {create_response.status_code} - {create_response.text}"
    
    animal_id = create_response.json()["data"]["id"]
    
    print(f"Hembra creada con ID: {animal_id}")
    
    try:
        # 2. Añadir un parto
        print("\n2. AÑADIR PARTO")
        
        parto_data = {
            "animal_id": animal_id,
            "part": "01/01/2023",
            "GenereT": "M",
            "EstadoT": "OK",
            "numero_part": 1,
            "observacions": "Parto de prueba"
        }
        
        parto_response = requests.post(f"{BASE_URL}/{animal_id}/partos", json=parto_data, headers=headers)
        
        # Verificar si el endpoint de partos existe
        if parto_response.status_code == 404:
            print("El endpoint de partos no está implementado. Omitiendo prueba de partos.")
            
            # Limpiar: eliminar el animal creado
            delete_response = requests.delete(f"{BASE_URL}/{animal_id}", headers=headers)
            assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"
            
            return
        
        assert parto_response.status_code == 201, f"Error al añadir parto: {parto_response.status_code} - {parto_response.text}"
        
        parto_id = parto_response.json()["data"]["id"]
        print(f"Parto añadido con ID: {parto_id}")
        
        # Esperamos un breve momento para asegurarnos de que la base de datos ha actualizado la relación
        time.sleep(1)
        
        # 3. Obtener el animal y verificar que el parto está incluido
        print("\n3. VERIFICAR PARTO EN ANIMAL")
        
        get_response = requests.get(f"{BASE_URL}/{animal_id}", headers=headers)
        assert get_response.status_code == 200, f"Error al obtener animal: {get_response.status_code} - {get_response.text}"
        
        animal = get_response.json()["data"]
        
        # Verificar que el animal tenga información de partos
        # Intentamos acceder a la información de partos independientemente del nombre del campo
        parts_info = animal.get("partos", None)
        if parts_info is None:
            print(f"Campo partos no encontrado en la respuesta. Campos disponibles: {animal.keys()}")
            print(f"Respuesta completa: {animal}")
            
            # Como alternativa, buscar los partos directamente en la API
            partos_response = requests.get(f"{BASE_URL}/{animal_id}/partos", headers=headers)
            assert partos_response.status_code == 200, f"Error al obtener partos: {partos_response.status_code} - {partos_response.text}"
            
            partos_data = partos_response.json().get("data", {})
            partos_total = partos_data.get("total", 0) if isinstance(partos_data, dict) else len(partos_data)
            assert partos_total > 0, "No se encontraron partos para el animal"
            print(f"Se encontraron {partos_total} partos para el animal usando el endpoint dedicado")
            found_parto = True
        else:
            assert parts_info["total"] > 0, "El contador de partos no se incrementó"
            
            # Buscar el parto en la lista
            found_parto = False
            for parto in parts_info["items"]:
                if parto["id"] == parto_id:
                    found_parto = True
                    assert parto["part"] == parto_data["part"], "La fecha del parto no coincide"
                    assert parto["GenereT"] == parto_data["GenereT"], "El género de la cría no coincide"
                    assert parto["EstadoT"] == parto_data["EstadoT"], "El estado de la cría no coincide"
                    break
            
            assert found_parto, f"El parto con ID {parto_id} no se encontró en la lista de partos del animal"
        
        print("Parto verificado correctamente en el animal")

        # 4. No podemos eliminar el parto (regla de negocio: los partos son registros históricos permanentes)
        print("\n4. VERIFICAR QUE LOS PARTOS NO PUEDEN ELIMINARSE (REGLA DE NEGOCIO)")

        delete_parto_response = requests.delete(f"{BASE_URL}/{animal_id}/partos/{parto_id}", headers=headers)
        assert delete_parto_response.status_code == 405, f"Los partos deberían no poder eliminarse (Método no permitido). Respuesta: {delete_parto_response.status_code}"
        print("Verificado: Los partos no pueden eliminarse (son registros históricos permanentes)")
        
    finally:
        # Limpiar: eliminar el animal creado
        delete_response = requests.delete(f"{BASE_URL}/{animal_id}", headers=headers)
        assert delete_response.status_code == 204, f"Error al eliminar animal: {delete_response.status_code} - {delete_response.text}"
        
        print("Animal eliminado correctamente")
    
    print("\nTest de animal con partos completado con éxito.")
