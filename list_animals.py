import requests
import json

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

def list_animals(token, limit=100):
    """Lista todos los animales en la base de datos."""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Realizar la solicitud con un límite mayor para ver más animales
    response = requests.get(f"{BASE_URL}/animals/?limit={limit}", headers=headers)
    
    if response.status_code != 200:
        print(f"Error al obtener animales: {response.status_code} - {response.text}")
        return None
    
    return response.json()

def main():
    # Obtener token
    print("Obteniendo token de autenticación...")
    token = get_token()
    if not token:
        print("No se pudo obtener el token. Saliendo.")
        return
    
    # Listar animales
    print("\nConsultando lista de animales...")
    animals_data = list_animals(token, limit=100)  # Aumentar límite para ver más animales
    
    if not animals_data:
        print("No se pudieron obtener datos de animales.")
        return
    
    # Analizar la estructura de datos
    if isinstance(animals_data, dict) and "status" in animals_data and animals_data["status"] == "success":
        if "data" in animals_data and isinstance(animals_data["data"], dict):
            if "items" in animals_data["data"]:
                animals = animals_data["data"]["items"]
                total = animals_data["data"].get("total", "desconocido")
                print(f"\nEncontrados {len(animals)} animales de un total de {total}:")
                
                # Tabla de cabecera
                print(f"\n{'ID':<6} {'NOMBRE':<10} {'GÉNERO':<7} {'ESTADO':<7} {'AMAMANTA':<9} {'EXPLOTACIÓN':<15}")
                print("-" * 60)
                
                # Animales
                for animal in animals:
                    print(f"{animal.get('id', 'N/A'):<6} {animal.get('nom', 'N/A'):<10} {animal.get('genere', 'N/A'):<7} {animal.get('estado', 'N/A'):<7} {animal.get('alletar', 'N/A'):<9} {animal.get('explotacio', 'N/A'):<15}")
                
                # Detalle completo del primer animal como referencia
                print("\nDetalle completo del primer animal (como referencia de estructura):")
                print(json.dumps(animals[0], indent=2, ensure_ascii=False))
                
                # Resumen por género
                females = sum(1 for a in animals if a.get('genere') == 'F')
                males = sum(1 for a in animals if a.get('genere') == 'M')
                print(f"\nResumen por género: {females} hembras, {males} machos")
                
                # Resumen por estado
                status_count = {}
                for a in animals:
                    status = a.get('estado', 'N/A')
                    status_count[status] = status_count.get(status, 0) + 1
                
                print("\nResumen por estado:")
                for status, count in status_count.items():
                    print(f"  {status}: {count}")
                
                # Resumen por amamantamiento (solo para hembras)
                if females > 0:
                    alletar_count = {}
                    for a in animals:
                        if a.get('genere') == 'F':
                            alletar = a.get('alletar', 'N/A')
                            alletar_count[alletar] = alletar_count.get(alletar, 0) + 1
                    
                    print("\nResumen de amamantamiento (hembras):")
                    for alletar, count in alletar_count.items():
                        print(f"  {alletar}: {count}")
            else:
                print("No se encontró la lista de animales en la respuesta.")
        else:
            print("Estructura de datos inesperada.")
    else:
        print("Formato de respuesta inesperado:", animals_data)

if __name__ == "__main__":
    main()
