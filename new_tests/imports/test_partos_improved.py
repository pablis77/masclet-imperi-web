"""
Test avanzado para verificar el funcionamiento de los partos en el proceso de importación.

Este test verifica específicamente:
1. Que solo las hembras (F) puedan tener partos
2. Que los partos se procesen correctamente con todos sus datos
3. Que los machos (M) no puedan tener partos
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
async def test_partos_improved(auth_token):
    """
    Test mejorado que verifica el comportamiento de los partos durante la importación:
    1. Las hembras pueden tener partos y se procesan correctamente
    2. Los machos no pueden tener partos
    """
    # Creamos un prefijo único para este test
    test_prefix = f"Test_{uuid.uuid4().hex[:6]}"
    print(f"Usando prefijo único para este test: {test_prefix}")
    
    # Crear archivo CSV con combinaciones específicas
    test_file_path = f"{test_prefix}_partos.csv"
    test_content = f"""nom;genere;estado;explotacio;part;GenereT;EstadoT
{test_prefix}_F_Parto1;F;OK;ExplotTest;01/01/2023;M;OK
{test_prefix}_F_Parto2;F;OK;ExplotTest;02/02/2023;F;OK
{test_prefix}_F_Parto3;F;OK;ExplotTest;03/03/2023;F;DEF
{test_prefix}_M_NoParto;M;OK;ExplotTest;01/01/2023;M;OK"""

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
            data = {"description": f"Test partos {test_prefix}"}
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
        time.sleep(2)
        
        # Ver todos los animales para hacer un diagnóstico general
        print("\n=== Listado completo de animales de este test ===")
        all_animals_response = requests.get(f"{ANIMALS_URL}/?limit=100", headers=headers)
        all_animals = all_animals_response.json()["data"]["items"]
        print(f"Total de animales en la BD: {len(all_animals)}")
        
        # Encontrar los animales creados por este test
        test_animals = [a for a in all_animals if a["nom"].startswith(test_prefix)]
        print(f"Animales encontrados de este test: {len(test_animals)}")
        for a in test_animals:
            animal_ids.append(a["id"])
            print(f"- {a['nom']}: género={a['genere']}, alletar={a['alletar']}, explotacio={a['explotacio']}")
        
        # Verificar partos para cada animal
        print("\n=== Verificando partos para cada animal ===")
        
        for animal in test_animals:
            animal_id = animal["id"]
            animal_name = animal["nom"]
            print(f"\nVERIFICANDO: {animal_name} (ID: {animal_id}, Género: {animal['genere']})")
            
            # ESTRATEGIA 1: Obtener partos a través del endpoint principal con parámetro
            partos_url = f"{API_URL}/partos"
            params = {"animal_id": animal_id}
            print(f"Intentando obtener partos con endpoint principal: {partos_url} con params={params}")
            
            partos_response = requests.get(partos_url, headers=headers, params=params)
            
            # Si el endpoint principal falla, intentar con el endpoint anidado
            if partos_response.status_code != 200:
                print(f"Error con endpoint principal: {partos_response.status_code}. Intentando endpoint anidado...")
                nested_url = f"{ANIMALS_URL}/{animal_id}/partos"
                print(f"Usando URL alternativa: {nested_url}")
                partos_response = requests.get(nested_url, headers=headers)
                
            assert partos_response.status_code == 200, f"Error obteniendo partos: {partos_response.status_code} - {partos_response.text}"
            
            # Procesar la respuesta según la estructura
            response_data = partos_response.json()
            
            # Verificar si la respuesta es una lista directa o está dentro de una estructura
            if isinstance(response_data, dict) and 'data' in response_data and 'items' in response_data['data']:
                partos = response_data['data']['items']
            else:
                partos = response_data  # Respuesta directa como lista
            print(f"Partos encontrados: {len(partos)}")
            
            # Verificar según el animal
            if animal["genere"] == "F" and animal_name.startswith(f"{test_prefix}_F_Parto"):
                # Las hembras con "Parto" en el nombre deberían tener un parto
                assert len(partos) > 0, f"La hembra {animal_name} debería tener partos pero no tiene ninguno"
                
                # Verificar detalles del parto
                parto = partos[0]
                print(f"Datos del parto: {json.dumps(parto, indent=2)}")
                
                # Verificar datos específicos según el animal
                if animal_name.endswith("Parto1"):
                    assert parto["part"] == "01/01/2023", f"Fecha incorrecta para {animal_name}: {parto['part']}"
                    assert parto["GenereT"] == "M", f"Género de cría incorrecto para {animal_name}: {parto['GenereT']}"
                    assert parto["EstadoT"] == "OK", f"Estado de cría incorrecto para {animal_name}: {parto['EstadoT']}"
                
                elif animal_name.endswith("Parto2"):
                    assert parto["part"] == "02/02/2023", f"Fecha incorrecta para {animal_name}: {parto['part']}"
                    assert parto["GenereT"] == "F", f"Género de cría incorrecto para {animal_name}: {parto['GenereT']}"
                    assert parto["EstadoT"] == "OK", f"Estado de cría incorrecto para {animal_name}: {parto['EstadoT']}"
                
                elif animal_name.endswith("Parto3"):
                    assert parto["part"] == "03/03/2023", f"Fecha incorrecta para {animal_name}: {parto['part']}"
                    assert parto["GenereT"] == "F", f"Género de cría incorrecto para {animal_name}: {parto['GenereT']}"
                    assert parto["EstadoT"] == "DEF", f"Estado de cría incorrecto para {animal_name}: {parto['EstadoT']}"
                
                # Verificar que el alletar está en 1 o más si tiene partos
                detail_response = requests.get(f"{ANIMALS_URL}/{animal_id}", headers=headers)
                detail = detail_response.json()["data"]
                print(f"Alletar del animal con parto: {detail['alletar']}")
                assert detail["alletar"] in ["1", "2"], f"Animal con parto debe tener alletar 1 o 2, tiene: {detail['alletar']}"
                
            elif animal["genere"] == "M":
                # Los machos no deberían tener partos
                assert len(partos) == 0, f"El macho {animal_name} no debería tener partos pero tiene {len(partos)}"
                
                # Verificar que alletar siempre es 0 para machos
                detail_response = requests.get(f"{ANIMALS_URL}/{animal_id}", headers=headers)
                detail = detail_response.json()["data"]
                assert detail["alletar"] == "0", f"Macho debe tener alletar=0, tiene: {detail['alletar']}"
    
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
