import requests
import json
from datetime import datetime

def test_create_animal():
    """Prueba la creación de un animal con fechas en formato español"""
    url = "http://localhost:8000/api/v1/animals/"
    
    # Datos de prueba con fecha en formato español (DD/MM/YYYY)
    data = {
        "explotacio": "Granja Test",
        "nom": "Toro Test",
        "genere": "M",
        "estado": "OK",
        "dob": "01/01/2024"  # Fecha en formato español
    }
    
    print("\n=== Test de Creación de Animal ===")
    print(f"\nURL: {url}")
    print(f"Datos enviados (formato español DD/MM/YYYY):")
    print(json.dumps(data, indent=2))
    
    try:
        response = requests.post(
            url,
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.ok:
            response_data = response.json()
            print("\nRespuesta exitosa:")
            print(json.dumps(response_data, indent=2))
            
            # Verificar formato de fechas en la respuesta
            if 'data' in response_data and 'dob' in response_data['data']:
                print(f"\nFecha de nacimiento recibida: {response_data['data']['dob']}")
                print("(Debería estar en formato DD/MM/YYYY)")
        else:
            print("\nError en la respuesta:")
            print(json.dumps(response.json(), indent=2))
            
    except Exception as e:
        print(f"\nError ejecutando el test: {str(e)}")

if __name__ == "__main__":
    test_create_animal()