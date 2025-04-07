"""
Test avanzado para verificar el funcionamiento del campo 'alletar' en el proceso de importación.

Este test verifica específicamente:
1. Que los machos (M) siempre tengan alletar="0" independientemente del valor en el CSV
2. Que las hembras (F) conserven el valor específico de alletar del CSV (0, 1, 2)
"""
import pytest
import os
import requests
import aiofiles
import time
import uuid
import json

# URLs base para las pruebas
API_URL = "http://localhost:8000/api/v1"
IMPORTS_URL = f"{API_URL}/imports"
AUTH_URL = f"{API_URL}/auth"
ANIMALS_URL = f"{API_URL}/animals"

@pytest.fixture
def auth_token():
    """Obtener token de autenticación para las pruebas."""
    credentials = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = requests.post(f"{AUTH_URL}/login", data=credentials)
    assert response.status_code == 200, f"Error al autenticar: {response.text}"
    
    data = response.json()
    assert "access_token" in data, "Falta el token de acceso en la respuesta"
    
    return data["access_token"]

@pytest.mark.asyncio
async def test_alletar_improved(auth_token):
    """
    Test mejorado que verifica el comportamiento del campo alletar:
    1. Los machos siempre tienen alletar="0" independientemente del valor en CSV
    2. Las hembras mantienen el valor específico de alletar del CSV
    """
    # Creamos un prefijo único para este test
    test_prefix = f"Test_{uuid.uuid4().hex[:6]}"
    print(f"Usando prefijo único para este test: {test_prefix}")
    
    # Crear archivo CSV con combinaciones específicas
    test_file_path = f"{test_prefix}_alletar.csv"
    test_content = f"""nom;genere;estado;explotacio;alletar
{test_prefix}_M0;M;OK;ExplotTest;0
{test_prefix}_M1;M;OK;ExplotTest;1
{test_prefix}_M2;M;OK;ExplotTest;2
{test_prefix}_F0;F;OK;ExplotTest;0
{test_prefix}_F1;F;OK;ExplotTest;1
{test_prefix}_F2;F;OK;ExplotTest;2"""

    print(f"Contenido del CSV:\n{test_content}")
    
    async with aiofiles.open(test_file_path, 'w') as f:
        await f.write(test_content)
    
    # Lista para llevar registro de los animales creados para limpieza
    animal_ids = []
    
    try:
        # Preparar cabeceras con token de autenticación
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Ejecutar importación
        print("\n=== Iniciando importación ===")
        with open(test_file_path, "rb") as f:
            files = {"file": (test_file_path, f, "text/csv")}
            data = {"description": f"Test alletar {test_prefix}"}
            response = requests.post(
                f"{IMPORTS_URL}/csv",
                files=files,
                data=data,
                headers=headers
            )
        
        # Verificar que la importación fue exitosa
        assert response.status_code == 200
        result = response.json()
        print(f"Resultado de importación: {json.dumps(result, indent=2)}")
        assert result["status"] in ["completed", "completed_err"]
        
        # Dar tiempo a que se procese la importación
        time.sleep(1)
        
        # Ver todos los animales para hacer un diagnóstico general
        print("\n=== Listado completo de animales ===")
        all_animals_response = requests.get(f"{ANIMALS_URL}/", headers=headers)
        all_animals = all_animals_response.json()["data"]["items"]
        print(f"Total de animales en la BD: {len(all_animals)}")
        
        # Encontrar los animales creados por este test
        test_animals = [a for a in all_animals if a["nom"].startswith(test_prefix)]
        print(f"Animales encontrados de este test: {len(test_animals)}")
        for a in test_animals:
            animal_ids.append(a["id"])
            print(f"- {a['nom']}: género={a['genere']}, alletar={a['alletar']}, explotacio={a['explotacio']}")
        
        # Verificar cada uno de nuestros animales individualmente
        # IMPORTANTE: obtener cada animal por ID para evitar problemas de búsqueda
        print("\n=== Verificando animales por ID ===")
        
        for animal in test_animals:
            animal_id = animal["id"]
            animal_name = animal["nom"]
            detail_response = requests.get(f"{ANIMALS_URL}/{animal_id}", headers=headers)
            assert detail_response.status_code == 200
            detail = detail_response.json()["data"]
            
            print(f"Verificando animal: {animal_name} (ID: {animal_id})")
            print(f"Datos: {json.dumps(detail, indent=2)}")
            
            # Verificar si el alletar es correcto según género
            if detail["genere"] == "M":
                print(f"Animal macho: {animal_name}, alletar={detail['alletar']}")
                assert detail["alletar"] == "0", f"Error: Macho {animal_name} tiene alletar={detail['alletar']} en lugar de 0"
            elif detail["genere"] == "F":
                expected_alletar = None
                if animal_name.endswith("_F0"):
                    expected_alletar = "0"
                elif animal_name.endswith("_F1"):
                    expected_alletar = "1"
                elif animal_name.endswith("_F2"):
                    expected_alletar = "2"
                
                print(f"Animal hembra: {animal_name}, alletar actual={detail['alletar']}, esperado={expected_alletar}")
                if expected_alletar:
                    assert detail["alletar"] == expected_alletar, f"Error: Hembra {animal_name} tiene alletar={detail['alletar']} en lugar de {expected_alletar}"
        
        # Prueba adicional: Intentar actualizar un macho con alletar=1
        if animal_ids:
            # Tomar el primer animal que sea macho
            macho_id = None
            for animal in test_animals:
                if animal["genere"] == "M":
                    macho_id = animal["id"]
                    break
            
            if macho_id:
                print(f"\n=== Intentando actualizar alletar a 1 para macho ID: {macho_id} ===")  
                update_data = {"alletar": "1"}
                update_response = requests.patch(f"{ANIMALS_URL}/{macho_id}", json=update_data, headers=headers)
                
                # El código 422 es esperado ya que hay una validación que impide cambiar alletar en machos
                # El código 200 también sería válido si el backend permite la solicitud pero mantiene alletar=0
                assert update_response.status_code in [200, 422], f"Código de estado inesperado: {update_response.status_code}. Contenido: {update_response.text}"
                
                # Si el código es 200, buscamos el resultado en data
                # Si es 422, capturamos el error pero continuamos con la prueba
                if update_response.status_code == 200:
                    update_result = update_response.json()["data"]
                    print(f"Resultado de actualización: {json.dumps(update_result, indent=2)}")
                else:
                    error_info = update_response.json()
                    print(f"Error esperado al actualizar alletar en macho: {json.dumps(error_info, indent=2)}")
                
                # Verificar que alletar sigue siendo 0 después de intentar cambiarlo
                verify_response = requests.get(f"{ANIMALS_URL}/{macho_id}", headers=headers)
                verify_data = verify_response.json()["data"]
                print(f"Alletar después de actualización: {verify_data['alletar']}")
                assert verify_data["alletar"] == "0", f"Error: El alletar de un macho debe ser 0 después de actualización, es {verify_data['alletar']}"
    
    finally:
        # Limpieza - eliminar animales creados
        print("\n=== Limpieza ===")
        for animal_id in animal_ids:
            try:
                delete_response = requests.delete(f"{ANIMALS_URL}/{animal_id}", headers=headers)
                print(f"Animal ID {animal_id} eliminado: {delete_response.status_code}")
            except Exception as e:
                print(f"Error al eliminar animal {animal_id}: {str(e)}")
        
        # Eliminar archivo CSV
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
            print(f"Archivo CSV eliminado: {test_file_path}")
