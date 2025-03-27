"""
Script para probar los endpoints de explotaciones.
"""
import requests
import json
import sys

# Configuración
BASE_URL = "http://127.0.0.1:8000/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJVc2VyUm9sZS5BRE1JTiIsImV4cCI6MTc0MjQ3NzU3M30.PWdh3_6uffg2OBCcfJM_d_cWYrQP9mH3w9IggGLJud8"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def test_list_explotacions():
    """Prueba el endpoint GET /explotacions/"""
    url = f"{BASE_URL}/explotacions/"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        print("✅ GET /explotacions/ - OK")
        data = response.json()
        print(f"Número de explotaciones: {len(data)}")
        
        # Mostrar las primeras 5 explotaciones
        for i, explotacio in enumerate(data[:5]):
            print(f"{i+1}. ID: {explotacio['id']}, Nombre: {explotacio['nom']}, Activa: {explotacio['activa']}")
        
        return data
    else:
        print(f"❌ GET /explotacions/ - Error: {response.status_code}")
        print(response.text)
        return None

def test_get_explotacio(explotacio_id):
    """Prueba el endpoint GET /explotacions/{id}"""
    url = f"{BASE_URL}/explotacions/{explotacio_id}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code == 200:
        print(f"✅ GET /explotacions/{explotacio_id} - OK")
        data = response.json()
        print(json.dumps(data, indent=2))
        return data
    else:
        print(f"❌ GET /explotacions/{explotacio_id} - Error: {response.status_code}")
        print(response.text)
        return None

def test_create_explotacio(nom, explotaci=None, activa=True):
    """Prueba el endpoint POST /explotacions/"""
    url = f"{BASE_URL}/explotacions/"
    data = {
        "nom": nom,
        "activa": activa
    }
    
    if explotaci:
        data["explotaci"] = explotaci
    
    response = requests.post(url, headers=HEADERS, json=data)
    
    if response.status_code == 200:
        print(f"✅ POST /explotacions/ - OK")
        data = response.json()
        print(json.dumps(data, indent=2))
        return data
    else:
        print(f"❌ POST /explotacions/ - Error: {response.status_code}")
        print(response.text)
        return None

def test_update_explotacio(explotacio_id, nom=None, explotaci=None, activa=None):
    """Prueba el endpoint PUT /explotacions/{id}"""
    url = f"{BASE_URL}/explotacions/{explotacio_id}"
    data = {}
    
    if nom is not None:
        data["nom"] = nom
    if explotaci is not None:
        data["explotaci"] = explotaci
    if activa is not None:
        data["activa"] = activa
    
    response = requests.put(url, headers=HEADERS, json=data)
    
    if response.status_code == 200:
        print(f"✅ PUT /explotacions/{explotacio_id} - OK")
        data = response.json()
        print(json.dumps(data, indent=2))
        return data
    else:
        print(f"❌ PUT /explotacions/{explotacio_id} - Error: {response.status_code}")
        print(response.text)
        return None

def test_delete_explotacio(explotacio_id):
    """Prueba el endpoint DELETE /explotacions/{id}"""
    url = f"{BASE_URL}/explotacions/{explotacio_id}"
    response = requests.delete(url, headers=HEADERS)
    
    if response.status_code == 200:
        print(f"✅ DELETE /explotacions/{explotacio_id} - OK")
        data = response.json()
        print(json.dumps(data, indent=2))
        return data
    else:
        print(f"❌ DELETE /explotacions/{explotacio_id} - Error: {response.status_code}")
        print(response.text)
        return None

if __name__ == "__main__":
    # Si se proporciona un argumento, se usa como ID para obtener una explotación específica
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "get" and len(sys.argv) > 2:
            # Obtener una explotación específica
            explotacio_id = int(sys.argv[2])
            test_get_explotacio(explotacio_id)
        
        elif command == "create" and len(sys.argv) > 2:
            # Crear una nueva explotación
            nom = sys.argv[2]
            explotaci = sys.argv[3] if len(sys.argv) > 3 else None
            test_create_explotacio(nom, explotaci)
        
        elif command == "update" and len(sys.argv) > 3:
            # Actualizar una explotación existente
            explotacio_id = int(sys.argv[2])
            nom = sys.argv[3]
            explotaci = sys.argv[4] if len(sys.argv) > 4 else None
            activa = True if len(sys.argv) <= 5 or sys.argv[5].lower() == "true" else False
            test_update_explotacio(explotacio_id, nom, explotaci, activa)
        
        elif command == "delete" and len(sys.argv) > 2:
            # Eliminar una explotación
            explotacio_id = int(sys.argv[2])
            test_delete_explotacio(explotacio_id)
        
        else:
            print("Uso:")
            print("  python test_explotacions.py                  # Listar todas las explotaciones")
            print("  python test_explotacions.py get ID           # Obtener una explotación específica")
            print("  python test_explotacions.py create NOMBRE [EXPLOTACI]  # Crear una nueva explotación")
            print("  python test_explotacions.py update ID NOMBRE [EXPLOTACI] [ACTIVA]  # Actualizar una explotación")
            print("  python test_explotacions.py delete ID        # Eliminar una explotación")
    else:
        # Listar todas las explotaciones
        explotacions = test_list_explotacions()
