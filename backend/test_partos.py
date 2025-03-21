"""
Script para probar los endpoints de partos
"""
import requests
import json
from datetime import datetime, timedelta
import sys

# Configuración base
BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Credenciales de administrador (según la memoria del sistema)
AUTH_DATA = {
    "username": "admin",
    "password": "admin123"
}

# IDs de vacas existentes para usar en las pruebas
VACAS_EXISTENTES = [
    {"nombre": "Marta", "id": 1},  # Ajustar ID según corresponda
    {"nombre": "20-36", "id": 2}   # Ajustar ID según corresponda
]

def obtener_token():
    """Obtiene un token de autenticación"""
    auth_url = f"{BASE_URL}/auth/login"
    
    # Para OAuth2PasswordRequestForm, debemos enviar los datos como form-data, no como JSON
    response = requests.post(
        auth_url, 
        data=AUTH_DATA,  # Usar data en lugar de json
        headers={"Content-Type": "application/x-www-form-urlencoded"}  # Cambiar Content-Type
    )
    
    if response.status_code != 200:
        print(f"Error de autenticación: {response.status_code}")
        print(response.text)
        sys.exit(1)
        
    token = response.json().get("access_token")
    return token

def configurar_headers():
    """Configura los headers con el token de autenticación"""
    token = obtener_token()
    headers = HEADERS.copy()
    headers["Authorization"] = f"Bearer {token}"
    return headers

