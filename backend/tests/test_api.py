"""
Script para probar el endpoint de animales
"""
import requests
import json
import sys

def test_animal_creation():
    """Prueba la creación de un animal"""
    print("=== Iniciando prueba de creación de animal ===")
    
    # URL base
    BASE_URL = "http://localhost:8000"
    
    try:
        # 1. Verificar que el servidor está funcionando
        print("\nVerificando servidor...")
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            print("Error: El servidor no está respondiendo correctamente")
            return False
            
        # 2. Crear un animal
        print("\nCreando animal...")
        data = {
            "explotacio": "Granja Test",
            "nom": "Toro Test",
            "genere": "M",
            "estado": "OK",
            "dob": "01/01/2024"
        }
        
        print(f"Datos a enviar: {json.dumps(data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/animals/",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Test completado exitosamente")
            return True
        else:
            print("\n❌ Test falló")
            return False
            
    except Exception as e:
        print(f"\nError ejecutando el test: {str(e)}")
        return False

if __name__ == "__main__":
    try:
        success = test_animal_creation()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\nTest interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\nError fatal: {str(e)}")
        sys.exit(1)