import requests
import json

# ID de Marta (ya lo vemos en el listado)
MARTA_ID = 446
BASE_URL = "http://localhost:8000/api/v1"

# Obtener token
credentials = {
    "username": "admin",
    "password": "admin123"
}
auth_response = requests.post(
    f"{BASE_URL}/auth/login",
    data=credentials,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if auth_response.status_code != 200:
    print(f"Error de autenticación: {auth_response.status_code} - {auth_response.text}")
    exit(1)

token = auth_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Verificar que Marta existe y obtener sus detalles
animal_response = requests.get(f"{BASE_URL}/animals/{MARTA_ID}", headers=headers)

if animal_response.status_code != 200:
    print(f"Error al obtener el animal: {animal_response.status_code} - {animal_response.text}")
    exit(1)

animal_data = animal_response.json()
print("\n=== DETALLES DE MARTA (ID 446) ===")

# Intentar obtener datos del animal según la estructura
if isinstance(animal_data, dict):
    # Caso 1: Datos directos en la respuesta
    if "nom" in animal_data:
        print(f"Nombre: {animal_data.get('nom')}")
        print(f"Género: {animal_data.get('genere')}")
        print(f"ID: {animal_data.get('id')}")
        print(f"Explotación: {animal_data.get('explotacio')}")
        print(f"Estado: {animal_data.get('estado')}")
        
        # Información de partos en el animal
        if "partos" in animal_data:
            partos_info = animal_data["partos"]
            print(f"\nInformación de partos en el animal:")
            print(f"Total de partos: {partos_info.get('total', 0)}")
            print(f"Último parto: {partos_info.get('ultimo')}")
            
            if "items" in partos_info and partos_info["items"]:
                print(f"Partos en animal.partos.items: {len(partos_info['items'])}")
    
    # Caso 2: Formato {status: success, data: {...}}
    elif "status" in animal_data and animal_data["status"] == "success" and "data" in animal_data:
        animal = animal_data["data"]
        print(f"Nombre: {animal.get('nom')}")
        print(f"Género: {animal.get('genere')}")
        print(f"ID: {animal.get('id')}")
        print(f"Explotación: {animal.get('explotacio')}")
        print(f"Estado: {animal.get('estado')}")
        
        # Información de partos en el animal
        if "partos" in animal:
            partos_info = animal["partos"]
            print(f"\nInformación de partos en el animal:")
            print(f"Total de partos: {partos_info.get('total', 0)}")
            print(f"Último parto: {partos_info.get('ultimo')}")
            
            if "items" in partos_info and partos_info["items"]:
                print(f"Partos en animal.partos.items: {len(partos_info['items'])}")

# Obtener los partos específicamente
print("\n=== CONSULTANDO PARTOS DE MARTA ===")
partos_response = requests.get(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers)

if partos_response.status_code != 200:
    print(f"Error al obtener partos: {partos_response.status_code} - {partos_response.text}")
    exit(1)

partos_data = partos_response.json()
print(f"Respuesta del endpoint de partos:")
print(json.dumps(partos_data, indent=2, ensure_ascii=False))

# Intentar extraer y mostrar los partos de diferentes posibles estructuras
partos_list = []

if isinstance(partos_data, list):
    # Caso 1: La respuesta directamente es una lista de partos
    partos_list = partos_data
elif isinstance(partos_data, dict):
    # Caso 2: {data: [partos]}
    if "data" in partos_data and isinstance(partos_data["data"], list):
        partos_list = partos_data["data"]
    # Caso 3: {status: success, data: {items: [partos]}}
    elif "status" in partos_data and "data" in partos_data and isinstance(partos_data["data"], dict):
        if "items" in partos_data["data"]:
            partos_list = partos_data["data"]["items"]

print(f"\nSe encontraron {len(partos_list)} partos para Marta")

if partos_list:
    print(f"\n{'ID':<5} {'FECHA':<12} {'GÉNERO_T':<8} {'ESTADO_T':<8} {'OBSERVACIONES':<30}")
    print("-" * 70)
    
    for parto in partos_list:
        observacions = parto.get('observacions', 'N/A')
        if observacions is None:
            observacions = 'N/A'
        print(f"{parto.get('id', 'N/A'):<5} {parto.get('part', 'N/A'):<12} {parto.get('GenereT', 'N/A'):<8} {parto.get('EstadoT', 'N/A'):<8} {observacions:<30}")

print("\n=== CREAR PARTO DE PRUEBA ===")
respuesta = input("¿Quieres crear un parto de prueba para Marta? (s/n): ")

if respuesta.lower() == "s":
    from datetime import datetime
    
    parto_data = {
        "part": datetime.now().strftime('%d/%m/%Y'),
        "GenereT": "F",  # Cría hembra
        "EstadoT": "OK",  # Cría viva
        "observacions": "Parto de prueba para Marta"
    }
    
    crear_response = requests.post(f"{BASE_URL}/animals/{MARTA_ID}/partos", headers=headers, json=parto_data)
    
    if crear_response.status_code in [200, 201]:
        print("Parto creado con éxito!")
        print(json.dumps(crear_response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"Error al crear parto: {crear_response.status_code}")
        print(crear_response.text)