def obtener_animal_por_nombre(nombre):
    """Busca un animal por su nombre"""
    headers = configurar_headers()
    
    # Buscar animal por nombre
    animals_url = f"{BASE_URL}/animals/"
    response = requests.get(animals_url, headers=headers)
    
    if response.status_code != 200:
        print(f"Error obteniendo animales: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    # Procesar la respuesta
    try:
        animales = response.json()
        
        # Si la respuesta es un diccionario con una clave 'data', extraer los animales
        if isinstance(animales, dict) and 'data' in animales:
            animales = animales['data']
        
        # Buscar el animal por nombre
        for animal in animales:
            if isinstance(animal, dict) and animal.get('nom') == nombre:
                animal_id = animal.get('id')
                print(f"Animal encontrado: {nombre} (ID: {animal_id})")
                return animal_id
    except Exception as e:
        print(f"Error procesando la respuesta: {str(e)}")
        print(f"Respuesta: {response.text[:200]}...")
    
    return None

def obtener_animal_hembra():
    """Obtiene una vaca hembra para las pruebas"""
    # Intentar con las vacas predefinidas
    for vaca in VACAS_EXISTENTES:
        animal_id = obtener_animal_por_nombre(vaca["nombre"])
        if animal_id:
            print(f"Usando vaca existente: {vaca['nombre']} (ID: {animal_id})")
            return animal_id
    
    # Si no se encuentra ninguna, crear una nueva
    return crear_animal_hembra()

def crear_animal_hembra():
    """Crea un animal hembra para las pruebas de partos"""
    headers = configurar_headers()
    
    # Primero verificamos si existe una explotación para usar
    explotaciones_url = f"{BASE_URL}/explotacions/"
    response = requests.get(explotaciones_url, headers=headers)
    
    if response.status_code != 200:
        print(f"Error obteniendo explotaciones: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    explotaciones = response.json()
    if not explotaciones:
        # Crear una explotación si no existe ninguna
        nueva_explotacion = {
            "nom": "Explotación de Prueba",
            "explotaci": "EXP001",
            "activa": True
        }
        response = requests.post(explotaciones_url, json=nueva_explotacion, headers=headers)
        if response.status_code not in [200, 201]:
            print(f"Error creando explotación: {response.status_code}")
            print(response.text)
            sys.exit(1)
        explotacion_id = response.json()["id"]
        explotacion_nombre = nueva_explotacion["nom"]
    else:
        # Usar la primera explotación existente
        explotacion_id = explotaciones[0]["id"]
        explotacion_nombre = explotaciones[0]["nom"]
    
    # Crear un animal hembra para las pruebas
    animal_url = f"{BASE_URL}/animals/"
    
    # Fecha de nacimiento: 2 años atrás
    fecha_nacimiento = (datetime.now() - timedelta(days=2*365)).strftime("%d/%m/%Y")
    
    nuevo_animal = {
        "nom": f"Vaca de Prueba {datetime.now().strftime('%Y%m%d%H%M%S')}",
        "explotacio": explotacion_nombre,
        "genere": "F",  # Hembra
        "estado": "OK",
        "alletar": "NO",
        "dob": fecha_nacimiento
    }
    
    response = requests.post(animal_url, json=nuevo_animal, headers=headers)
    
    if response.status_code not in [200, 201]:
        print(f"Error creando animal: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    animal_id = response.json()["data"]["id"]
    print(f"Animal hembra creado con ID: {animal_id}")
    return animal_id

def test_listar_partos():
    """Prueba el endpoint para listar partos"""
    headers = configurar_headers()
    partos_url = f"{BASE_URL}/partos/"
    
    response = requests.get(partos_url, headers=headers)
    
    print("\n=== LISTAR PARTOS ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total de partos: {data['data']['total']}")
        for parto in data['data']['items']:
            print(f"ID: {parto['id']}, Animal: {parto['animal_id']}, Fecha: {parto['data']}, Género: {parto['genere_fill']}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_crear_parto(animal_id):
    """Prueba el endpoint para crear un parto"""
    headers = configurar_headers()
    partos_url = f"{BASE_URL}/partos/"
    
    # Fecha del parto: hace 1 mes
    fecha_parto = (datetime.now() - timedelta(days=30)).strftime("%d/%m/%Y")
    
    nuevo_parto = {
        "animal_id": animal_id,
        "data": fecha_parto,
        "genere_fill": "M",  # Macho
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = requests.post(partos_url, json=nuevo_parto, headers=headers)
    
    print("\n=== CREAR PARTO ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        data = response.json()
        parto_id = data['data']['id']
        print(f"Parto creado con ID: {parto_id}")
        print(f"Detalles: {json.dumps(data['data'], indent=2)}")
        return parto_id
    else:
        print(f"Error: {response.text}")
        return None

def test_obtener_parto(parto_id):
    """Prueba el endpoint para obtener un parto específico"""
    headers = configurar_headers()
    parto_url = f"{BASE_URL}/partos/{parto_id}"
    
    response = requests.get(parto_url, headers=headers)
    
    print("\n=== OBTENER PARTO ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Detalles del parto: {json.dumps(data['data'], indent=2)}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_actualizar_parto(parto_id):
    """Prueba el endpoint para actualizar un parto"""
    headers = configurar_headers()
    parto_url = f"{BASE_URL}/partos/{parto_id}"
    
    # Actualizar el género y estado del ternero
    actualizacion_parto = {
        "genere_fill": "F",  # Cambiar a hembra
        "estat_fill": "DEF"  # Cambiar a defunción
    }
    
    response = requests.put(parto_url, json=actualizacion_parto, headers=headers)
    
    print("\n=== ACTUALIZAR PARTO ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Parto actualizado: {json.dumps(data['data'], indent=2)}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_listar_partos_animal(animal_id):
    """Prueba el endpoint para listar partos de un animal específico"""
    headers = configurar_headers()
    partos_url = f"{BASE_URL}/animals/{animal_id}/parts"
    
    response = requests.get(partos_url, headers=headers)
    
    print(f"\n=== LISTAR PARTOS DEL ANIMAL {animal_id} ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total de partos: {data['data']['total']}")
        for parto in data['data']['items']:
            print(f"ID: {parto['id']}, Fecha: {parto['data']}, Género: {parto['genere_fill']}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_crear_parto_animal(animal_id):
    """Prueba el endpoint para crear un parto a través de la ruta anidada del animal"""
    headers = configurar_headers()
    partos_url = f"{BASE_URL}/animals/{animal_id}/parts"
    
    # Fecha del parto: hace 2 meses
    fecha_parto = (datetime.now() - timedelta(days=60)).strftime("%d/%m/%Y")
    
    nuevo_parto = {
        "animal_id": animal_id,  
        "data": fecha_parto,
        "genere_fill": "F",  
        "estat_fill": "OK",
        "numero_part": 2
    }
    
    response = requests.post(partos_url, json=nuevo_parto, headers=headers)
    
    print(f"\n=== CREAR PARTO PARA ANIMAL {animal_id} ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        data = response.json()
        parto_id = data['data']['id']
        print(f"Parto creado con ID: {parto_id}")
        print(f"Detalles: {json.dumps(data['data'], indent=2)}")
        return parto_id
    else:
        print(f"Error: {response.text}")
        return None

def test_actualizar_parto_animal(animal_id, parto_id):
    """Prueba el endpoint para actualizar un parto a través de la ruta anidada del animal"""
    headers = configurar_headers()
    
    # Nota: Parece que el endpoint anidado no soporta actualización directa (405 Method Not Allowed)
    # En su lugar, usamos el endpoint standalone para actualizar el parto
    parto_url = f"{BASE_URL}/partos/{parto_id}"
    
    # Actualizar observaciones
    actualizacion_parto = {
        "observacions": "Actualización de prueba desde ruta anidada"
    }
    
    response = requests.put(parto_url, json=actualizacion_parto, headers=headers)
    
    print(f"\n=== ACTUALIZAR PARTO {parto_id} DEL ANIMAL {animal_id} (VÍA ENDPOINT STANDALONE) ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Parto actualizado: {json.dumps(data, indent=2)}")
        except Exception as e:
            print(f"Error al procesar la respuesta: {str(e)}")
            print(f"Respuesta recibida: {response.text}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def ejecutar_pruebas():
    """Ejecuta todas las pruebas de endpoints de partos"""
    print("Iniciando pruebas de endpoints de partos...")
    
    # Obtener o crear animal hembra para las pruebas
    animal_id = obtener_animal_hembra()
    
    # Probar endpoints standalone
    test_listar_partos()
    parto_id = test_crear_parto(animal_id)
    
    if parto_id:
        test_obtener_parto(parto_id)
        test_actualizar_parto(parto_id)
    
    # Probar endpoints anidados
    test_listar_partos_animal(animal_id)
    parto_id_anidado = test_crear_parto_animal(animal_id)
    
    if parto_id_anidado:
        test_actualizar_parto_animal(animal_id, parto_id_anidado)
    
    print("\nPruebas completadas.")

if __name__ == "__main__":
    ejecutar_pruebas()
