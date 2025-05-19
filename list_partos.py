import requests
import json
from datetime import datetime

# Constantes
BASE_URL = "http://localhost:8000/api/v1"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def get_token():
    """Obtiene un token de autenticación."""
    credentials = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data=credentials,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code != 200:
        print(f"Error al obtener token: {response.status_code} - {response.text}")
        return None
    
    return response.json()["access_token"]

def get_animal_details(token, animal_id):
    """Obtiene detalles de un animal específico."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/animals/{animal_id}", headers=headers)
    
    if response.status_code != 200:
        print(f"Error al obtener detalles del animal: {response.status_code} - {response.text}")
        return None
    
    return response.json()

def get_animal_partos(token, animal_id):
    """Obtiene los partos de un animal específico."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/animals/{animal_id}/partos", headers=headers)
    
    if response.status_code != 200:
        print(f"Error al obtener partos del animal: {response.status_code} - {response.text}")
        return None
    
    return response.json()

def find_animal_by_name(token, name):
    """Busca un animal por su nombre."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/animals/", headers=headers)
    
    if response.status_code != 200:
        print(f"Error al obtener lista de animales: {response.status_code} - {response.text}")
        return None
    
    data = response.json()
    
    # Extraer lista de animales según la estructura de datos
    animals = []
    if isinstance(data, dict) and "status" in data and data["status"] == "success":
        if "data" in data and isinstance(data["data"], dict) and "items" in data["data"]:
            animals = data["data"]["items"]
    
    # Buscar animal por nombre
    for animal in animals:
        if animal.get("nom", "").lower() == name.lower():
            return animal
    
    return None

def main():
    # Obtener token
    print("Obteniendo token de autenticación...")
    token = get_token()
    if not token:
        print("No se pudo obtener el token. Saliendo.")
        return
    
    # Buscar vaca Marta
    print("\nBuscando vaca 'Marta'...")
    marta = find_animal_by_name(token, "Marta")
    
    if not marta:
        print("No se encontró ninguna vaca con el nombre 'Marta'.")
        return
    
    # Mostrar detalles básicos
    marta_id = marta.get("id")
    print(f"\nEncontrada vaca Marta con ID: {marta_id}")
    print(f"Nombre: {marta.get('nom')}")
    print(f"Género: {marta.get('genere')}")
    print(f"Estado: {marta.get('estado')}")
    print(f"Amamantamiento: {marta.get('alletar')}")
    print(f"Explotación: {marta.get('explotacio')}")
    
    # Mostrar partos desde el detalle del animal
    partos_info = marta.get("partos", {})
    total_partos = partos_info.get("total", 0)
    ultimo_parto = partos_info.get("ultimo")
    
    print(f"\nPartos (según info básica): {total_partos}")
    print(f"Último parto: {ultimo_parto}")
    
    # Consultar detalles específicos de los partos
    print("\nConsultando detalles específicos de los partos...")
    partos_detalle = get_animal_partos(token, marta_id)
    
    if not partos_detalle:
        print("No se pudieron obtener los detalles de los partos.")
        return
    
    # Verificar estructura de la respuesta y mostrar partos
    if isinstance(partos_detalle, dict):
        # Intento 1: Estructura {data: [partos]}
        if "data" in partos_detalle and isinstance(partos_detalle["data"], list):
            partos = partos_detalle["data"]
            print(f"\nSe encontraron {len(partos)} partos para Marta:")
            
            if partos:
                print(f"\n{'ID':<5} {'FECHA':<12} {'GÉNERO_T':<8} {'ESTADO_T':<8} {'OBSERVACIONES':<30}")
                print("-" * 70)
                
                for parto in partos:
                    print(f"{parto.get('id', 'N/A'):<5} {parto.get('part', 'N/A'):<12} {parto.get('GenereT', 'N/A'):<8} {parto.get('EstadoT', 'N/A'):<8} {parto.get('observacions', 'N/A'):<30}")
                
                # Detalle completo del primer parto
                print("\nDetalle completo del primer parto:")
                print(json.dumps(partos[0], indent=2, ensure_ascii=False))
            else:
                print("No hay partos registrados.")
        
        # Intento 2: Estructura {status: success, data: {items: [partos]}}
        elif "status" in partos_detalle and partos_detalle["status"] == "success":
            if "data" in partos_detalle and isinstance(partos_detalle["data"], dict):
                if "items" in partos_detalle["data"]:
                    partos = partos_detalle["data"]["items"]
                    print(f"\nSe encontraron {len(partos)} partos para Marta:")
                    
                    if partos:
                        print(f"\n{'ID':<5} {'FECHA':<12} {'GÉNERO_T':<8} {'ESTADO_T':<8} {'OBSERVACIONES':<30}")
                        print("-" * 70)
                        
                        for parto in partos:
                            print(f"{parto.get('id', 'N/A'):<5} {parto.get('part', 'N/A'):<12} {parto.get('GenereT', 'N/A'):<8} {parto.get('EstadoT', 'N/A'):<8} {parto.get('observacions', 'N/A'):<30}")
                        
                        # Detalle completo del primer parto
                        print("\nDetalle completo del primer parto:")
                        print(json.dumps(partos[0], indent=2, ensure_ascii=False))
                    else:
                        print("No hay partos registrados.")
                else:
                    print("No se encontró la lista de partos en la respuesta.")
            else:
                print("Estructura de datos inesperada.")
        else:
            print("Estructura de respuesta inesperada:")
            print(json.dumps(partos_detalle, indent=2, ensure_ascii=False))
    else:
        print("Formato de respuesta inesperado:", partos_detalle)
    
    # Prueba: Crear un parto para Marta si no tiene ninguno
    if total_partos == 0:
        crear_parto = input("\n¿Desea crear un parto de prueba para Marta? (s/n): ")
        if crear_parto.lower() == 's':
            headers = {"Authorization": f"Bearer {token}"}
            
            parto_data = {
                "part": datetime.now().strftime('%d/%m/%Y'),
                "GenereT": "F",  # Cría hembra
                "EstadoT": "OK",  # Cría viva
                "observacions": "Parto de prueba creado desde script"
            }
            
            url = f"{BASE_URL}/animals/{marta_id}/partos/"
            print(f"\nCreando parto para Marta (ID: {marta_id}) en {url}")
            
            response = requests.post(url, headers=headers, json=parto_data)
            
            if response.status_code in [200, 201]:
                print("¡Parto creado con éxito!")
                print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            else:
                print(f"Error al crear parto: {response.status_code} - {response.text}")

if __name__ == "__main__":
    main()
